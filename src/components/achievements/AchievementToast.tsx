"use client";

import { useEffect } from 'react';
import { useAchievementsStore } from '@/store/useAchievementsStore';
import { Award, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AchievementToast() {
    const { toastQueue, dismissToast } = useAchievementsStore();
    const currentToast = toastQueue[0];

    useEffect(() => {
        if (currentToast) {
            const timer = setTimeout(() => {
                dismissToast();
            }, 5000); // 5 seconds display
            return () => clearTimeout(timer);
        }
    }, [currentToast, dismissToast]);

    return (
        <AnimatePresence>
            {currentToast && (
                <motion.div
                    key={currentToast.id}
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.9 }}
                    className="fixed bottom-6 right-6 z-50 flex items-center gap-4 bg-[#1A1A1A] border border-[#333] p-4 rounded-lg shadow-2xl max-w-sm"
                >
                    <div className="flex-shrink-0 bg-yellow-500/20 p-2 rounded-full">
                        <Award className="text-yellow-400" size={24} />
                    </div>
                    <div className="flex-grow">
                        <h4 className="text-sm font-bold text-white uppercase tracking-wider text-xs mb-1 text-yellow-500">
                            Achievement Unlocked
                        </h4>
                        <p className="font-semibold text-white">{currentToast.title}</p>
                        <p className="text-xs text-gray-400">{currentToast.description}</p>
                    </div>
                    <button
                        onClick={dismissToast}
                        className="text-gray-500 hover:text-white transition-colors"
                    >
                        <X size={16} />
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
