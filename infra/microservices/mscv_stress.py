# infra/microservices/mscv_stress.py

from .deploy_base import MicroserviceDeployer, HpaConfig, VpaConfig

# Nombre de la función POR CONVENCIÓN: 'deploy_service'
def deploy_service(provider, docker_service_name, image_tag):
    
    # docker_service_name será 'mscv-stress'
    
    image = f"gcr.io/k8-clusters-474002/{docker_service_name}:{image_tag}"

    # --- ¡CORRECCIÓN! ---
    # Este 'env' debe ser el de tu YAML 'stress-deployment.yaml'
    env_vars = [
        {"name": "ENVIRONMENT", "value": "production"}
    ]
    
    # --- ¡CORRECCIÓN! ---
    # Definimos el bloque 'resources' de tu YAML
    resources = {
        "requests": {
            "cpu": "200m",
            "memory": "128Mi"
        },
        "limits": {
            "cpu": "500m",
            "memory": "256Mi"
        }
    }

    # Configuración de HPA (de autoscaling.yaml para stress)
    hpa = HpaConfig(
        min_replicas=2,
        max_replicas=10,
        cpu_utilization=70,
        memory_utilization=75
    )
    
    # Configuración de VPA (de vpa-all.yaml para stress)
    vpa = VpaConfig(
        min_cpu="200m",
        min_memory="256Mi",
        max_cpu="2000m",
        max_memory="3Gi"
    )

    deployer = MicroserviceDeployer(
        name=docker_service_name, # 'mscv-stress'
        image=image,
        port=5003, # El puerto de tu app
        env=env_vars, # Pasamos el env correcto
        resources=resources, # <-- ¡Pasamos los resources!
        provider=provider,
        hpa_config=hpa,
        vpa_config=vpa
    )
    
    return deployer.deploy()