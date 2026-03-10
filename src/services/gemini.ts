import { GoogleGenAI, Type } from "@google/genai";
import { Language } from "../constants/translations";

let aiInstance: GoogleGenAI | null = null;

const getAI = () => {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "undefined") {
      throw new Error("Chave de API (GEMINI_API_KEY) não encontrada. Se você estiver usando a URL compartilhada, certifique-se de configurar a chave nos Segredos/Configurações do projeto e realizar um novo deploy.");
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
};

export const generateDailyPrompt = async (pillar: 'expression' | 'art' | 'spirit' | 'body', lang: Language) => {
  const ai = getAI();
  const languageNames = {
    pt: "Português do Brasil",
    es: "Español",
    en: "English"
  };

  const prompts = {
    expression: "Gere um exercício de escrita criativa ou expressão vocal focado em emoções profundas.",
    art: "Gere um desafio artístico visual (desenho, colagem, fotografia) que explore a conexão entre o interno e o externo.",
    spirit: "Gere uma meditação guiada curta ou uma reflexão filosófica sobre o propósito da vida.",
    body: "Gere uma sequência de movimentos conscientes ou exercícios de respiração para conectar mente e corpo."
  };

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompts[pillar],
    config: {
      systemInstruction: `Você é um mestre em artes expressivas e bem-estar holístico. Suas respostas devem ser em ${languageNames[lang]}, inspiradoras, poéticas e práticas.`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
          reflection: { type: Type.STRING }
        },
        required: ["title", "description", "instructions", "reflection"]
      }
    }
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    console.error("Failed to parse Gemini response:", response.text);
    throw new Error("O modelo retornou uma resposta inválida. Por favor, tente novamente.");
  }
};
