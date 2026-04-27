import type { Metadata } from 'next';
import AlertsPage from './AlertsPageClient';

export const metadata: Metadata = {
    title: 'Solana Token Alerts | Staqq',
    description: 'Real-time Solana new token pair alerts with multi-layer rug scoring, delivered to Telegram within 60 seconds. 5-15 quality alerts per day. Launching soon.',
    alternates: {
        canonical: '/alerts',
    },
};

export default AlertsPage;
