"use client";

import { useRef, useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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

    setUploading(true);
    let successCount = 0;

    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) {
          toast.error(`${file.name} is not an image`);
          continue;
        }

        // Upload to Cloudinary
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "unsigned_preset");

        const cloudRes = await fetch(
          "https://api.cloudinary.com/v1_1/dntncz9no/image/upload",
          { method: "POST", body: formData }
        );

        if (!cloudRes.ok) throw new Error(`Failed to upload ${file.name}`);
        const cloudData = await cloudRes.json();

        // Save to backend
        const backendRes = await fetch(`/api/projects/${projectId}/images`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageUrl: cloudData.secure_url,
            fileName: cloudData.original_filename || file.name,
            width: cloudData.width,
            height: cloudData.height,
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

      if (successCount > 0) {
        toast.success(`Uploaded ${successCount} image${successCount > 1 ? "s" : ""}`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
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
          : "border-[#2a2a2a] hover:border-[#3a3a3a] hover:bg-[#141414]",
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
            <p className="text-[13px] text-[#555]">Uploading…</p>
          </>
        ) : (
          <>
            <div className="w-10 h-10 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center">
              <Upload className="h-5 w-5 text-[#555]" />
            </div>
            <div>
              <p className="text-[13px] font-medium text-[#888]">
                Drop images here or <span className="text-primary">browse</span>
              </p>
              <p className="text-[11px] text-[#444] mt-0.5">PNG, JPG, WEBP supported</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
