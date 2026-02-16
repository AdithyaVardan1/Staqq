import { Achievement } from '@/lib/achievements';
import {
    Sprout, GraduationCap, Rocket, CandlestickChart, Scale,
    Eye, Crosshair, Calculator, Filter, ListPlus, ArrowLeftRight,
    Sunrise, Flame, Activity, Gem, Crown, Trophy, Lock
} from 'lucide-react';
import { motion } from 'framer-motion';

const ICON_MAP: Record<string, any> = {
    Sprout, GraduationCap, Rocket, CandlestickChart, Scale,
    Eye, Crosshair, Calculator, Filter, ListPlus, ArrowLeftRight,
    Sunrise, Flame, Activity, Gem, Crown, Trophy
};

interface AchievementCardProps {
    achievement: Achievement;
    isUnlocked: boolean;
    unlockedAt?: string;
}

export default function AchievementCard({ achievement, isUnlocked, unlockedAt }: AchievementCardProps) {
    const IconComponent = ICON_MAP[achievement.icon] || Lock;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`relative p-4 rounded-xl border flex flex-col items-center text-center transition-all duration-300 ${isUnlocked
                    ? 'bg-gradient-to-br from-[#1A1A1A] to-[#222] border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.1)]'
                    : 'bg-[#111] border-[#222] opacity-60 grayscale'
                }`}
        >
            <div className={`p-3 rounded-full mb-3 ${isUnlocked ? 'bg-yellow-500/20 text-yellow-400' : 'bg-gray-800 text-gray-500'
                }`}>
                {isUnlocked ? <IconComponent size={28} /> : <Lock size={28} />}
            </div>

            <h3 className={`font-bold text-sm mb-1 ${isUnlocked ? 'text-white' : 'text-gray-400'}`}>
                {achievement.title}
            </h3>

            <p className="text-xs text-gray-500 mb-2 line-clamp-2 min-h-[2.5em]">
                {achievement.description}
            </p>

            {isUnlocked && unlockedAt && (
                <span className="text-[10px] text-green-400 font-mono mt-auto">
                    Unlocked {new Date(unlockedAt).toLocaleDateString()}
                </span>
            )}

            {!isUnlocked && (
                <span className="text-[10px] text-gray-600 font-mono mt-auto uppercase tracking-wider">
                    Locked
                </span>
            )}

            {/* Rarity/Points Badge */}
            <div className="absolute top-2 right-2 text-[10px] font-bold text-gray-600 bg-black/40 px-1.5 py-0.5 rounded">
                {achievement.points} XP
            </div>
        </motion.div>
    );
}
