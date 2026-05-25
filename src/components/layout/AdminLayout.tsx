import { Outlet } from 'react-router-dom';
import AdminHeader from './AdminHeader';

export default function AdminLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <AdminHeader />
      <main className="flex-1 bg-muted/30">
        <Outlet />
      </main>
    </div>
  );
} 