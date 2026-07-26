import React from 'react';
import PropTypes from 'prop-types';

export default function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Delete',
  onConfirm,
  onCancel,
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-fade-in p-4"
      role="dialog"
      aria-modal="true"
      onClick={onCancel}
    >
      <div
        className="glass rounded-2xl p-6 max-w-sm w-full animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3 mb-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-[var(--color-danger)]">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M4.93 19h14.14a2 2 0 001.75-2.98l-7.07-12a2 2 0 00-3.5 0l-7.07 12A2 2 0 004.93 19z" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-slate-900">{title}</h3>
            {message && <p className="text-sm text-slate-500 mt-1">{message}</p>}
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button
            className="btn-base bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm px-4 py-2"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="btn-base bg-[var(--color-danger)] text-white hover:brightness-95 text-sm px-4 py-2"
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

ConfirmDialog.propTypes = {
  title: PropTypes.string.isRequired,
  message: PropTypes.string,
  confirmLabel: PropTypes.string,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};
