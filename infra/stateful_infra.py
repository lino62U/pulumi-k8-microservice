from pulumi import ResourceOptions
from pulumi_kubernetes.apps.v1 import Deployment
from pulumi_kubernetes.core.v1 import Service, PersistentVolumeClaim

def deploy_mysql(provider, config_map):
    """
    Despliega MySQL como un recurso estatal, traduciendo los YAMLs.
    Depende del ConfigMap que contiene init.sql.
    """
    labels = {"app": "mysql"}
    
    # 1. Persistent Volume Claim (mysql-pvc.yaml)
    pvc = PersistentVolumeClaim(
        "mysql-pvc",
        metadata={"name": "mysql-pvc"},
        spec={
            "accessModes": ["ReadWriteOnce"],
            "resources": {"requests": {"storage": "1Gi"}}
        },
        opts=ResourceOptions(provider=provider)
    )

    # 2. Deployment (mysql-deployment.yaml)
    mysql_deployment = Deployment(
        "mysql-deployment",
        spec={
            "selector": {"matchLabels": labels},
            "replicas": 1,
            "template": {
                "metadata": {"labels": labels},
                "spec": {
                    "containers": [{
                        "name": "mysql",
                        "image": "mysql:8",
                        "env": [
                            {"name": "MYSQL_ROOT_PASSWORD", "value": "123456"},
                            {"name": "MYSQL_DATABASE", "value": "myapp_db"},
                            {"name": "MYSQL_USER", "value": "myapp_user"},
                            {"name": "MYSQL_PASSWORD", "value": "mypassword"},
                        ],
                        "ports": [{"containerPort": 3306}],
                        "volumeMounts": [
                            {"mountPath": "/var/lib/mysql", "name": "mysql-storage"},
                            {
                                "mountPath": "/docker-entrypoint-initdb.d/init.sql",
                                "name": "mysql-init-volume",
                                "subPath": "init.sql"
                            }
                        ]
                    }],
                    "volumes": [
                        {"name": "mysql-storage", "persistentVolumeClaim": {"claimName": pvc.metadata["name"]}},
                        {
                            "name": "mysql-init-volume",
                            "configMap": {
                                "name": config_map.metadata["name"],
                                "items": [{"key": "init.sql", "path": "init.sql"}]
                            }
                        }
                    ]
                }
            }
        },
        opts=ResourceOptions(provider=provider, depends_on=[pvc, config_map])
    )

    # 3. Headless Service (mysql-deployment.yaml)
    Service(
        "mysql-service",
        metadata={"name": "mysql"}, # El nombre que usan tus apps (DB_HOST: mysql)
        spec={
            "selector": labels,
            "ports": [{"port": 3306, "targetPort": 3306}],
            "clusterIP": "None" # Headless service
        },
        opts=ResourceOptions(provider=provider, depends_on=[mysql_deployment])
    )