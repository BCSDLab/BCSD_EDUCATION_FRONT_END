import styles from './Wordmark.module.css';

type WordmarkProps = {
  size?: number;
  color?: string;
  accent?: string;
  sub?: string;
};

export default function Wordmark({
  size = 22,
  color,
  accent,
  sub,
}: WordmarkProps) {
  const dotSize = Math.max(4, size * 0.22);
  const dotMargin = Math.max(2, size * 0.12);

  return (
    <div className={styles.root}>
      <span className={styles.brand} style={{ fontSize: size, color }}>
        BCSD
      </span>
      <span
        className={styles.dot}
        style={{
          width: dotSize,
          height: dotSize,
          marginLeft: dotMargin,
          background: accent,
        }}
      />
      {sub && (
        <span
          className={styles.sub}
          style={{ marginLeft: size * 0.5, fontSize: size * 0.52 }}
        >
          {sub}
        </span>
      )}
    </div>
  );
}
