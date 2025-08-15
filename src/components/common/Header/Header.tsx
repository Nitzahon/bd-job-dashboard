import React from 'react';
import classNames from 'classnames';
import styles from './Header.module.scss';

export interface HeaderProps {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  size?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  color?: 'primary' | 'secondary' | 'inverse' | 'gradient';
  align?: 'left' | 'center' | 'right';
  truncate?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  as,
  size,
  color = 'primary',
  align,
  truncate = false,
  className,
  children,
  ...props
}) => {
  // If no 'as' is provided, derive it from size, defaulting to h1
  const Component = as || size || 'h1';
  // If no size is provided, derive it from 'as', defaulting to h1
  const headerSize = size || as || 'h1';

  return (
    <Component
      className={classNames(
        styles.root,
        styles[`header--${headerSize}`],
        color !== 'primary' && styles[`color--${color}`],
        align && styles[`align--${align}`],
        truncate && styles.truncate,
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
};
