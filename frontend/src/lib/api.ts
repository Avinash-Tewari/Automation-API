import type {
  User,
  UserRegister,
  UserLogin,
  TokenResponse,
  Conversation,
  ConversationCreate,
  Message,
  MessageCreate,
  Document as DocType,
  LearningStats,
} from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// ─── Helpers ──────────────────────────────────────────
function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail ?? `API error ${res.status}`);
  }
  if (res.status === 204) return undefined as unknown as T;
  return res.json();
}

// ─── Auth ─────────────────────────────────────────────
export const auth = {
  register: (data: UserRegister) =>
    apiFetch<User>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  login: async (data: UserLogin): Promise<TokenResponse> => {
    const res = await apiFetch<TokenResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
    localStorage.setItem("token", res.access_token);
    return res;
  },

  logout: () => localStorage.removeItem("token"),
};

// ─── Users ────────────────────────────────────────────
export const users = {
  me: () => apiFetch<User>("/users/me"),
  learningStats: () => apiFetch<LearningStats>("/users/me/learning-stats"),
};

// ─── Conversations ────────────────────────────────────
export const conversations = {
  list: () => apiFetch<Conversation[]>("/chat/conversation"),

  create: (data: ConversationCreate = {}) =>
    apiFetch<Conversation>("/chat/conversations", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiFetch<void>(`/chat/conversations/${id}`, { method: "DELETE" }),
};

// ─── Messages ─────────────────────────────────────────
export const messages = {
  list: (conversationId: string) =>
    apiFetch<Message[]>(`/chat/conversation/${conversationId}/messages`),

  /** Sends a message and returns a ReadableStream of SSE tokens. */
  send: async (conversationId: string, data: MessageCreate) => {
    const token = getToken();
    const res = await fetch(
      `${API_BASE}/chat/conversation/${conversationId}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(data),
      }
    );
    if (!res.ok) throw new Error(`Stream error ${res.status}`);
    return res;
  },
};

// ─── Documents ────────────────────────────────────────
export const documents = {
  upload: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return apiFetch<DocType>("/documents/upload", {
      method: "POST",
      body: form,
    });
  },
};

// ─── Images ───────────────────────────────────────────
export const images = {
  upload: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return apiFetch<DocType>("/images/upload", {
      method: "POST",
      body: form,
    });
  },
};
