import os
import glob
import pulumi
from pulumi import ResourceOptions
# Se añade compute para crear la regla de firewall
from pulumi_gcp import container, compute 
from pulumi_kubernetes import Provider, yaml

# ==== Configuración ====
cfg = pulumi.Config()
project = cfg.get("gcp:project") or pulumi.get_project()
zone = cfg.get("gcp:zone") or "us-central1-a"
cluster_name = cfg.get("clusterName") or "pulumi-gke-cluster"

# ==== Crear clúster GKE ====
# ... (código del cluster, no modificado)
cluster = container.Cluster(
    cluster_name,
    name=cluster_name,
    location=zone,
    remove_default_node_pool=True,
    initial_node_count=1
)

# ==== Crear Node Pool autoscalable ====
node_pool = container.NodePool(
    "gke-nodepool",
    cluster=cluster.name,
    location=zone,
    initial_node_count=3,
    node_config=container.NodePoolNodeConfigArgs(
        machine_type="e2-small",
        disk_size_gb=15,
        oauth_scopes=["https://www.googleapis.com/auth/cloud-platform"],
        labels={
            "env": "lab",
            "role": "autoscaled-node",
        },
        tags=["pulumi", "gke-autoscale"], # <-- Tags del firewall
    ),

    autoscaling=container.NodePoolAutoscalingArgs(
        min_node_count=2,
        max_node_count=5,
    ),
)

# === Regla de Firewall para Tráfico Público (HTTP/HTTPS) ===
# Se añade este recurso para asegurar que la regla de red esté en el código,
# aunque GKE la cree automáticamente.
firewall_rule = compute.Firewall(
    "allow-http-https-from-lb", 
    network="default", 
    allows=[
        compute.FirewallAllowArgs(
            protocol="tcp",
            ports=["80", "443"],
        ),
    ],
    direction="INGRESS",
    source_ranges=["0.0.0.0/0"], 
    target_tags=["pulumi", "gke-autoscale"], 
    description="Allow HTTP and HTTPS traffic to GKE LoadBalancer services",
)

# ==== Construir kubeconfig dinámico ====
kubeconfig = pulumi.Output.all(
    cluster.name, cluster.endpoint, cluster.master_auth
).apply(
    lambda args: f"""
apiVersion: v1
clusters:
- cluster:
    certificate-authority-data: {args[2].get('clusterCaCertificate') or args[2].get('cluster_ca_certificate')}
    server: https://{args[1]}
  name: {args[0]}
contexts:
- context:
    cluster: {args[0]}
    user: {args[0]}
  name: {args[0]}
current-context: {args[0]}
users:
- name: {args[0]}
  user:
    exec:
      apiVersion: client.authentication.k8s.io/v1beta1
      command: gke-gcloud-auth-plugin
      installHint: Install gke-gcloud-auth-plugin for use with kubectl
      provideClusterInfo: true
"""
)



# ==== Provider de Kubernetes ====
k8s_provider = Provider("gke_k8s", kubeconfig=kubeconfig)

# ==== Aplicar manifiestos YAML ====
manifests_dir = os.path.join(os.path.dirname(__file__), "manifests")
files = sorted(glob.glob(os.path.join(manifests_dir, "*.yaml")))

applied = []
for fpath in files:
    name = os.path.splitext(os.path.basename(fpath))[0]
    # Se añade la dependencia para asegurar que el firewall se cree primero.
    c = yaml.ConfigFile(name, file=fpath, opts=ResourceOptions(provider=k8s_provider, depends_on=[firewall_rule]))
    applied.append(c)

# ==== Exports ====
pulumi.export("cluster_name", cluster.name)
pulumi.export("endpoint", cluster.endpoint)
pulumi.export("node_pool_autoscaling", {
    "min_nodes": 2,
    "max_nodes": 5,
})
pulumi.export("applied_manifests", [os.path.basename(p) for p in files])
