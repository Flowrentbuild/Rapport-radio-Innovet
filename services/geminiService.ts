
import { GoogleGenAI, Type } from "@google/genai";
import { ANATOMICAL_REGIONS, DEFAULT_COMMENT } from "../constants";

export interface AIAnalysisResult {
  horseName?: string;
  regions: {
    label: string;
    comment: string;
    grade: number;
  }[];
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Analyse ligne par ligne (utilisée dans l'éditeur)
export const analyzeDictation = async (text: string): Promise<AIAnalysisResult | null> => {
  const prompt = `
    Tu es un assistant vétérinaire expert en radiographie équine.
    Analyse la transcription suivante : "${text}"
    Regions disponibles : ${ANATOMICAL_REGIONS.join(", ")}
    Règles impératives : 
    - Si l'utilisateur mentionne explicitement "RAS" ou "normal" pour une région : le commentaire DOIT être exactement "${DEFAULT_COMMENT}" et le Grade doit être 0.
    - Si une région est saine ou non mentionnée comme pathologique : le commentaire DOIT être "${DEFAULT_COMMENT}" et le Grade doit être 0.
    - Si une lésion est décrite : fournis une description précise et détermine le grade 1-4 selon la sévérité.
    - Retourne exclusivement un JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            regions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  comment: { type: Type.STRING },
                  grade: { type: Type.INTEGER }
                },
                required: ["label", "comment", "grade"]
              }
            }
          },
          required: ["regions"]
        }
      }
    });
    return JSON.parse(response.text) as AIAnalysisResult;
  } catch (error) {
    console.error("Gemini analysis error:", error);
    return null;
  }
};

// Analyse globale de session (utilisée sur le Dashboard)
export const analyzeFullSession = async (fullTranscript: string): Promise<AIAnalysisResult | null> => {
  const prompt = `
    Tu es un assistant vétérinaire expert. 
    Analyse cette transcription complète de consultation :
    "${fullTranscript}"

    1. Extrais le NOM DU CHEVAL si mentionné.
    2. Pour chaque région anatomique mentionnée parmi : ${ANATOMICAL_REGIONS.join(", ")}, fournis le commentaire et le grade.
    3. RÈGLE CRUCIALE : Si l'utilisateur mentionne "RAS" ou si la région est saine, le commentaire DOIT être "${DEFAULT_COMMENT}" et le Grade 0.
    4. Si une région n'est PAS mentionnée du tout dans la transcription, ne l'inclus pas dans le JSON de réponse.
    
    Retourne un JSON avec "horseName" et "regions".
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            horseName: { type: Type.STRING, description: "Nom du cheval extrait" },
            regions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  comment: { type: Type.STRING },
                  grade: { type: Type.INTEGER }
                },
                required: ["label", "comment", "grade"]
              }
            }
          },
          required: ["regions"]
        }
      }
    });
    return JSON.parse(response.text) as AIAnalysisResult;
  } catch (error) {
    console.error("Gemini session analysis error:", error);
    return null;
  }
};
