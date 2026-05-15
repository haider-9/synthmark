'use client';

import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ImageIcon, Loader2, X } from 'lucide-react';

interface CreateProjectDialogProps {
  onProjectCreated?: (project: any) => void;
}

export function CreateProjectDialog({ onProjectCreated }: CreateProjectDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles: File[] = [];
      const newPreviews: string[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} is not an image file`);
          continue;
        }
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`${file.name} is larger than 10MB`);
          continue;
        }
        
        newFiles.push(file);
        
        const reader = new FileReader();
        reader.onload = (e) => {
          newPreviews.push(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
      
      setImageFiles([...imageFiles, ...newFiles]);
      // Wait a bit for all FileReaders to complete
      setTimeout(() => {
        setImagePreviews([...imagePreviews, ...newPreviews]);
      }, 100);
    }
  };

  const removeImage = (index: number) => {
    setImageFiles(imageFiles.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Project name is required');
      return;
    }

    setLoading(true);

    try {
      // Upload images to Cloudinary first
      const uploadedImageUrls: { url: string; fileName: string }[] = [];

      for (const imageFile of imageFiles) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', imageFile);

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: uploadFormData,
        });

        if (!uploadResponse.ok) {
          throw new Error(`Failed to upload ${imageFile.name}`);
        }

        const uploadData = await uploadResponse.json();
        uploadedImageUrls.push({
          url: uploadData.url,
          fileName: imageFile.name,
        });
      }

      // Create project with uploaded image URLs
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      uploadedImageUrls.forEach((img, index) => {
        formData.append(`imageUrl_${index}`, img.url);
        formData.append(`fileName_${index}`, img.fileName);
      });
      formData.append('imageCount', uploadedImageUrls.length.toString());

      const response = await fetch('/api/projects', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create project');
      }

      const data = await response.json();
      toast.success('Project created successfully!');
      
      // Reset form
      setName('');
      setDescription('');
      setImageFiles([]);
      setImagePreviews([]);
      setOpen(false);

      // Call callback
      onProjectCreated?.(data.project);
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="text-[13px] bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-[#e8e8e8] transition-colors">
        New project
      </DialogTrigger>
      <DialogContent className="bg-[#111] border border-[#1e1e1e] max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">Create new project</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Project Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-[13px] text-[#aaa]">
              Project name
            </Label>
            <Input
              id="name"
              placeholder="e.g., Burger Dataset"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-[#1a1a1a] border border-[#2a2a2a] text-white placeholder:text-[#555] focus:border-[#444]"
              disabled={loading}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-[13px] text-[#aaa]">
              Description (optional)
            </Label>
            <Textarea
              id="description"
              placeholder="Describe your project..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-[#1a1a1a] border border-[#2a2a2a] text-white placeholder:text-[#555] focus:border-[#444] resize-none h-24"
              disabled={loading}
            />
          </div>

          {/* Images Upload */}
          <div className="space-y-2">
            <Label htmlFor="images" className="text-[13px] text-[#aaa]">
              Dataset images for annotation (optional)
            </Label>
            <input
              ref={fileInputRef}
              id="images"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="hidden"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-24 border-2 border-dashed border-[#2a2a2a] rounded-lg hover:border-[#444] transition-colors flex items-center justify-center cursor-pointer bg-[#0a0a0a]"
              disabled={loading}
            >
              <div className="flex flex-col items-center gap-2 text-[#555]">
                <ImageIcon size={20} />
                <span className="text-[12px]">Click to upload images</span>
              </div>
            </button>

            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <div className="space-y-2">
                <p className="text-[12px] text-[#888]">
                  {imagePreviews.length} image{imagePreviews.length !== 1 ? 's' : ''} selected
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-20 object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={12} className="text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex-1 text-[13px] bg-[#1a1a1a] text-white px-4 py-2 rounded-lg border border-[#2a2a2a] hover:bg-[#222] transition-colors disabled:opacity-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 text-[13px] bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-[#e8e8e8] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

