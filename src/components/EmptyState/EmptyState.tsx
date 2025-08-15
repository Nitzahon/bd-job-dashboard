import React from 'react';
import { useTranslation } from 'react-i18next';
import { Header } from '../common/Header/Header';
import { Text } from '../common/Text/Text';
import { Button } from '../common/Button/Button';
import { useJobs } from '../../context/JobContext';
import styles from './EmptyState.module.scss';

interface EmptyStateProps {
  type: 'no-jobs' | 'no-results';
}

export function EmptyState({ type }: EmptyStateProps): React.ReactElement {
  const { t } = useTranslation();
  const { setModal, setFilters } = useJobs();

  const handleCreateJob = () => {
    setModal({ isOpen: true, type: 'create' });
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  if (type === 'no-jobs') {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>📋</div>
        <Header as="h3" size="h4" className={styles.emptyTitle}>
          {t('empty.noJobs')}
        </Header>
        <Text size="base" color="secondary" className={styles.emptyDescription}>
          {t('empty.noJobsDescription')}
        </Text>
        <Button 
          variant="primary" 
          size="base"
          onClick={handleCreateJob}
          className={styles.emptyAction}
        >
          {t('dashboard.actions.createJob')}
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyIcon}>🔍</div>
      <Header as="h3" size="h4" className={styles.emptyTitle}>
        {t('empty.noResults')}
      </Header>
      <Text size="base" color="secondary" className={styles.emptyDescription}>
        {t('empty.noResultsDescription')}
      </Text>
      <Button 
        variant="secondary" 
        size="base"
        onClick={handleClearFilters}
        className={styles.emptyAction}
      >
        {t('filters.clearAll')}
      </Button>
    </div>
  );
}
