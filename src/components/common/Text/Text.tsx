import React from 'react';
import classNames from 'classnames';
import styles from './Text.module.scss';

export interface TextProps {
  as?: 'p' | 'span' | 'div' | 'label';
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl';
  weight?: 'light' | 'regular' | 'medium' | 'semibold' | 'bold';
  color?: 'primary' | 'secondary' | 'tertiary' | 'disabled' | 'inverse' | 'success' | 'warning' | 'error' | 'info';
  align?: 'left' | 'center' | 'right';
  truncate?: boolean;
  uppercase?: boolean;
  monospace?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const Text: React.FC<TextProps> = ({
  as: Component = 'p',
  size = 'base',
  weight = 'regular',
  color = 'primary',
  align,
  truncate = false,
  uppercase = false,
  monospace = false,
  className,
  children,
  ...props
}) => {
  return (
    <Component
      className={classNames(
        styles.root,
        styles[`size-${size}`],
        styles[`weight-${weight}`],
        styles[`color-${color}`],
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
};
