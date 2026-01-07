
import { GoogleGenAI, Type } from "@google/genai";
import { Tender } from "../types";

// Always use named parameter for apiKey and use process.env.API_KEY directly.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeTenderRisk = async (tender: Tender) => {
  const prompt = `
    Analise a seguinte licitação e identifique potenciais riscos jurídicos ou operacionais:
    Órgão: ${tender.orgaoLicitante}
    Objeto: ${tender.objeto}
    Valor: R$ ${tender.valorReferencia}
    Modo: ${tender.modoDisputa}
    Prazos: Abertura em ${tender.dataAbertura}.

    Forneça 3 pontos principais de atenção e uma recomendação estratégica.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        temperature: 0.7,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            risks: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Lista de riscos identificados"
            },
            recommendation: {
              type: Type.STRING,
              description: "Recomendação estratégica curta"
            }
          },
          required: ["risks", "recommendation"]
        }
      }
    });

    // Access .text property directly (not as a method).
    const text = response.text.trim();
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return {
      risks: ["Não foi possível realizar a análise automática no momento."],
      recommendation: "Revise os editais manualmente conforme protocolo padrão."
    };
  }
};

export const getLegalAdvice = async (query: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Você é um assistente jurídico sênior especializado em licitações públicas brasileiras (Leis 8.666/93 e 14.133/2021). 
    Responda à seguinte dúvida: ${query}`,
  });
  // Access .text property directly.
  return response.text;
};
