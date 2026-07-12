"use client";

import { useState, useRef, useEffect } from "react";
import { savePost, deletePost, uploadPortfolioImage, generateBlogFromPdf } from "@/lib/actions/portfolio";
import { Plus, Edit2, Trash2, CheckCircle, XCircle, Image as ImageIcon, FileText } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import dynamic from "next/dynamic";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });


export function BlogManager({ initialPosts }: { initialPosts: any[] }) {
  const [posts, setPosts] = useState(initialPosts);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [summary, setSummary] = useState("");
  const [contentMdx, setContentMdx] = useState<string | undefined>("");
  const [published, setPublished] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const openModal = (post?: any) => {
    if (post) {
      setEditingPost(post);
      setTitle(post.title);
      setSlug(post.slug);
      setSummary(post.summary || "");
      setContentMdx(post.content_mdx);
      setPublished(post.published);
    } else {
      setEditingPost(null);
      setTitle("");
      setSlug("");
      setSummary("");
      setContentMdx("");
      setPublished(false);
    }
    setIsModalOpen(true);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    // Auto-generate slug if not editing an existing post
    if (!editingPost) {
      setSlug(newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const url = await uploadPortfolioImage(formData);
      
      const imageMarkdown = `\n![${file.name}](${url})\n`;
      setContentMdx(prev => (prev || "") + imageMarkdown);
    } catch (err) {
      console.error(err);
      alert("Failed to upload image");
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPdf(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const generatedMarkdown = await generateBlogFromPdf(formData);
      
      setContentMdx(generatedMarkdown);
    } catch (err) {
      console.error(err);
      alert("Failed to convert PDF to blog");
    } finally {
      setUploadingPdf(false);
      if (pdfInputRef.current) pdfInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await savePost(editingPost?.id || null, title, slug, summary, contentMdx || "", published);
      // Optimistic update would be better, but we can just let Server Actions revalidate and we reload
      window.location.reload(); 
    } catch (err) {
      console.error(err);
      alert("Failed to save post");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      await deletePost(id);
      setPosts(posts.filter(p => p.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-card border border-card-border rounded-theme p-6 glass-panel">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-mono text-xs uppercase tracking-widest text-on-surface-variant">Manage Posts</h3>
        <button
          onClick={() => openModal()}
          className="bg-primary-container text-on-primary-container p-2 rounded hover:bg-primary-container/80 transition-colors"
          title="New Post"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        {posts.map(post => (
          <div key={post.id} className="flex items-center justify-between p-4 bg-surface-container-lowest border border-outline-variant rounded-lg">
            <div>
              <div className="font-bold text-on-surface flex items-center gap-2">
                {post.title}
                {post.published ? (
                  <span title="Published"><CheckCircle className="w-4 h-4 text-green-500" /></span>
                ) : (
                  <span title="Draft"><XCircle className="w-4 h-4 text-on-surface-variant" /></span>
                )}
              </div>
              <div className="text-xs font-mono text-on-surface-variant mt-1">/{post.slug}</div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => openModal(post)}
                className="p-2 text-on-surface-variant hover:text-primary transition-colors"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(post.id)}
                className="p-2 text-on-surface-variant hover:text-error transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {posts.length === 0 && (
          <div className="text-sm text-on-surface-variant italic">No posts yet.</div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingPost ? "Edit Post" : "New Post"} maxWidth="max-w-5xl w-full">
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4 mt-2">
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Title</label>
            <input required value={title} onChange={handleTitleChange} className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 text-on-surface outline-none" />
          </div>
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Slug</label>
            <input required value={slug} onChange={e => setSlug(e.target.value)} className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 text-on-surface outline-none font-mono text-sm" />
          </div>
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Summary</label>
            <input value={summary} onChange={e => setSummary(e.target.value)} className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 text-on-surface outline-none" />
          </div>
          <div className="pt-2">
            <div className="flex items-center justify-between mb-1">
              <label className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">Content (MDX)</label>
              <div className="flex items-center gap-4">
                <button 
                  type="button" 
                  onClick={() => pdfInputRef.current?.click()}
                  disabled={uploadingPdf}
                  className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-secondary hover:text-secondary/80 transition-colors"
                >
                  <FileText className="w-3 h-3" />
                  {uploadingPdf ? "Generating..." : "✨ Generate from PDF"}
                </button>
                <input 
                  type="file" 
                  ref={pdfInputRef} 
                  onChange={handlePdfUpload} 
                  accept="application/pdf" 
                  className="hidden" 
                />

                <button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-primary hover:text-primary/80 transition-colors"
                >
                  <ImageIcon className="w-3 h-3" />
                  {uploadingImage ? "Uploading..." : "Insert Image"}
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>
            </div>
            <div data-color-mode="dark">
              <MDEditor
                value={contentMdx}
                onChange={setContentMdx}
                height={400}
                className="w-full font-mono text-sm"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="published" checked={published} onChange={e => setPublished(e.target.checked)} />
            <label htmlFor="published" className="text-sm font-mono text-on-surface">Publish immediately</label>
          </div>
          
          <div className="flex justify-end pt-4">
            <button type="submit" disabled={loading} className="px-4 py-2 bg-primary-container text-on-primary-container rounded uppercase text-xs font-mono tracking-widest font-bold">
              {loading ? "Saving..." : "Save Post"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
