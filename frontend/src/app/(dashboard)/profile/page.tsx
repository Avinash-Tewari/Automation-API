"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { users as usersApi } from "@/lib/api";
import type { LearningStats } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Mail,
  Calendar,
  MessageSquare,
  FileText,
  MessagesSquare,
  BookOpen,
  TrendingUp,
  Loader2,
} from "lucide-react";

export default function ProfilePage() {
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

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold tracking-tight animate-fade-in-up">Profile</h1>

      {/* User Card */}
      <Card className="glass border-border/30 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center glow-primary">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{user?.username}</h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <Mail className="w-4 h-4" /> {user?.email}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
                <Calendar className="w-4 h-4" /> Joined{" "}
                {user?.created_at
                  ? new Date(user.created_at).toLocaleDateString(undefined, {
                      month: "long",
                      year: "numeric",
                    })
                  : "—"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
      ) : stats ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                label: "Conversations",
                value: stats.total_conversations,
                icon: MessageSquare,
                color: "text-chart-1",
                bg: "bg-chart-1/10",
              },
              {
                label: "Documents",
                value: stats.total_documents,
                icon: FileText,
                color: "text-chart-2",
                bg: "bg-chart-2/10",
              },
              {
                label: "Messages",
                value: stats.total_messages,
                icon: MessagesSquare,
                color: "text-chart-4",
                bg: "bg-chart-4/10",
              },
            ].map(({ label, value, icon: Icon, color, bg }, i) => (
              <Card
                key={label}
                className="glass border-border/30 animate-fade-in-up"
                style={{ animationDelay: `${0.15 + i * 0.08}s` }}
              >
                <CardContent className="flex items-center gap-4 p-5">
                  <div
                    className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}
                  >
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <div>
                    <p className="text-xl font-bold">{value}</p>
                    <p className="text-xs text-muted-foreground">{label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Topics */}
          {stats.topics.length > 0 && (
            <Card
              className="glass border-border/30 animate-fade-in-up"
              style={{ animationDelay: "0.4s" }}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BookOpen className="w-5 h-5 text-primary" />
                  Topic Proficiency
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {stats.topics.map((topic, i) => (
                  <div key={topic.id}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium text-sm">{topic.topic}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {Math.round(topic.proficiency_score * 100)}%
                      </span>
                    </div>
                    <Progress
                      value={topic.proficiency_score * 100}
                      className="h-2 bg-muted"
                    />
                    {i < stats.topics.length - 1 && (
                      <Separator className="mt-4 bg-border/20" />
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </>
      ) : null}
    </div>
  );
}
