import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Leaf, Menu, X, User, Trash2, Truck, Recycle, Shield, LogOut, QrCode } from "lucide-react";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  const getNavItems = () => {
    const baseItems = [];
    
    if (user?.role === 'citizen') {
      baseItems.push(
        { href: "/dashboard/citizen", label: "Dashboard", icon: User },
        { href: "/dashboard/tracking", label: "Tracking", icon: Truck }
      );
    } else if (user?.role === 'worker') {
      baseItems.push(
        { href: "/dashboard/worker", label: "Dashboard", icon: Trash2 },
        { href: "/qr-scanner", label: "QR Scanner", icon: QrCode },
        { href: "/dashboard/tracking", label: "Tracking", icon: Truck }
      );
    } else if (user?.role === 'recycler') {
      baseItems.push(
        { href: "/dashboard/recycler", label: "Dashboard", icon: Recycle },
        { href: "/dashboard/tracking", label: "Tracking", icon: Truck }
      );
    } else if (user?.role === 'admin') {
      baseItems.push(
        { href: "/dashboard/admin", label: "Admin", icon: Shield },
        { href: "/qr-scanner", label: "QR Scanner", icon: QrCode },
        { href: "/dashboard/tracking", label: "Tracking", icon: Truck }
      );
    }
    
    return baseItems;
  };

  const navItems = getNavItems();

  return (
    <nav className="bg-card/95 backdrop-blur-sm border-b sticky top-0 z-50 card-shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="primary-gradient p-2 rounded-lg">
              <Leaf className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">EcoWaste</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-baseline space-x-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-smooth ${
                      isActive
                        ? "primary-gradient text-white"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/20"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
            
            <div className="flex items-center space-x-2 ml-4 pl-4 border-l border-border">
              <span className="text-sm text-muted-foreground">
                {user?.name} ({user?.role})
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle navigation"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-card border-t">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-smooth ${
                    isActive
                      ? "primary-gradient text-white"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/20"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            
            <div className="border-t border-border pt-3 mt-3">
              <div className="px-3 py-2 text-sm text-muted-foreground">
                {user?.name} ({user?.role})
              </div>
              <Button
                variant="ghost"
                onClick={logout}
                className="w-full justify-start text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};