import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <DashboardPage /> },
    ],
  },
  {
    path: '/login',
    element: <LoginPage />

  }
]);

export default router;
