import { useId } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import { CircleAlert } from 'lucide-react';
import styles from './Input.module.css';

type InputProps = {
  label?: string;
  sub?: ReactNode;
  leading?: ReactNode;
  trailing?: ReactNode;
  helper?: string;
  error?: string | null;
  mono?: boolean;
} & InputHTMLAttributes<HTMLInputElement>;

export default function Input({
  label,
  sub,
  leading,
  trailing,
  helper,
  error,
  required,
  mono,
  id,
  className,
  ...rest
}: InputProps) {
  const generatedId = useId();
  const realId = id ?? generatedId;

  const fieldClasses = [styles.field, error && styles.fieldError]
    .filter(Boolean)
    .join(' ');
  const inputClasses = [styles.input, mono && styles.mono, className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={styles.root}>
      {label && (
        <label htmlFor={realId} className={styles.labelRow}>
          <span>
            {label}
            {required && <span className={styles.required}>*</span>}
          </span>
          {sub && <span className={styles.sub}>{sub}</span>}
        </label>
      )}
      <div className={fieldClasses}>
        {leading && <span className={styles.leading}>{leading}</span>}
        <input
          id={realId}
          required={required}
          className={inputClasses}
          {...rest}
        />
        {trailing}
      </div>
      {(helper || error) && (
        <div
          className={`${styles.helper} ${error ? styles.errorText : ''}`}
          role={error ? 'alert' : undefined}
        >
          {error && <CircleAlert size={12} />}
          {error || helper}
        </div>
      )}
    </div>
  );
}
