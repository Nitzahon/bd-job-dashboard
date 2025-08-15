import React, { useId } from 'react';
import styles from './Input.module.scss';
import classNames from 'classnames';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix'> {
  size?: 'sm' | 'base' | 'lg';
  state?: 'default' | 'error' | 'success';
  fullWidth?: boolean;
  label?: string;
  helpText?: string;
  required?: boolean;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}

export interface TextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  size?: 'sm' | 'base' | 'lg';
  state?: 'default' | 'error' | 'success';
  fullWidth?: boolean;
  label?: string;
  helpText?: string;
  required?: boolean;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  size?: 'sm' | 'base' | 'lg';
  state?: 'default' | 'error' | 'success';
  fullWidth?: boolean;
  label?: string;
  helpText?: string;
  required?: boolean;
  placeholder?: string;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      size = 'base',
      state = 'default',
      fullWidth = false,
      label,
      helpText,
      required = false,
      prefix,
      suffix,
      className,
      id,
      ...props
    },
    ref
  ) => {
    
    const reactId = useId();
    const inputId = id || reactId;
    

    const inputElement = (
      <input
        ref={ref}
        id={inputId}
        className={classNames(
          styles.root,
          size !== 'base' && styles[size],
          state !== 'default' && styles[state],
          className
        )}
        {...props}
      />
    );

    const content = prefix || suffix ? (
      <div className={styles.inputGroup}>
        {prefix && <div className={styles['input-group__prefix']}>{prefix}</div>}
        {inputElement}
        {suffix && <div className={styles['input-group__suffix']}>{suffix}</div>}
      </div>
    ) : (
      inputElement
    );

    if (!label && !helpText) {
      return content;
    }

    return (
      <div className={classNames(styles.formField, fullWidth && styles['formField--fullWidth'])}>
        {label && (
          <label htmlFor={inputId} className={classNames(styles.label, required && styles['label--required'])}>
            {label}
          </label>
        )}
        {content}
        {helpText && (
          <div className={classNames(styles.helpText, state !== 'default' && styles[`helpText--${state}`])}>
            {helpText}
          </div>
        )}
      </div>
    );
  }
);

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      size = 'base',
      state = 'default',
      fullWidth = false,
      label,
      helpText,
      required = false,
      resize = 'vertical',
      className,
      id,
      style,
      ...props
    },
    ref
  ) => {
    const reactId = useId();
    const textareaId = id || reactId;

    const textareaElement = (
      <textarea
        ref={ref}
        id={textareaId}
        className={classNames(
          styles.textarea,
          state !== 'default' && styles[`textarea--${state}`],
          className
        )}
        style={{ resize, ...style }}
        {...props}
      />
    );

    if (!label && !helpText) {
      return textareaElement;
    }

    return (
      <div className={classNames(styles.formField, fullWidth && styles['formField--fullWidth'])}>
        {label && (
          <label htmlFor={textareaId} className={classNames(styles.label, required && styles['label--required'])}>
            {label}
          </label>
        )}
        {textareaElement}
        {helpText && (
          <div className={classNames(styles.helpText, state !== 'default' && styles[`helpText--${state}`])}>
            {helpText}
          </div>
        )}
      </div>
    );
  }
);

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      size = 'base',
      state = 'default',
      fullWidth = false,
      label,
      helpText,
      required = false,
      placeholder,
      options,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const reactId = useId();
    const selectId = id || reactId;

    const selectElement = (
      <select
        ref={ref}
        id={selectId}
        className={classNames(
          styles.select,
          size !== 'base' && styles[`select--${size}`],
          state !== 'default' && styles[`select--${state}`],
          className
        )}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map(({ value, label: optionLabel, disabled }) => (
          <option key={value} value={value} disabled={disabled}>
            {optionLabel}
          </option>
        ))}
      </select>
    );

    if (!label && !helpText) {
      return selectElement;
    }

    return (
      <div className={classNames(styles.formField, fullWidth && styles['formField--fullWidth'])}>
        {label && (
          <label htmlFor={selectId} className={classNames(styles.label, required && styles['label--required'])}>
            {label}
          </label>
        )}
        {selectElement}
        {helpText && (
          <div className={classNames(styles.helpText, state !== 'default' && styles[`helpText--${state}`])}>
            {helpText}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
Textarea.displayName = 'Textarea';
Select.displayName = 'Select';
