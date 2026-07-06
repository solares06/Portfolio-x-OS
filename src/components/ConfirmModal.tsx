import React from "react";
import { X, AlertTriangle } from "lucide-react";

type ConfirmModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
};

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDestructive = true,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-surface-container-low border border-surface-variant w-full max-w-sm rounded-xl shadow-2xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-surface-container">
          <div className="flex items-center gap-2">
            {isDestructive && <AlertTriangle className="w-5 h-5 text-error" />}
            <h2 className={`font-display font-bold text-lg ${isDestructive ? 'text-error' : 'text-primary'}`}>
              {title}
            </h2>
          </div>
          <button onClick={onClose} className="text-on-surface-variant hover:text-error transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          <p className="text-on-surface-variant text-sm">{message}</p>
        </div>

        <div className="flex justify-end gap-3 p-4 border-t border-surface-container bg-surface-container-lowest">
          <button 
            type="button" 
            onClick={onClose}
            className="px-4 py-2 text-sm font-mono uppercase text-on-surface-variant hover:text-on-surface transition-colors"
          >
            {cancelText}
          </button>
          <button 
            type="button" 
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 text-sm font-mono uppercase rounded transition-colors ${
              isDestructive 
                ? 'bg-error text-background hover:bg-error/80' 
                : 'bg-primary text-background hover:bg-primary-container'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
