"use client";

import { useState } from "react";
import { saveReadingListItem, deleteReadingListItem } from "@/lib/actions/portfolio";
import { Plus, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";

export function ReadingListManager({ initialList }: { initialList: any[] }) {
  const [list, setList] = useState(initialList);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState("reading");

  const openModal = () => {
    setTitle("");
    setAuthor("");
    setUrl("");
    setStatus("reading");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await saveReadingListItem(title, author, url, status);
      window.location.reload(); 
    } catch (err) {
      console.error(err);
      alert("Failed to save item");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this item?")) return;
    try {
      await deleteReadingListItem(id);
      setList(list.filter(item => item.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-card border border-card-border rounded-theme p-6 glass-panel">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-mono text-xs uppercase tracking-widest text-on-surface-variant">Manage List</h3>
        <button
          onClick={openModal}
          className="bg-secondary-container text-on-secondary-container p-2 rounded hover:bg-secondary-container/80 transition-colors"
          title="New Item"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        {list.map(item => (
          <div key={item.id} className="flex items-center justify-between p-4 bg-surface-container-lowest border border-outline-variant rounded-lg">
            <div>
              <div className="font-bold text-on-surface">{item.title}</div>
              <div className="text-xs text-on-surface-variant mt-1">{item.author}</div>
              <div className="mt-2 inline-block px-2 py-0.5 rounded text-[10px] uppercase font-mono tracking-widest bg-surface-container-high">
                {item.status}
              </div>
            </div>
            <div>
              <button
                onClick={() => handleDelete(item.id)}
                className="p-2 text-on-surface-variant hover:text-error transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {list.length === 0 && (
          <div className="text-sm text-on-surface-variant italic">List is empty.</div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Book">
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4 mt-2">
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Title</label>
            <input required value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 text-on-surface outline-none" />
          </div>
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Author</label>
            <input required value={author} onChange={e => setAuthor(e.target.value)} className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 text-on-surface outline-none" />
          </div>
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">URL (Optional)</label>
            <input value={url} onChange={e => setUrl(e.target.value)} className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 text-on-surface outline-none" />
          </div>
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Status</label>
            <select value={status} onChange={e => setStatus(e.target.value)} className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 text-on-surface outline-none" style={{ colorScheme: "var(--color-scheme)" }}>
              <option value="reading">Reading</option>
              <option value="read">Read</option>
            </select>
          </div>
          
          <div className="flex justify-end pt-4">
            <button type="submit" disabled={loading} className="px-4 py-2 bg-secondary-container text-on-secondary-container rounded uppercase text-xs font-mono tracking-widest font-bold">
              {loading ? "Saving..." : "Add to List"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
