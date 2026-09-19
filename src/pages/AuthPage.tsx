import { useState } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { Button } from '@/components/ui/button';
import { Leaf, Recycle, Truck, Shield } from 'lucide-react';

export const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700 p-12 flex-col justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 text-white">
          <div className="flex items-center space-x-3 mb-8">
            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
              <Leaf className="h-8 w-8" />
            </div>
            <h1 className="text-4xl font-bold">EcoWaste</h1>
          </div>
          
          <h2 className="text-3xl font-light mb-6 leading-tight">
            Smart Waste Management
            <br />
            <span className="font-semibold">for a Cleaner Future</span>
          </h2>
          
          <p className="text-lg text-white/90 mb-12 leading-relaxed">
            Join thousands of citizens, workers, and administrators making waste management smarter and more efficient.
          </p>
          
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-white/20 p-4 rounded-lg backdrop-blur-sm mb-3 mx-auto w-fit">
                <Recycle className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium">Eco-Friendly</p>
            </div>
            <div className="text-center">
              <div className="bg-white/20 p-4 rounded-lg backdrop-blur-sm mb-3 mx-auto w-fit">
                <Truck className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium">Real-time Tracking</p>
            </div>
            <div className="text-center">
              <div className="bg-white/20 p-4 rounded-lg backdrop-blur-sm mb-3 mx-auto w-fit">
                <Shield className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium">Secure & Reliable</p>
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
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="bg-green-600 p-2 rounded-lg">
                <Leaf className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">EcoWaste</h1>
            </div>
            <p className="text-gray-600">Smart Waste Management System</p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="text-gray-600">
                {isLogin ? 'Sign in to your account' : 'Join our waste management platform'}
              </p>
            </div>
            
            {isLogin ? <LoginForm /> : <RegisterForm />}
            
            <div className="text-center mt-6 pt-6 border-t border-gray-200">
              <p className="text-gray-600 mb-2">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
              </p>
              <Button
                variant="link"
                onClick={() => setIsLogin(!isLogin)}
                className="text-green-600 hover:text-green-700 font-semibold"
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