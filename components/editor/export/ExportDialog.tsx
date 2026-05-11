"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, FileJson, FileText, FileCode, Check } from "lucide-react";
import { useAnnotationStore } from "@/stores/useAnnotationStore";
import { downloadExport } from "@/lib/export";
import type { ExportFormat } from "@/lib/export";

const FORMATS: {
  value: ExportFormat;
  label: string;
  icon: React.ElementType;
  description: string;
  formats: string;
}[] = [
  {
    value: "coco",
    label: "COCO JSON",
    icon: FileJson,
    description: "Standard COCO annotation format with bounding boxes and polygon segmentation.",
    formats: "JSON",
  },
  {
    value: "yolo",
    label: "YOLO",
    icon: FileText,
    description: "One file per image with normalized bounding boxes. Compatible with YOLO v5–v10.",
    formats: "TXT",
  },
  {
    value: "pascal-voc",
    label: "Pascal VOC",
    icon: FileCode,
    description: "XML annotation files following the Pascal VOC format with bounding boxes.",
    formats: "XML",
  },
];

export function ExportDialog() {
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<ExportFormat>("coco");
  const [exported, setExported] = useState(false);
  const annotations = useAnnotationStore((s) => s.annotations);
  const labelClasses = useAnnotationStore((s) => s.labelClasses);

  const visibleCount = annotations.filter((a) => a.isVisible).length;

  const handleExport = () => {
    downloadExport(format, {
      annotations,
      labelClasses,
      imageWidth: 1920,
      imageHeight: 1080,
      imageName: "image.png",
    });
    setExported(true);
    setTimeout(() => {
      setOpen(false);
      setExported(false);
    }, 1200);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" />}>
        <Download className="h-3.5 w-3.5" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export annotations</DialogTitle>
          <DialogDescription>
            Choose a format to export {visibleCount} visible annotation{visibleCount !== 1 ? "s" : ""}.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-2.5 py-2">
          {FORMATS.map((f) => (
            <button
              key={f.value}
              onClick={() => {
                setFormat(f.value);
                setExported(false);
              }}
              className={`flex items-start gap-3 rounded-lg border p-3 text-left transition-colors ${
                format === f.value
                  ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                  : "border-border hover:border-border/80 hover:bg-muted/50"
              }`}
            >
              <span
                className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border ${
                  format === f.value
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-muted text-muted-foreground"
                }`}
              >
                {exported && format === f.value ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <f.icon className="h-4 w-4" />
                )}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{f.label}</span>
                  <span className="text-[10px] font-mono uppercase text-muted-foreground/60 border border-border rounded px-1 py-0.5">
                    {f.formats}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  {f.description}
                </p>
              </div>
            </button>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={visibleCount === 0}>
            {exported ? "Exported!" : "Export"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
