"use client";

import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { images as imgApi } from "@/lib/api";
import type { Document as DocType } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ImageIcon,
  Upload,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
} from "lucide-react";

export default function ImagesPage() {
  const [uploads, setUploads] = useState<
    { file: File; preview: string; status: "uploading" | "done" | "error"; doc?: DocType }[]
  >([]);

  const onDrop = async (acceptedFiles: File[]) => {
    for (const file of acceptedFiles) {
      const preview = URL.createObjectURL(file);
      const entry = { file, preview, status: "uploading" as const };
      setUploads((prev) => [entry, ...prev]);
      try {
        const doc = await imgApi.upload(file);
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
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/bmp": [".bmp"],
      "image/tiff": [".tiff"],
    },
    maxSize: 20 * 1024 * 1024,
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
        <h1 className="text-2xl font-bold tracking-tight">Images</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Upload images for OCR processing and knowledge extraction
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
                ? "Drop images here"
                : "Drag & drop images, or click to browse"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              PNG, JPG, BMP, TIFF — up to 20MB
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Image grid */}
      {uploads.length > 0 && (
        <Card className="glass border-border/30 animate-fade-in-up">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-primary" />
              Uploaded Images
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {uploads.map((u, i) => (
                <div
                  key={i}
                  className="relative group rounded-xl overflow-hidden border border-border/30 bg-muted/30"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={u.preview}
                    alt={u.file.name}
                    className="w-full aspect-square object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2 space-y-2">
                    <p className="text-xs text-white truncate w-full text-center font-medium">
                      {u.file.name}
                    </p>
                    {statusBadge(u.doc?.status ?? u.status)}
                  </div>
                  {u.status === "uploading" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <Loader2 className="w-6 h-6 text-white animate-spin" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
