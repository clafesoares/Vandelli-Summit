import { GoogleGenAI } from "@google/genai";
import { SecurityTip } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateMonasteryWisdom = async (): Promise<SecurityTip> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Gera um conselho curto e metafórico sobre segurança informática, escrito no estilo de um curador de um jardim botânico antigo. Deve usar analogias com raízes, estufas, pragas e flores. Uma frase poética seguida de uma tradução técnica moderna entre parênteses. Responde em Português de Portugal.",
      config: {
        systemInstruction: "Tu és o Curador Principal do Jardim Botânico Vandelli. Vês o mundo digital como um ecossistema delicado que precisa de poda e proteção contra espécies invasoras.",
      },
    });

    const text = response.text || "Uma raiz profunda resiste a qualquer tempestade. (Usa autenticação de múltiplos fatores.)";
    
    const parts = text.split('(');
    const title = parts[0]?.trim() || "Sabedoria da Raiz";
    const content = parts.length > 1 ? `(${parts[1]}` : "";

    return { title, content };
  } catch (error) {
    console.error("Gemini Botanical Wisdom Error:", error);
    return {
      title: "Solo Fértil",
      content: "Garante que as tuas defesas são orgânicas e impenetráveis como a Estufa Real.",
    };
  }
};