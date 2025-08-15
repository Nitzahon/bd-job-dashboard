import React from 'react';
import classNames from 'classnames';
import { JobStatus } from '../../types';
import styles from './StatusBadge.module.scss';

export interface StatusBadgeProps {
  status: JobStatus;
  size?: 'sm' | 'base' | 'lg';
  variant?: 'default' | 'outlined';
  withDot?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'base',
  variant = 'default',
  withDot = false,
  className,
}) => {
  const getStatusClass = (status: JobStatus): string => {
    switch (status) {
      case JobStatus.Pending: return 'pending';
      case JobStatus.InQueue: return 'inQueue';
      case JobStatus.Running: return 'running';
      case JobStatus.Completed: return 'completed';
      case JobStatus.Failed: return 'failed';
      case JobStatus.Stopped: return 'stopped';
      default: return 'unknown';
    }
  };

  return (
    <span
      className={classNames(
        styles.root,
        styles[`status--${getStatusClass(status)}`],
        size !== 'base' && styles[`size--${size}`],
        variant !== 'default' && styles[`variant--${variant}`],
        withDot && styles.withDot,
        className
      )}
    >
      {getStatusClass(status)}
    </span>
  );
};
