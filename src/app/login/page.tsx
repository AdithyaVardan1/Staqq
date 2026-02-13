import AuthForm from '@/components/auth/AuthForm';
import Logo from '@/components/ui/Logo';
import styles from './page.module.css';

export default function LoginPage() {
    return (
        <div className={styles.main}>
            <div className={styles.container}>
                <div className={styles.logoWrap}>
                    <Logo
                        width={160}
                        height={50}
                        className={styles.logo}
                        priority
                    />
                </div>
                <AuthForm key="login" view="sign-in" />
            </div>
        </div>
    );
}
