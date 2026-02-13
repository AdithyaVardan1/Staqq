'use client';

import React, { useState, useEffect } from 'react';
import { useComparisonStore } from '@/store/useComparisonStore';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
    ArrowLeft,
    Download,
    FileText,
    Table as TableIcon,
    Sparkles,
    TrendingUp,
    TrendingDown,
    X,
    CheckCircle2,
    AlertTriangle,
    ShieldCheck,
    Zap
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { StockLogo } from '@/components/stocks/StockLogo';
import styles from './page.module.css';
import clsx from 'clsx';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function ComparePage() {
    const { selectedTickers, removeTicker, clearTickers } = useComparisonStore();
    const router = useRouter();
    const [comparisonData, setComparisonData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (selectedTickers.length === 0) {
            router.push('/stocks/screener');
            return;
        }

        const fetchData = async () => {
            setIsLoading(true);
            try {
                const results = await Promise.all(
                    selectedTickers.map(async (ticker) => {
                        const res = await fetch(`/api/stocks/fundamentals?ticker=${ticker}`);
                        const data = await res.json();
                        return { ticker, ...(data.fundamentals || {}) };
                    })
                );
                setComparisonData(results);
            } catch (error) {
                console.error('Comparison fetch failed:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [selectedTickers, router]);

    const getSignals = (stock: any) => {
        const pros = [];
        const cons = [];

        if (stock.peRatio < 20) pros.push("Attractive P/E");
        if (stock.roe > 0.18) pros.push("High ROE");
        if (stock.divYield > 0.02) pros.push("Healthy Dividend");
        if (stock.debtToEquity < 0.5) pros.push("Low Debt");

        if (stock.peRatio > 40) cons.push("High Valuation");
        if (stock.roe < 0.08) cons.push("Low Profitability");
        if (stock.debtToEquity > 1.5) cons.push("High Leverage");
        if (stock.beta > 1.5) cons.push("High Volatility");

        return { pros, cons };
    };

    const exportToExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(comparisonData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Comparison");
        XLSX.writeFile(workbook, "Staqq_Stock_Comparison.xlsx");
    };

    const exportToPDF = () => {
        const doc = new jsPDF();
        doc.text("Staqq Stock Comparison Report", 14, 15);

        const headers = ["Metric", ...comparisonData.map(d => d.ticker)];
        const rows = [
            ["Company Name", ...comparisonData.map(d => d.name || d.ticker)],
            ["Sector", ...comparisonData.map(d => d.sector || '---')],
            ["Price", ...comparisonData.map(d => `₹${d.price?.toFixed(2) || '0.00'}`)],
            ["Market Cap (Cr)", ...comparisonData.map(d => (d.marketCap / 1e7).toFixed(0))],
            ["P/E Ratio", ...comparisonData.map(d => d.peRatio?.toFixed(2) || '---')],
            ["RO Equity", ...comparisonData.map(d => (d.roe * 100).toFixed(2) + '%')],
            ["Div Yield", ...comparisonData.map(d => (d.divYield * 100).toFixed(2) + '%')],
        ];

        autoTable(doc, {
            head: [headers],
            body: rows,
            startY: 25,
            theme: 'grid',
            headStyles: { fillColor: [34, 197, 94] }
        });

        doc.save("Staqq_Stock_Comparison.pdf");
    };

    if (isLoading) return <div className={styles.loading}>Analyzing stocks and preparing comparison...</div>;

    return (
        <main className={styles.main}>
            <div className="container">
                <header className={styles.header}>
                    <Link href="/stocks/screener" className={styles.backBtn}>
                        <ArrowLeft size={18} /> Back to Screener
                    </Link>
                    <div className={styles.headerTitle}>
                        <h1>Stock Comparison</h1>
                        <p>Detailed analysis of {selectedTickers.length} selected stocks</p>
                    </div>
                    <div className={styles.exportActions}>
                        <Button variant="outline" size="sm" onClick={exportToExcel}>
                            <TableIcon size={16} /> Excel
                        </Button>
                        <Button variant="outline" size="sm" onClick={exportToPDF}>
                            <FileText size={16} /> PDF
                        </Button>
                    </div>
                </header>

                <div className={styles.compareGrid}>
                    <Card className={styles.tableCard}>
                        <div className={styles.tableWrapper}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th className={styles.stickyCol}>Metric</th>
                                        {comparisonData.map(stock => (
                                            <th key={stock.ticker}>
                                                <div className={styles.stockHeader}>
                                                    <StockLogo ticker={stock.ticker} name={stock.ticker} size="md" />
                                                    <div className={styles.stockInfo}>
                                                        <span className={styles.tickerName}>{stock.ticker}</span>
                                                        <button className={styles.removeTag} onClick={() => removeTicker(stock.ticker)}>
                                                            <X size={12} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className={styles.subHeader}><td colSpan={comparisonData.length + 1}>Basic Information</td></tr>
                                    <tr>
                                        <td className={styles.stickyCol}>Price</td>
                                        {comparisonData.map(d => (
                                            <td key={d.ticker} className={styles.valCell}>
                                                <div className={styles.priceVal}>₹{d.price?.toFixed(2) || '--'}</div>
                                            </td>
                                        ))}
                                    </tr>
                                    <tr>
                                        <td className={styles.stickyCol}>Market Cap</td>
                                        {comparisonData.map(d => <td key={d.ticker}>₹{(d.marketCap / 1e7).toFixed(0)} Cr</td>)}
                                    </tr>

                                    <tr className={styles.subHeader}><td colSpan={comparisonData.length + 1}>Stock Health Signals</td></tr>
                                    <tr>
                                        <td className={styles.stickyCol}>Advantages (Pros)</td>
                                        {comparisonData.map(d => {
                                            const { pros } = getSignals(d);
                                            return (
                                                <td key={d.ticker} className={styles.signalCell}>
                                                    <div className={styles.prosList}>
                                                        {pros.map(p => (
                                                            <div key={p} className={styles.proItem}>
                                                                <CheckCircle2 size={14} /> {p}
                                                            </div>
                                                        ))}
                                                        {pros.length === 0 && <span className="text-muted text-xs">No major pros</span>}
                                                    </div>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                    <tr>
                                        <td className={styles.stickyCol}>Disadvantages (Cons)</td>
                                        {comparisonData.map(d => {
                                            const { cons } = getSignals(d);
                                            return (
                                                <td key={d.ticker} className={styles.signalCell}>
                                                    <div className={styles.consList}>
                                                        {cons.map(c => (
                                                            <div key={c} className={styles.conItem}>
                                                                <AlertTriangle size={14} /> {c}
                                                            </div>
                                                        ))}
                                                        {cons.length === 0 && <span className="text-muted text-xs">No major cons</span>}
                                                    </div>
                                                </td>
                                            );
                                        })}
                                    </tr>

                                    <tr className={styles.subHeader}><td colSpan={comparisonData.length + 1}>Key Ratios</td></tr>
                                    <tr>
                                        <td className={styles.stickyCol}>P/E Ratio</td>
                                        {comparisonData.map(d => (
                                            <td key={d.ticker} className={clsx(styles.valCell, d.peRatio < 20 && styles.better)}>
                                                {d.peRatio?.toFixed(2) || '---'}
                                            </td>
                                        ))}
                                    </tr>
                                    <tr>
                                        <td className={styles.stickyCol}>ROE (%)</td>
                                        {comparisonData.map(d => (
                                            <td key={d.ticker} className={clsx(styles.valCell, d.roe > 0.15 && styles.better)}>
                                                {(d.roe * 100).toFixed(2)}%
                                            </td>
                                        ))}
                                    </tr>
                                    <tr>
                                        <td className={styles.stickyCol}>Div. Yield</td>
                                        {comparisonData.map(d => <td key={d.ticker}>{(d.divYield * 100).toFixed(2)}%</td>)}
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    <aside className={styles.aiInsights}>
                        <Card className={styles.insightCard}>
                            <h3 className={styles.insightTitle}><Sparkles size={18} /> AI Comparison Insight</h3>
                            <div className={styles.insightContent}>
                                <p>Based on the current selection:</p>
                                <ul>
                                    {comparisonData.length > 1 && (
                                        <>
                                            <li className="mb-3">
                                                <div className="flex items-center gap-2 font-bold mb-1">
                                                    <Zap size={16} className="text-brand" />
                                                    Valuation Pick: {comparisonData.sort((a, b) => (a.peRatio || 100) - (b.peRatio || 100))[0].ticker}
                                                </div>
                                                <p className="text-xs text-secondary pl-6">Trading at a P/E of {comparisonData.sort((a, b) => (a.peRatio || 100) - (b.peRatio || 100))[0].peRatio?.toFixed(2)}, indicating the best relative value in this peer group.</p>
                                            </li>
                                            <li className="mb-3">
                                                <div className="flex items-center gap-2 font-bold mb-1">
                                                    <ShieldCheck size={16} className="text-brand" />
                                                    Efficiency Pick: {comparisonData.sort((a, b) => (b.roe || 0) - (a.roe || 0))[0].ticker}
                                                </div>
                                                <p className="text-xs text-secondary pl-6">Generating a superior {(comparisonData.sort((a, b) => (b.roe || 0) - (a.roe || 0))[0].roe * 100).toFixed(1)}% Return on Equity, showcasing excellent capital management.</p>
                                            </li>
                                            <li className="mt-4 pt-4 border-t border-glass">
                                                <p className="font-bold text-xs uppercase tracking-wider mb-2 text-brand">Quick Recap</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {comparisonData.map(s => (
                                                        <Badge key={s.ticker} variant="outline" className="text-[10px] py-1">
                                                            {s.ticker}: {getSignals(s).pros[0] || 'Steady'}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </li>
                                        </>
                                    )}
                                </ul>
                            </div>
                        </Card>
                    </aside>
                </div>
            </div>
        </main>
    );
}
