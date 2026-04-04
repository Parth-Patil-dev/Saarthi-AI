import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const generateAIResponse = async (prompt, systemInstruction,activeConv) => {
  try {
    const response = await fetch("http://localhost:3000/api/chat",{
      method: "POST",
      headers: {"Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        message: prompt,
        sessionId : activeConv,
       }),
    } )
    console.log("Response:", response);
    return response.json() || "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "I'm having trouble connecting to my brain right now. Please try again later!";
  }
};
