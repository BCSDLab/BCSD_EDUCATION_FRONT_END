import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export default function GNB() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const clearTokens = useAuthStore((state) => state.clearTokens);

  const handleLogout = () => {
    clearTokens();
    navigate('/login', { replace: true });
  };

  return (
    <nav>
      <ul>
        <li><Link to="/">홈</Link></li>
        <li><Link to="/lectures">강의자료</Link></li>
        <li><Link to="/reports">보고서</Link></li>
        <li><Link to="/attendance">출석</Link></li>
        <li><Link to="/curriculum">커리큘럼</Link></li>
        <li><Link to="/mypage">마이페이지</Link></li>
      </ul>

      {isAuthenticated
      ? <button type="button" onClick={handleLogout}>로그아웃</button>
      : <Link to="/login">로그인</Link>}
    </nav>
  );
}
