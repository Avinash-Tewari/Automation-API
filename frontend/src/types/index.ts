// ─── Auth ─────────────────────────────────────────────
export interface UserRegister {
  email: string;
  name: string;
  password: string;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  created_at: string;
}

// ─── Conversations ────────────────────────────────────
export interface ConversationCreate {
  title?: string;
}

export interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

// ─── Messages ─────────────────────────────────────────
export interface MessageCreate {
  content: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

// ─── Documents ────────────────────────────────────────
export interface Document {
  id: string;
  filename: string;
  file_type: string;
  file_size: number;
  chunk_count: number;
  status: "processing" | "ready" | "error";
  created_at: string;
}

// ─── Learning ─────────────────────────────────────────
export interface LearningHistory {
  id: string;
  topic: string;
  interaction_count: number;
  last_interaction: string;
  proficiency_score: number;
}

export interface LearningStats {
  total_conversations: number;
  total_documents: number;
  total_messages: number;
  topics: LearningHistory[];
}
