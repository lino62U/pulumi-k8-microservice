# Importa la clase base y las clases de configuración
from .deploy_base import MicroserviceDeployer, HpaConfig, VpaConfig

# Nombre de la función POR CONVENCIÓN: 'deploy_service'
def deploy_service(provider, docker_service_name, image_tag):
    
    # docker_service_name será 'mscv-auth'
    # image_tag vendrá del CI (ej. 'bfa123...')
    
    image = f"gcr.io/k8-clusters-474002/{docker_service_name}:{image_tag}"

    # Variables de entorno del YAML
    env_vars = [
        {"name": "DB_HOST", "value": "mysql"},
        {"name": "DB_USER", "value": "myapp_user"},
        {"name": "DB_PASSWORD", "value": "mypassword"},
        {"name": "DB_NAME", "value": "myapp_db"},
    ]

    # Configuración de HPA (de autoscaling.yaml)
    hpa = HpaConfig(
        min_replicas=2,
        max_replicas=10,
        cpu_utilization=70,
        memory_utilization=75
    )
    
    # Configuración de VPA (de vpa-all.yaml)
    vpa = VpaConfig(
        min_cpu="100m",
        min_memory="128Mi",
        max_cpu="1000m",
        max_memory="1Gi"
    )

    deployer = MicroserviceDeployer(
        name=docker_service_name, # 'mscv-auth'
        image=image,
        port=5001, # El puerto de tu app
        env=env_vars,
        provider=provider,
        hpa_config=hpa,
        vpa_config=vpa
    )
    
    return deployer.deploy()