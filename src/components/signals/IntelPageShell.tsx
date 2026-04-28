'use client';

import { motion } from 'framer-motion';
import React from 'react';

const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 22, filter: 'blur(8px)' },
    animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
    transition: { duration: 0.75, delay, ease: [0.22, 1, 0.36, 1] as any },
});

interface IntelPageShellProps {
    header: React.ReactNode;
    nav: React.ReactNode;
    children: React.ReactNode;
}

export function IntelPageShell({ header, nav, children }: IntelPageShellProps) {
    return (
        <>
            <motion.div {...fadeUp(0)}>
                {header}
            </motion.div>
            <motion.div {...fadeUp(0.1)}>
                {nav}
            </motion.div>
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
                {children}
            </motion.div>
        </>
    );
}
