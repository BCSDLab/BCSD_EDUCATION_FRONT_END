import GNB from './components/layout/GNB';
import { Outlet } from 'react-router-dom';
import './App.css';

function App() {
  return (
    <>
      <GNB />
      <Outlet />
    </>
  );
}

export default App;
