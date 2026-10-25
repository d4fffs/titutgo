import { AppProvider, useApp } from './context/AppContext';
import { RoleSelectScreen } from './pages/auth/RoleSelectScreen';
import { AdminLayout } from './layouts/AdminLayout';
import { CourierLayout } from './layouts/CourierLayout';
import { UserLayout } from './layouts/UserLayout';
import { FloatingRoleSwitcher } from './components/shared/FloatingRoleSwitcher';

function MainApp() {
  const { state } = useApp();

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

  return (
    <>
      {renderContent()}
      <FloatingRoleSwitcher />
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
