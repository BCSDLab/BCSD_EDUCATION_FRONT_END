import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import styles from './Button.module.css';

type ButtonKind = 'primary' | 'accent' | 'secondary' | 'ghost' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = {
  kind?: ButtonKind;
  size?: ButtonSize;
  leading?: ReactNode;
  trailing?: ReactNode;
  full?: boolean;
  loading?: boolean;
  children: ReactNode;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'>;

export default function Button({
  kind = 'primary',
  size = 'md',
  leading,
  trailing,
  full,
  loading,
  disabled,
  type = 'button',
  children,
  className,
  ...rest
}: ButtonProps) {
  const classes = [
    styles.button,
    styles[kind],
    styles[size],
    full && styles.full,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const iconSize = size === 'lg' ? 18 : size === 'md' ? 16 : 14;

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <Loader2 size={iconSize} className={styles.spinner} />
      ) : (
        leading
      )}
      <span>{children}</span>
      {!loading && trailing}
    </button>
  );
}
