import { apiRequest } from "./api";

export interface MentorMessage {
  _id?: string;
  role: "user" | "assistant";
  content: string;
  createdAt?: string;
}

interface MentorHistoryResponse {
  success: boolean;
  messages: MentorMessage[];
  message?: string;
}

interface MentorChatResponse {
  success: boolean;
  message: string;
  chatId: string;
}

export const getMentorHistory = async (): Promise<MentorMessage[]> => {
  const response = await apiRequest<MentorHistoryResponse>(
    "/ai-mentor/history"
  );

  return response.messages || [];
};

export const sendMentorMessage = async (
  message: string
): Promise<MentorChatResponse> => {
  return apiRequest<MentorChatResponse>("/ai-mentor/chat", {
    method: "POST",
    body: JSON.stringify({ message }),
  });
};

export const clearMentorHistory = async (): Promise<void> => {
  await apiRequest("/ai-mentor/history", {
    method: "DELETE",
  });
};