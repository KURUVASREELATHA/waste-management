import { AdminLayout } from '@/components/layout/AdminLayout';
import { AdminDashboard } from './AdminDashboard';

export const AdminDashboardPage = () => {
  return (
    <AdminLayout>
      <AdminDashboard />
    </AdminLayout>
  );
};