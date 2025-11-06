# infra/microservices/frontend.py

from .deploy_base import MicroserviceDeployer, HpaConfig, VpaConfig

# Nombre de la función POR CONVENCIÓN: 'deploy_service'
def deploy_service(provider, docker_service_name, image_tag):
    
    # docker_service_name será 'frontend'
    
    image = f"gcr.io/k8-clusters-474002/{docker_service_name}:{image_tag}"

    # --- ¡CORRECCIÓN! ---
    # El frontend no necesita saber de la base de datos.
    # El 'env' debe estar vacío, tal como en tu YAML.
    env_vars = [] 

    # Configuración de HPA (de autoscaling.yaml para frontend)
    hpa = HpaConfig(
        min_replicas=2,
        max_replicas=8,  # <-- Valor de tu YAML
        cpu_utilization=60, # <-- Valor de tu YAML
        memory_utilization=70 # <-- Valor de tu YAML
    )
    
    # Configuración de VPA (de vpa-all.yaml para frontend)
    vpa = VpaConfig(
        min_cpu="100m",
        min_memory="128Mi",
        max_cpu="1000m",
        max_memory="1Gi"
    )

    deployer = MicroserviceDeployer(
        name=docker_service_name, # 'frontend'
        image=image,
        port=80, # El puerto de NGINX
        env=env_vars, # Se pasa la lista vacía
        provider=provider,
        hpa_config=hpa,
        vpa_config=vpa,
        resources={} # No tiene 'resources' definidos en el YAML
    )
    
    return deployer.deploy()