import React from 'react';
import { useTranslation } from 'react-i18next';
import { useJobs } from '../../context/JobContext';
import { JobStatus } from '../../types';
import { StatusCards } from './StatusCards';

export function StatusCardsContainer(): React.ReactElement {
  const { t } = useTranslation();
  const { statusCounts, filters, setFilters } = useJobs();

  const handleStatusFilter = (status: JobStatus) => {
    // If the same status is clicked again, clear the filter and search
    if (filters.status === status) {
      setFilters({ ...filters, status: undefined, searchTerm: '' });
    } else {
      setFilters({ ...filters, status, searchTerm: '' });
    }
  };

  const cards = [
    {
      title: t('status.pending'),
      count: statusCounts.pending,
      status: JobStatus.Pending,
      color: 'orange'
    },
    {
      title: t('status.inQueue'),
      count: statusCounts.inQueue,
      status: JobStatus.InQueue,
      color: 'purple'
    },
    {
      title: t('status.running'),
      count: statusCounts.running,
      status: JobStatus.Running,
      color: 'blue'
    },
    {
      title: t('status.completed'),
      count: statusCounts.completed,
      status: JobStatus.Completed,
      color: 'green'
    },
    {
      title: t('status.failed'),
      count: statusCounts.failed,
      status: JobStatus.Failed,
      color: 'red'
    },
    {
      title: t('status.stopped'),
      count: statusCounts.stopped,
      status: JobStatus.Stopped,
      color: 'gray'
    }
  ];

  return (
    <StatusCards
      cards={cards}
      onStatusFilter={handleStatusFilter}
      selectedStatus={filters.status}
    />
  );
}
