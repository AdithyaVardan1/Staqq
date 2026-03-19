'use client';

import React, { useEffect, useCallback } from 'react';
import { X, Crown, Zap, Bell, BarChart3, Mail, Download } from 'lucide-react';
import Link from 'next/link';

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    feature?: string;
}

const FEATURES = [
    { icon: Zap, text: 'Real-time signals (no 30-min delay)' },
    { icon: Bell, text: 'Unlimited alert subscriptions' },
    { icon: BarChart3, text: 'Composite IPO Score (1-10)' },
    { icon: Mail, text: 'Daily morning market brief' },
    { icon: Download, text: 'Export to PDF & Excel' },
    { icon: Crown, text: 'Custom alert rules engine' },
];

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
    isOpen,
    onClose,
    feature,
}) => {
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
    }, [onClose]);

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [isOpen, handleKeyDown]);

    if (!isOpen) return null;

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
            }}
            onClick={onClose}
        >
            {/* Backdrop */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(0, 0, 0, 0.7)',
                    backdropFilter: 'blur(4px)',
                }}
            />

            {/* Modal */}
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    position: 'relative',
                    width: '100%',
                    maxWidth: '440px',
                    background: '#121212',
                    border: '1px solid rgba(202, 255, 0, 0.2)',
                    borderRadius: '16px',
                    padding: '32px',
                    boxShadow: '0 0 60px rgba(202, 255, 0, 0.08)',
                }}
            >
                {/* Close button */}
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        background: 'none',
                        border: 'none',
                        color: '#A1A1AA',
                        cursor: 'pointer',
                        padding: '4px',
                    }}
                >
                    <X size={20} />
                </button>

                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <div
                        style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '50%',
                            background: 'rgba(202, 255, 0, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 16px',
                        }}
                    >
                        <Crown size={28} color="#CAFF00" />
                    </div>
                    <h2 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 700, margin: '0 0 8px' }}>
                        Upgrade to Pro
                    </h2>
                    {feature && (
                        <p style={{ color: '#A1A1AA', fontSize: '0.9rem', margin: 0 }}>
                            {feature} is a Pro feature
                        </p>
                    )}
                </div>

                {/* Features list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
                    {FEATURES.map(({ icon: Icon, text }) => (
                        <div
                            key={text}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                color: '#E4E4E7',
                                fontSize: '0.9rem',
                            }}
                        >
                            <Icon size={18} color="#CAFF00" />
                            <span>{text}</span>
                        </div>
                    ))}
                </div>

                {/* Pricing */}
                <div
                    style={{
                        background: 'rgba(202, 255, 0, 0.05)',
                        border: '1px solid rgba(202, 255, 0, 0.15)',
                        borderRadius: '12px',
                        padding: '16px',
                        textAlign: 'center',
                        marginBottom: '20px',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '4px' }}>
                        <span style={{ color: '#CAFF00', fontSize: '2rem', fontWeight: 800 }}>₹499</span>
                        <span style={{ color: '#A1A1AA', fontSize: '0.9rem' }}>/month</span>
                    </div>
                    <p style={{ color: '#71717A', fontSize: '0.8rem', margin: '4px 0 0' }}>
                        or ₹4,999/year (save 17%)
                    </p>
                </div>

                {/* CTA */}
                <Link
                    href="/pricing"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        width: '100%',
                        padding: '12px 24px',
                        borderRadius: '9999px',
                        background: '#CAFF00',
                        color: '#0A0A0A',
                        fontWeight: 700,
                        fontSize: '1rem',
                        textDecoration: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                    }}
                >
                    <Crown size={18} />
                    Get Staqq Pro
                </Link>
            </div>
        </div>
    );
};
