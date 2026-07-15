import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '../../lib/cn';
import { Card } from './Card';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export const Modal: React.FC<ModalProps> = ({ open, onClose, title, children, size = 'md' }) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [open, onClose]);

  if (!open) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
  };

  return createPortal(
    <div 
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/30 backdrop-blur-md animate-fade-in"
    >
      <Card className={cn("w-full shadow-[0_20px_50px_rgba(15,23,42,0.12)] border border-slate-100/80 relative max-h-[90vh] flex flex-col animate-slide-up", sizes[size])}>
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100">
          {title && <h2 className="text-base font-display font-bold text-charcoal">{title}</h2>}
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl text-charcoal-muted/70 hover:bg-slate-100 hover:text-charcoal transition-all ml-auto cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
      </Card>
    </div>,
    document.body
  );
};
