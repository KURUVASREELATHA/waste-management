import { useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { Button } from '@/components/ui/button';
import { UserRole } from '@/types/auth';
import { Leaf, User, Trash2, Recycle, Shield, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const roleConfig = {
  citizen: {
    title: 'Citizen Portal',
    description: 'Access your waste management dashboard',
    icon: User,
    color: 'blue',
    gradient: 'from-blue-600 to-blue-700'
  },
  worker: {
    title: 'Worker Portal',
    description: 'Manage collection routes and operations',
    icon: Trash2,
    color: 'green',
    gradient: 'from-green-600 to-green-700'
  },
  recycler: {
    title: 'Recycling Center',
    description: 'Process and manage recyclable materials',
    icon: Recycle,
    color: 'emerald',
    gradient: 'from-emerald-600 to-emerald-700'
  }
};

export const RoleAuthPage = () => {
  const { role } = useParams<{ role: string }>();
  const [isLogin, setIsLogin] = useState(true);

  // Redirect admin users to separate admin login
  if (role === 'admin') {
    return <Navigate to="/admin-login" replace />;
  }

  if (!role || !roleConfig[role as UserRole]) {
    return <Navigate to="/" replace />;
  }

  const config = roleConfig[role as UserRole];
  const Icon = config.icon;

  return (
    <div className="min-h-screen flex">
      {/* Left side - Role specific branding */}
      <div className={`hidden lg:flex lg:w-1/2 bg-gradient-to-br ${config.gradient} p-12 flex-col justify-center relative overflow-hidden`}>
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 text-white">
          <Link to="/" className="inline-flex items-center text-white/80 hover:text-white mb-8 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          
          <div className="flex items-center space-x-3 mb-8">
            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
              <Icon className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">{config.title}</h1>
              <div className="flex items-center space-x-2 mt-1">
                <Leaf className="h-4 w-4" />
                <span className="text-lg">EcoWaste</span>
              </div>
            </div>
          </div>
          
          <h2 className="text-3xl font-light mb-6 leading-tight">
            {config.description}
          </h2>
          
          <p className="text-lg text-white/90 mb-12 leading-relaxed">
            {role === 'citizen' && 'Report waste issues, schedule pickups, and track your environmental impact with our comprehensive citizen portal.'}
            {role === 'worker' && 'Optimize collection routes, update pickup status, and manage daily operations efficiently.'}
            {role === 'recycler' && 'Process recyclable materials, manage inventory, and track sustainability metrics.'}
          </p>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center">
              <div className="bg-white/20 p-4 rounded-lg backdrop-blur-sm mb-3 mx-auto w-fit">
                <Leaf className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium">Eco-Friendly</p>
            </div>
            <div className="text-center">
              <div className="bg-white/20 p-4 rounded-lg backdrop-blur-sm mb-3 mx-auto w-fit">
                <Shield className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium">Secure Access</p>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
      </div>
      
      {/* Right side - Auth Forms */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 lg:hidden">
            <Link to="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className={`bg-${config.color}-600 p-2 rounded-lg`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">{config.title}</h1>
            </div>
            <p className="text-gray-600">{config.description}</p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="text-gray-600">
                {isLogin ? `Sign in to your ${role} account` : `Join as a ${role}`}
              </p>
            </div>
            
            {isLogin ? (
              <LoginForm defaultRole={role as UserRole} />
            ) : (
              <RegisterForm defaultRole={role as UserRole} />
            )}
            
            <div className="text-center mt-6 pt-6 border-t border-gray-200">
              <p className="text-gray-600 mb-2">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
              </p>
              <Button
                variant="link"
                onClick={() => setIsLogin(!isLogin)}
                className={`text-${config.color}-600 hover:text-${config.color}-700 font-semibold`}
              >
                {isLogin ? 'Create Account' : 'Sign In'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};