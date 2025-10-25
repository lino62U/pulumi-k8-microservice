import os
import glob
import pulumi
from pulumi import ResourceOptions
from pulumi_gcp import container
from pulumi_kubernetes import Provider, yaml

# ==== Configuración ====
cfg = pulumi.Config()
project = cfg.get("gcp:project") or pulumi.get_project()
zone = cfg.get("gcp:zone") or "us-central1-a"
cluster_name = cfg.get("clusterName") or "pulumi-gke-cluster"

# ==== Crear clúster GKE ====
cluster = container.Cluster(
    cluster_name,
    name=cluster_name,
    location=zone,
    remove_default_node_pool=True,  # Eliminamos el pool por defecto
    initial_node_count=1           # Placeholder, se elimina luego
    #min_master_version="1.29",      # Puedes ajustar según versión estable
)

# ==== Crear Node Pool autoscalable ====
node_pool = container.NodePool(
    "gke-nodepool",
    cluster=cluster.name,
    location=zone,
    initial_node_count=3,  # arranca con 2 nodos
    node_config=container.NodePoolNodeConfigArgs(
    machine_type="e2-small",  # ✅ GKE permite este tipo
    disk_size_gb=15,
    oauth_scopes=["https://www.googleapis.com/auth/cloud-platform"],
    labels={
            "env": "lab",
            "role": "autoscaled-node",
        },
        tags=["pulumi", "gke-autoscale"],
    ),

    autoscaling=container.NodePoolAutoscalingArgs(
        min_node_count=2,  # mínimo 2 nodos activos
        max_node_count=5,  # máximo 5 nodos según carga
    ),
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

# ==== Aplicar manifiestos YAML (carpeta manifests/*.yaml) ====
manifests_dir = os.path.join(os.path.dirname(__file__), "manifests")
files = sorted(glob.glob(os.path.join(manifests_dir, "*.yaml")))

applied = []
for fpath in files:
    name = os.path.splitext(os.path.basename(fpath))[0]
    c = yaml.ConfigFile(name, file=fpath, opts=ResourceOptions(provider=k8s_provider))
    applied.append(c)

# ==== Exports ====
pulumi.export("cluster_name", cluster.name)
pulumi.export("endpoint", cluster.endpoint)
pulumi.export("node_pool_autoscaling", {
    "min_nodes": 2,
    "max_nodes": 5,
})
pulumi.export("applied_manifests", [os.path.basename(p) for p in files])
