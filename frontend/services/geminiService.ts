// En: frontend/services/geminiService.ts

import { Employee } from "../types";

// Ya no importamos GoogleGenAI
// const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

// Convertimos la función para que no sea 'async' o la dejamos 'async' 
// y que simplemente devuelva un texto de ejemplo.
export const generateEmployeePerformanceSummary = async (employees: Employee[]): Promise<string> => {
  
  // ¡Toda la lógica de la API se ha ido!
  // Simplemente devolvemos un texto de ejemplo.
  const placeholderSummary = `
    Se ha generado un resumen de rendimiento de ejemplo. 
    Total de Empleados: ${employees.length}.
    Este es un texto estático porque la API de Gemini está deshabilitada.
  `;

  // Devolvemos la promesa con el texto
  return Promise.resolve(placeholderSummary);
};