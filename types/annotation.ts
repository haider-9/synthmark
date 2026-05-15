export type AnnotationType = 'polygon' | 'keypoint' | 'line' | 'box' | 'circle';
export type ActiveTool = AnnotationType | 'select' | 'pan' | 'erase' | 'merge' | 'lasso';

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

export interface Polygon extends AnnotationBase {
  type: 'polygon';
  points: Point[]; // [{x, y}, ...]
}

export interface Keypoint extends AnnotationBase {
  type: 'keypoint';
  point: Point;
}

export interface LineAnnotation extends AnnotationBase {
  type: 'line';
  points: Point[];
}

export interface BoundingBox extends AnnotationBase {
  type: 'box';
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CircleAnnotation extends AnnotationBase {
  type: 'circle';
  x: number;
  y: number;
  radius: number;
}

export type Annotation = Polygon | Keypoint | LineAnnotation | BoundingBox | CircleAnnotation;

export interface LabelClass {
  id: string;
  name: string;
  color: string;
  shortcut?: string;
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
