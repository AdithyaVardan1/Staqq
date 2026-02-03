
'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import styles from './BrokerageCalculator.module.css';

export const BrokerageCalculator = () => {
    // State
    const [buyPrice, setBuyPrice] = useState(100);
    const [sellPrice, setSellPrice] = useState(110);
    const [quantity, setQuantity] = useState(100);
    const [type, setType] = useState<'DELIVERY' | 'INTRADAY'>('DELIVERY');

    // Charges State
    const [charges, setCharges] = useState({
        brokerage: 0,
        stt: 0,
        transaction: 0,
        gst: 0,
        sebi: 0,
        stamp: 0,
        totalTax: 0,
        netProfit: 0
    });

    useEffect(() => {
        // Standard Discount Broker Logic (Zerodha/Groww style)

        const turnover = (buyPrice + sellPrice) * quantity;

        // 1. Brokerage: Flat 20 or 0.03% whichever is lower (Intraday), usually 0 for Delivery (Equity) or Flat 20.
        // Simplified: Delivery = 0, Intraday = Min(20, 0.03%) per order side? 
        // Let's assume standard "Flat 20 per order" for Intraday, 0 for Delivery equity.
        let brokerage = 0;
        if (type === 'INTRADAY') {
            // Flat 20 per executed order (Buy + Sell = 40 max)
            // But usually it's lower of 0.03% or 20.
            const b_buy = Math.min(20, (buyPrice * quantity) * 0.0003);
            const b_sell = Math.min(20, (sellPrice * quantity) * 0.0003);
            brokerage = b_buy + b_sell;
        } else {
            brokerage = 0; // Equity Delivery Free
        }

        // 2. STT (Securities Transaction Tax)
        // Delivery: 0.1% on Buy & Sell
        // Intraday: 0.025% on Sell only
        let stt = 0;
        if (type === 'DELIVERY') {
            stt = turnover * 0.001;
        } else {
            stt = (sellPrice * quantity) * 0.00025;
        }

        // 3. Transaction Charges (NSE avg ~0.00325%)
        const transaction = turnover * 0.0000325;

        // 4. GST (18% on Brokerage + Transaction)
        const gst = (brokerage + transaction) * 0.18;

        // 5. SEBI Charges (10 per crore = 0.0001%)
        const sebi = turnover * 0.000001;

        // 6. Stamp Duty (0.015% on Buy only)
        const stamp = (buyPrice * quantity) * 0.00015;

        const totalTax = brokerage + stt + transaction + gst + sebi + stamp;

        const grossProfit = (sellPrice - buyPrice) * quantity;
        const netProfit = grossProfit - totalTax;

        setCharges({
            brokerage,
            stt,
            transaction,
            gst,
            sebi,
            stamp,
            totalTax,
            netProfit
        });

    }, [buyPrice, sellPrice, quantity, type]);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 2
        }).format(val);
    };

    return (
        <div className={styles.container}>
            <div className={styles.inputsSection}>

                {/* Type Toggle */}
                <div className={styles.tabs}>
                    <button
                        className={`${styles.tab} ${type === 'DELIVERY' ? styles.activeTab : ''}`}
                        onClick={() => setType('DELIVERY')}
                    >
                        Delivery (Equity)
                    </button>
                    <button
                        className={`${styles.tab} ${type === 'INTRADAY' ? styles.activeTab : ''}`}
                        onClick={() => setType('INTRADAY')}
                    >
                        Intraday
                    </button>
                </div>

                <div className={styles.row}>
                    <div className={styles.inputGroup}>
                        <label>Buy Price</label>
                        <input
                            type="number"
                            className={styles.input}
                            value={buyPrice}
                            onChange={(e) => setBuyPrice(Number(e.target.value))}
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Sell Price</label>
                        <input
                            type="number"
                            className={styles.input}
                            value={sellPrice}
                            onChange={(e) => setSellPrice(Number(e.target.value))}
                        />
                    </div>
                </div>

                <div className={styles.inputGroup}>
                    <label>Quantity</label>
                    <input
                        type="number"
                        className={styles.input}
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                    />
                </div>
            </div>

            <div className={styles.resultsSection}>
                <Card className={styles.resultCard}>
                    <h3 className={styles.cardTitle}>P&L Breakdown</h3>

                    <div className={styles.breakdownRow}>
                        <span>Brokerage</span>
                        <span>{formatCurrency(charges.brokerage)}</span>
                    </div>
                    <div className={styles.breakdownRow}>
                        <span>STT Total</span>
                        <span>{formatCurrency(charges.stt)}</span>
                    </div>
                    <div className={styles.breakdownRow}>
                        <span>Exchange Txn</span>
                        <span>{formatCurrency(charges.transaction)}</span>
                    </div>
                    <div className={styles.breakdownRow}>
                        <span>Other Taxes (GST, SEBI, Stamp)</span>
                        <span>{formatCurrency(charges.gst + charges.sebi + charges.stamp)}</span>
                    </div>

                    <div className={styles.divider}></div>

                    <div className={styles.totalTaxRow}>
                        <span>Total Tax & Charges</span>
                        <span className="text-red-400">-{formatCurrency(charges.totalTax)}</span>
                    </div>

                    <div className={styles.netProfitRow}>
                        <span>Net Profit / Loss</span>
                        <span className={charges.netProfit >= 0 ? styles.profit : styles.loss}>
                            {formatCurrency(charges.netProfit)}
                        </span>
                    </div>
                </Card>
            </div>
        </div>
    );
};
