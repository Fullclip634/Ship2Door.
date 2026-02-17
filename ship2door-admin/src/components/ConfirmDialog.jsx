import { AlertTriangle, Trash2, Info } from 'lucide-react';

const iconMap = {
    danger: <Trash2 size={24} />,
    warning: <AlertTriangle size={24} />,
    info: <Info size={24} />,
};

export default function ConfirmDialog({
    open,
    onClose,
    onConfirm,
    title = 'Are you sure?',
    message = 'This action cannot be undone.',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'danger', // danger | warning | info
}) {
    if (!open) return null;

    return (
        <div className="confirm-overlay" onClick={onClose}>
            <div className="confirm-dialog" onClick={e => e.stopPropagation()}>
                <div className={`confirm-icon ${variant}`}>
                    {iconMap[variant]}
                </div>
                <h3>{title}</h3>
                <p>{message}</p>
                <div className="confirm-actions">
                    <button className="btn btn-secondary" onClick={onClose}>
                        {cancelText}
                    </button>
                    <button
                        className={`btn ${variant === 'danger' ? 'btn-danger' : 'btn-primary'}`}
                        onClick={() => { onConfirm(); onClose(); }}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
