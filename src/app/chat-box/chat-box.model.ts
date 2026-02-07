export interface Message {
  id: number;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

export interface ChatRequest {
  userId?: number;
  message: string;
}

export interface ChatResponse {
  response: string;
}
