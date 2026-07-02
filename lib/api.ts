import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL: API_URL,
  timeout: 120000, // 2 min — PDF uploads + embedding can take longer
});

// ── Health ─────────────────────────────────────────────────────────────────
export const checkHealth = () => api.get("/health");

// ── General Chat & Image Generation ────────────────────────────────────────
export const sendGeneralChat = (messages: Array<{ role: string; content: string }>, file?: File) => {
  const form = new FormData();
  form.append("messages", JSON.stringify(messages));
  if (file) {
    form.append("file", file);
  }
  return api.post("/general/ask", form);
};

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
    timeout: 180000,
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
    timeout: 180000,
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

// ── History ────────────────────────────────────────────────────────────────
export const saveConversation = (data: {
  user_id: string;
  module?: string;
  title?: string;
  messages: Array<{ role: string; content: string; id?: string }>;
  session_id?: string;
}) => api.post("/history/save", data);

export const getUserHistory = (user_id: string, module?: string) =>
  api.get(`/history/user/${encodeURIComponent(user_id)}`, {
    params: module ? { module } : undefined,
  });

export const getLatestConversation = (user_id: string, module: string) =>
  api.get(`/history/user/${encodeURIComponent(user_id)}/latest`, {
    params: { module },
  });

export const getConversation = (session_id: string) =>
  api.get(`/history/session/${session_id}`);

export const deleteConversation = (session_id: string, user_id: string) =>
  api.delete(`/history/session/${session_id}`, { params: { user_id } });

// ── Voice ──────────────────────────────────────────────────────────────────
export const transcribeAudio = (file: Blob, filename: string = "audio.webm") => {
  const form = new FormData();
  form.append("file", file, filename);
  return api.post("/voice/transcribe", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
