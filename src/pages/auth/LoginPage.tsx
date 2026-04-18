import { useState, type SubmitEventHandler } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { login } from '../../api/auth';
import { useAuthStore } from '../../store/authStore';

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

  const navigate = useNavigate();
  const setTokens = useAuthStore((state) => state.setTokens);

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = async (e) => {
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
        setSubmitError('로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h1>로그인</h1>

      {submitError && <p>{submitError}</p>}

      <form onSubmit={handleSubmit}>
        <label>
          이메일
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
          />
        </label>
        {errors.email && <p>{errors.email}</p>}

        <label>
          비밀번호
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isSubmitting}
          />
        </label>
        {errors.password && <p>{errors.password}</p>}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? '로그인 중...' : '로그인'}
        </button>
      </form>
    </div>
  );
}
