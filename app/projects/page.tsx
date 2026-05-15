'use client';

import { AuthGuard } from '@/components/auth/AuthGuard';
import { DashboardNav } from '@/components/dashboard/DashboardNav';
import { CreateProjectDialog } from '@/components/projects/CreateProjectDialog';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

// ─── Content ──────────────────────────────────────────────────────────────────

function ProjectsContent() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects || []);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectCreated = (newProject: any) => {
    setProjects([newProject, ...projects]);
  };

  return (
    <div className="dark min-h-screen bg-[#0d0d0d] text-white">
      <DashboardNav />

      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Page header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-xl font-semibold text-white">Projects</h1>
            <p className="text-[13px] text-[#555] mt-1">
              {projects.length === 0 ? 'Your projects will appear here.' : `You have ${projects.length} project${projects.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <CreateProjectDialog onProjectCreated={handleProjectCreated} />
        </div>

        {/* Projects grid or empty state */}
        {loading ? (
          <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-20 flex flex-col items-center justify-center text-center">
            <p className="text-[13px] text-[#555]">Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-20 flex flex-col items-center justify-center text-center">
            <p className="text-[13px] text-[#555]">
              No projects yet. Create your first project to get started.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-[#111] border border-[#1e1e1e] rounded-xl p-4 hover:border-[#333] transition-colors cursor-pointer group"
                onClick={() => router.push(`/projects/${project.id}`)}
              >
                <div className="space-y-3">
                  <h3 className="font-medium text-white group-hover:text-[#ccc] transition-colors">{project.name}</h3>
                  {project.description && (
                    <p className="text-[13px] text-[#555]">{project.description}</p>
                  )}
                  <p className="text-[12px] text-[#444]">
                    Created {new Date(project.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────

export default function ProjectsPage() {
  return (
    <AuthGuard>
      <ProjectsContent />
    </AuthGuard>
  );
}
