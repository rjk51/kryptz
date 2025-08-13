import React from "react";

export default function Popup({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="nes-container is-dark is-rounded p-6 relative min-w-[300px] max-w-[90vw]">
        <button
          className="absolute top-2 right-2 nes-btn is-error text-xs"
          onClick={onClose}
        >
          ×
        </button>
        {title && <div className="font-bold text-warning text-lg mb-2">{title}</div>}
        <div className="text-white text-sm">{children}</div>
      </div>
    </div>
  );
}
