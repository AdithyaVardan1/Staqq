'use client';

import React, { useState, useEffect } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';

interface Props {
    ticker: string;
}

export const AlertSubscribeButton: React.FC<Props> = ({ ticker }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        const supabase = createClient();
        supabase.auth.getSession().then(({ data: { session } }) => {
            setIsLoggedIn(!!session);
            if (session) {
                fetch('/api/alerts/subscriptions')
                    .then(r => r.json())
                    .then(data => {
                        const subs = data.subscriptions ?? [];
                        setIsSubscribed(
                            subs.some((s: { ticker: string }) =>
                                s.ticker === ticker.toUpperCase()
                            )
                        );
                    })
                    .catch(() => {})
                    .finally(() => setLoading(false));
            } else {
                setLoading(false);
            }
        });
    }, [ticker]);

    const toggle = async () => {
        setActionLoading(true);
        const endpoint = isSubscribed ? '/api/alerts/unsubscribe' : '/api/alerts/subscribe';
        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ticker }),
            });
            if (res.ok) setIsSubscribed(v => !v);
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return null;

    if (!isLoggedIn) {
        return (
            <Link href="/login">
                <Button variant="outline" size="sm">
                    <Bell size={14} className="mr-2" />
                    Alert Me
                </Button>
            </Link>
        );
    }

    return (
        <Button
            variant={isSubscribed ? 'ghost' : 'outline'}
            size="sm"
            onClick={toggle}
            isLoading={actionLoading}
        >
            {isSubscribed
                ? <><BellOff size={14} className="mr-2" />Subscribed</>
                : <><Bell size={14} className="mr-2" />Alert Me</>
            }
        </Button>
    );
};
