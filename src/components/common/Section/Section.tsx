import React from 'react';
import styles from './Section.module.scss';
import classNames from 'classnames';

export interface SectionProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  variant?: 'default' | 'bordered' | 'elevated';
  spacing?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Section({
  children,
  title,
  subtitle,
  className,
  variant = 'default',
  spacing = 'md',
}: SectionProps): React.ReactElement {
  return (
    <section 
      className={classNames(
        styles.root,
        styles[`variant--${variant}`],
        styles[`spacing--${spacing}`],
        className
      )}
    >
      {(title || subtitle) && (
        <div className={styles.header}>
          {title && (
            <h2 className={styles.title}>
              {title}
            </h2>
          )}
          {subtitle && (
            <p className={styles.subtitle}>
              {subtitle}
            </p>
          )}
        </div>
      )}
      <div className={styles.content}>
        {children}
      </div>
    </section>
  );
}
