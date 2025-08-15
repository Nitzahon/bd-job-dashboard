import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useJobs } from '../../context/JobContext';
import { useLanguage } from '../../context/LanguageContext';
import { Language, JobTableFilters } from '../../types';
import { DashboardHeader } from './DashboardHeader';

export function DashboardHeaderContainer(): React.ReactElement {
  
  const { t } = useTranslation();
  const { setModal, filters, setFilters } = useJobs();
  const { language, changeLanguage } = useLanguage();

  const handleCreateNewJob = useCallback(() => {
    setModal({ isOpen: true, type: 'create' });
  }, [setModal]);

  const handleDeleteJobs = useCallback(() => {
    setModal({ isOpen: true, type: 'bulkDelete' });
  }, [setModal]);

  const handleLanguageToggle = useCallback(() => {
    const newLanguage: Language = language === 'en' ? 'he' : 'en';
    changeLanguage(newLanguage);
  }, [language, changeLanguage]);

  const handleSearchChange = useCallback((searchTerm: string) => {
    setFilters((prevFilters: JobTableFilters) => ({ ...prevFilters, searchTerm }));
  }, [setFilters]);

  return (
    <DashboardHeader
      title={t('dashboard.title')}
      language={language}
      createJobText={t('dashboard.actions.createJob')}
      deleteJobsText={t('dashboard.actions.deleteJobs')}
      searchValue={filters.searchTerm || ''}
      onCreateNewJob={handleCreateNewJob}
      onDeleteJobs={handleDeleteJobs}
      onLanguageToggle={handleLanguageToggle}
      onSearchChange={handleSearchChange}
    />
  );
}
