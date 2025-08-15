import React from 'react';
import classNames from 'classnames';
import styles from './Card.module.scss';

export interface CardProps {
  size?: 'sm' | 'base' | 'lg';
  variant?: 'default' | 'elevated' | 'bordered' | 'flat';
  clickable?: boolean;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

export interface CardHeaderProps {
  className?: string;
  children: React.ReactNode;
}

export interface CardBodyProps {
  className?: string;
  children: React.ReactNode;
}

export interface CardFooterProps {
  className?: string;
  children: React.ReactNode;
}

export interface CardTitleProps {
  className?: string;
  children: React.ReactNode;
}

export interface CardSubtitleProps {
  className?: string;
  children: React.ReactNode;
}

export interface CardActionsProps {
  align?: 'start' | 'center' | 'end' | 'between';
  className?: string;
  children: React.ReactNode;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(({
  size = 'base',
  variant = 'default',
  clickable = false,
  className,
  children,
  onClick,
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={classNames(
        styles.root,
        size !== 'base' && styles[`size--${size}`],
        variant !== 'default' && styles[`variant--${variant}`],
        clickable && styles.clickable,
        className
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';

export const CardHeader: React.FC<CardHeaderProps> = ({ className, children, ...props }) => (
  <div className={classNames(styles.header, className)} {...props}>
    {children}
  </div>
);

export const CardBody: React.FC<CardBodyProps> = ({ className, children, ...props }) => (
  <div className={classNames(styles.body, className)} {...props}>
    {children}
  </div>
);

export const CardFooter: React.FC<CardFooterProps> = ({ className, children, ...props }) => (
  <div className={classNames(styles.footer, className)} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<CardTitleProps> = ({ className, children, ...props }) => (
  <h3 className={classNames(styles.title, className)} {...props}>
    {children}
  </h3>
);

export const CardSubtitle: React.FC<CardSubtitleProps> = ({ className, children, ...props }) => (
  <p className={classNames(styles.subtitle, className)} {...props}>
    {children}
  </p>
);

export const CardActions: React.FC<CardActionsProps> = ({ 
  align = 'end', 
  className, 
  children, 
  ...props 
}) => (
  <div 
    className={classNames(
      'card__actions', 
      align !== 'end' && `card__actions--${align}`,
      className
    )} 
    {...props}
  >
    {children}
  </div>
);
