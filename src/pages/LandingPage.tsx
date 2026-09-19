import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Leaf, 
  Users, 
  Truck, 
  Recycle, 
  Shield, 
  MapPin, 
  Camera, 
  BarChart3,
  CheckCircle,
  ArrowRight
} from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

export const LandingPage = () => {
  const features = [
    {
      icon: Users,
      title: "Citizen Dashboard",
      description: "Track your waste history, report dumped waste, and monitor collection vehicles in real-time",
      href: "/citizen",
      color: "primary"
    },
    {
      icon: Truck,
      title: "Worker Portal",
      description: "Scan QR codes, manage collections, and track routes efficiently",
      href: "/worker",
      color: "secondary"
    },
    {
      icon: MapPin,
      title: "Live Tracking",
      description: "Real-time vehicle tracking with GPS simulation for transparent operations",
      href: "/tracking",
      color: "accent"
    },
    {
      icon: Recycle,
      title: "Recycling Centers",
      description: "Monitor waste processing, track connections, and manage recycling operations",
      href: "/recycling",
      color: "success"
    },
    {
      icon: Shield,
      title: "Admin Control",
      description: "Comprehensive dashboard for monitoring all operations and managing the system",
      href: "/admin",
      color: "warning"
    }
  ];

  const stats = [
    { label: "Active Households", value: "2,847", icon: Users },
    { label: "Vehicles Tracked", value: "23", icon: Truck },
    { label: "Waste Collected Today", value: "1,542 kg", icon: Recycle },
    { label: "Reports Resolved", value: "89%", icon: CheckCircle }
  ];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="hero-gradient text-white py-24 -mt-16 pt-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
          style={{ backgroundImage: `url(${heroImage})` }}
        ></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm">
                <Leaf className="h-4 w-4" />
                <span>Smart India Hackathon 2024</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
                Smart Waste
                <br />
                <span className="text-primary-light">Management</span>
              </h1>
              <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto">
                Revolutionary IoT-powered waste management system with real-time tracking, 
                citizen participation, and transparent operations
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="accent" asChild>
                <Link to="/citizen">
                  Get Started as Citizen
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20" asChild>
                <Link to="/tracking">
                  View Live Tracking
                  <MapPin className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="text-center card-shadow">
                <CardContent className="pt-6">
                  <div className="primary-gradient w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl font-bold text-foreground">
            Complete Waste Management Solution
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Integrated platform connecting citizens, workers, recycling centers, and administrators 
            for efficient waste management
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="card-shadow hover:scale-105 transition-bounce">
                <CardHeader>
                  <div className="primary-gradient w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">{feature.description}</p>
                  <Button variant="outline" className="w-full" asChild>
                    <Link to={feature.href}>
                      Access Dashboard
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Key Features Highlight */}
      <section className="bg-muted/30 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h3 className="text-3xl font-bold text-foreground">
                Advanced Features for Modern Waste Management
              </h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <Camera className="h-6 w-6 text-primary mt-1" />
                  <div>
                    <h4 className="font-semibold text-foreground">Photo Reporting</h4>
                    <p className="text-muted-foreground">Citizens can report dumped waste with photo evidence</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <BarChart3 className="h-6 w-6 text-primary mt-1" />
                  <div>
                    <h4 className="font-semibold text-foreground">IoT Integration</h4>
                    <p className="text-muted-foreground">Smart weighing devices for accurate waste measurement</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <MapPin className="h-6 w-6 text-primary mt-1" />
                  <div>
                    <h4 className="font-semibold text-foreground">Real-time Tracking</h4>
                    <p className="text-muted-foreground">GPS-based vehicle tracking for transparency</p>
                  </div>
                </div>
              </div>
              <Button variant="hero" size="lg" asChild>
                <Link to="/admin">
                  Explore Admin Dashboard
                  <Shield className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
            <div className="relative">
              <div className="primary-gradient rounded-2xl p-8 text-white">
                <div className="space-y-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
                    <span className="text-sm">System Status: Online</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Today's Collections</span>
                      <span className="font-bold">1,542 kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Active Vehicles</span>
                      <span className="font-bold">23/25</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pending Reports</span>
                      <span className="font-bold">7</span>
                    </div>
                  </div>
                  <div className="bg-white/20 rounded-lg p-4">
                    <p className="text-sm">
                      "This system has improved our waste collection efficiency by 40% and 
                      increased citizen participation significantly."
                    </p>
                    <p className="text-xs mt-2 opacity-80">- Municipal Commissioner</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};