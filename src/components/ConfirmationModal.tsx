
import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ 
  isOpen, onClose, onConfirm, title, message, confirmLabel = 'Delete' 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm p-4">
      <div className="bg-surface border border-borderColor w-full max-w-sm rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95">
        <div className="p-6 text-center">
           <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4 text-red-500">
             <AlertTriangle size={24} />
           </div>
           <h3 className="text-lg font-bold text-textMain mb-2">{title}</h3>
           <p className="text-textMuted text-sm mb-6 leading-relaxed">{message}</p>
           
           <div className="flex gap-3">
             <button 
               onClick={onClose}
               className="flex-1 py-2 rounded-lg border border-borderColor text-textMuted font-medium hover:bg-surfaceLight transition-colors"
             >
               Cancel
             </button>
             <button 
               onClick={() => { onConfirm(); onClose(); }}
               className="flex-1 py-2 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
             >
               {confirmLabel}
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};
