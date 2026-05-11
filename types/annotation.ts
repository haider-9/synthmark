export type AnnotationType = 'box' | 'polygon' | 'keypoint' | 'line' | 'circle' | 'brush' | 'lasso';
export type ActiveTool = AnnotationType | 'select' | 'pan' | 'erase' | 'merge';

export interface Point {
  x: number;
  y: number;
}

export interface AnnotationBase {
  id: string;
  type: AnnotationType;
  labelId: string;
  isVisible: boolean;
  isLocked: boolean;
  metadata?: Record<string, any>;
}

export interface BoundingBox extends AnnotationBase {
  type: 'box';
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Polygon extends AnnotationBase {
  type: 'polygon';
  points: Point[]; // [{x, y}, ...]
}

export interface Keypoint extends AnnotationBase {
  type: 'keypoint';
  point: Point;
}

export interface CircleAnnotation extends AnnotationBase {
  type: 'circle';
  x: number;
  y: number;
  radius: number;
}

export interface BrushAnnotation extends AnnotationBase {
  type: 'brush';
  points: Point[];
  strokeWidth: number;
}

export type Annotation = BoundingBox | Polygon | Keypoint | LineAnnotation | CircleAnnotation | BrushAnnotation;

export interface LabelClass {
  id: string;
  name: string;
  color: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  classes: LabelClass[];
}

export interface DatasetItem {
  id: string;
  projectId: string;
  imageUrl: string;
  width: number;
  height: number;
  annotations: Annotation[];
  status: 'todo' | 'in_progress' | 'completed';
}
