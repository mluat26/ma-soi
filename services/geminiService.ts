import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY || '';

export const askElder = async (question: string, context: string): Promise<string> => {
  if (!API_KEY) {
    return "Lỗi: Chưa cấu hình API Key. Vui lòng kiểm tra cài đặt.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const model = 'gemini-3-flash-preview';
    
    const systemPrompt = `
      Bạn là "Trưởng Làng" (The Elder) trong trò chơi Ma Sói (Werewolf).
      Nhiệm vụ của bạn là giải đáp các thắc mắc về luật chơi cho Quản trò (Moderator).
      
      Ngữ cảnh trò chơi hiện tại:
      ${context}

      Trả lời ngắn gọn, súc tích, chính xác theo luật Ma Sói phổ biến.
      Nếu câu hỏi không liên quan đến luật chơi, hãy từ chối lịch sự theo phong cách Trưởng Làng.
      Đừng đưa ra lời khuyên về chiến thuật, chỉ giải thích cơ chế.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: question,
      config: {
        systemInstruction: systemPrompt,
      },
    });

    return response.text || "Trưởng làng đang suy ngẫm... (Không nhận được phản hồi)";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Trưởng làng đang bận. Vui lòng thử lại sau.";
  }
};