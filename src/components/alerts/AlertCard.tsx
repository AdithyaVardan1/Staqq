'use client';

import React from 'react';
import { ArrowUpRight, MessageSquare, TrendingUp } from 'lucide-react';
import Link from 'next/link';

interface AlertProps {
    alert: {
        id: string;
        title: string;
        url: string;
        score: number;
        num_comments: number;
        subreddit: string;
        created_utc: number;
        tickers: string[];
        body: string;
    };
}

const AlertCard: React.FC<AlertProps> = ({ alert }) => {
    const formatDate = (timestamp: number) => {
        const now = Date.now();
        const diff = now - (timestamp * 1000);
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);
        
        if (hours < 1) return 'Just now';
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        
        return new Date(timestamp * 1000).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short'
        });
    };

    const formatScore = (score: number) => {
        if (score >= 1000) return `${(score / 1000).toFixed(1)}k`;
        return score.toString();
    };

    return (
        <Link 
            href={alert.url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="block group"
        >
            <div className="bg-gradient-to-br from-[#0A0A0A] to-[#0F0F0F] border border-white/10 rounded-3xl p-5 hover:border-[#CCFF00]/40 hover:shadow-2xl hover:shadow-[#CCFF00]/10 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-gray-500">
                        r/{alert.subreddit}
                    </span>
                    
                    {(alert.score > 100 || alert.num_comments > 50) && (
                        <span className="text-[10px] font-bold text-[#CCFF00] bg-[#CCFF00]/10 px-2.5 py-1 rounded-full">
                            HOT
                        </span>
                    )}
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-white leading-tight mb-3 line-clamp-2 group-hover:text-[#CCFF00] transition-colors flex-grow">
                    {alert.title}
                </h3>

                {/* Tickers */}
                {alert.tickers && alert.tickers.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                        {alert.tickers.slice(0, 3).map((ticker) => (
                            <span 
                                key={ticker} 
                                className="text-xs font-semibold text-[#CCFF00] bg-[#CCFF00]/10 px-2.5 py-1 rounded-lg border border-[#CCFF00]/20"
                            >
                                ${ticker}
                            </span>
                        ))}
                        {alert.tickers.length > 3 && (
                            <span className="text-xs text-gray-500 px-2.5 py-1">
                                +{alert.tickers.length - 3}
                            </span>
                        )}
                    </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-white/10 mt-auto">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 text-sm">
                            <TrendingUp size={14} className={alert.score > 100 ? 'text-green-400' : 'text-gray-500'} />
                            <span className="font-semibold text-gray-300">{formatScore(alert.score)}</span>
                        </div>
                        
                        <div className="flex items-center gap-1.5 text-sm">
                            <MessageSquare size={14} className={alert.num_comments > 50 ? 'text-blue-400' : 'text-gray-500'} />
                            <span className="font-semibold text-gray-300">{alert.num_comments}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{formatDate(alert.created_utc)}</span>
                        <ArrowUpRight size={14} className="text-gray-500 group-hover:text-[#CCFF00] transition-colors" strokeWidth={2} />
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default AlertCard;
