"use client";

import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { documents as docApi } from "@/lib/api";
import type { Document as DocType } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  FileText,
  Upload,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
} from "lucide-react";

export default function DocumentsPage() {
  const [uploads, setUploads] = useState<
    { file: File; status: "uploading" | "done" | "error"; doc?: DocType }[]
  >([]);

  const onDrop = async (acceptedFiles: File[]) => {
    for (const file of acceptedFiles) {
      const entry = { file, status: "uploading" as const };
      setUploads((prev) => [entry, ...prev]);
      try {
        const doc = await docApi.upload(file);
        setUploads((prev) =>
          prev.map((u) =>
            u.file === file ? { ...u, status: "done" as const, doc } : u
          )
        );
      } catch {
        setUploads((prev) =>
          prev.map((u) =>
            u.file === file ? { ...u, status: "error" as const } : u
          )
        );
      }
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "text/plain": [".txt"],
    },
    maxSize: 50 * 1024 * 1024,
  });

  const statusBadge = (status: string) => {
    switch (status) {
      case "uploading":
      case "processing":
        return (
          <Badge variant="secondary" className="gap-1 bg-chart-2/10 text-chart-2 border-chart-2/20">
            <Clock className="w-3 h-3" /> Processing
          </Badge>
        );
      case "ready":
      case "done":
        return (
          <Badge variant="secondary" className="gap-1 bg-chart-4/10 text-chart-4 border-chart-4/20">
            <CheckCircle2 className="w-3 h-3" /> Ready
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="gap-1 bg-destructive/10 text-destructive border-destructive/20">
            <XCircle className="w-3 h-3" /> Error
          </Badge>
        );
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold tracking-tight">Documents</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Upload PDF, DOCX, or TXT files to build your knowledge base
        </p>
      </div>

      {/* Dropzone */}
      <Card
        {...getRootProps()}
        className={`glass border-2 border-dashed cursor-pointer transition-all duration-300 animate-fade-in-up ${
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-border/40 hover:border-primary/40"
        }`}
      >
        <input {...getInputProps()} />
        <CardContent className="flex flex-col items-center justify-center py-16 space-y-4">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${
              isDragActive ? "bg-primary/20" : "bg-muted"
            }`}
          >
            <Upload
              className={`w-8 h-8 transition-colors ${
                isDragActive ? "text-primary" : "text-muted-foreground"
              }`}
            />
          </div>
          <div className="text-center">
            <p className="font-medium">
              {isDragActive
                ? "Drop files here"
                : "Drag & drop files, or click to browse"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              PDF, DOCX, TXT — up to 50MB
            </p>
          </div>
        </CardContent>
      </Card>

      {/* File list */}
      {uploads.length > 0 && (
        <Card className="glass border-border/30 animate-fade-in-up">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Uploaded Files
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {uploads.map((u, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/20"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="w-5 h-5 text-muted-foreground shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {u.file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(u.file.size / 1024).toFixed(1)} KB
                      {u.doc ? ` · ${u.doc.chunk_count} chunks` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {u.status === "uploading" && (
                    <Loader2 className="w-4 h-4 text-primary animate-spin" />
                  )}
                  {statusBadge(u.doc?.status ?? u.status)}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
