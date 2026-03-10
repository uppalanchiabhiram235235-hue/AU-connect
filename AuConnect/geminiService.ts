
import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini with the required configuration and correct API key access
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeIssueReport = async (title: string, description: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `As an AU Connect Campus Assistant, analyze this issue report and suggest a priority (Low, Medium, High) and a specialized department it might belong to (Maintenance, IT Support, Cleaning, Security). 
      Title: ${title}
      Description: ${description}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            priority: {
              type: Type.STRING,
              description: 'The suggested priority (Low, Medium, High).',
            },
            department: {
              type: Type.STRING,
              description: 'The department responsible (Maintenance, IT Support, Cleaning, Security).',
            },
          },
          required: ["priority", "department"],
        },
      }
    });
    // Correctly access .text property and provide fallback for JSON parsing
    const text = response.text;
    return text ? JSON.parse(text.trim()) : { priority: 'Medium', department: 'General Maintenance' };
  } catch (error) {
    console.error("Gemini Error:", error);
    return { priority: 'Medium', department: 'General Maintenance' };
  }
};

export const suggestFacultyReply = async (message: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a faculty member at a university. A student sent you this message: "${message}". 
      Draft a professional, concise, and helpful reply (max 100 words).`
    });
    // Access response text as a property, not a method
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Thank you for your message. I will look into this and get back to you shortly.";
  }
};
