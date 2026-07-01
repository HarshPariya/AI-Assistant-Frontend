import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL: API_URL,
  timeout: 120000, // 2 minutes for LLM responses
});

// ── Health ─────────────────────────────────────────────────────────────────
export const checkHealth = () => api.get("/health");

// ── Resume Reviewer ────────────────────────────────────────────────────────
export const analyzeResume = (file: File) => {
  const form = new FormData();
  form.append("file", file);
  return api.post("/resume/analyze", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// ── Interview Assistant ────────────────────────────────────────────────────
export const getRoles = () => api.get("/interview/roles");

export const generateQuestions = (data: {
  role: string;
  experience_level: string;
  num_questions: number;
  focus_areas?: string[];
}) => api.post("/interview/generate", data);

export const evaluateMockAnswer = (data: {
  role: string;
  question: string;
  user_answer: string;
  conversation_history?: Array<{ question: string; answer: string }>;
}) => api.post("/interview/mock-evaluate", data);

// ── PDF Chatbot ────────────────────────────────────────────────────────────
export const uploadChatPDF = (file: File) => {
  const form = new FormData();
  form.append("file", file);
  return api.post("/chat/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const askChatQuestion = (session_id: string, message: string) =>
  api.post("/chat/ask", { session_id, message });

export const getChatHistory = (session_id: string) =>
  api.get(`/chat/history/${session_id}`);

// ── Research Assistant ─────────────────────────────────────────────────────
export const uploadResearchPDFs = (files: File[]) => {
  const form = new FormData();
  files.forEach((f) => form.append("files", f));
  return api.post("/research/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const performResearchAction = (data: {
  session_id: string;
  action: string;
  query?: string;
}) => api.post("/research/action", data);

// ── Vision ─────────────────────────────────────────────────────────────────
export const analyzeImage = (file: File) => {
  const form = new FormData();
  form.append("file", file);
  return api.post("/vision/analyze", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const askAboutImage = (session_id: string, question: string) =>
  api.post("/vision/ask", { session_id, question });
