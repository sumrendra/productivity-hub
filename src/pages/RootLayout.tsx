import { Outlet } from 'react-router-dom';
import { AppShell } from '../components/layout';

const RootLayout = () => {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
};

export default RootLayout;
