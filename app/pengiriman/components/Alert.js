"use client";

export default function Alert({ message, type = "success", onClose }) {
  if (!message) return null;

  return (
    <div className={`alert alert-${type}`} data-testid="alert">
      {message}
      {onClose && (
        <button 
          onClick={onClose} 
          style={{ 
            float: 'right', 
            background: 'none', 
            border: 'none', 
            cursor: 'pointer',
            padding: '0 5px'
          }}
        >
          x
        </button>
      )}
    </div>
  );
}
