'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { DashboardNav } from '@/components/dashboard/DashboardNav';
import { AddImagesDialog } from '@/components/projects/AddImagesDialog';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Play, MoreVertical } from 'lucide-react';
import { toast } from 'sonner';

interface Project {
  id: string;
  name: string;
  description: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface DatasetItem {
  id: string;
  projectId: string;
  fileName: string;
  status: 'todo' | 'in_progress' | 'completed' | 'skipped';
  createdAt: string;
}

function ProjectDetailsContent() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const [project, setProject] = useState<Project | null>(null);
  const [images, setImages] = useState<DatasetItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjectDetails();
  }, [projectId]);

  const fetchProjectDetails = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`);
      if (response.ok) {
        const data = await response.json();
        setProject(data.project);
        setImages(data.images || []);
      } else {
        toast.error('Project not found');
        router.push('/projects');
      }
    } catch (error) {
      console.error('Error fetching project:', error);
      toast.error('Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'in_progress':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'skipped':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-[#1e1e1e] text-[#aaa] border-[#2a2a2a]';
    }
  };

  return (
    <div className="dark min-h-screen bg-[#0d0d0d] text-white">
      <DashboardNav />

      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Header with back button */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => router.push('/projects')}
            className="p-2 hover:bg-[#1a1a1a] rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-semibold">{project?.name || 'Loading...'}</h1>
        </div>

        {loading ? (
          <div className="text-center text-[#555]">Loading project details...</div>
        ) : !project ? (
          <div className="text-center text-[#555]">Project not found</div>
        ) : (
          <div className="space-y-8">
            {/* Project Info Card */}
            <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h2 className="text-sm font-semibold text-[#888] mb-2">Project Name</h2>
                  <p className="text-lg text-white">{project.name}</p>
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-[#888] mb-2">Created</h2>
                  <p className="text-lg text-white">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {project.description && (
                <div className="mt-6">
                  <h2 className="text-sm font-semibold text-[#888] mb-2">Description</h2>
                  <p className="text-white">{project.description}</p>
                </div>
              )}
            </div>

            {/* Dataset Images Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Dataset Images ({images.length})</h2>
                <div className="flex items-center gap-2">
                  {images.length > 0 && (
                    <button
                      onClick={() => router.push(`/projects/${projectId}/editor`)}
                      className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-[#e8e8e8] transition-colors"
                    >
                      <Play size={16} />
                      Start Annotation
                    </button>
                  )}
                  <AddImagesDialog projectId={projectId} onImagesAdded={fetchProjectDetails} />
                </div>
              </div>

            {images.length === 0 ? (
                <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-12 text-center">
                  <p className="text-[#555]">No images uploaded yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {images.map((image) => (
                    <div
                      key={image.id}
                      className="bg-[#111] border border-[#1e1e1e] rounded-xl overflow-hidden hover:border-[#333] transition-colors group cursor-pointer"
                      onClick={() => router.push(`/projects/${projectId}/editor?image=${image.id}`)}
                    >
                      <div className="relative bg-[#0a0a0a] aspect-video flex items-center justify-center overflow-hidden">
                        <img
                          src={image.imageUrl}
                          alt={image.fileName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                      <div className="p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-[13px] font-medium truncate">{image.fileName}</p>
                          <button className="p-1 hover:bg-[#1a1a1a] rounded transition-colors">
                            <MoreVertical size={16} className="text-[#555]" />
                          </button>
                        </div>
                        <span
                          className={`inline-block px-2 py-1 text-[11px] font-medium rounded border ${getStatusColor(
                            image.status
                          )}`}
                        >
                          {image.status.replace('_', ' ')}
                        </span>
                        <p className="text-[12px] text-[#555]">
                          {new Date(image.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function ProjectDetailsPage() {
  return (
    <AuthGuard>
      <ProjectDetailsContent />
    </AuthGuard>
  );
}
