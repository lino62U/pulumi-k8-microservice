import React, { useState } from "react";
import Swal from "sweetalert2";
import axios from "axios";

const StressProof = () => {
  const [loading, setLoading] = useState(false);

  const simulateStress = async () => {
    setLoading(true);

    try {
      // 50 peticiones simultáneas a través de NGINX → mscv-stress:5003
      const requests = Array.from({ length: 50 }, () =>
        axios.get("/stress/heavy_task", {
          params: { seconds: 2 },
        })
      );

      await Promise.all(requests);

      Swal.fire({
        icon: "success",
        title: "🚀 Estrés simulado correctamente",
        text: "Se enviaron 50 peticiones al servicio de estrés.",
        showConfirmButton: false,
        timer: 2000,
      });
    } catch (error) {
      console.error("Error durante la simulación de estrés:", error);
      Swal.fire({
        icon: "error",
        title: "❌ Error en la simulación",
        text: "Ocurrió un problema al enviar las peticiones.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container text-center mt-5">
      <h2>🧠 Simulador de Estrés</h2>
      <p>
        Esta herramienta envía múltiples solicitudes al servicio de estrés para
        probar la carga del sistema.
      </p>

      <button
        className="btn btn-danger mt-4"
        onClick={simulateStress}
        disabled={loading}
        style={{
          padding: "1rem 2rem",
          fontSize: "1.1rem",
          borderRadius: "10px",
        }}
      >
        {loading ? "Ejecutando..." : "Iniciar Estrés 🚀"}
      </button>
    </div>
  );
};

export default StressProof;
