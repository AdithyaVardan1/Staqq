
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { ArrowUp } from 'lucide-react';
import styles from './BackToTop.module.css';
import clsx from 'clsx';

export const BackToTop: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            // Visible after scrolling 3000px (approx 60 cards)
            if (window.scrollY > 3000) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    return (
        <div className={clsx(styles.container, { [styles.visible]: isVisible })}>
            <Button
                variant="primary"
                size="sm"
                onClick={scrollToTop}
                className={styles.button}
            >
                <ArrowUp size={16} />
                <span className={styles.text}>Back to Top</span>
            </Button>
        </div>
    );
};
