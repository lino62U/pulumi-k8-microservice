import os
import glob
import subprocess
from pathlib import Path
import pulumi
from pulumi import ResourceOptions
from pulumi_gcp import container, compute 
from pulumi_kubernetes import Provider, yaml
from pulumi_kubernetes.core.v1 import ConfigMap

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
    deletion_protection=False,
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
        machine_type="e2-medium",
        disk_size_gb=15,
        oauth_scopes=["https://www.googleapis.com/auth/cloud-platform"],
        labels={"env": "lab", "role": "autoscaled-node"},
        tags=["pulumi", "gke-autoscale"],
    ),
    autoscaling=container.NodePoolAutoscalingArgs(
        min_node_count=2,
        max_node_count=5,
    ),
)

# === Regla de Firewall para Tráfico Público (HTTP/HTTPS) ===
firewall_rule = compute.Firewall(
    "allow-http-https-from-lb", 
    network="default", 
    allows=[compute.FirewallAllowArgs(protocol="tcp", ports=["80", "443"])],
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
k8s_provider = Provider("gke_k8s", kubeconfig=kubeconfig, opts=ResourceOptions(depends_on=[node_pool]))

# =====================================================================================
# ==== 1. Crear ConfigMap de Inicialización (Lectura dinámica del archivo init.sql) ====
# =====================================================================================

# Calcula la ruta para leer el archivo db/init.sql (dos niveles arriba de la carpeta infra)
db_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "db")
init_sql_path = os.path.join(db_dir, "init.sql")

# Leer el contenido de init.sql
try:
    with open(init_sql_path, "r") as f:
        init_sql_content = f.read()
except FileNotFoundError:
    raise Exception(f"Error: No se encontró el archivo de inicialización SQL en: {init_sql_path}")

# Crear el ConfigMap de Kubernetes con el contenido leído
mysql_init_config = ConfigMap(
    "mysql-init-config",
    metadata={"name": "mysql-init-config"},
    data={"init.sql": init_sql_content},
    opts=ResourceOptions(provider=k8s_provider, depends_on=[firewall_rule, node_pool])
)

# ==== Aplicar manifiestos YAML ====
manifests_dir = os.path.join(os.path.dirname(__file__), "manifests")
files = sorted(glob.glob(os.path.join(manifests_dir, "*.yaml")))

applied = []
for fpath in files:
    name = os.path.splitext(os.path.basename(fpath))[0]
    depends = [firewall_rule, node_pool]
    if "mysql-deployment.yaml" in fpath:
        depends.append(mysql_init_config)
    c = yaml.ConfigFile(name, file=fpath, opts=ResourceOptions(provider=k8s_provider, depends_on=depends))
    applied.append(c)

# =====================================================================================
# ==== Función para fusionar kubeconfig en ~/.kube/config (sin export manual) ==========
# =====================================================================================

def merge_kubeconfig(new_config_content):
    kube_dir = Path.home() / ".kube"
    kube_dir.mkdir(parents=True, exist_ok=True)
    default_path = kube_dir / "config"

    # Guardar temporalmente el kubeconfig generado por Pulumi
    temp_path = kube_dir / "pulumi-temp.yaml"
    with open(temp_path, "w") as f:
        f.write(new_config_content)

    if default_path.exists():
        # Fusiona la configuración nueva con la existente
        subprocess.run([
            "kubectl", "config", "view", "--flatten", "--merge",
            "--kubeconfig", f"{default_path}:{temp_path}"
        ], stdout=open(default_path, "w"), check=True)
        temp_path.unlink()
        print("✅ Contexto GKE fusionado automáticamente con ~/.kube/config")
    else:
        temp_path.rename(default_path)
        print("✅ Se creó un nuevo archivo ~/.kube/config para el clúster GKE")

# ==== Aplicar automáticamente el merge del kubeconfig ====
def merge_and_set_context(content):
    merge_kubeconfig(content)

    # Intentar activar automáticamente el contexto del cluster
    try:
        subprocess.run(
            ["kubectl", "config", "use-context", cluster_name],
            check=True,
            capture_output=True,
            text=True
        )
        print(f"✅ Contexto cambiado automáticamente a: {cluster_name}")
        print("🚀 Ahora puedes usar kubectl directamente (ej. kubectl get pods)\n")
    except subprocess.CalledProcessError as e:
        print("⚠️ Advertencia: No se pudo cambiar automáticamente el contexto.")
        print(e.stderr)

kubeconfig.apply(merge_and_set_context)

# ==== Exports ====
pulumi.export("cluster_name", cluster.name)
pulumi.export("endpoint", cluster.endpoint)
pulumi.export("node_pool_autoscaling", {"min_nodes": 2, "max_nodes": 5})
pulumi.export("applied_manifests", [os.path.basename(p) for p in files])
pulumi.export("kubeconfig_path", str(Path.home() / ".kube/config"))
