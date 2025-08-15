import React from 'react';
import { JobProvider } from '../../context/JobContext';
import { StatusCardsContainer } from '../StatusCards/StatusCardsContainer';
import { JobTable } from '../JobTable/JobTable';
import { DashboardHeaderContainer } from '../DashboardHeader/DashboardHeaderContainer';
import { JobModals } from '../JobModals/JobModals';
import { ConfigToggle } from '../ConfigToggle/ConfigToggle';
import styles from './Dashboard.module.scss';

export function Dashboard(): React.ReactElement {
  
  return (
    <JobProvider>
      <div className={styles.root}>
        <ConfigToggle />
        <DashboardHeaderContainer />
        <StatusCardsContainer />
        <JobTable />
        <JobModals />
      </div>
    </JobProvider>
  );
}
