"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { users as usersApi } from "@/lib/api";
import type { LearningStats } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  MessageSquare,
  FileText,
  MessagesSquare,
  Plus,
  Upload,
  TrendingUp,
  BookOpen,
  Loader2,
} from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<LearningStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    usersApi
      .learningStats()
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    {
      label: "Conversations",
      value: stats?.total_conversations ?? 0,
      icon: MessageSquare,
      color: "text-chart-1",
      bg: "bg-chart-1/10",
    },
    {
      label: "Documents",
      value: stats?.total_documents ?? 0,
      icon: FileText,
      color: "text-chart-2",
      bg: "bg-chart-2/10",
    },
    {
      label: "Messages",
      value: stats?.total_messages ?? 0,
      icon: MessagesSquare,
      color: "text-chart-4",
      bg: "bg-chart-4/10",
    },
  ];

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-6xl mx-auto">
      {/* Welcome */}
      <div className="space-y-1 animate-fade-in-up">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {user?.username ?? "Learner"} 👋
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s your learning progress at a glance.
        </p>
      </div>

      {/* Quick actions */}
      <div className="flex gap-3 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
        <Link href="/chat">
          <Button className="gap-2 bg-primary hover:bg-primary/90 glow-primary">
            <Plus className="w-4 h-4" /> New Chat
          </Button>
        </Link>
        <Link href="/documents">
          <Button variant="secondary" className="gap-2">
            <Upload className="w-4 h-4" /> Upload Document
          </Button>
        </Link>
      </div>

      {/* Stats cards */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {statCards.map(({ label, value, icon: Icon, color, bg }, i) => (
            <Card
              key={label}
              className="glass border-border/30 hover:border-border/50 transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: `${0.15 + i * 0.08}s` }}
            >
              <CardContent className="flex items-center gap-4 p-6">
                <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{value}</p>
                  <p className="text-sm text-muted-foreground">{label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Learning topics */}
      {stats && stats.topics.length > 0 && (
        <Card className="glass border-border/30 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="w-5 h-5 text-primary" />
              Learning Topics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.topics.map((topic) => (
              <div key={topic.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium text-sm">{topic.topic}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {topic.interaction_count} interactions ·{" "}
                    {Math.round(topic.proficiency_score * 100)}%
                  </span>
                </div>
                <Progress
                  value={topic.proficiency_score * 100}
                  className="h-2 bg-muted"
                />
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
