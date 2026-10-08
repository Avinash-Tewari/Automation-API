"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import { messages as msgApi } from "@/lib/api";
import type { Message } from "@/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Bot, User, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function ChatPage() {
  const { id } = useParams<{ id: string }>();
  const [messagesList, setMessagesList] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamText, setStreamText] = useState("");
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Load existing messages
  useEffect(() => {
    if (!id) return;
    msgApi
      .list(id)
      .then(setMessagesList)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesList, streamText]);

  const handleSend = useCallback(async () => {
    const content = input.trim();
    if (!content || streaming) return;

    // Optimistic user message
    const userMsg: Message = {
      id: `temp-${Date.now()}`,
      role: "user",
      content,
      created_at: new Date().toISOString(),
    };
    setMessagesList((prev) => [...prev, userMsg]);
    setInput("");
    setStreaming(true);
    setStreamText("");

    try {
      const res = await msgApi.send(id, { content });
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6).trim();
              if (data === "[DONE]") break;
              try {
                const parsed = JSON.parse(data);
                if (parsed.token) {
                  fullText += parsed.token;
                  setStreamText(fullText);
                }
                if (parsed.error) {
                  fullText += `\n\n_Error: ${parsed.error}_`;
                  setStreamText(fullText);
                }
              } catch {
                // skip malformed
              }
            }
          }
        }
      }

      // Finalize assistant message
      const assistantMsg: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: fullText || "No response received.",
        created_at: new Date().toISOString(),
      };
      setMessagesList((prev) => [...prev, assistantMsg]);
    } catch {
      const errMsg: Message = {
        id: `err-${Date.now()}`,
        role: "assistant",
        content: "_Could not reach the server. Please try again._",
        created_at: new Date().toISOString(),
      };
      setMessagesList((prev) => [...prev, errMsg]);
    } finally {
      setStreaming(false);
      setStreamText("");
    }
  }, [id, input, streaming]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <ScrollArea className="flex-1 px-4 md:px-8 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            </div>
          ) : messagesList.length === 0 && !streaming ? (
            <div className="flex flex-col items-center justify-center py-24 space-y-4 animate-fade-in-up">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Bot className="w-8 h-8 text-primary" />
              </div>
              <p className="text-muted-foreground text-center max-w-sm">
                Send a message to start the conversation. I can help you learn from your uploaded documents.
              </p>
            </div>
          ) : (
            <>
              {messagesList.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}

              {/* Streaming message */}
              {streaming && streamText && (
                <div className="flex gap-3 animate-fade-in-up">
                  <Avatar className="w-8 h-8 shrink-0 mt-1">
                    <AvatarFallback className="bg-primary/20 text-primary">
                      <Bot className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 p-4 rounded-2xl rounded-tl-sm bg-card border border-border/30">
                    <div className="prose prose-invert prose-sm max-w-none">
                      <ReactMarkdown>{streamText}</ReactMarkdown>
                    </div>
                    <span className="inline-block w-2 h-4 bg-primary ml-1 animate-pulse-glow rounded-sm" />
                  </div>
                </div>
              )}

              {streaming && !streamText && (
                <div className="flex gap-3 animate-fade-in-up">
                  <Avatar className="w-8 h-8 shrink-0 mt-1">
                    <AvatarFallback className="bg-primary/20 text-primary">
                      <Bot className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="p-4 rounded-2xl rounded-tl-sm bg-card border border-border/30">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* Input bar */}
      <div className="border-t border-border/30 glass px-4 md:px-8 py-4">
        <div className="max-w-3xl mx-auto flex gap-3">
          <Textarea
            id="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about your documents…"
            rows={1}
            className="min-h-[44px] max-h-32 resize-none bg-input/50 border-border/50 focus:border-primary/50 transition-colors"
          />
          <Button
            id="chat-send"
            onClick={handleSend}
            disabled={!input.trim() || streaming}
            size="icon"
            className="h-11 w-11 shrink-0 bg-primary hover:bg-primary/90 glow-primary transition-all"
          >
            {streaming ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <Avatar className="w-8 h-8 shrink-0 mt-1">
        <AvatarFallback
          className={
            isUser
              ? "bg-chart-2/20 text-chart-2"
              : "bg-primary/20 text-primary"
          }
        >
          {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
        </AvatarFallback>
      </Avatar>
      <div
        className={`flex-1 min-w-0 p-4 rounded-2xl ${
          isUser
            ? "rounded-tr-sm bg-primary/15 border border-primary/20"
            : "rounded-tl-sm bg-card border border-border/30"
        }`}
      >
        {isUser ? (
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="prose prose-invert prose-sm max-w-none">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
