import React from 'react';
import { useTranslation } from 'react-i18next';
import { useError } from '../../context/ErrorContext';
import { configService } from '../../services/configService';
import { Button } from '../common/Button/Button';
import styles from './ErrorNotifications.module.scss';

export function ErrorNotifications(): React.ReactElement {
    const { t, i18n } = useTranslation();
    const { errors, connectionState, removeError, retryConnection } = useError();
    const isRTL = i18n.dir() === 'rtl';
    const isUsingMockData = configService.getServiceConfig().useMockData;

    if (errors.length === 0 && (connectionState.isConnected || isUsingMockData)) {
        return <></>;
    }

    return (
        <div className={`${styles.container} ${isRTL ? styles.rtl : styles.ltr}`}>
            {/* Connection Status - Only show in real API mode */}
            {!isUsingMockData && !connectionState.isConnected && (
                <div className={`${styles.notification} ${styles.signalrError}`}>
                    <div className={styles.content}>
                        <strong className={styles.title}>
                            {connectionState.isReconnecting
                                ? t('errors.reconnecting')
                                : t('errors.disconnected')
                            }
                        </strong>
                        <p className={styles.message}>
                            {connectionState.lastError || t('errors.signalr_default')}
                        </p>
                        {connectionState.retryCount > 0 && (
                            <p className={styles.retryCount}>
                                {t('errors.retry_attempt', { count: connectionState.retryCount })}
                            </p>
                        )}
                    </div>
                    {!connectionState.isReconnecting && (
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={retryConnection}
                            className={styles.retryButton}
                        >
                            {t('errors.retry_button')}
                        </Button>
                    )}
                </div>
            )}

            {/* Error Messages */}
            {errors.map((error) => (
                <div
                    key={error.timestamp}
                    className={`${styles.notification} ${styles[error.type]}`}
                >
                    <div className={styles.content}>
                        <strong className={styles.title}>
                            {getErrorTitle(error.type, t)}
                        </strong>
                        <p className={styles.message}>{error.message}</p>
                    </div>
                    <div className={styles.actions}>
                        {error.canRetry && error.action && (
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={error.action}
                                className={styles.actionButton}
                            >
                                {t('errors.retry_button')}
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeError(error.timestamp)}
                            className={styles.closeButton}
                        >
                            ×
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    );
}

function getErrorTitle(type: string, t: (key: string) => string): string {
    switch (type) {
        case 'api_error':
            return t('errors.api_error_title');
        case 'signalr_error':
            return t('errors.signalr_error_title');
        case 'network_error':
            return t('errors.network_error_title');
        default:
            return t('errors.unknown_error_title');
    }
}
