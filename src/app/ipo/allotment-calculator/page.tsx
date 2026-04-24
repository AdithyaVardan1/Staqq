'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calculator, Search, ChevronDown, Info, ExternalLink, TrendingUp, TrendingDown } from 'lucide-react';
import styles from './page.module.css';

interface CalcIPO {
    id: number;
    slug: string;
    name: string;
    price: number | null;
    lotSize: number | null;
    gmp: number | null;
    gmpPercent: number | null;
    estListing: number | null;
    subscriptionNum: number | null;
    subscription: string | null;
    status: 'Live' | 'Upcoming' | 'Closed' | 'Listed';
    category: 'IPO' | 'SME';
    openDate: string | null;
    closeDate: string | null;
    listingDate: string | null;
    ipoSizeCr: string | null;
}

type InvestorCategory = 'retail' | 'snii' | 'bnii' | 'employee';

const CATEGORIES: { id: InvestorCategory; label: string; desc: string }[] = [
    { id: 'retail', label: 'Retail (RII)', desc: 'Apply up to ₹2L. Lottery allotment.' },
    { id: 'snii', label: 'sNII', desc: 'HNI, ₹2L to ₹10L. Proportional.' },
    { id: 'bnii', label: 'bNII', desc: 'HNI, above ₹10L. Proportional.' },
    { id: 'employee', label: 'Employee', desc: 'Reserved employee quota.' },
];

function calcRetailProb(subX: number): number {
    if (subX <= 1) return 99;
    if (subX <= 3) return Math.min(99, Math.round(100 / subX));
    if (subX <= 10) return Math.min(99, Math.round(80 / subX));
    if (subX <= 50) return Math.min(99, Math.round(60 / subX));
    return Math.max(1, Math.round(30 / subX));
}

function calcHniProb(subX: number): number {
    if (subX <= 1) return 99;
    return Math.max(1, Math.min(99, Math.round(100 / subX)));
}

function inr(n: number): string {
    return n.toLocaleString('en-IN');
}

function probColor(p: number): string {
    if (p >= 50) return '#22c55e';
    if (p >= 20) return '#f59e0b';
    return '#ef4444';
}

export default function AllotmentCalculatorPage() {
    const [ipos, setIpos] = useState<CalcIPO[]>([]);
    const [loadingIpos, setLoadingIpos] = useState(true);
    const [selected, setSelected] = useState<CalcIPO | null>(null);
    const [query, setQuery] = useState('');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [category, setCategory] = useState<InvestorCategory>('retail');
    const [applications, setApplications] = useState(1);
    const [hniAmount, setHniAmount] = useState(200000);
    const [subOverride, setSubOverride] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetch('/api/ipo')
            .then(r => r.json())
            .then(data => {
                const list: CalcIPO[] = data.ipos || [];
                setIpos(list);
                const firstLive = list.find(i => i.status === 'Live');
                if (firstLive) {
                    setSelected(firstLive);
                    setSubOverride(firstLive.subscriptionNum?.toFixed(2) || '');
                }
            })
            .finally(() => setLoadingIpos(false));
    }, []);

    useEffect(() => {
        if (selected) setSubOverride(selected.subscriptionNum?.toFixed(2) || '');
    }, [selected?.id]);

    useEffect(() => {
        function onClickOutside(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', onClickOutside);
        return () => document.removeEventListener('mousedown', onClickOutside);
    }, []);

    const subX = parseFloat(subOverride) || 0;
    const lotSize = selected?.lotSize || 0;
    const issuePrice = selected?.price || 0;
    const lotValue = lotSize * issuePrice;
    const gmp = selected?.gmp || 0;

    const results = useMemo(() => {
        if (!selected || lotValue <= 0) return null;

        if (category === 'retail') {
            const singleProb = subX > 0 ? calcRetailProb(subX) : null;
            const multiProb = singleProb !== null && applications > 1
                ? Math.min(99, Math.round((1 - Math.pow(1 - singleProb / 100, applications)) * 100))
                : singleProb;
            return {
                type: 'retail' as const,
                singleProb,
                multiProb,
                capitalBlocked: lotValue * applications,
                gainPerLot: gmp * lotSize,
                lotsApplied: applications,
            };
        }

        if (category === 'snii' || category === 'bnii') {
            const lotsApplied = lotValue > 0 ? Math.floor(hniAmount / lotValue) : 0;
            const effectiveCapital = lotsApplied * lotValue;
            const prob = subX > 0 ? calcHniProb(subX) : null;
            const lotsExpected = subX > 0 && lotsApplied > 0
                ? Math.max(1, Math.round(lotsApplied / subX))
                : null;
            return {
                type: 'hni' as const,
                prob,
                lotsApplied,
                lotsExpected,
                capitalBlocked: effectiveCapital,
                gainPerLot: gmp * lotSize,
            };
        }

        return {
            type: 'employee' as const,
            capitalBlocked: lotValue * applications,
            gainPerLot: gmp * lotSize,
        };
    }, [selected, subX, lotValue, gmp, lotSize, category, applications, hniAmount]);

    const filtered = ipos.filter(i => i.name.toLowerCase().includes(query.toLowerCase()));
    const liveIpos = ipos.filter(i => i.status === 'Live');

    return (
        <main className={styles.main}>
            <div className="container">
                <Link href="/ipo" className={styles.back}>
                    <ArrowLeft size={16} /> Back to IPO Hub
                </Link>

                <div className={styles.header}>
                    <div className={styles.eyebrow}>CALCULATOR</div>
                    <h1 className={styles.title}>Allotment <span className={styles.accent}>Calculator</span></h1>
                    <p className={styles.subtitle}>
                        Pick any IPO, select your category, and get your allotment odds. Updated with live subscription data.
                    </p>
                </div>

                {/* IPO Selector */}
                <div className={styles.selectorWrap} ref={dropdownRef}>
                    <div
                        className={`${styles.selectorBox} ${dropdownOpen ? styles.selectorOpen : ''}`}
                        onClick={() => setDropdownOpen(v => !v)}
                    >
                        <Search size={16} className={styles.selectorSearchIcon} />
                        {selected ? (
                            <span className={styles.selectorValue}>
                                {selected.name}
                                <span className={`${styles.badge} ${styles[`badge_${selected.status.toLowerCase()}`]}`}>
                                    {selected.status}
                                </span>
                                {selected.subscriptionNum && (
                                    <span className={styles.badgeSub}>{selected.subscriptionNum.toFixed(1)}x</span>
                                )}
                            </span>
                        ) : (
                            <span className={styles.selectorPlaceholder}>
                                {loadingIpos ? 'Loading IPOs...' : 'Search and select an IPO...'}
                            </span>
                        )}
                        <ChevronDown size={16} className={`${styles.chevron} ${dropdownOpen ? styles.chevronUp : ''}`} />
                    </div>

                    {dropdownOpen && (
                        <div className={styles.dropdown}>
                            <div className={styles.dropdownSearch}>
                                <Search size={14} />
                                <input
                                    autoFocus
                                    placeholder="Search IPOs..."
                                    value={query}
                                    onChange={e => setQuery(e.target.value)}
                                    onClick={e => e.stopPropagation()}
                                />
                            </div>
                            <div className={styles.dropdownList}>
                                {filtered.length === 0 ? (
                                    <div className={styles.dropdownEmpty}>No IPOs found</div>
                                ) : filtered.map(ipo => (
                                    <div
                                        key={ipo.id}
                                        className={`${styles.dropdownItem} ${selected?.id === ipo.id ? styles.dropdownItemActive : ''}`}
                                        onClick={() => { setSelected(ipo); setDropdownOpen(false); setQuery(''); }}
                                    >
                                        <span className={styles.dropdownItemName}>{ipo.name}</span>
                                        <div className={styles.dropdownItemRight}>
                                            <span className={`${styles.badge} ${styles[`badge_${ipo.status.toLowerCase()}`]}`}>
                                                {ipo.status}
                                            </span>
                                            {ipo.subscriptionNum && (
                                                <span className={styles.dropdownSub}>{ipo.subscriptionNum.toFixed(1)}x</span>
                                            )}
                                            {ipo.gmpPercent !== null && (
                                                <span className={ipo.gmpPercent >= 0 ? styles.pos : styles.neg}>
                                                    {ipo.gmpPercent >= 0 ? '+' : ''}{ipo.gmpPercent.toFixed(1)}%
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* IPO Summary Strip */}
                {selected && (
                    <div className={styles.summaryStrip}>
                        <div className={styles.summaryItem}>
                            <span className={styles.summaryLabel}>Issue Price</span>
                            <span className={styles.summaryVal}>{selected.price ? `₹${selected.price}` : 'TBA'}</span>
                        </div>
                        <div className={styles.summaryItem}>
                            <span className={styles.summaryLabel}>Lot Size</span>
                            <span className={styles.summaryVal}>{selected.lotSize ? `${selected.lotSize} shares` : 'TBA'}</span>
                        </div>
                        <div className={styles.summaryItem}>
                            <span className={styles.summaryLabel}>Min Amount</span>
                            <span className={styles.summaryVal}>{lotValue > 0 ? `₹${inr(lotValue)}` : 'TBA'}</span>
                        </div>
                        <div className={styles.summaryItem}>
                            <span className={styles.summaryLabel}>GMP</span>
                            <span className={`${styles.summaryVal} ${gmp > 0 ? styles.pos : gmp < 0 ? styles.neg : ''}`}>
                                {selected.gmp !== null ? (
                                    <>
                                        {gmp >= 0 ? '+' : ''}₹{gmp}
                                        {selected.gmpPercent !== null && (
                                            <span className={styles.summaryGmpPct}>
                                                {' '}({gmp >= 0 ? '+' : ''}{selected.gmpPercent.toFixed(1)}%)
                                            </span>
                                        )}
                                    </>
                                ) : 'N/A'}
                            </span>
                        </div>
                        <div className={styles.summaryItem}>
                            <span className={styles.summaryLabel}>Subscription</span>
                            <span className={styles.summaryVal}>
                                {selected.subscriptionNum ? `${selected.subscriptionNum.toFixed(2)}x` : 'Pending'}
                            </span>
                        </div>
                        <div className={styles.summaryItem}>
                            <span className={styles.summaryLabel}>Close Date</span>
                            <span className={styles.summaryVal}>{selected.closeDate || 'TBA'}</span>
                        </div>
                    </div>
                )}

                {/* Calculator + Results */}
                {selected ? (
                    <div className={styles.calcGrid}>
                        {/* Left: Inputs */}
                        <div className={styles.inputPanel}>
                            <h2 className={styles.panelTitle}>
                                <Calculator size={16} />
                                Your Application
                            </h2>

                            {/* Category */}
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Investor Category</label>
                                <div className={styles.catGrid}>
                                    {CATEGORIES.map(cat => (
                                        <button
                                            key={cat.id}
                                            className={`${styles.catBtn} ${category === cat.id ? styles.catActive : ''}`}
                                            onClick={() => setCategory(cat.id)}
                                        >
                                            <span className={styles.catLabel}>{cat.label}</span>
                                            <span className={styles.catDesc}>{cat.desc}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Retail / Employee: number of applications */}
                            {(category === 'retail' || category === 'employee') && (
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>
                                        Number of Applications
                                        <span className={styles.labelHint}>different PAN/demat accounts</span>
                                    </label>
                                    <div className={styles.counterRow}>
                                        <button
                                            className={styles.counterBtn}
                                            onClick={() => setApplications(a => Math.max(1, a - 1))}
                                        >−</button>
                                        <span className={styles.counterVal}>{applications}</span>
                                        <button
                                            className={styles.counterBtn}
                                            onClick={() => setApplications(a => Math.min(50, a + 1))}
                                        >+</button>
                                    </div>
                                    <input
                                        type="range"
                                        min={1} max={20}
                                        value={Math.min(applications, 20)}
                                        onChange={e => setApplications(parseInt(e.target.value))}
                                        className={styles.slider}
                                    />
                                    <div className={styles.sliderLabels}>
                                        <span>1</span><span>5</span><span>10</span><span>15</span><span>20</span>
                                    </div>
                                    {lotValue > 0 && (
                                        <div className={styles.hint}>
                                            ₹{inr(lotValue)} per application = ₹{inr(lotValue * applications)} total blocked
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* HNI: amount */}
                            {(category === 'snii' || category === 'bnii') && (
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>
                                        Application Amount
                                        <span className={styles.labelHint}>
                                            {category === 'snii' ? '₹2L to ₹10L' : 'Above ₹10L'}
                                        </span>
                                    </label>
                                    <div className={styles.amountRow}>
                                        <span className={styles.amountPrefix}>₹</span>
                                        <input
                                            type="number"
                                            className={styles.input}
                                            value={hniAmount}
                                            onChange={e => setHniAmount(parseInt(e.target.value) || 200000)}
                                            min={category === 'snii' ? 200000 : 1000000}
                                            max={category === 'snii' ? 1000000 : undefined}
                                            step={lotValue || 200000}
                                        />
                                    </div>
                                    {lotValue > 0 && (
                                        <div className={styles.hint}>
                                            = {Math.floor(hniAmount / lotValue)} lots
                                            (₹{inr(Math.floor(hniAmount / lotValue) * lotValue)} effective)
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Subscription override */}
                            <div className={styles.formGroup}>
                                <label className={styles.label}>
                                    {category === 'retail' ? 'Retail (RII)' : category === 'snii' ? 'sNII' : category === 'bnii' ? 'bNII' : 'Overall'} Subscription (x)
                                    <span className={styles.labelHint}>
                                        {selected.subscriptionNum ? 'overall figure, enter category-specific for accuracy' : 'enter from NSE'}
                                    </span>
                                </label>
                                <input
                                    type="number"
                                    className={styles.input}
                                    value={subOverride}
                                    onChange={e => setSubOverride(e.target.value)}
                                    placeholder="e.g. 47.5"
                                    min="0"
                                    step="0.1"
                                />
                                {selected.subscriptionNum && category === 'retail' && (
                                    <div className={styles.subNote}>
                                        This is the overall number. For hot IPOs, Retail subscription is often 2-5x lower than overall. Enter the Retail-specific figure from NSE for accurate odds.
                                    </div>
                                )}
                                {(selected.status === 'Live' || selected.status === 'Closed') && (
                                    <a
                                        href="https://www.nseindia.com/market-data/ipo-subscription-status"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={styles.nseLink}
                                    >
                                        <ExternalLink size={11} />
                                        Per-category subscription on NSE
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Right: Results */}
                        <div className={styles.resultsPanel}>
                            <h2 className={styles.panelTitle}>Results</h2>

                            {results ? (
                                <>
                                    {results.type === 'retail' && (
                                        <>
                                            <div className={styles.resultCard}>
                                                <div className={styles.resultLabel}>Single Application</div>
                                                {results.singleProb !== null ? (
                                                    <>
                                                        <div className={styles.resultBig} style={{ color: probColor(results.singleProb) }}>
                                                            {results.singleProb}%
                                                        </div>
                                                        <div className={styles.resultSub}>
                                                            1 in {Math.round(100 / results.singleProb)} chance
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className={styles.resultPending}>Enter subscription multiple</div>
                                                )}
                                            </div>

                                            {applications > 1 && results.multiProb !== null && (
                                                <div className={styles.resultCard}>
                                                    <div className={styles.resultLabel}>{applications} Apps Combined</div>
                                                    <div className={styles.resultBig} style={{ color: probColor(results.multiProb) }}>
                                                        {results.multiProb}%
                                                    </div>
                                                    <div className={styles.resultSub}>at least 1 allotment</div>
                                                </div>
                                            )}
                                        </>
                                    )}

                                    {results.type === 'hni' && (
                                        <div className={styles.resultCard}>
                                            <div className={styles.resultLabel}>Min Lot Allotment Odds</div>
                                            {results.prob !== null ? (
                                                <>
                                                    <div className={styles.resultBig} style={{ color: probColor(results.prob) }}>
                                                        {results.prob}%
                                                    </div>
                                                    {results.lotsExpected !== null && (
                                                        <div className={styles.resultSub}>
                                                            ~{results.lotsExpected} lot{results.lotsExpected !== 1 ? 's' : ''} expected if allotted
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                <div className={styles.resultPending}>Enter subscription multiple</div>
                                            )}
                                        </div>
                                    )}

                                    {results.type === 'employee' && (
                                        <div className={styles.resultCard}>
                                            <div className={styles.resultLabel}>Employee Quota</div>
                                            <div className={styles.resultBig} style={{ color: '#22c55e' }}>~90%</div>
                                            <div className={styles.resultSub}>usually near-certain unless oversubscribed</div>
                                        </div>
                                    )}

                                    {/* Capital blocked */}
                                    <div className={styles.resultCard}>
                                        <div className={styles.resultLabel}>Capital Blocked (ASBA)</div>
                                        <div className={styles.resultBig} style={{ fontSize: '1.7rem' }}>
                                            ₹{inr(results.capitalBlocked)}
                                        </div>
                                        <div className={styles.resultSub}>refunded within 6 days if not allotted</div>
                                    </div>

                                    {/* Expected gain */}
                                    {selected.gmp !== null && lotSize > 0 && (
                                        <div className={`${styles.resultCard} ${results.gainPerLot >= 0 ? styles.gainCard : styles.lossCard}`}>
                                            <div className={styles.resultLabel}>Expected Gain per Lot</div>
                                            <div className={styles.resultBig} style={{ color: results.gainPerLot >= 0 ? '#22c55e' : '#ef4444', fontSize: '1.7rem' }}>
                                                {results.gainPerLot >= 0 ? '+' : ''}₹{inr(Math.abs(results.gainPerLot))}
                                            </div>
                                            <div className={styles.resultSub}>
                                                GMP ₹{gmp} × {lotSize} shares
                                                {selected.estListing && ` = est. listing ₹${selected.estListing}`}
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className={styles.noResult}>
                                    <Calculator size={36} />
                                    <p>Select an IPO with valid lot size and issue price to calculate.</p>
                                </div>
                            )}

                            <div className={styles.disclaimer}>
                                <Info size={13} />
                                <span>
                                    Estimates use SEBI allotment rules and historical patterns. Actual allotment is by registrar lottery. Not financial advice.
                                </span>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* No IPO selected - show live quick picks */
                    <div className={styles.emptyState}>
                        {loadingIpos ? (
                            <div className={styles.loadingMsg}>Loading IPOs...</div>
                        ) : liveIpos.length > 0 ? (
                            <>
                                <div className={styles.quickTitle}>Live IPOs Right Now</div>
                                <div className={styles.quickGrid}>
                                    {liveIpos.map(ipo => (
                                        <div
                                            key={ipo.id}
                                            className={styles.quickCard}
                                            onClick={() => setSelected(ipo)}
                                        >
                                            <span className={styles.quickName}>{ipo.name}</span>
                                            <div className={styles.quickMeta}>
                                                {ipo.subscriptionNum && (
                                                    <span className={styles.quickSub}>{ipo.subscriptionNum.toFixed(1)}x subscribed</span>
                                                )}
                                                {ipo.gmpPercent !== null && (
                                                    <span className={ipo.gmpPercent >= 0 ? styles.pos : styles.neg}>
                                                        GMP {ipo.gmpPercent >= 0 ? '+' : ''}{ipo.gmpPercent.toFixed(1)}%
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className={styles.noLive}>
                                <Calculator size={40} />
                                <p>No live IPOs right now. Select from the dropdown above to calculate for upcoming or recent IPOs.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </main>
    );
}
