import { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Shield, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AdminLayoutProps {
  children: ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = '/admin-login';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Title */}
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-purple-600 to-purple-700 p-2 rounded-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">WasteWise Admin</h1>
                <p className="text-xs text-gray-200">System Administration Panel</p>
              </div>
            </div>

            {/* Admin Controls */}
            <div className="flex items-center space-x-4">
              {/* Admin Info */}
              <div className="flex items-center space-x-3 px-3 py-2 bg-white/20 backdrop-blur-sm rounded-lg">
                <div className="w-8 h-8 bg-white/30 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {user?.name?.charAt(0).toUpperCase() || 'A'}
                  </span>
                </div>
                <div className="text-sm">
                  <p className="font-medium text-white">{user?.name || 'Administrator'}</p>
                  <p className="text-gray-200">System Admin</p>
                </div>
              </div>

              {/* Logout */}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                className="text-white bg-red-500/80 border-red-400 hover:bg-red-600 hover:border-red-500"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Admin Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Admin Footer */}
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              <span>© 2024 WasteWise Admin Panel</span>
              <span>•</span>
              <span>Version 2.1.0</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/admin-dashboard" className="hover:text-gray-700">Dashboard</Link>
              <span>•</span>
              <span>Last login: {new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};