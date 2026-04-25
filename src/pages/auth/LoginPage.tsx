import { useState, type FormEventHandler } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Mail,
  Lock,
  ArrowRight,
  ChevronRight,
  CircleHelp,
  Check,
} from 'lucide-react';
import { login } from '../../api/auth';
import { useAuthStore } from '../../store/authStore';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Wordmark from '../../components/ui/Wordmark';
import styles from './LoginPage.module.css';

const EMAIL_REGEX = /^[^\s@]+@koreatech\.ac\.kr$/;
const MIN_PASSWORD_LENGTH = 8;

type LoginFormErrors = {
  email?: string;
  password?: string;
};

function validate(email: string, password: string): LoginFormErrors {
  const next: LoginFormErrors = {};

  if (email === '') {
    next.email = '이메일을 입력해주세요.';
  } else if (!EMAIL_REGEX.test(email)) {
    next.email = 'koreatech.ac.kr 이메일만 사용할 수 있습니다.';
  }

  if (password === '') {
    next.password = '비밀번호를 입력해주세요.';
  } else if (password.length < MIN_PASSWORD_LENGTH) {
    next.password = `${MIN_PASSWORD_LENGTH}자 이상 입력해주세요.`;
  }

  return next;
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [remember, setRemember] = useState(true);

  const navigate = useNavigate();
  const setTokens = useAuthStore((state) => state.setTokens);

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    const nextErrors = validate(email, password);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const response = await login({ email, password });
      setTokens(response.accessToken, response.refreshToken);
      navigate('/');
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setSubmitError('이메일 또는 비밀번호가 일치하지 않습니다.');
      } else {
        setSubmitError(
          '로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const notReady = () => alert('준비 중입니다.');

  return (
    <div className={styles.page}>
      <aside className={styles.brandPanel}>
        <div className={styles.cornerMark} />
        <div className={styles.cornerSquare} />

        <div className={styles.brandHeader}>
          <Wordmark size={20} color="#ffffff" accent="var(--color-purple-400)" />
          <div className={styles.brandDivider} />
          <span className={styles.brandVersion}>v2.6.0</span>
        </div>

        <div className={styles.brandBody}>
          <div className={styles.brandKicker}>// 26-상반기 · WEEK 03</div>
          <h1 className={styles.brandHeadline}>
            쓰기, 리뷰, 출석.
            <br />
            <span className={styles.brandHeadlineAccent}>하나의 기록으로.</span>
          </h1>
          <p className={styles.brandLead}>
            KOREATECH 개발자 동아리 BCSD의 학습 기록 플랫폼. 강의자료, 보고서,
            출석을 한 곳에서 관리하세요.
          </p>
        </div>

        <div className={styles.brandFooter}>
          <span>7 tracks</span>
          <span className={styles.brandFooterDot}>·</span>
          <span>20 members</span>
          <span className={styles.brandFooterDot}>·</span>
          <span>26-H1</span>
        </div>
      </aside>

      <form className={styles.formPanel} onSubmit={handleSubmit} noValidate>
        <div className={styles.topNav}>
          <span>처음이신가요?&nbsp;</span>
          <button
            type="button"
            onClick={notReady}
            className={styles.topLink}
          >
            초대 코드 입력 <ChevronRight size={12} />
          </button>
        </div>

        <div className={styles.formContainer}>
          <div>
            <h2 className={styles.headline}>다시 오신 걸 환영해요</h2>
            <p className={styles.lead}>KOREATECH 이메일로 로그인하세요</p>
          </div>

          <div className={styles.formBody}>
            <Input
              label="이메일"
              type="email"
              placeholder="you@koreatech.ac.kr"
              leading={<Mail size={14} />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              required
              mono
              disabled={isSubmitting}
              autoComplete="email"
              autoFocus
            />
            <Input
              label="비밀번호"
              sub={
                <button
                  type="button"
                  onClick={notReady}
                  className={styles.subLink}
                >
                  비밀번호 찾기
                </button>
              }
              type="password"
              placeholder="••••••••"
              leading={<Lock size={14} />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              required
              disabled={isSubmitting}
              autoComplete="current-password"
            />

            <label className={styles.checkboxRow}>
              <span
                className={`${styles.checkbox} ${remember ? styles.checkboxOn : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  setRemember((v) => !v);
                }}
              >
                {remember && <Check size={12} strokeWidth={3} />}
              </span>
              이 기기에서 로그인 유지
            </label>

            {submitError && (
              <div className={styles.errorBanner} role="alert">
                {submitError}
              </div>
            )}
          </div>

          <Button
            type="submit"
            kind="primary"
            size="lg"
            full
            loading={isSubmitting}
            trailing={!isSubmitting && <ArrowRight size={16} />}
          >
            {isSubmitting ? '로그인 중…' : '로그인하기'}
          </Button>
        </div>

        <div className={styles.bottomMeta}>
          <span className={styles.path}>/login</span>
          <button type="button" onClick={notReady} className={styles.help}>
            <CircleHelp size={12} /> 도움이 필요하신가요?
          </button>
        </div>
      </form>
    </div>
  );
}
