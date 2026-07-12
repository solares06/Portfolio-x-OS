import React from "react";
import { Modal } from "./Modal";
import { AlertTriangle } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  loading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDestructive = true,
  loading = false
}: ConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-sm">
      <div className="flex flex-col items-center text-center space-y-4">
        {isDestructive && (
          <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-error" />
          </div>
        )}
        <p className="text-on-surface-variant font-body">{message}</p>
        
        <div className="flex space-x-3 w-full mt-6">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-surface-container-high hover:bg-surface-variant text-on-surface transition-colors rounded border border-outline-variant font-mono text-sm uppercase tracking-wider"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 px-4 py-2 transition-colors rounded font-mono text-sm uppercase tracking-wider flex justify-center items-center ${
              isDestructive 
                ? "bg-error/20 text-error border border-error hover:bg-error hover:text-white"
                : "bg-primary-container/20 text-primary border border-primary-container hover:bg-primary-container hover:text-on-primary-container"
            }`}
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
