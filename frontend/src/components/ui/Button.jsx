import React from 'react';
import PropTypes from 'prop-types';

const VARIANTS = {
  primary: 'bg-brand-gradient text-white shadow-glow hover:shadow-elevated hover:-translate-y-0.5',
  secondary: 'bg-white border border-slate-200 text-slate-700 shadow-soft hover:border-brand-300 hover:text-brand-600 hover:-translate-y-0.5',
  ghost: 'bg-transparent text-brand-600 hover:bg-brand-50',
  danger: 'bg-[var(--color-danger)] text-white shadow-soft hover:brightness-95 hover:-translate-y-0.5',
  success: 'bg-[var(--color-success)] text-white shadow-soft hover:brightness-95 hover:-translate-y-0.5',
};

const SIZES = {
  sm: 'text-sm px-3.5 py-1.5',
  md: 'text-sm px-5 py-2.5',
  lg: 'text-base px-6 py-3',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
  isLoading = false,
  disabled = false,
  ...rest
}) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`btn-base ${VARIANTS[variant] || VARIANTS.primary} ${SIZES[size] || SIZES.md} ${className}`}
      {...rest}
    >
      {isLoading && (
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      )}
      {children}
    </button>
  );
}

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'ghost', 'danger', 'success']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string,
  type: PropTypes.string,
  isLoading: PropTypes.bool,
  disabled: PropTypes.bool,
};
