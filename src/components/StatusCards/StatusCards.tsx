import React from 'react';
import { JobStatus } from '../../types';
import { Card } from '../common/Card/Card';
import { Text } from '../common/Text/Text';
import { Section } from '../common/Section/Section';
import styles from './StatusCards.module.scss';

interface StatusCardProps {
  title: string;
  count: number;
  status: JobStatus;
  color: string;
  isSelected?: boolean;
  onClick: () => void;
}

interface CardData {
  title: string;
  count: number;
  status: JobStatus;
  color: string;
}

export interface StatusCardsProps {
  cards: CardData[];
  onStatusFilter: (status: JobStatus) => void;
  selectedStatus?: JobStatus;
  title?: string;
}

function StatusCard({ title, count, status, color, isSelected, onClick }: StatusCardProps): React.ReactElement {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      onClick();
    }
  };

  return (
    <Card 
      className={`${styles.statusCard} ${styles[`statusCard--${color}`]} ${isSelected ? styles['statusCard--selected'] : ''}`}
      clickable
      onClick={onClick}
    >
      <div 
        role="button"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        className={styles.cardContent}
      >
        <Text 
          size="2xl" 
          weight="bold" 
          color="primary"
        >
          {count}
        </Text>
        <Text 
          size="sm" 
          weight="medium" 
          className={styles.title}
          color="secondary"
        >
          {title}
        </Text>
      </div>
    </Card>
  );
}

export function StatusCards({ cards, onStatusFilter, selectedStatus, title }: StatusCardsProps): React.ReactElement {
  const content = (
    <div className={styles.root}>
      {cards.map((card) => (
        <StatusCard
          key={card.status}
          title={card.title}
          count={card.count}
          status={card.status}
          color={card.color}
          isSelected={selectedStatus === card.status}
          onClick={() => onStatusFilter(card.status)}
        />
      ))}
    </div>
  );

  if (title) {
    return (
      <Section title={title} spacing="md">
        {content}
      </Section>
    );
  }

  return content;
}
