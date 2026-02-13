import AuthForm from '@/components/auth/AuthForm';
import Logo from '@/components/ui/Logo';
import styles from '../login/page.module.css';

export default function SignupPage() {
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
                <AuthForm key="signup" view="sign-up" />
            </div>
        </div>
    );
}
