import { Link } from 'react-router-dom';

export default function GNB() {
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
    </nav>
  );
}
