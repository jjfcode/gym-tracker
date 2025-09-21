import React, { forwardRef } from 'react';
import styles from './Textarea.module.css';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: 'default' | 'filled';
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ 
    label, 
    error, 
    helperText, 
    variant = 'default',
    resize = 'vertical',
    className,
    ...props 
  }, ref) => {
    return (
      <div className={`${styles.textareaGroup} ${className || ''}`}>
        {label && (
          <label className={styles.label} htmlFor={props.id}>
            {label}
            {props.required && <span className={styles.required}>*</span>}
          </label>
        )}
        
        <textarea
          ref={ref}
          className={`${styles.textarea} ${styles[variant]} ${error ? styles.error : ''}`}
          style={{ resize }}
          {...props}
        />
        
        {(error || helperText) && (
          <div className={`${styles.helperText} ${error ? styles.errorText : ''}`}>
            {error || helperText}
          </div>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea;