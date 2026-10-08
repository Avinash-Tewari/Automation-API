"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { conversations as convoApi } from "@/lib/api";
import type { Conversation } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Plus,
  MessageSquare,
  Trash2,
  Loader2,
} from "lucide-react";

export default function ChatListPage() {
  const router = useRouter();
  const [convos, setConvos] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    convoApi
      .list()
      .then(setConvos)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    setCreating(true);
    try {
      const convo = await convoApi.create({ title: "New Conversation" });
      router.push(`/chat/${convo.id}`);
    } catch {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    await convoApi.delete(id);
    setConvos((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Conversations</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Chat with your AI learning assistant
          </p>
        </div>
        <Button
          onClick={handleCreate}
          disabled={creating}
          className="gap-2 bg-primary hover:bg-primary/90 glow-primary"
        >
          {creating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          New Chat
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
      ) : convos.length === 0 ? (
        <Card className="glass border-border/30 animate-fade-in-up">
          <CardContent className="flex flex-col items-center justify-center py-16 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <MessageSquare className="w-8 h-8 text-primary" />
            </div>
            <div className="text-center">
              <p className="font-medium">No conversations yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Start a new chat to begin learning
              </p>
            </div>
            <Button
              onClick={handleCreate}
              disabled={creating}
              className="gap-2 bg-primary hover:bg-primary/90"
            >
              <Plus className="w-4 h-4" /> Start chatting
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {convos.map((c, i) => (
            <Card
              key={c.id}
              className="glass border-border/30 hover:border-primary/30 transition-all duration-200 cursor-pointer animate-fade-in-up group"
              style={{ animationDelay: `${i * 0.05}s` }}
              onClick={() => router.push(`/chat/${c.id}`)}
            >
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{c.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(c.updated_at).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(c.id);
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
