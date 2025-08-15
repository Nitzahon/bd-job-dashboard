import React from 'react';
import { useTranslation } from 'react-i18next';
import { useJobs } from '../../context/JobContext';
import { Section } from '../common/Section/Section';
import { Button } from '../common/Button/Button';
import { EmptyState } from '../EmptyState/EmptyState';
import { StatusBadge } from '../StatusBadge/StatusBadge';
import { JobStatus, JobPriority, SortField, SortDirection } from '../../types';
import styles from './JobTable.module.scss'

// Helper functions for enum display
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

export function JobTable(): React.ReactElement {
  const { t } = useTranslation();
  const { filteredJobs, loading, stopJob, restartJob, deleteJob, hasActiveFilters, jobs, sort, setSort } = useJobs();

  const handleStopJob = async (jobID: string) => {
    try {
      await stopJob(jobID);
    } catch (error) {
      // Error handling is done in the context
      console.error('Failed to stop job:', error);
    }
  };

  const handleRestartJob = async (jobID: string) => {
    try {
      await restartJob(jobID);
    } catch (error) {
      // Error handling is done in the context
      console.error('Failed to restart job:', error);
    }
  };

  const handleDeleteJob = async (jobID: string) => {
    try {
      await deleteJob(jobID);
    } catch (error) {
      // Error handling is done in the context
      console.error('Failed to delete job:', error);
    }
  };

  const handleSort = (field: SortField) => {
    const newDirection: SortDirection = 
      sort.field === field && sort.direction === 'asc' ? 'desc' : 'asc';
    setSort({ field, direction: newDirection });
  };

  const getSortIcon = (field: SortField) => {
    if (sort.field !== field) return '↕️';
    return sort.direction === 'asc' ? '↑' : '↓';
  };

  if (loading) {
    return (
      <Section className={styles.loadingSection}>
        <div className={styles.loadingContent}>
          {t('loading.jobs')}
        </div>
      </Section>
    );
  }

  // Handle empty states
  if (filteredJobs.length === 0) {
    // If no jobs at all exist, show "no jobs" empty state
    if (jobs.length === 0) {
      return (
        <Section spacing="sm" className={styles.root}>
          <EmptyState type="no-jobs" />
        </Section>
      );
    }
    
    // If jobs exist but none match filters, show "no results" empty state
    if (hasActiveFilters) {
      return (
        <Section spacing="sm" className={styles.root}>
          <EmptyState type="no-results" />
        </Section>
      );
    }
  }

  return (
    <Section 
      spacing="sm"
      className={styles.root}
    >
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead className={styles.tableHead}>
            <tr>
              <th 
                className={`${styles.tableHeader} ${styles.sortableHeader}`}
                onClick={() => handleSort('name' as SortField)}
              >
                {t('table.headers.jobName')} {getSortIcon('name' as SortField)}
              </th>
              <th 
                className={`${styles.tableHeader} ${styles.sortableHeader}`}
                onClick={() => handleSort('priority' as SortField)}
              >
                {t('table.headers.priority')} {getSortIcon('priority' as SortField)}
              </th>
              <th 
                className={`${styles.tableHeader} ${styles.sortableHeader}`}
                onClick={() => handleSort('status' as SortField)}
              >
                {t('table.headers.status')} {getSortIcon('status' as SortField)}
              </th>
              <th 
                className={`${styles.tableHeader} ${styles.sortableHeader}`}
                onClick={() => handleSort('progress' as SortField)}
              >
                {t('table.headers.progress')} {getSortIcon('progress' as SortField)}
              </th>
              <th 
                className={`${styles.tableHeader} ${styles.sortableHeader}`}
                onClick={() => handleSort('startedAt' as SortField)}
              >
                {t('table.headers.startTime')} {getSortIcon('startedAt' as SortField)}
              </th>
              <th 
                className={`${styles.tableHeader} ${styles.sortableHeader}`}
                onClick={() => handleSort('completedAt' as SortField)}
              >
                {t('table.headers.endTime')} {getSortIcon('completedAt' as SortField)}
              </th>
              <th className={styles.tableHeader}>{t('table.headers.actions')}</th>
            </tr>
          </thead>
          <tbody className={styles.tableBody}>
            {filteredJobs.map((job) => (
                <tr key={job.jobID} className={styles.tableRow}>
                  <td className={styles.tableCell}>{job.name}</td>
                  <td className={styles.tableCell}>
                    <span className={`${styles.priorityBadge} ${styles[`priority--${job.priority === JobPriority.High ? 'high' : 'regular'}`]}`}>
                      {job.priority === JobPriority.High ? t('priority.high') : t('priority.regular')}
                    </span>
                  </td>
                  <td className={styles.tableCell}>
                    <StatusBadge status={job.status} />
                  </td>
                  <td className={styles.tableCell}>
                    <div className={styles.progressContainer}>
                      <div className={styles.progressBar}>
                        <div 
                          className={`${styles.progressFill} ${styles[`progress--${getStatusClass(job.status)}`]}`}
                          style={{ width: `${job.progress}%` }}
                        />
                      </div>
                      <span className={styles.progressText}>{job.progress}%</span>
                    </div>
                  </td>
                  <td className={styles.tableCell}>
                    {job.startedAt && job.startedAt > 0 ? new Date(job.startedAt * 1000).toLocaleString() : '-'}
                  </td>
                  <td className={styles.tableCell}>
                    {job.completedAt && job.completedAt > 0 ? new Date(job.completedAt * 1000).toLocaleString() : '-'}
                  </td>
                  <td className={styles.tableCell}>
                    <div className={styles.actionButtons}>
                      {(job.status === JobStatus.Running || job.status === JobStatus.InQueue) && (
                        <Button 
                          variant="warning" 
                          size="xs"
                          onClick={() => handleStopJob(job.jobID)}
                        >
                          {t('actions.stop')}
                        </Button>
                      )}
                      {(job.status === JobStatus.Failed || job.status === JobStatus.Stopped) && (
                        <Button 
                          variant="primary" 
                          size="xs"
                          onClick={() => handleRestartJob(job.jobID)}
                        >
                          {t('actions.restart')}
                        </Button>
                      )}
                      {(job.status === JobStatus.Completed || job.status === JobStatus.Failed || job.status === JobStatus.Stopped) && (
                        <Button 
                          variant="danger" 
                          size="xs"
                          onClick={() => handleDeleteJob(job.jobID)}
                        >
                          {t('actions.delete')}
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </Section>
  );
}
