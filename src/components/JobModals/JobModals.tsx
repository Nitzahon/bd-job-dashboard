import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useJobs } from '../../context/JobContext';
import { JobPriority, JobStatus, CreateJobRequest } from '../../types';
import { Card } from '../common/Card/Card';
import { Header } from '../common/Header/Header';
import { Text } from '../common/Text/Text';
import { Button } from '../common/Button/Button';
import { Input, Select } from '../common/Input/Input';
import styles from './JobModals.module.scss';
import { useClickOutside, useToggle } from '../../hooks';

interface FormErrors {
  name?: string;
  status?: string;
}

interface BulkDeleteFormData {
  status: JobStatus | '';
}

export function JobModals(): React.ReactElement {
  const { t } = useTranslation();
  const { modal, setModal, createJob, deleteJobsByStatus } = useJobs();
  const ref = useClickOutside<HTMLDivElement>(() => {
    handleClose();
  });

  const [createFormData, setCreateFormData] = useState<CreateJobRequest>({
    name: '',
    priority: JobPriority.Regular
  });
  
  const [bulkDeleteFormData, setBulkDeleteFormData] = useState<BulkDeleteFormData>({
    status: ''
  });
  
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const submitting = useToggle(false);

  if (!modal.isOpen) {
    return <></>;
  }

  const handleClose = () => {
    setModal({ isOpen: false, type: null });
    setCreateFormData({ name: '', priority: JobPriority.Regular });
    setBulkDeleteFormData({ status: '' });
    setFormErrors({});
    submitting.setFalse();
  };

  const validateCreateJobForm = (): boolean => {
    const errors: FormErrors = {};
    
    if (!createFormData.name.trim()) {
      errors.name = t('validation.nameRequired');
    } else if (createFormData.name.trim().length < 2) {
      errors.name = t('validation.nameMinLength');
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateBulkDeleteForm = (): boolean => {
    const errors: FormErrors = {};
    
    if (!bulkDeleteFormData.status) {
      errors.status = t('validation.statusRequired');
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateInputChange = (field: keyof CreateJobRequest) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const value = field === 'priority' ? parseInt(e.target.value) : e.target.value;
    setCreateFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear specific field error when user starts typing
    if (formErrors[field as keyof FormErrors]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleBulkDeleteInputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const status = e.target.value ? parseInt(e.target.value) as JobStatus : '';
    setBulkDeleteFormData({ status });
    
    // Clear error when user selects a value
    if (formErrors.status) {
      setFormErrors(prev => ({ ...prev, status: undefined }));
    }
  };

  const handleCreateJob = async () => {
    if (!validateCreateJobForm()) return;
    
    submitting.setTrue();
    try {
      await createJob(createFormData);
      handleClose();
    } catch (error) {
      console.error('Failed to create job:', error);
    } finally {
      submitting.setFalse();
    }
  };

  const handleBulkDeleteJobs = async () => {
    if (!validateBulkDeleteForm()) return;

    submitting.setTrue();
    try {
      await deleteJobsByStatus(bulkDeleteFormData.status as JobStatus);
      handleClose();
    } catch (error) {
      console.error('Failed to delete jobs:', error);
    } finally {
      submitting.setFalse();
    }
  };

  const renderCreateJobModal = () => (
    <>
      <div className={styles.header}>
        <Header as="h2" size="h3">
          {t('modal.createJob.title')}
        </Header>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleClose}
          iconOnly
        >
          ×
        </Button>
      </div>
      
      <div className={styles.content}>
        <div className={styles.formGroup}>
          <Input
            label={t('modal.createJob.jobName')}
            required
            fullWidth
            value={createFormData.name}
            onChange={handleCreateInputChange('name')}
            placeholder={t('modal.createJob.jobNamePlaceholder')}
            state={formErrors.name ? 'error' : 'default'}
            helpText={formErrors.name}
          />
        </div>
        
        <div className={styles.formGroup}>
          <Select
            label={t('modal.createJob.priority')}
            required
            fullWidth
            value={createFormData.priority.toString()}
            onChange={handleCreateInputChange('priority')}
            options={[
              { value: JobPriority.Regular.toString(), label: t('priority.regular') },
              { value: JobPriority.High.toString(), label: t('priority.high') }
            ]}
          />
        </div>
      </div>
      
      <div className={styles.footer}>
        <Button variant="secondary" onClick={handleClose} disabled={submitting.value}>
          {t('modal.createJob.cancel')}
        </Button>
        <Button 
          variant="primary" 
          onClick={handleCreateJob}
          disabled={!createFormData.name.trim() || submitting.value}
        >
          {submitting.value ? t('modal.createJob.creating') : t('modal.createJob.create')}
        </Button>
      </div>
    </>
  );

  const renderBulkDeleteModal = () => (
    <>
      <div className={styles.header}>
        <Header as="h2" size="h3">
          {t('modal.deleteJobs.title')}
        </Header>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleClose}
          iconOnly
        >
          ×
        </Button>
      </div>
      
      <div className={styles.content}>
        <Text size="base" color="secondary" className={styles.description}>
          {t('modal.deleteJobs.description')}
        </Text>
        
        <div className={styles.formGroup}>
          <Select
            label={t('modal.deleteJobs.selectStatus')}
            required
            fullWidth
            value={bulkDeleteFormData.status.toString()}
            onChange={handleBulkDeleteInputChange}
            placeholder={t('modal.deleteJobs.statusPlaceholder')}
            state={formErrors.status ? 'error' : 'default'}
            helpText={formErrors.status}
            options={[
              { value: JobStatus.Completed.toString(), label: t('status.completed') },
              { value: JobStatus.Failed.toString(), label: t('status.failed') },
              { value: JobStatus.Stopped.toString(), label: t('status.stopped') }
            ]}
          />
        </div>
      </div>
      
      <div className={styles.footer}>
        <Button variant="secondary" onClick={handleClose} disabled={submitting.value}>
          {t('modal.deleteJobs.cancel')}
        </Button>
        <Button 
          variant="danger" 
          onClick={handleBulkDeleteJobs}
          disabled={!bulkDeleteFormData.status || submitting.value}
        >
          {submitting.value ? t('modal.deleteJobs.deleting') : t('modal.deleteJobs.delete')}
        </Button>
      </div>
    </>
  );

  return (
    <div className={styles.overlay}>
      <Card className={styles.modal} variant="elevated" ref={ref}>
        {modal.type === 'create' && renderCreateJobModal()}
        {modal.type === 'bulkDelete' && renderBulkDeleteModal()}
      </Card>
    </div>
  );
}
