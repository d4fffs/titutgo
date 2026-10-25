import { AppProvider, useApp } from './context/AppContext';
import { RoleSelectScreen } from './pages/auth/RoleSelectScreen';
import { AdminLayout } from './layouts/AdminLayout';
import { CourierLayout } from './layouts/CourierLayout';
import { UserLayout } from './layouts/UserLayout';

import { MascotExporter } from './pages/MascotExporter';

function MainApp() {
  const { state } = useApp();

  if (
    typeof window !== 'undefined' &&
    (window.location.search.includes('export_mascots') ||
      window.location.pathname === '/export-mascots')
  ) {
    return <MascotExporter />;
  }

  const renderContent = () => {
    switch (state.currentRole) {
      case 'admin':
        return <AdminLayout />;
      case 'kurir':
        return <CourierLayout />;
      case 'user':
        return <UserLayout />;
      default:
        return <RoleSelectScreen />;
    }
  };

  return <>{renderContent()}</>;
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
