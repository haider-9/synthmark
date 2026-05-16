import { Annotation, LabelClass } from "@/types/annotation";

export type ExportFormat = "coco" | "yolo" | "pascal-voc" | "label-studio";

interface ExportOptions {
  annotations: Annotation[];
  labelClasses: LabelClass[];
  imageWidth?: number;
  imageHeight?: number;
  imageName?: string;
}

interface ImportOptions {
  input: string;
  labelClasses: LabelClass[];
  imageWidth?: number;
  imageHeight?: number;
  fallbackLabelId?: string | null;
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

// ─── Label Studio JSON ───────────────────────────────────────────────────────
// Produces the `result` array for a single task annotation.
// Points are expressed as percentages (0–100) of image dimensions.

export function toLabelStudioResult(
  { annotations, labelClasses, imageWidth = 1920, imageHeight = 1080 }: ExportOptions
): object[] {
  const clsMap = new Map(labelClasses.map((cls) => [cls.id, cls.name]));

  const results: object[] = [];

  for (const ann of annotations) {
    if (!ann.isVisible) continue;
    const labelName = clsMap.get(ann.labelId) ?? "unknown";
    const id = ann.id.replace(/-/g, "").slice(0, 10);

    if (ann.type === "polygon" && ann.points.length >= 3) {
      results.push({
        id,
        type: "polygonlabels",
        origin: "manual",
        to_name: "image",
        from_name: "label",
        original_width: imageWidth,
        original_height: imageHeight,
        value: {
          points: ann.points.map((p) => [
            parseFloat(((p.x / imageWidth) * 100).toFixed(4)),
            parseFloat(((p.y / imageHeight) * 100).toFixed(4)),
          ]),
          polygonlabels: [labelName],
        },
      });
    } else if (ann.type === "box") {
      results.push({
        id,
        type: "rectanglelabels",
        origin: "manual",
        to_name: "image",
        from_name: "label",
        original_width: imageWidth,
        original_height: imageHeight,
        value: {
          x: parseFloat(((ann.x / imageWidth) * 100).toFixed(4)),
          y: parseFloat(((ann.y / imageHeight) * 100).toFixed(4)),
          width: parseFloat(((ann.width / imageWidth) * 100).toFixed(4)),
          height: parseFloat(((ann.height / imageHeight) * 100).toFixed(4)),
          rotation: 0,
          rectanglelabels: [labelName],
        },
      });
    } else if (ann.type === "keypoint") {
      results.push({
        id,
        type: "keypointlabels",
        origin: "manual",
        to_name: "image",
        from_name: "label",
        original_width: imageWidth,
        original_height: imageHeight,
        value: {
          x: parseFloat(((ann.point.x / imageWidth) * 100).toFixed(4)),
          y: parseFloat(((ann.point.y / imageHeight) * 100).toFixed(4)),
          width: 0.5,
          keypointlabels: [labelName],
        },
      });
    }
  }

  return results;
}

function toLabelStudioFull(options: ExportOptions): string {
  return JSON.stringify(toLabelStudioResult(options), null, 2);
}

function parseLabelStudioInput(input: string): unknown {
  const trimmed = input.trim();
  if (!trimmed) return [];

  try {
    return JSON.parse(trimmed);
  } catch {
    const appendMatch = trimmed.match(/appendResults\s*\(([\s\S]*)\)\s*;?\s*$/);
    if (appendMatch?.[1]) {
      return JSON.parse(appendMatch[1]);
    }
    throw new Error("Paste Label Studio/NXUS JSON, or the appendResults(...) command.");
  }
}

function labelIdForResult(
  result: any,
  labelClasses: LabelClass[],
  fallbackLabelId?: string | null,
): string | null {
  const labelName =
    result?.value?.polygonlabels?.[0] ??
    result?.value?.rectanglelabels?.[0] ??
    result?.value?.keypointlabels?.[0];

  if (typeof labelName === "string") {
    const match = labelClasses.find((cls) => cls.name === labelName);
    if (match) return match.id;
  }

  return fallbackLabelId ?? labelClasses[0]?.id ?? null;
}

function resultArrayFromParsed(parsed: any): any[] {
  if (Array.isArray(parsed)) return parsed;
  if (Array.isArray(parsed?.result)) return parsed.result;
  if (Array.isArray(parsed?.annotations?.[0]?.result)) return parsed.annotations[0].result;
  return [];
}

// Converts Label Studio/NXUS result JSON back into Synthmark pixel annotations.
export function fromLabelStudioResult({
  input,
  labelClasses,
  imageWidth = 1920,
  imageHeight = 1080,
  fallbackLabelId,
}: ImportOptions): Annotation[] {
  const parsed = parseLabelStudioInput(input);
  const results = resultArrayFromParsed(parsed);

  return results.flatMap((result): Annotation[] => {
    const labelId = labelIdForResult(result, labelClasses, fallbackLabelId);
    if (!labelId || !result?.value) return [];

    const originalWidth = Number(result.original_width) || imageWidth;
    const originalHeight = Number(result.original_height) || imageHeight;
    const scaleX = imageWidth / originalWidth;
    const scaleY = imageHeight / originalHeight;
    const id = crypto.randomUUID();

    if (result.type === "polygonlabels" && Array.isArray(result.value.points)) {
      const points = result.value.points
        .filter((point: unknown) => Array.isArray(point) && point.length >= 2)
        .map(([x, y]: [number, number]) => ({
          x: (Number(x) / 100) * originalWidth * scaleX,
          y: (Number(y) / 100) * originalHeight * scaleY,
        }));

      if (points.length < 3) return [];
      return [{
        id,
        type: "polygon",
        labelId,
        points,
        isVisible: true,
        isLocked: false,
        metadata: { source: "label-studio-import" },
      }];
    }

    if (result.type === "rectanglelabels") {
      const x = (Number(result.value.x) / 100) * originalWidth * scaleX;
      const y = (Number(result.value.y) / 100) * originalHeight * scaleY;
      const width = (Number(result.value.width) / 100) * originalWidth * scaleX;
      const height = (Number(result.value.height) / 100) * originalHeight * scaleY;
      if (![x, y, width, height].every(Number.isFinite)) return [];

      return [{
        id,
        type: "box",
        labelId,
        x,
        y,
        width,
        height,
        isVisible: true,
        isLocked: false,
        metadata: { source: "label-studio-import" },
      }];
    }

    if (result.type === "keypointlabels") {
      const x = (Number(result.value.x) / 100) * originalWidth * scaleX;
      const y = (Number(result.value.y) / 100) * originalHeight * scaleY;
      if (![x, y].every(Number.isFinite)) return [];

      return [{
        id,
        type: "keypoint",
        labelId,
        point: { x, y },
        isVisible: true,
        isLocked: false,
        metadata: { source: "label-studio-import" },
      }];
    }

    return [];
  });
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
    case "label-studio": {
      const content = toLabelStudioFull(options);
      return { content, filename: "annotations_label_studio.json", mime: "application/json" };
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
