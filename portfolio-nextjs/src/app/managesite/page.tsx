'use client';

import { useState, useEffect, useCallback } from 'react';
import { AuthGate } from '@/components/AuthGate';
import { PlusIcon, EditIcon, TrashIcon, ExternalLinkIcon, CloseIcon, UploadIcon } from '@/components/icons';
import type { Project } from '@/lib/types';

function ManageSiteContent() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    project_url: '',
    vc_url: '',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadProjects = useCallback(async () => {
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      setProjects(data);
    } catch {
      setMessage({ type: 'error', text: 'Failed to load projects' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const resetForm = () => {
    setFormData({ title: '', description: '', image_url: '', project_url: '', vc_url: '' });
    setEditingProject(null);
    setShowForm(false);
    setMessage(null);
  };

  const openEdit = (project: Project) => {
    setFormData({
      title: project.title,
      description: project.description,
      image_url: project.image_url,
      project_url: project.project_url,
      vc_url: project.vc_url,
    });
    setEditingProject(project);
    setShowForm(true);
    setMessage(null);
  };

  function getAdminKey() {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('admin_key') || '';
    }
    return '';
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setMessage({ type: 'error', text: 'Title is required' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const url = '/api/projects';
      const method = editingProject ? 'PUT' : 'POST';
      const body = editingProject
        ? { ...formData, id: editingProject.id }
        : formData;

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': getAdminKey(),
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save');
      }

      setMessage({ type: 'success', text: editingProject ? 'Project updated!' : 'Project created!' });
      resetForm();
      loadProjects();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this project permanently?')) return;

    try {
      const res = await fetch(`/api/projects?id=${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-key': getAdminKey() },
      });
      if (!res.ok) throw new Error('Failed to delete');
      setMessage({ type: 'success', text: 'Project deleted!' });
      loadProjects();
    } catch {
      setMessage({ type: 'error', text: 'Failed to delete project' });
    }
  };

  return (
    <>
      {/* Header */}
      <div className="bg-gradient-to-r from-[#DC2626]/10 to-transparent border-b border-accent-border">
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.25rem' }}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between" style={{ gap: '1rem' }}>
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">Site Manager</h1>
              <p className="text-sm text-text-muted" style={{ marginTop: '0.25rem' }}>Manage your portfolio projects</p>
            </div>
            <button
              onClick={() => { resetForm(); setShowForm(true); }}
              className="inline-flex items-center bg-accent hover:bg-accent-hover text-bg text-sm font-bold rounded-full transition-all duration-300 active:scale-[0.97]"
              style={{ gap: '0.5rem', padding: '0.625rem 1.25rem' }}
            >
              <PlusIcon className="w-5 h-5" />
              Add Project
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.25rem' }}>
        {/* Message */}
        {message && (
          <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium animate-fade-in ${
            message.type === 'success'
              ? 'bg-green-900/50 text-green-300 border border-green-800'
              : 'bg-red-900/50 text-red-300 border border-red-800'
          }`}>
            {message.text}
          </div>
        )}

        {/* Add/Edit Form Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" style={{ padding: '1rem' }}>
            <div className="bg-surface border border-accent-border rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fade-in-up">
              {/* Form Header */}
              <div className="flex items-center justify-between border-b border-border" style={{ padding: '1.25rem' }}>
                <h2 className="font-display text-lg font-semibold text-text-primary tracking-tight">
                  {editingProject ? 'Edit Project' : 'New Project'}
                </h2>
                <button
                  onClick={resetForm}
                  className="hover:bg-surface-elevated rounded-full transition-colors"
                  style={{ padding: '0.5rem' }}
                >
                  <CloseIcon className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-text-muted" style={{ marginBottom: '0.375rem' }}>Project Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="My Amazing Project"
                    className="w-full bg-bg border border-border rounded-xl text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent transition-colors"
                    style={{ padding: '0.625rem 1rem' }}
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-text-muted" style={{ marginBottom: '0.375rem' }}>Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your project..."
                    rows={4}
                    className="w-full bg-bg border border-border rounded-xl text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent transition-colors resize-none"
                    style={{ padding: '0.625rem 1rem' }}
                  />
                </div>

                {/* Image URL */}
                <div>
                  <label className="block text-sm font-medium text-text-muted" style={{ marginBottom: '0.375rem' }}>Image URL</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      placeholder="https://example.com/thumbnail.jpg"
                      className="flex-1 bg-bg border border-border rounded-xl text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent transition-colors"
                      style={{ padding: '0.625rem 1rem' }}
                    />
                    <div className="p-2.5 bg-surface-elevated rounded-xl">
                      <UploadIcon className="w-5 h-5 text-text-muted" />
                    </div>
                  </div>
                </div>

                {/* Project URL */}
                <div>
                  <label className="block text-sm font-medium text-text-muted" style={{ marginBottom: '0.375rem' }}>Project URL</label>
                  <input
                    type="url"
                    value={formData.project_url}
                    onChange={(e) => setFormData({ ...formData, project_url: e.target.value })}
                    placeholder="https://myproject.com"
                    className="w-full bg-bg border border-border rounded-xl text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent transition-colors"
                    style={{ padding: '0.625rem 1rem' }}
                  />
                </div>

                {/* VC URL (PDF) */}
                <div>
                  <label className="block text-sm font-medium text-text-muted" style={{ marginBottom: '0.375rem' }}>VC / PDF URL</label>
                  <input
                    type="url"
                    value={formData.vc_url}
                    onChange={(e) => setFormData({ ...formData, vc_url: e.target.value })}
                    placeholder="https://example.com/resume.pdf"
                    className="w-full bg-bg border border-border rounded-xl text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent transition-colors"
                    style={{ padding: '0.625rem 1rem' }}
                  />
                  <p className="text-xs text-text-muted" style={{ marginTop: '0.25rem' }}>
                    Link to a PDF, VC document, or case study
                  </p>
                </div>

                {/* Preview */}
                {formData.image_url && (
                <div>
                  <label className="block text-sm font-medium text-text-muted" style={{ marginBottom: '0.375rem' }}>Preview</label>
                    <img
                      src={formData.image_url}
                      alt="Preview"
                      className="w-full aspect-video object-cover rounded-xl bg-surface-elevated"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </div>
                )}

                {/* Buttons */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-accent hover:bg-accent-hover disabled:bg-accent/50 text-bg text-sm font-bold rounded-full transition-all duration-300 active:scale-[0.97] disabled:cursor-not-allowed"
                    style={{ padding: '0.625rem 1.25rem' }}
                  >
                    {saving ? 'Saving...' : editingProject ? 'Update Project' : 'Create Project'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="bg-surface-elevated hover:bg-border text-text-muted text-sm font-medium rounded-full transition-colors"
                    style={{ padding: '0.625rem 1.25rem' }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Projects List */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{ gap: '1rem' }}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-surface border border-accent-border rounded-xl animate-pulse" style={{ padding: '1rem' }}>
                <div className="aspect-video bg-surface-elevated rounded-lg mb-3" />
                <div className="h-4 bg-surface-elevated rounded w-3/4 mb-2" />
                <div className="h-3 bg-surface-elevated rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center" style={{ paddingTop: '5rem', paddingBottom: '5rem' }}>
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-surface border-2 border-dashed border-accent-border flex items-center justify-center">
              <PlusIcon className="w-8 h-8 text-text-muted" />
            </div>
            <h3 className="font-display text-xl font-semibold text-text-muted tracking-tight">No projects yet</h3>
            <p className="text-sm text-text-muted mt-2 mb-8">Start by adding your first project</p>
            <button
              onClick={() => { resetForm(); setShowForm(true); }}
              className="inline-flex items-center bg-accent hover:bg-accent-hover text-bg text-sm font-bold rounded-full transition-all duration-300 active:scale-[0.97]"
              style={{ gap: '0.5rem', padding: '0.75rem 1.5rem' }}
            >
              <PlusIcon className="w-5 h-5" />
              Add Your First Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{ gap: '1rem' }}>
            {projects.map((project) => (
              <div
                key={project.id}
                className="group bg-surface border border-accent-border rounded-xl overflow-hidden hover:border-accent/40 hover:-translate-y-0.5 transition-all duration-300"
              >
                {/* Thumbnail preview */}
                <div className="relative aspect-video bg-surface-elevated overflow-hidden">
                  <img
                    src={project.image_url || 'https://placehold.co/480x270/1E1E1E/6B7280?text=No+Image'}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://placehold.co/480x270/1E1E1E/6B7280?text=No+Image';
                    }}
                  />
                  {/* Hover actions */}
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={() => openEdit(project)}
                      className="p-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full transition-colors"
                      title="Edit"
                    >
                      <EditIcon className="w-5 h-5 text-white" />
                    </button>
                    <button
                      onClick={() => handleDelete(project.id)}
                      className="p-2.5 bg-accent/40 hover:bg-accent/60 backdrop-blur-sm rounded-full transition-colors"
                      title="Delete"
                    >
                      <TrashIcon className="w-5 h-5 text-white" />
                    </button>
                    {project.project_url && (
                      <a
                        href={project.project_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full transition-colors"
                        title="Visit project"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLinkIcon className="w-5 h-5 text-white" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Card info */}
                <div className="p-4" style={{ padding: '1.25rem' }}>
                  <div className="flex items-start justify-between" style={{ gap: '0.5rem' }}>
                    <h3 className="text-sm font-semibold text-text-primary line-clamp-2 leading-5 flex-1">
                      {project.title}
                    </h3>
                    <div className="flex items-center flex-shrink-0" style={{ gap: '0.25rem' }}>
                      <button
                        onClick={() => openEdit(project)}
                        className="p-1.5 hover:bg-surface-elevated rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        title="Edit"
                      >
                        <EditIcon className="w-4 h-4 text-text-muted" />
                      </button>
                      <button
                        onClick={() => handleDelete(project.id)}
                        className="p-1.5 hover:bg-surface-elevated rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete"
                      >
                        <TrashIcon className="w-4 h-4 text-text-muted" />
                      </button>
                    </div>
                  </div>
                  {project.description && (
                    <p className="text-xs text-text-muted line-clamp-2" style={{ marginTop: '0.375rem' }}>
                      {project.description}
                    </p>
                  )}
                  <div className="flex items-center" style={{ gap: '0.5rem', marginTop: '0.5rem' }}>
                    {project.vc_url && (
                      <span className="text-[10px] px-2 py-0.5 bg-surface-elevated text-text-muted rounded-full">
                        VC
                      </span>
                    )}
                    {project.project_url && (
                      <span className="text-[10px] px-2 py-0.5 bg-surface-elevated text-text-muted rounded-full">
                        Live
                      </span>
                    )}
                    <span className="text-[10px] text-text-muted ml-auto">
                      {new Date(project.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats Footer */}
        {projects.length > 0 && (
          <div className="flex items-center justify-between text-xs text-text-muted" style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid var(--accent-border, #DC262650)' }}>
            <span>{projects.length} project{projects.length !== 1 ? 's' : ''} total</span>
            <a href="/" className="text-accent hover:text-accent-hover transition-colors">
              View public site
            </a>
          </div>
        )}
      </div>
    </>
  );
}

export default function ManageSite() {
  return (
    <AuthGate>
      <ManageSiteContent />
    </AuthGate>
  );
}
