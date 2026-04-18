import { useState, type SubmitEventHandler } from 'react';

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

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();

    const nextErrors = validate(email, password);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }
    console.log({ email, password });
  };

  return (
    <div>
      <h1>로그인</h1>

      <form onSubmit={handleSubmit}>
        <label>
          이메일
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        {errors.email && <p>{errors.email}</p>}

        <label>
          비밀번호
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {errors.password && <p>{errors.password}</p>}

        <button type="submit">로그인</button>
      </form>
    </div>
  );
}
