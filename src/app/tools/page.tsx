
import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Calculator, TrendingUp, PieChart, Percent } from 'lucide-react';
import styles from './page.module.css';

const TOOLS = [
    {
        name: 'SIP Calculator',
        slug: 'sip-calculator',
        desc: 'Calculate potential returns on your monthly investments.',
        icon: <TrendingUp size={32} className="text-brand" />
    },
    {
        name: 'IPO Allotment',
        slug: 'ipo-allotment',
        desc: 'Estimate probability of getting an IPO allotment.',
        icon: <PieChart size={32} className="text-brand" />
    },
    {
        name: 'Brokerage Calc',
        slug: 'brokerage-calculator',
        desc: 'Compare trading charges across Zerodha, Groww, etc.',
        icon: <Percent size={32} className="text-brand" />
    },
];

export default function ToolsDashboard() {
    return (
        <main className={styles.main}>
            <div className="container">
                <div className={styles.header}>
                    <h1 className={styles.title}>Financial <span className="text-brand">Tools</span></h1>
                    <p className={styles.subtitle}>Smart calculators to help you plan your millions.</p>
                </div>

                <div className={styles.grid}>
                    {TOOLS.map((tool) => (
                        <Link key={tool.slug} href={`/tools/${tool.slug}`} className={styles.cardLink}>
                            <Card className={styles.toolCard}>
                                <div className={styles.iconWrapper}>
                                    {tool.icon}
                                </div>
                                <h3>{tool.name}</h3>
                                <p>{tool.desc}</p>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </main>
    );
}
