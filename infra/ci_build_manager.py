import os
import sys
import subprocess
from pathlib import Path

# --- Configuración de Convenciones (AJUSTADA) ---
# NO hay un solo directorio. El script los descubrirá.
CONFIG_KEY_TEMPLATE = "{service_name}_image_tag" 
# Plantilla de imagen Docker (ajusta 'k8-clusters-474002' a tu project ID)
IMAGE_NAME_TEMPLATE = "gcr.io/{project_id}/{service_name}:{tag}"
# -------------------------------------

def run_command(command, cwd=None):
    """Ejecuta un comando en el shell y maneja errores."""
    try:
        print(f"Executing: {' '.join(command)}")
        # Asegúrate de que cwd sea un string si no es None
        subprocess.run(command, check=True, cwd=str(cwd) if cwd else None)
    except subprocess.CalledProcessError as e:
        print(f"Error: El comando falló: {e}")
        sys.exit(1)
    except FileNotFoundError:
        print(f"Error: No se encontró el comando: {command[0]}")
        sys.exit(1)

def main():
    # 1. Obtener variables del entorno de CI
    changed_files_str = os.environ.get("CHANGED_FILES")
    if not changed_files_str:
        print("No se detectaron archivos cambiados. Omitiendo build.")
        sys.exit(0)

    image_tag = os.environ.get("IMAGE_TAG")
    project_id = os.environ.get("GCP_PROJECT_ID")
    pulumi_stack = os.environ.get("PULUMI_STACK", "dev")
    
    if not image_tag or not project_id:
        print("Error: Faltan variables de entorno (IMAGE_TAG, GCP_PROJECT_ID).")
        sys.exit(1)

    changed_files = changed_files_str.split(' ')
    # Usaremos un dict: { 'service_name': 'ruta_al_contexto_docker' }
    services_to_build = {}

    # 2. Descubrir qué servicios cambiaron (LÓGICA ACTUALIZADA)
    print("--- Detectando servicios modificados ---")
    for file_path in changed_files:
        p = Path(file_path)
        if not p.parts: continue

        # Caso 1: Un microservicio de backend (ej. backend/mscv-auth/app.py)
        if p.parts[0] == 'backend' and len(p.parts) > 2:
            service_name = p.parts[1] # 'mscv-auth'
            context_path = Path('backend') / service_name
            if context_path.exists():
                services_to_build[service_name] = context_path

        # Caso 2: El frontend (ej. frontend/App.tsx)
        elif p.parts[0] == 'frontend' and len(p.parts) > 1:
            service_name = 'frontend'
            context_path = Path('frontend')
            if context_path.exists():
                services_to_build[service_name] = context_path

    if not services_to_build:
        print("No se modificó el código de ningún servicio. Omitiendo builds.")
        return # Salimos con éxito

    print(f"Servicios para construir: {', '.join(services_to_build.keys())}")

    # 3. Construir, Publicar y Configurar Pulumi para cada servicio
    for service_name, context_path in services_to_build.items():
        print(f"--- Procesando: {service_name} ---")
        
        image_name = IMAGE_NAME_TEMPLATE.format(
            project_id=project_id, 
            service_name=service_name, 
            tag=image_tag
        )
        # ej. 'mscv-auth' -> 'mscv_auth' para la key de Pulumi
        config_key = CONFIG_KEY_TEMPLATE.format(service_name=service_name.replace("-", "_"))
        
        # B. Construir (usando el context_path correcto)
        run_command(["docker", "build", "-t", image_name, "."], cwd=context_path)
        
        # C. Publicar
        run_command(["docker", "push", image_name])
        
        # D. Configurar Pulumi
        print(f"Actualizando config de Pulumi: {config_key} = {image_tag}")
        run_command([
            "pulumi", "config", "set", config_key, image_tag, 
            "--stack", pulumi_stack, 
            "--cwd", "infra" # El stack de Pulumi está en 'infra'
        ])

    print("--- Proceso de Build completado ---")

if __name__ == "__main__":
    main()