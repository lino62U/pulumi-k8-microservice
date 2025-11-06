import os
import pulumi
import importlib
import pkgutil
import subprocess
from pathlib import Path
from pulumi import ResourceOptions, Config
from pulumi_gcp import container, compute
from pulumi_kubernetes import Provider
from pulumi_kubernetes.core.v1 import ConfigMap

# --- Importar nuestros módulos de despliegue ---
from stateful_infra import deploy_mysql

# =====================================================================================
# ==== 1. INFRAESTRUCTURA BASE (CLÚSTER, NODE POOL, FIREWALL) ====
# (Esta sección es tu código original, se mantiene igual)
# =====================================================================================

cfg = Config()
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
    initial_node_count=1,
    vertical_pod_autoscaling=container.ClusterVerticalPodAutoscalingArgs(
        enabled=True
    )
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
k8s_provider = Provider(
    "gke_k8s", 
    kubeconfig=kubeconfig, 
    opts=ResourceOptions(depends_on=[node_pool, firewall_rule]) # Depende de ambos
)

# =====================================================================================
# ==== 2. INFRAESTRUCTURA ESTATAL (MYSQL) ====
# =====================================================================================

# 2.1. Crear ConfigMap de Inicialización (Lectura dinámica del archivo init.sql)
db_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "db")
init_sql_path = os.path.join(db_dir, "init.sql")
try:
    with open(init_sql_path, "r") as f:
        init_sql_content = f.read()
except FileNotFoundError:
    raise Exception(f"Error: No se encontró el archivo de inicialización SQL en: {init_sql_path}")

mysql_init_config = ConfigMap(
    "mysql-init-config",
    metadata={"name": "mysql-init-config"},
    data={"init.sql": init_sql_content},
    opts=ResourceOptions(provider=k8s_provider)
)

# 2.2. Desplegar MySQL usando nuestro módulo Python
# Esto reemplaza mysql-deployment.yaml y mysql-pvc.yaml
deploy_mysql(provider=k8s_provider, config_map=mysql_init_config)

# =====================================================================================
# ==== 3. DESPLIEGUE GENÉRICO DE MICROSERVICIOS ====
# (Esto REEMPLAZA tu bucle de YAMLs)
# =====================================================================================

# Directorio de definiciones de Pulumi
SERVICES_DIR = "microservices"
# Módulos que no son servicios y deben ser ignorados
MODULES_TO_IGNORE = ['__init__', 'deploy_base']

pulumi.log.info("--- Iniciando Despliegue Genérico de Microservicios ---")

# Descubrir todos los módulos en la carpeta 'microservices'
for finder, module_name, is_pkg in pkgutil.iter_modules([SERVICES_DIR]):
    
    if module_name in MODULES_TO_IGNORE:
        continue

    # 1. Importar el módulo dinámicamente (ej. microservices.mscv_auth)
    module = importlib.import_module(f"{SERVICES_DIR}.{module_name}")

    # 2. Convención: nombre del servicio para Docker/paths (ej. 'mscv_auth' -> 'mscv-auth')
    service_name_docker = module_name.replace("_", "-")
    
    # 3. Convención: nombre para la config de Pulumi (ej. 'mscv_auth_image_tag')
    config_key = f"{module_name}_image_tag"
    image_tag = cfg.get(config_key) or "latest" # Lee de Pulumi.dev.yaml

    # 4. Convención: Cada módulo DEBE tener una función 'deploy_service'
    deploy_function = getattr(module, "deploy_service", None)
    
    if deploy_function:
        pulumi.log.info(f"Desplegando: {module_name} (Servicio: {service_name_docker}) con tag: {image_tag}")
        
        # Llamar a la función genérica
        deploy_function(
            provider=k8s_provider,
            docker_service_name=service_name_docker,
            image_tag=image_tag
        )
    else:
        pulumi.log.warn(f"Omitiendo {module_name}: no se encontró la función 'deploy_service'.")

# =====================================================================================
# ==== 4. HELPERS Y EXPORTS ====
# (Función 'merge_kubeconfig' MODIFICADA para manejar el error)
# =====================================================================================

def merge_kubeconfig(new_config_content, cluster_name="pulumi-gke-cluster"):
    try:
        kube_dir = Path.home() / ".kube"
        kube_dir.mkdir(parents=True, exist_ok=True)
        default_path = kube_dir / "config"

        # Guardar temporalmente el kubeconfig generado por Pulumi
        temp_path = kube_dir / "pulumi-temp.yaml"
        with open(temp_path, "w") as f:
            f.write(new_config_content)

        if default_path.exists():
            # Fusionar la configuración nueva con la existente usando $KUBECONFIG
            merged_output = subprocess.run(
                ["kubectl", "config", "view", "--flatten"],
                env={**dict(**{"KUBECONFIG": f"{default_path}:{temp_path}"})},
                capture_output=True, text=True, check=True
            )
            with open(default_path, "w") as f:
                f.write(merged_output.stdout)
            temp_path.unlink()
            print("✅ Contexto GKE fusionado automáticamente con ~/.kube/config")
        else:
            temp_path.rename(default_path)
            print("✅ Se creó un nuevo archivo ~/.kube/config para el clúster GKE")
        
        # Intentar cambiar el contexto
        subprocess.run(
            ["kubectl", "config", "use-context", cluster_name],
            check=True, capture_output=True, text=True
        )
        print(f"✅ Contexto cambiado automáticamente a: {cluster_name}")

    except FileNotFoundError:
        # --- ¡LA CAPTURA DEL ERROR! ---
        print("\n⚠️  `kubectl` no se encontró en el PATH. No se pudo fusionar el kubeconfig.")
        print("   (Esto es normal en CI/CD. Para desarrollo local, instala 'kubectl').")
    except subprocess.CalledProcessError as e:
        print(f"\n⚠️  `kubectl` falló al intentar fusionar el contexto: {e.stderr}")
        

def merge_and_set_context(content):
    # Esta función ahora solo necesita llamar a la función robusta
    merge_kubeconfig(content, cluster_name="pulumi-gke-cluster")

kubeconfig.apply(merge_and_set_context)

# ==== Exports ====
pulumi.export("cluster_name", cluster.name)
pulumi.export("endpoint", cluster.endpoint)
pulumi.export("node_pool_autoscaling", {"min_nodes": 2, "max_nodes": 5})
pulumi.export("kubeconfig_path", str(Path.home() / ".kube/config"))