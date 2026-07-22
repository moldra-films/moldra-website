"use client";

import { useState } from "react";
import { UploadCloud, CheckCircle2, AlertCircle, Copy, Link } from "lucide-react";

export default function R2UploadTest() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedUrl, setUploadedUrl] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setErrorMsg("");
      setUploadedUrl("");
      setProgress(0);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setErrorMsg("");
    setProgress(10); // Requesting stage

    try {
      // Step 1: Request presigned URL from API route
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to fetch presigned URL.");
      }

      const { uploadUrl, fileUrl } = await res.json();
      setProgress(40); // Uploading stage

      // Step 2: Upload directly to Cloudflare R2
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });

      if (!uploadRes.ok) {
        throw new Error("Direct upload to Cloudflare R2 failed.");
      }

      setProgress(100);
      setUploadedUrl(fileUrl);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "An unexpected error occurred during upload.");
      setProgress(0);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-black/40 border border-white/5 space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <UploadCloud className="w-5 h-5 text-primary" />
        <h3 className="text-sm font-bold uppercase tracking-wider text-white">Upload de Mídias (Cloudflare R2)</h3>
      </div>

      <p className="text-xs text-gray-400 font-sans font-light leading-relaxed">
        Selecione fotos, vídeos ou arquivos pesados do seu projeto para enviá-los diretamente ao bucket seguro da Cloudflare R2.
      </p>

      {/* Selector Box */}
      <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-white/10 rounded-2xl hover:border-primary/30 transition-all cursor-pointer relative bg-black/20 group">
        <input
          type="file"
          onChange={handleFileChange}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
        />
        <UploadCloud className="w-8 h-8 text-gray-500 group-hover:text-primary transition-colors mb-3" />
        <span className="text-xs font-bold text-gray-300 font-sans block truncate max-w-[200px]">
          {file ? file.name : "Escolher arquivo..."}
        </span>
        <span className="text-[10px] text-gray-500 mt-1">Imagens, vídeos e PDFs</span>
      </div>

      {file && (
        <div className="space-y-4">
          {/* Progress bar */}
          {progress > 0 && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                <span>{progress === 100 ? "Concluído" : "Carregando..."}</span>
                <span>{progress}%</span>
              </div>
              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Trigger button */}
          {!uploadedUrl && !uploading && (
            <button
              onClick={handleUpload}
              className="w-full py-3 bg-primary hover:bg-[#B39356] text-black font-semibold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
            >
              Iniciar Upload
            </button>
          )}

          {/* Success layout */}
          {uploadedUrl && (
            <div className="space-y-4 pt-3 border-t border-white/5">
              <div className="flex items-center gap-2 text-green-400 text-xs font-bold font-sans">
                <CheckCircle2 className="w-4 h-4" />
                Upload finalizado!
              </div>

              {/* Display copy URL box */}
              <div className="flex bg-black/50 border border-white/10 rounded-xl p-2.5 items-center justify-between gap-4">
                <span className="text-[10px] text-gray-400 font-mono truncate flex-1">{uploadedUrl}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(uploadedUrl);
                    alert("Link copiado!");
                  }}
                  className="p-2 bg-white/5 hover:bg-white/10 text-primary border border-white/5 rounded-lg cursor-pointer transition-colors"
                  title="Copiar URL"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Previews if image/video */}
              {file.type.startsWith("image/") && (
                <div className="aspect-video relative rounded-xl overflow-hidden border border-white/5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={uploadedUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
              {file.type.startsWith("video/") && (
                <div className="aspect-video relative rounded-xl overflow-hidden bg-black border border-white/5">
                  <video src={uploadedUrl} controls className="w-full h-full object-contain" />
                </div>
              )}
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2.5 text-xs text-red-400 font-sans">
              <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block mb-0.5">Erro no Upload</span>
                <span className="font-light">{errorMsg}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
