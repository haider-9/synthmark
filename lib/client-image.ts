"use client";

export interface PreparedImageUpload {
  imageUrl: string;
  fileName: string;
  width: number;
  height: number;
}

export function prepareImageUpload(file: File): Promise<PreparedImageUpload> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
    reader.onload = () => {
      const imageUrl = String(reader.result ?? "");
      if (!imageUrl) {
        reject(new Error(`Failed to read ${file.name}`));
        return;
      }

      const img = new Image();
      img.onerror = () => reject(new Error(`Failed to inspect ${file.name}`));
      img.onload = () => {
        resolve({
          imageUrl,
          fileName: file.name,
          width: img.naturalWidth,
          height: img.naturalHeight,
        });
      };
      img.src = imageUrl;
    };

    reader.readAsDataURL(file);
  });
}
