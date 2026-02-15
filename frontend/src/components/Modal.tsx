import React from 'react';

interface ModalProps {
  children: React.ReactNode;
  onClose: () => void;
}

export default function Modal({ children, onClose }: ModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" />
      {/* Modal content */}
      <div
        className="relative bg-card rounded-2xl shadow-modal max-h-[90vh] overflow-hidden w-full max-w-2xl overflow-y-auto animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
