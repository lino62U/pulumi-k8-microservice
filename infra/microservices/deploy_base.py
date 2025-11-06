# --- ¡LA IMPORTACIÓN CORRECTA! ---
# Importamos la clase base genérica de 'pulumi'
from pulumi import ResourceOptions, CustomResource
from pulumi_kubernetes.apps.v1 import Deployment
from pulumi_kubernetes.core.v1 import Service
from pulumi_kubernetes.autoscaling.v2 import HorizontalPodAutoscaler

# Clase de 'Configuración' simple para HPA y VPA para mantener limpio el __init__
class HpaConfig:
# ... (código sin cambios) ...
    def __init__(self, min_replicas=2, max_replicas=10, cpu_utilization=70, memory_utilization=75):
        self.min_replicas = min_replicas
        self.max_replicas = max_replicas
        self.cpu = cpu_utilization
        self.memory = memory_utilization

class VpaConfig:
# ... (código sin cambios) ...
    def __init__(self, min_cpu="100m", min_memory="128Mi", max_cpu="1000m", max_memory="1Gi"):
        self.min_cpu = min_cpu
        self.min_memory = min_memory
        self.max_cpu = max_cpu
        self.max_memory = max_memory

class MicroserviceDeployer:
    def __init__(self,
                 name: str,
# ... (código sin cambios) ...
                 image: str,
                 port: int,
                 provider: str,
                 env: list = None,
                 resources: dict = None,
                 hpa_config: HpaConfig = None,
                 vpa_config: VpaConfig = None):
        
        self.name = name
# ... (código sin cambios) ...
        self.image = image
        self.port = port
        self.provider = provider
        self.env = env or []
        self.labels = {"app": self.name}
        
        # Usar recursos si se proveen, de lo contrario VPA los manejará
        self.resources = resources or {} 
        
        self.hpa_config = hpa_config
        self.vpa_config = vpa_config
        self.service = None
        self.deployment = None

    def deploy(self):
        # 1. Deployment
        self.deployment = Deployment(
            f"{self.name}-deployment",
            {
                "metadata": {
                    "name": self.name,   # ✅ EXACTO: mscv-auth
                    "labels": self.labels
                },
                "spec": {
                    "replicas": 2,
                    "selector": {
                        "matchLabels": self.labels
                    },
                    "template": {
                        "metadata": {
                            "labels": self.labels
                        },
                        "spec": {
                            "containers": [{
                                "name": self.name,
                                "image": self.image,
                                "ports": [{"containerPort": self.port}],
                                "env": self.env
                            }]
                        }
                    }
                }
            },
            opts=ResourceOptions(provider=self.provider)
        )

        # 2. Service (LoadBalancer)
        self.service = Service(
            f"{self.name}-service",
            {
                "metadata": {
                    "name": self.name  # ✅ EXACTO: mscv-auth
                },
                "spec": {
                    "selector": self.labels,
                    "ports": [{
                        "port": self.port,
                        "targetPort": self.port
                    }],
                    "type": "LoadBalancer"
                }
            },
            opts=ResourceOptions(provider=self.provider, depends_on=[self.deployment])
        )

        # 3. Horizontal Pod Autoscaler (HPA)
        if self.hpa_config:
            HorizontalPodAutoscaler(
# ... (código sin cambios) ...
                f"{self.name}-hpa",
                spec={
                    "scaleTargetRef": {
                        "apiVersion": "apps/v1",
                        "kind": "Deployment",
                        "name": self.deployment.metadata["name"],
                    },
                    "minReplicas": self.hpa_config.min_replicas,
                    "maxReplicas": self.hpa_config.max_replicas,
                    "metrics": [
                        {
                            "type": "Resource",
                            "resource": {
                                "name": "cpu",
                                "target": {"type": "Utilization", "averageUtilization": self.hpa_config.cpu}
                            }
                        },
                        {
                            "type": "Resource",
                            "resource": {
                                "name": "memory",
                                "target": {"type": "Utilization", "averageUtilization": self.hpa_config.memory}
                            }
                        }
                    ]
                },
                opts=ResourceOptions(provider=self.provider, depends_on=[self.deployment])
            )

        # 4. Vertical Pod Autoscaler (VPA)
        if self.vpa_config:
            
            vpa_type_string = "kubernetes:autoscaling.k8s.io/v1:VerticalPodAutoscaler"

            vpa_props = {
                "metadata": {"name": f"vpa-{self.name}"},
                "spec": {
                    "targetRef": {
                        "apiVersion": "apps/v1",
                        "kind": "Deployment",
                        "name": self.deployment.metadata["name"],
                    },
                    "updatePolicy": {"updateMode": "Auto"},
                    "resourcePolicy": {
                        "containerPolicies": [{
                            "containerName": "*",
                            "minAllowed": {"cpu": self.vpa_config.min_cpu, "memory": self.vpa_config.min_memory},
                            "maxAllowed": {"cpu": self.vpa_config.max_cpu, "memory": self.vpa_config.max_memory},
                            "controlledResources": ["cpu", "memory"]
                        }]
                    }
                }
            }
            
            # --- ¡LA CORRECCIÓN FINAL! (Argumentos intercambiados) ---
            CustomResource(
                vpa_type_string,     # 1. El 'type_string'
                f"{self.name}-vpa", # 2. El nombre
                vpa_props,           # 3. El diccionario 'props'
                opts=ResourceOptions(provider=self.provider, depends_on=[self.deployment])
            )

        return self.service