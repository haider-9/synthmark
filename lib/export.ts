import { Annotation, LabelClass } from "@/types/annotation";

export type ExportFormat = "coco" | "yolo" | "pascal-voc";

interface ExportOptions {
  annotations: Annotation[];
  labelClasses: LabelClass[];
  imageWidth?: number;
  imageHeight?: number;
  imageName?: string;
}

function classById(classes: LabelClass[], id: string): LabelClass | undefined {
  return classes.find((c) => c.id === id);
}

function bboxOf(ann: Annotation): { x: number; y: number; width: number; height: number } | null {
  switch (ann.type) {
    case "box":
      return { x: ann.x, y: ann.y, width: ann.width, height: ann.height };
    case "polygon": {
      if (ann.points.length === 0) return null;
      const xs = ann.points.map((p) => p.x);
      const ys = ann.points.map((p) => p.y);
      const minX = Math.min(...xs);
      const maxX = Math.max(...xs);
      const minY = Math.min(...ys);
      const maxY = Math.max(...ys);
      return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
    }
    case "circle":
      return {
        x: ann.x - ann.radius,
        y: ann.y - ann.radius,
        width: ann.radius * 2,
        height: ann.radius * 2,
      };
    case "keypoint":
      return { x: ann.point.x, y: ann.point.y, width: 0, height: 0 };
    case "line": {
      if (ann.points.length === 0) return null;
      const xs = ann.points.map((p) => p.x);
      const ys = ann.points.map((p) => p.y);
      return { x: Math.min(...xs), y: Math.min(...ys), width: Math.max(...xs) - Math.min(...xs), height: Math.max(...ys) - Math.min(...ys) };
    }
  }
}

function segmentationOf(ann: Annotation): number[][] | null {
  if (ann.type === "polygon" && ann.points.length >= 3) {
    return [ann.points.flatMap((p) => [p.x, p.y])];
  }
  return null;
}

// ─── COCO JSON ──────────────────────────────────────────────────────────────────

function toCOCO({ annotations, labelClasses, imageWidth = 1920, imageHeight = 1080, imageName = "image.png" }: ExportOptions): string {
  const cats = labelClasses.map((cls, i) => ({
    id: i + 1,
    name: cls.name,
    supercategory: "object",
  }));

  const clsToId = new Map(labelClasses.map((cls, i) => [cls.id, i + 1]));

  const anns = annotations
    .filter((a) => a.isVisible)
    .map((ann, i) => {
      const bbox = bboxOf(ann);
      const seg = segmentationOf(ann);
      const catId = clsToId.get(ann.labelId) ?? 0;
      const area = bbox ? bbox.width * bbox.height : 0;

      return {
        id: i + 1,
        image_id: 1,
        category_id: catId,
        bbox: bbox ? [bbox.x, bbox.y, bbox.width, bbox.height] : [],
        segmentation: seg ?? [],
        area,
        iscrowd: 0,
      };
    });

  const coco = {
    info: {
      description: "Exported from Synthmark",
      version: "1.0",
      year: new Date().getFullYear(),
      contributor: "",
      date_created: new Date().toISOString(),
    },
    licenses: [{ id: 1, name: "Unknown", url: "" }],
    images: [
      {
        id: 1,
        file_name: imageName,
        width: imageWidth,
        height: imageHeight,
        license: 1,
        date_captured: "",
      },
    ],
    annotations: anns,
    categories: cats,
  };

  return JSON.stringify(coco, null, 2);
}

// ─── YOLO ────────────────────────────────────────────────────────────────────────

function toYOLO({ annotations, labelClasses, imageWidth = 1920, imageHeight = 1080 }: ExportOptions): string {
  const clsToId = new Map(labelClasses.map((cls, i) => [cls.id, i]));

  const lines: string[] = [];

  for (const ann of annotations) {
    if (!ann.isVisible) continue;
    const bbox = bboxOf(ann);
    if (!bbox || (bbox.width === 0 && bbox.height === 0)) continue;

    const catId = clsToId.get(ann.labelId);
    if (catId === undefined) continue;

    const xCenter = (bbox.x + bbox.width / 2) / imageWidth;
    const yCenter = (bbox.y + bbox.height / 2) / imageHeight;
    const w = bbox.width / imageWidth;
    const h = bbox.height / imageHeight;

    lines.push(`${catId} ${xCenter} ${yCenter} ${w} ${h}`);
  }

  return lines.join("\n");
}

// ─── Pascal VOC ──────────────────────────────────────────────────────────────────

function toPascalVOC({ annotations, labelClasses, imageWidth = 1920, imageHeight = 1080, imageName = "image.png" }: ExportOptions): string {
  const clsMap = new Map(labelClasses.map((cls) => [cls.id, cls.name]));

  const objects = annotations
    .filter((a) => a.isVisible)
    .map((ann) => {
      const bbox = bboxOf(ann);
      if (!bbox) return "";
      const name = clsMap.get(ann.labelId) ?? "unknown";

      return `  <object>
    <name>${escapeXml(name)}</name>
    <pose>Unspecified</pose>
    <truncated>0</truncated>
    <difficult>0</difficult>
    <bndbox>
      <xmin>${Math.round(bbox.x)}</xmin>
      <ymin>${Math.round(bbox.y)}</ymin>
      <xmax>${Math.round(bbox.x + bbox.width)}</xmax>
      <ymax>${Math.round(bbox.y + bbox.height)}</ymax>
    </bndbox>
  </object>`;
    })
    .filter(Boolean)
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<annotation>
  <folder>images</folder>
  <filename>${escapeXml(imageName)}</filename>
  <size>
    <width>${imageWidth}</width>
    <height>${imageHeight}</height>
    <depth>3</depth>
  </size>
  <segmented>0</segmented>
${objects}
</annotation>`;
}

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

// ─── Public API ──────────────────────────────────────────────────────────────────

export function exportAnnotations(format: ExportFormat, options: ExportOptions): { content: string; filename: string; mime: string } {
  switch (format) {
    case "coco": {
      const content = toCOCO(options);
      return { content, filename: "annotations_coco.json", mime: "application/json" };
    }
    case "yolo": {
      const content = toYOLO(options);
      return { content, filename: "annotations_yolo.txt", mime: "text/plain" };
    }
    case "pascal-voc": {
      const content = toPascalVOC(options);
      return { content, filename: "annotations_pascal.xml", mime: "application/xml" };
    }
  }
}

export function downloadExport(format: ExportFormat, options: ExportOptions): void {
  const { content, filename, mime } = exportAnnotations(format, options);
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
