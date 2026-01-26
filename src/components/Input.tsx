import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  leftIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ label, error, leftIcon, className = '', ...props }) => {
  return (
    <div className="form-group">
      <label className="label" htmlFor={props.id || props.name}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        {leftIcon && (
          <div style={{
            position: 'absolute',
            left: '1rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            pointerEvents: 'none'
          }}>
            {leftIcon}
          </div>
        )}
        <input
          className={`input ${error ? 'border-error' : ''} ${className}`}
          style={{ paddingLeft: leftIcon ? '3rem' : '1rem' }}
          {...props}
        />
      </div>
      {error && <span className="text-sm" style={{ color: 'var(--error)' }}>{error}</span>}
    </div>
  );
};
