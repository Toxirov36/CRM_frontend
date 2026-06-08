export default function Modal({ title, subtitle, onClose, children, footer, position = "center" }) {
  const positionClasses = {
    right: "justify-end",
    left: "justify-start",
    center: "items-center justify-center"
  };

  const panelClasses = {
    right: "w-full max-w-md h-full animate-in slide-in-from-right duration-300",
    left: "w-full max-w-md h-full animate-in slide-in-from-left duration-300",
    center: "w-full max-w-md mx-4 rounded-2xl max-h-[90vh]"
  };

  return (
    <div className={`fixed inset-0 z-50 flex ${positionClasses[position]}`}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className={`relative bg-white shadow-2xl flex flex-col ${panelClasses[position]}`}>
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{title}</h2>
            {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors ml-4 mt-0.5">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 overflow-y-auto flex-1">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}