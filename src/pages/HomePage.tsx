import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { WastePricing } from '@/components/pricing/WastePricing';
import { Leaf, User, Trash2, Recycle, ArrowRight, Shield, BookOpen } from 'lucide-react';

export const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="bg-green-600 p-3 rounded-xl">
              <Leaf className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-gray-900">EcoWaste</h1>
          </div>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Smart Waste Management System for a Cleaner, Greener Future
          </p>
          <p className="text-lg text-gray-500 max-w-3xl mx-auto">
            Join our comprehensive waste management platform designed for citizens, workers, and administrators to create sustainable communities together.
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 max-w-7xl mx-auto">
          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-orange-200">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto bg-orange-100 p-4 rounded-full mb-4 group-hover:bg-orange-200 transition-colors">
                <BookOpen className="h-8 w-8 text-orange-600" />
              </div>
              <CardTitle className="text-xl text-gray-900">Training Center</CardTitle>
              <CardDescription className="text-gray-600">
                Access educational videos on waste management, safety, and segregation
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Link to="/training">
                <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white group">
                  Start Learning
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>
          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-green-200">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto bg-blue-100 p-4 rounded-full mb-4 group-hover:bg-blue-200 transition-colors">
                <User className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-xl text-gray-900">Citizen Portal</CardTitle>
              <CardDescription className="text-gray-600">
                Report waste issues, schedule pickups, and track your environmental impact
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Link to="/auth/citizen">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white group">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-green-200">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto bg-green-100 p-4 rounded-full mb-4 group-hover:bg-green-200 transition-colors">
                <Trash2 className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-xl text-gray-900">Municipal Portal</CardTitle>
              <CardDescription className="text-gray-600">
                Manage collection routes, update pickup status, and optimize operations
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Link to="/auth/worker">
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white group">
                  Access Portal
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-green-200">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto bg-emerald-100 p-4 rounded-full mb-4 group-hover:bg-emerald-200 transition-colors">
                <Recycle className="h-8 w-8 text-emerald-600" />
              </div>
              <CardTitle className="text-xl text-gray-900">Recycling Center</CardTitle>
              <CardDescription className="text-gray-600">
                Process recyclables, manage inventory, and track sustainability metrics
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Link to="/auth/recycler">
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white group">
                  Enter Portal
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-green-200">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto bg-purple-100 p-4 rounded-full mb-4 group-hover:bg-purple-200 transition-colors">
                <Shield className="h-8 w-8 text-purple-600" />
              </div>
              <CardTitle className="text-xl text-gray-900">Admin Panel</CardTitle>
              <CardDescription className="text-gray-600">
                Oversee operations, manage users, and analyze system performance
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Link to="/admin-login">
                <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white group">
                  Admin Access
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Waste Pricing Section */}
        <div className="mt-20">
          <WastePricing />
        </div>

        {/* Features Section */}
        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">Why Choose EcoWaste?</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Leaf className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Eco-Friendly</h3>
              <p className="text-gray-600">Reduce environmental impact with smart waste sorting and recycling</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Trash2 className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Efficient</h3>
              <p className="text-gray-600">Streamlined operations with real-time tracking and optimization</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Shield className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Reliable</h3>
              <p className="text-gray-600">Secure platform with 24/7 monitoring and support</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};