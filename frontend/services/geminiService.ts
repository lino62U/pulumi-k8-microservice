
import { GoogleGenAI } from "@google/genai";
import { Employee } from "../types";

// Assume process.env.API_KEY is configured in the environment
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const generateEmployeePerformanceSummary = async (employees: Employee[]): Promise<string> => {
  if (!process.env.API_KEY) {
    return "API key is not configured. Please set the API_KEY environment variable.";
  }

  const activeEmployees = employees.filter(e => e.status === 'Active').length;
  const onLeave = employees.filter(e => e.status === 'On Leave').length;
  const creativeCount = employees.filter(e => e.department === 'Creative').length;

  const prompt = `
    Analyze the following employee data for an advertising agency and provide a brief, insightful performance summary.
    Total Employees: ${employees.length}
    - Active: ${activeEmployees}
    - On Leave: ${onLeave}
    - Employees in Creative Department: ${creativeCount}

    Based on this data, write a 2-paragraph summary focusing on team composition and potential areas to watch.
    For example, mention if the creative department is a significant portion of the team.
    Be concise and professional.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "Failed to generate summary. Please check the console for details.";
  }
};
