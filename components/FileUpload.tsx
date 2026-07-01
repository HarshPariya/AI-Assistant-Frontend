"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, X, Loader2 } from "lucide-react";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isLoading?: boolean;
  accept?: string;
  label?: string;
  description?: string;
  maxSizeMB?: number;
  multiple?: boolean;
  onMultipleFilesSelect?: (files: File[]) => void;
  accentColor?: string;
  accentHex?: string;
}

export default function FileUpload({
  onFileSelect,
  isLoading = false,
  accept = ".pdf",
  label = "Drop your file here",
  description = "or click to browse",
  maxSizeMB = 20,
  multiple = false,
  onMultipleFilesSelect,
  accentHex = "#6366f1",
}: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [error, setError] = useState<string>("");

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setError("");
      if (multiple && onMultipleFilesSelect) {
        setSelectedFiles(acceptedFiles);
        onMultipleFilesSelect(acceptedFiles);
      } else {
        const file = acceptedFiles[0];
        if (file) {
          if (file.size > maxSizeMB * 1024 * 1024) {
            setError(`File too large. Maximum size is ${maxSizeMB}MB.`);
            return;
          }
          setSelectedFile(file);
          onFileSelect(file);
        }
      }
    },
    [onFileSelect, maxSizeMB, multiple, onMultipleFilesSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept.split(",").reduce((acc, ext) => {
      if (ext.trim() === ".pdf") acc["application/pdf"] = [".pdf"];
      if (ext.trim() === ".png") acc["image/png"] = [".png"];
      if (ext.trim() === ".jpg" || ext.trim() === ".jpeg") acc["image/jpeg"] = [".jpg", ".jpeg"];
      if (ext.trim() === ".webp") acc["image/webp"] = [".webp"];
      if (ext.trim() === ".gif") acc["image/gif"] = [".gif"];
      return acc;
    }, {} as Record<string, string[]>),
    multiple,
  });

  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    setSelectedFiles([]);
    setError("");
  };

  const displayFiles = multiple ? selectedFiles : selectedFile ? [selectedFile] : [];

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`drop-zone p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragActive ? "drag-over" : ""
        } ${isLoading ? "pointer-events-none opacity-60" : ""}`}
        style={{
          borderColor: isDragActive ? accentHex : undefined,
          background: isDragActive ? `${accentHex}08` : undefined,
        }}
      >
        <input {...getInputProps()} />

        {isLoading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: `${accentHex}15`, border: `1px solid ${accentHex}30` }}>
              <Loader2 size={28} className="animate-spin" style={{ color: accentHex }} />
            </div>
            <p className="text-sm" style={{ color: "var(--muted)" }}>Processing your file…</p>
          </div>
        ) : displayFiles.length > 0 ? (
          <div className="space-y-3">
            {displayFiles.map((file, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl px-4 py-3 text-left"
                style={{ background: `${accentHex}10`, border: `1px solid ${accentHex}25` }}>
                <FileText size={20} className="flex-shrink-0" style={{ color: accentHex }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: "var(--fg)" }}>{file.name}</p>
                  <p className="text-xs" style={{ color: "var(--faint)" }}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                {!multiple && (
                  <button onClick={clearFile}
                    style={{ color: "var(--faint)" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "#ef4444")}
                    onMouseLeave={e => (e.currentTarget.style.color = "var(--faint)")}>
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}
            {multiple && (
              <button onClick={clearFile} className="text-xs mt-2 transition-colors"
                style={{ color: "#f87171" }}>
                Clear all files
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${isDragActive ? "scale-110" : ""}`}
              style={{ background: `${accentHex}12`, border: `1px solid ${accentHex}28` }}
            >
              <Upload size={24} style={{ color: isDragActive ? accentHex : "var(--faint)" }} />
            </div>
            <div>
              <p className="font-medium text-sm" style={{ color: "var(--fg)" }}>{label}</p>
              <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>{description}</p>
              <p className="text-xs mt-1.5" style={{ color: "var(--faint)" }}>
                Max {maxSizeMB}MB · {accept} files
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-center" style={{ color: "#f87171" }}>{error}</p>
      )}
    </div>
  );
}
