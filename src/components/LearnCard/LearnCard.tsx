import styles from './LearnCard.module.css';

interface LearnCardProps {
  title: string;
  description: string;
}

export default function LearnCard({ title, description }: LearnCardProps) {
  return (
    <div className={styles.card}>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}
