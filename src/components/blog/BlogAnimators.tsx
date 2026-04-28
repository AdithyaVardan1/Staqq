'use client';

import React from 'react';
import { motion } from 'framer-motion';

const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 28, filter: 'blur(10px)' },
    animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
    transition: { duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] as any },
});

const stagger = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.08 }
    }
};

const childBlur = {
    hidden: { opacity: 0, y: 20, filter: 'blur(8px)' },
    show: {
        opacity: 1, y: 0, filter: 'blur(0px)',
        transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as any }
    }
};

export function BlogHeroAnimator({ children }: { children: React.ReactNode }) {
    return (
        <motion.div {...fadeUp(0)}>
            {children}
        </motion.div>
    );
}

export function BlogSectionAnimator({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.75, delay, ease: [0.22, 1, 0.36, 1] }}
        >
            {children}
        </motion.div>
    );
}

export function BlogGridAnimator({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-40px' }}
            className={className}
        >
            {React.Children.map(children, (child, i) => (
                <motion.div key={i} variants={childBlur} style={{ height: '100%' }}>
                    {child}
                </motion.div>
            ))}
        </motion.div>
    );
}
