"use client";

import { useRef, useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { prepareImageUpload } from "@/lib/client-image";

interface UploadedImage {
  id: string;
  fileName: string;
  imageUrl: string;
  width: number;
  height: number;
  status: "todo";
}

interface ImageUploadZoneProps {
  projectId: string;
  onUploaded?: (image: UploadedImage) => void;
  className?: string;
}

export function ImageUploadZone({ projectId, onUploaded, className }: ImageUploadZoneProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const imageFiles = Array.from(files).filter((file) => {
      const isImage = file.type.startsWith("image/");
      if (!isImage) toast.error(`${file.name} is not an image`);
      return isImage;
    });

    if (imageFiles.length === 0) return;

    const upload = async () => {
      let successCount = 0;
      for (const file of imageFiles) {
        const prepared = await prepareImageUpload(file);

        const backendRes = await fetch(`/api/projects/${projectId}/images`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageUrl: prepared.imageUrl,
            fileName: prepared.fileName,
            width: prepared.width,
            height: prepared.height,
          }),
        });

        if (!backendRes.ok) throw new Error(`Failed to save ${file.name}`);
        const { image } = await backendRes.json();

        onUploaded?.({
          id: image.id,
          fileName: image.fileName,
          imageUrl: image.imageUrl,
          width: image.width,
          height: image.height,
          status: "todo",
        });

        successCount++;
      }

      return successCount;
    };

    setUploading(true);
    const promise = upload();

    toast.promise(promise, {
      loading: `Uploading ${imageFiles.length} image${imageFiles.length > 1 ? "s" : ""}...`,
      success: (count) => `Uploaded ${count} image${count === 1 ? "" : "s"}`,
      error: (err) => err instanceof Error ? err.message : "Upload failed",
    });

    try {
      await promise;
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      className={cn(
        "relative border-2 border-dashed rounded-xl transition-colors cursor-pointer",
        dragActive
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/50 hover:bg-card",
        uploading && "pointer-events-none opacity-60",
        className
      )}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
      onDragLeave={() => setDragActive(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragActive(false);
        uploadFiles(e.dataTransfer.files);
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => uploadFiles(e.target.files)}
      />

      <div className="flex flex-col items-center justify-center gap-2 py-8 px-4 text-center select-none">
        {uploading ? (
          <>
            <Loader2 className="h-6 w-6 text-primary animate-spin" />
            <p className="text-[13px] text-muted-foreground">Uploading…</p>
          </>
        ) : (
          <>
            <div className="w-10 h-10 rounded-xl bg-muted border border-border flex items-center justify-center">
              <Upload className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-[13px] font-medium text-muted-foreground">
                Drop images here or <span className="text-primary">browse</span>
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">PNG, JPG, WEBP supported</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
