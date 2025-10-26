
# ☁️ Infraestructura Kubernetes con Pulumi + GKE

Este proyecto automatiza la creación y despliegue de una infraestructura completa en **Google Kubernetes Engine (GKE)** utilizando **Pulumi** como herramienta de *Infrastructure as Code (IaC)*.  
Incluye:
- Creación del clúster GKE y su *node pool* autoscalable.  
- Reglas de firewall para tráfico HTTP/HTTPS.  
- Aplicación automática de manifiestos YAML (`Deployments`, `Services`, `PVCs`).  
- Generación y fusión automática del `kubeconfig` (sin necesidad de `export` manual).  
- Contexto de Kubernetes configurado automáticamente (`kubectl` listo para usar).  

---

## 🚀 Requisitos previos

Asegúrate de tener instalado y configurado lo siguiente:

| Herramienta | Versión recomendada | Descripción |
|--------------|--------------------|--------------|
| [Python](https://www.python.org/downloads/) | 3.9+ | Entorno para Pulumi y dependencias |
| [Pulumi CLI](https://www.pulumi.com/docs/install/) | latest | Framework IaC |
| [Google Cloud SDK (gcloud)](https://cloud.google.com/sdk/docs/install) | latest | Autenticación con GCP |
| [kubectl](https://kubernetes.io/docs/tasks/tools/) | latest | Cliente para Kubernetes |

---

## 🔑 Autenticación en Google Cloud

Inicia sesión con tu cuenta de Google Cloud y selecciona tu proyecto:

```bash
gcloud auth login
gcloud config set project k8-clusters-474002
gcloud config set compute/zone us-central1-a
````

---

## 🧹 Reiniciar entorno (si vienes de una instalación previa)

Si antes eliminaste el clúster desde el Dashboard de GCP o quieres empezar completamente desde cero, **reinicia el entorno** siguiendo estos pasos:

```bash
# 1. Destruir todos los recursos gestionados por Pulumi
pulumi destroy

# 2. Eliminar el stack y su estado
pulumi stack rm dev

# 3. Borrar kubeconfigs viejos
rm -f ~/.kube/config ~/.kube/pulumi-gke-config.yaml

# 4. Verificar que no queden recursos en GCP
gcloud container clusters list
gcloud compute instances list
gcloud compute disks list
```

Si encuentras un clúster viejo:

```bash
gcloud container clusters delete pulumi-gke-cluster --zone us-central1-a --quiet
```

---

## ⚙️ Inicializar el proyecto Pulumi

1. **Entrar al directorio de infraestructura:**

   ```bash
   cd docker-project/infra
   ```

2. **Inicializar un nuevo stack limpio:**

   ```bash
   pulumi stack init dev
   ```

3. **Configurar parámetros del proyecto:**

   ```bash
   pulumi config set gcp:project k8-clusters-474002
   pulumi config set gcp:zone us-central1-a
   ```

4. **(Opcional) Crear entorno virtual y dependencias:**

   ```bash
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

---

## 🏗️ Desplegar la infraestructura

Ejecuta el siguiente comando para crear toda la infraestructura y desplegar tus manifiestos Kubernetes:

```bash
pulumi up
```

Durante el proceso, Pulumi:

* Creará el **clúster GKE** y su **node pool autoscalable**.
* Configurará la **regla de firewall** pública (HTTP/HTTPS).
* Aplicará todos los manifiestos YAML ubicados en `infra/manifests/`.
* Generará y fusionará el **kubeconfig** automáticamente en `~/.kube/config`.
* Cambiará el contexto activo a `pulumi-gke-cluster`.

---

## ✅ Verificación posterior al despliegue

Pulumi mostrará mensajes como:

```
✅ Contexto GKE fusionado automáticamente con ~/.kube/config
✅ Contexto cambiado automáticamente a: pulumi-gke-cluster
🚀 Ahora puedes usar kubectl directamente (ej. kubectl get pods)
```

Luego, verifica:

```bash
kubectl get nodes
kubectl get pods -A
```

Deberías ver los nodos del clúster y todos los pods en ejecución (`frontend`, `auth`, `mysql`, etc.).

---

## 🔄 Escalado

El clúster usa **autoscaling dinámico** entre 2 y 5 nodos:

```bash
pulumi export node_pool_autoscaling
```

Para escalar manualmente réplicas de un *Deployment*:

```bash
kubectl scale deployment frontend --replicas=5
```

---

## 🧼 Destruir la infraestructura

Para eliminar todos los recursos creados (clúster, reglas, manifiestos, etc.):

```bash
pulumi destroy
```

Y para limpiar el stack completamente:

```bash
pulumi stack rm dev
```

---

## 🧠 Consejos y buenas prácticas

* **Nunca borres recursos Pulumi desde la consola de GCP.**
  Siempre usa `pulumi destroy` o `pulumi up` para mantener el estado sincronizado.
* Versiona el directorio `infra/` completo en Git.
* Si cambias manifiestos YAML o configuraciones, solo ejecuta `pulumi up` nuevamente.

---

## 📁 Estructura del proyecto

```
docker-project/
│
├── backend/
├── frontend/
├── db/
│   └── init.sql
├── docker-compose.yml
└── infra/
    ├── __main__.py           # Código Pulumi principal
    ├── manifests/            # Manifiestos Kubernetes (YAML)
    └── requirements.txt
```

---

## 🧩 Créditos

Desarrollado por **Avelino Lupo**
Infraestructura desplegada automáticamente con **Pulumi + GKE + Kubernetes**



