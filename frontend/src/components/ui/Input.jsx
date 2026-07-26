import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

/**
 * Accessible text input with label and error message.
 * Forwards ref so it works with react-hook-form's `register`.
 */
const Input = forwardRef(function Input({ label, id, error, className = '', ...rest }, ref) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <input
        id={id}
        ref={ref}
        aria-invalid={!!error}
        className={`input-base ${error ? 'border-[var(--color-danger)] focus:border-[var(--color-danger)] focus:ring-red-100' : ''} ${className}`}
        {...rest}
      />
      {error && <span className="text-sm text-[var(--color-danger)]">{error}</span>}
    </div>
  );
});

Input.propTypes = {
  label: PropTypes.string,
  id: PropTypes.string,
  error: PropTypes.string,
  className: PropTypes.string,
};

export default Input;
