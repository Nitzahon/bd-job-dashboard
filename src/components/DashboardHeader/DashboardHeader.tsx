import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Language } from '../../types';
import { Button } from '../common/Button/Button';
import { Input } from '../common/Input/Input';
import { Section } from '../common/Section/Section';
import styles from './DashboardHeader.module.scss';

export interface DashboardHeaderProps {
  title: string;
  language: Language;
  createJobText: string;
  deleteJobsText: string;
  searchValue: string;
  onCreateNewJob: () => void;
  onDeleteJobs: () => void;
  onLanguageToggle: () => void;
  onSearchChange: (value: string) => void;
}

function DashboardHeaderComponent({
  title,
  language,
  createJobText,
  deleteJobsText,
  searchValue,
  onCreateNewJob,
  onDeleteJobs,
  onLanguageToggle,
  onSearchChange,
}: DashboardHeaderProps): React.ReactElement {
  const { t } = useTranslation();
  
  // Local state for the input value to prevent re-renders
  const [localSearchValue, setLocalSearchValue] = useState(searchValue);
  
  // Sync local state with prop when it changes externally (like clear from status cards)
  useEffect(() => {
    setLocalSearchValue(searchValue);
  }, [searchValue]);
  
  // Debounce the context update to avoid constant re-renders
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (localSearchValue !== searchValue) {
        onSearchChange(localSearchValue);
      }
    }, 300); // 300ms debounce
    
    return () => clearTimeout(timeoutId);
  }, [localSearchValue, searchValue, onSearchChange]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearchValue(value);
  };
  
  const handleClear = () => {
    setLocalSearchValue('');
    onSearchChange(''); // Immediately sync clear action
  };
  
  return (
    <Section className={styles.root}>
      <div className={styles.header}>
        <h1 className={styles.title}>{title}</h1>
        <div className={styles.controls}>
          <div className={styles.search}>
            <Input
              placeholder={t('search.placeholder')}
              value={localSearchValue}
              onChange={handleInputChange}
              size="sm"
              suffix={localSearchValue ? (
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={handleClear}
                  iconOnly
                  title={t('search.clearTitle')}
                >
                  ×
                </Button>
              ) : null}
            />
          </div>
          
          <Button 
            variant="outline"
            size="sm"
            onClick={onLanguageToggle}
            title={language === 'en' ? t('language.switchToHebrew') : t('language.switchToEnglish')}
            className={styles.languageToggle}
          >
            {language === 'en' ? 'עב' : 'EN'}
          </Button>
          
          <div className={styles.actions}>
            <Button 
              variant="primary"
              onClick={onCreateNewJob}
            >
              {createJobText}
            </Button>
            
            <Button 
              variant="secondary"
              onClick={onDeleteJobs}
            >
              {deleteJobsText}
            </Button>
          </div>
        </div>
      </div>
    </Section>
  );
}

export const DashboardHeader = React.memo(DashboardHeaderComponent);

DashboardHeader.displayName = 'DashboardHeader';

export default DashboardHeader;
