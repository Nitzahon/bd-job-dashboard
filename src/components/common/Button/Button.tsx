import React from 'react';
import classNames from 'classnames';
import styles from './Button.module.scss';

// Button component props
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'warning' | 'outline';
  size?: 'xs' | 'sm' | 'base' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
  iconOnly?: boolean;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'base',
      loading = false,
      fullWidth = false,
      iconOnly = false,
      className,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={classNames(
          styles.root,
          {
            [styles[variant]]: variant,
            [styles[size]]: size !== 'base',
            [styles.loading]: loading,
            [styles.fullWidth]: fullWidth,
            [styles.iconOnly]: iconOnly,
          },
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
