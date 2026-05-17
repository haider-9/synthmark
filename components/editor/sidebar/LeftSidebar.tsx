"use client";

import { useState } from "react";
import { useAnnotationStore } from "@/stores/useAnnotationStore";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Images,
  Layers,
  Tag,
  Database,
  Upload,
  Trash2,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Plus,
  Search,
  Square,
  Hexagon,
  Circle,
  CheckCircle2,
  Clock,
  AlertCircle,
  ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { prepareImageUpload } from "@/lib/client-image";

export function LeftSidebar({ projectId }: { projectId: string }) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [layersFilter, setLayersFilter] = useState("");
  const [newClassName, setNewClassName] = useState("");
  const [newClassColor, setNewClassColor] = useState("var(--primary)");

  const images = useAnnotationStore((s) => s.images);
  const activeImageId = useAnnotationStore((s) => s.activeImageId);
  const labelClasses = useAnnotationStore((s) => s.labelClasses);
  const annotations = useAnnotationStore((s) => s.annotations);
  const activeLabelId = useAnnotationStore((s) => s.activeLabelId);
  const selectedAnnotationIds = useAnnotationStore(
    (s) => s.selectedAnnotationIds
  );

  const setActiveImage = useAnnotationStore((s) => s.setActiveImage);
  const addImage = useAnnotationStore((s) => s.addImage);
  const removeImage = useAnnotationStore((s) => s.removeImage);
  const addLabelClass = useAnnotationStore((s) => s.addLabelClass);
  const updateLabelClass = useAnnotationStore((s) => s.updateLabelClass);
  const deleteLabelClass = useAnnotationStore((s) => s.deleteLabelClass);
  const setActiveLabelId = useAnnotationStore((s) => s.setActiveLabelId);
  const updateAnnotation = useAnnotationStore((s) => s.updateAnnotation);
  const setSelectedAnnotationIds = useAnnotationStore(
    (s) => s.setSelectedAnnotationIds
  );

  const completedImages = images.filter((img) => img.status === "completed");
  const inProgressImages = images.filter((img) => img.status === "in_progress");

  const filteredAnnotations = annotations.filter((ann) => {
    if (!layersFilter) return true;
    const label = labelClasses.find((lc) => lc.id === ann.labelId);
    return label?.name.toLowerCase().includes(layersFilter.toLowerCase());
  });

  const annotationTypeCounts = {
    box: annotations.filter((a) => a.type === "box").length,
    polygon: annotations.filter((a) => a.type === "polygon").length,
    keypoint: annotations.filter((a) => a.type === "keypoint").length,
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const imageFiles = Array.from(files).filter((file) => {
      const isImage = file.type.startsWith("image/");
      if (!isImage) toast.error(`${file.name} is not an image file`);
      return isImage;
    });

    if (imageFiles.length === 0) return;

    const upload = async () => {
      let count = 0;
      for (const file of imageFiles) {
        const prepared = await prepareImageUpload(file);

        const backendResponse = await fetch(
          `/api/projects/${projectId}/images`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              imageUrl: prepared.imageUrl,
              fileName: prepared.fileName,
              width: prepared.width,
              height: prepared.height,
            }),
          }
        );

        if (!backendResponse.ok) {
          throw new Error(`Failed to save ${file.name} to backend`);
        }

        const { image } = await backendResponse.json();

        addImage({
          id: image.id,
          url: image.imageUrl,
          name: image.fileName,
          width: image.width,
          height: image.height,
        });

        count++;
      }
      return count;
    };

    setUploading(true);
    const promise = upload();
    toast.promise(promise, {
      loading: `Uploading ${imageFiles.length} image${imageFiles.length > 1 ? "s" : ""}...`,
      success: (count) => `Uploaded ${count} image${count === 1 ? "" : "s"}`,
      error: (error) => error instanceof Error ? error.message : "Upload failed",
    });

    try {
      await promise;
    } finally {
      setUploading(false);
    }
  };

  const handleImageDelete = async (imageId: string, imageName: string) => {
    if (images.length === 1) {
      toast.error("Cannot delete the last image");
      return;
    }

    const remove = async () => {
      const response = await fetch(
        `/api/projects/${projectId}/images/${imageId}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        throw new Error("Failed to delete image");
      }
    };

    const promise = remove();
    toast.promise(promise, {
      loading: `Deleting ${imageName}...`,
      success: `Deleted ${imageName}`,
      error: (error) => error instanceof Error ? error.message : "Delete failed",
    });

    try {
      await promise;
      removeImage(imageId);
    } catch (error) {
      // toast.promise already presents the failure.
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const handleAddClass = async () => {
    if (!newClassName.trim()) {
      toast.error("Class name cannot be empty");
      return;
    }

    const createClass = async () => {
      const response = await fetch(`/api/projects/${projectId}/labels`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newClassName.trim(), color: newClassColor }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Failed to add class");
      return data.labelClass;
    };

    const promise = createClass();
    toast.promise(promise, {
      loading: "Adding class...",
      success: (labelClass) => `Added class "${labelClass.name}"`,
      error: (error) => error instanceof Error ? error.message : "Failed to add class",
    });

    try {
      const labelClass = await promise;
      addLabelClass(labelClass);
      setNewClassName("");
      setNewClassColor("var(--primary)");
    } catch (error) {
      // toast.promise already presents the failure.
    }
  };

  const handleDeleteClass = async (classId: string, className: string) => {
    const classAnnotations = annotations.filter((a) => a.labelId === classId);
    if (classAnnotations.length > 0) {
      toast.error(
        `Cannot delete "${className}" - it has ${classAnnotations.length} annotation(s)`
      );
      return;
    }

    const removeClass = async () => {
      const response = await fetch(`/api/projects/${projectId}/labels/${classId}`, {
        method: "DELETE",
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error ?? "Failed to delete class");
    };

    const promise = removeClass();
    toast.promise(promise, {
      loading: `Deleting class "${className}"...`,
      success: `Deleted class "${className}"`,
      error: (error) => error instanceof Error ? error.message : "Failed to delete class",
    });

    try {
      await promise;
      deleteLabelClass(classId);
      if (activeLabelId === classId) {
        setActiveLabelId(null);
      }
    } catch (error) {
      // toast.promise already presents the failure.
    }
  };

  const persistLabelClass = async (
    classId: string,
    updates: { name?: string; color?: string },
  ) => {
    const promise = (async () => {
      const response = await fetch(`/api/projects/${projectId}/labels/${classId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to update class");
      }
    })();

    toast.promise(promise, {
      loading: "Saving class...",
      success: "Class saved",
      error: (error) => error instanceof Error ? error.message : "Failed to update class",
    });

    try {
      await promise;
    } catch (error) {
      // toast.promise already presents the failure.
    }
  };

  const handleSetActiveClass = (classId: string) => {
    setActiveLabelId(classId);

    if (selectedAnnotationIds.length > 0) {
      selectedAnnotationIds.forEach((annId) => {
        updateAnnotation(annId, { labelId: classId });
      });
      toast.success(
        `Reclassified ${selectedAnnotationIds.length} annotation(s)`
      );
      setSelectedAnnotationIds([]);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-3 w-3" />;
      case "in_progress":
        return <Clock className="h-3 w-3" />;
      case "skipped":
        return <AlertCircle className="h-3 w-3" />;
      default:
        return <ImageIcon className="h-3 w-3" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "in_progress":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "skipped":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "box":
        return <Square className="h-4 w-4" />;
      case "polygon":
        return <Hexagon className="h-4 w-4" />;
      case "keypoint":
        return <Circle className="h-4 w-4" />;
      default:
        return <Square className="h-4 w-4" />;
    }
  };

  return (
    <div className="h-full flex flex-col bg-background border-r">
      <Tabs defaultValue="layers" className="flex-1 flex flex-col">
        <TabsList className="w-full grid grid-cols-3 h-7 rounded-none border-b">
          <TabsTrigger value="layers" className="h-full gap-1.5 text-xs">
            <Layers className="size-4" />
            Layers
          </TabsTrigger>
          <TabsTrigger value="classes" className="h-full gap-1.5 text-xs">
            <Tag className="h-3.5 w-3.5" />
            Classes
          </TabsTrigger>
          <TabsTrigger value="dataset" className="h-full gap-1.5 text-xs">
            <Database className="h-3.5 w-3.5" />
            Dataset
          </TabsTrigger>
        </TabsList>

       

        <TabsContent value="layers" className="flex-1 flex flex-col mt-0 p-3 space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">
                {annotations.length} Annotation{annotations.length !== 1 ? "s" : ""}
              </div>
            </div>

            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Filter layers..."
                value={layersFilter}
                onChange={(e) => setLayersFilter(e.target.value)}
                className="pl-8 h-8 text-xs"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <Badge variant="secondary" className="text-xs">
                <Square className="h-3 w-3 mr-1" />
                {annotationTypeCounts.box}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                <Hexagon className="h-3 w-3 mr-1" />
                {annotationTypeCounts.polygon}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                <Circle className="h-3 w-3 mr-1" />
                {annotationTypeCounts.keypoint}
              </Badge>
            </div>
          </div>

          <Separator />

          <ScrollArea className="flex-1">
            {filteredAnnotations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Layers className="h-12 w-12 text-muted-foreground mb-3" />
                <p className="text-sm font-medium mb-1">
                  {annotations.length === 0 ? "No annotations yet" : "No matches"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {annotations.length === 0
                    ? "Start drawing on the canvas"
                    : "Try a different filter"}
                </p>
              </div>
            ) : (
              <div className="space-y-1 pr-3">
                {filteredAnnotations.map((annotation) => {
                  const label = labelClasses.find(
                    (lc) => lc.id === annotation.labelId
                  );
                  return (
                    <div
                      key={annotation.id}
                      className="flex items-center gap-2 p-2 rounded hover:bg-accent transition-colors"
                    >
                      {getTypeIcon(annotation.type)}
                      <div
                        className="h-3 w-3 rounded-full border"
                        style={{ backgroundColor: label?.color || "var(--muted-foreground)" }}
                      />
                      <span className="text-xs flex-1 truncate">
                        {label?.name || "Unlabeled"}
                      </span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger
                            className={buttonVariants({ size: "sm", variant: "ghost" }) + " h-6 w-6 p-0"}
                            onClick={() =>
                              updateAnnotation(annotation.id, {
                                isVisible: !annotation.isVisible,
                              })
                            }
                          >
                            {annotation.isVisible ? (
                              <Eye className="h-3.5 w-3.5" />
                            ) : (
                              <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
                            )}
                          </TooltipTrigger>
                          <TooltipContent>Toggle visibility</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger
                            className={buttonVariants({ size: "sm", variant: "ghost" }) + " h-6 w-6 p-0"}
                            onClick={() =>
                              updateAnnotation(annotation.id, {
                                isLocked: !annotation.isLocked,
                              })
                            }
                          >
                            {annotation.isLocked ? (
                              <Lock className="h-3.5 w-3.5" />
                            ) : (
                              <Unlock className="h-3.5 w-3.5 text-muted-foreground" />
                            )}
                          </TooltipTrigger>
                          <TooltipContent>Toggle lock</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="classes" className="flex-1 flex flex-col mt-0 p-3 space-y-3">
          <div className="space-y-2">
            <div className="text-sm font-medium">
              {labelClasses.length} Class{labelClasses.length !== 1 ? "es" : ""}
            </div>
          </div>

          <Separator />

          <ScrollArea className="flex-1">
            {labelClasses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Tag className="h-12 w-12 text-muted-foreground mb-3" />
                <p className="text-sm font-medium mb-1">No classes yet</p>
                <p className="text-xs text-muted-foreground">
                  Add a class below to start
                </p>
              </div>
            ) : (
              <div className="space-y-1 pr-3 mb-3">
                {labelClasses.map((labelClass) => {
                  const usageCount = annotations.filter(
                    (a) => a.labelId === labelClass.id
                  ).length;
                  const isActive = labelClass.id === activeLabelId;

                  return (
                    <div
                      key={labelClass.id}
                      className={cn(
                        "flex items-center gap-2 p-2 rounded transition-colors cursor-pointer",
                        isActive
                          ? "bg-primary/10 hover:bg-primary/15"
                          : "hover:bg-accent"
                      )}
                      onClick={() => handleSetActiveClass(labelClass.id)}
                    >
                      <input
                        type="color"
                        value={labelClass.color}
                        onChange={(e) =>
                          updateLabelClass(labelClass.id, {
                            color: e.target.value,
                          })
                        }
                        onBlur={(e) =>
                          persistLabelClass(labelClass.id, { color: e.target.value })
                        }
                        onClick={(e) => e.stopPropagation()}
                        className="h-6 w-6 rounded cursor-pointer border"
                      />
                      <Input
                        value={labelClass.name}
                        onChange={(e) =>
                          updateLabelClass(labelClass.id, {
                            name: e.target.value,
                          })
                        }
                        onBlur={(e) =>
                          persistLabelClass(labelClass.id, { name: e.target.value })
                        }
                        onClick={(e) => e.stopPropagation()}
                        className="h-7 text-xs flex-1"
                      />
                      <Badge variant="secondary" className="text-xs">
                        {usageCount}
                      </Badge>
                      {isActive && (
                        <div className="h-2 w-2 rounded-full bg-primary" />
                      )}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger
                            className={buttonVariants({ size: "sm", variant: "ghost" }) + " h-6 w-6 p-0"}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClass(
                                labelClass.id,
                                labelClass.name
                              );
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </TooltipTrigger>
                          <TooltipContent>Delete class</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>

          <div className="space-y-2 pt-2 border-t">
            <div className="text-xs font-medium text-muted-foreground">
              Add New Class
            </div>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={newClassColor}
                onChange={(e) => setNewClassColor(e.target.value)}
                className="h-8 w-8 rounded cursor-pointer border"
              />
              <Input
                placeholder="Class name..."
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAddClass();
                  }
                }}
                className="h-8 text-xs flex-1"
              />
              <Button
                size="sm"
                onClick={handleAddClass}
                disabled={!newClassName.trim()}
                className="h-8"
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="dataset" className="flex-1 flex flex-col mt-0 p-3 space-y-3">
          <div className="space-y-2">
            <div className="text-sm font-medium">
              {images.length} {images.length === 1 ? "Image" : "Images"}
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Completion</span>
                <span>
                  {completedImages.length} / {images.length}
                </span>
              </div>
              <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{
                    width: `${
                      images.length > 0
                        ? (completedImages.length / images.length) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>

          <Separator />

          <ScrollArea className="flex-1">
            {images.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Database className="h-12 w-12 text-muted-foreground mb-3" />
                <p className="text-sm font-medium mb-1">No images in dataset</p>
                <p className="text-xs text-muted-foreground">
                  Upload images to build your dataset
                </p>
              </div>
            ) : (
              <div className="space-y-1 pr-3">
                {images.map((image) => (
                  <div
                    key={image.id}
                    className="flex items-center gap-2 p-2 rounded hover:bg-accent transition-colors cursor-pointer"
                    onClick={() => setActiveImage(image.id)}
                  >
                    <div className="h-10 w-14 rounded overflow-hidden bg-secondary flex-shrink-0">
                      <img
                        src={image.url}
                        alt={image.name}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">
                        {image.name}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] px-1 h-4 gap-0.5",
                            getStatusColor(image.status)
                          )}
                        >
                          {getStatusIcon(image.status)}
                          {image.status.replace("_", " ")}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
