export type Message = {
  role: "user" | "assistant";
  content: string;
};

export type Metrics = {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  model: string | null;
  responseTime: number | null;
};
