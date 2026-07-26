import React from 'react';

export default function Loading({ message = 'Loading...', fullScreen = false }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center gap-3 ${
        fullScreen ? 'min-h-[60vh]' : 'py-10'
      }`}
    >
      <span className="relative flex h-10 w-10">
        <span className="absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-30 animate-ping" />
        <svg className="relative h-10 w-10 animate-spin text-brand-500" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      </span>
      <span className="text-sm font-medium text-slate-500">{message}</span>
    </div>
  );
}
