# Importa la clase base y las clases de configuración
from .deploy_base import MicroserviceDeployer, HpaConfig, VpaConfig

# Nombre de la función POR CONVENCIÓN: 'deploy_service'
def deploy_service(provider, docker_service_name, image_tag):
    
    # docker_service_name será 'mscv-employee'
    
    image = f"gcr.io/k8-clusters-474002/{docker_service_name}:{image_tag}"

    # Variables de entorno del YAML (Correctas)
    env_vars = [
        {"name": "DB_HOST", "value": "mysql"},
        {"name": "DB_USER", "value": "myapp_user"},
        {"name": "DB_PASSWORD", "value": "mypassword"},
        {"name": "DB_NAME", "value": "myapp_db"},
    ]

    # Configuración de HPA (de autoscaling.yaml) (Correcta)
    hpa = HpaConfig(
        min_replicas=2,
        max_replicas=10,
        cpu_utilization=70,
        memory_utilization=75
    )
    
    # --- ¡CORRECCIÓN AQUÍ! ---
    # Configuración de VPA (debe coincidir con vpa-mscv-employee)
    vpa = VpaConfig(
        min_cpu="150m",     # <-- Valor corregido
        min_memory="256Mi", # <-- Valor corregido
        max_cpu="1500m",    # <-- Valor corregido
        max_memory="2Gi"    # <-- Valor corregido
    )

    deployer = MicroserviceDeployer(
        name=docker_service_name, # 'mscv-employee'
        image=image,
        port=5002, # El puerto de tu app
        env=env_vars,
        provider=provider,
        hpa_config=hpa,
        vpa_config=vpa # Ahora se pasa la configuración de VPA correcta
    )
    
    return deployer.deploy()