import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { UserRole } from '@/types/auth';
import { Mail, Lock, User, Phone, MapPin, Loader2, UserPlus, Recycle } from 'lucide-react';

interface RegisterFormProps {
  defaultRole?: UserRole;
}

export const RegisterForm = ({ defaultRole = 'citizen' }: RegisterFormProps) => {
  const { register, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: defaultRole,
    phone: '',
    address: '',
    // Role-specific fields
    upiId: '',
    houseId: '',
    workerId: '',
    centerName: '',
    municipalId: '',
    wasteTypesProcessed: [] as string[],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) return;
    if (formData.role === 'recycler' && formData.wasteTypesProcessed.length === 0) {
      return;
    }
    await register(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium text-gray-700">
            Full Name
          </Label>
          <div className="relative">
            <UserPlus className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="name"
              placeholder="Enter your full name"
              className="pl-10 h-11 border-gray-300 focus:border-green-500 focus:ring-green-500"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-gray-700">
            Email Address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              className="pl-10 h-11 border-gray-300 focus:border-green-500 focus:ring-green-500"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-gray-700">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="password"
                type="password"
                placeholder="Password"
                className="pl-10 h-11 border-gray-300 focus:border-green-500 focus:ring-green-500"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
              Confirm
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm"
                className="pl-10 h-11 border-gray-300 focus:border-green-500 focus:ring-green-500"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
              />
            </div>
          </div>
        </div>



        {/* Role-specific fields */}
        {formData.role === 'citizen' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="municipalId" className="text-sm font-medium text-gray-700">
                Municipal Identification Number *
              </Label>
              <Input
                id="municipalId"
                placeholder="MUN_2024_001"
                className="h-11 border-gray-300 focus:border-green-500 focus:ring-green-500"
                value={formData.municipalId}
                onChange={(e) => setFormData({ ...formData, municipalId: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="upiId" className="text-sm font-medium text-gray-700">
                  UPI ID *
                </Label>
                <Input
                  id="upiId"
                  placeholder="your-upi@paytm"
                  className="h-11 border-gray-300 focus:border-green-500 focus:ring-green-500"
                  value={formData.upiId}
                  onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="houseId" className="text-sm font-medium text-gray-700">
                  House ID *
                </Label>
                <Input
                  id="houseId"
                  placeholder="HOUSE_001"
                  className="h-11 border-gray-300 focus:border-green-500 focus:ring-green-500"
                  value={formData.houseId}
                  onChange={(e) => setFormData({ ...formData, houseId: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>
        )}

        {formData.role === 'worker' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="municipalId" className="text-sm font-medium text-gray-700">
                Municipal Identification Number *
              </Label>
              <Input
                id="municipalId"
                placeholder="MUN_2024_001"
                className="h-11 border-gray-300 focus:border-green-500 focus:ring-green-500"
                value={formData.municipalId}
                onChange={(e) => setFormData({ ...formData, municipalId: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="workerId" className="text-sm font-medium text-gray-700">
                Worker ID *
              </Label>
              <Input
                id="workerId"
                placeholder="WORKER_001"
                className="h-11 border-gray-300 focus:border-green-500 focus:ring-green-500"
                value={formData.workerId}
                onChange={(e) => setFormData({ ...formData, workerId: e.target.value })}
                required
              />
            </div>
          </div>
        )}

        {formData.role === 'recycler' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="centerName" className="text-sm font-medium text-gray-700">
                Center Name *
              </Label>
              <Input
                id="centerName"
                placeholder="EcoRecycle Center Delhi"
                className="h-11 border-gray-300 focus:border-green-500 focus:ring-green-500"
                value={formData.centerName}
                onChange={(e) => setFormData({ ...formData, centerName: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Recycle className="h-4 w-4" />
                Waste Types Processed *
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'organic', label: 'Organic Waste' },
                  { id: 'plastic', label: 'Plastic' },
                  { id: 'paper', label: 'Paper' },
                  { id: 'metal', label: 'Metal' },
                  { id: 'glass', label: 'Glass' },
                  { id: 'mixed', label: 'Mixed Waste' }
                ].map((wasteType) => (
                  <div key={wasteType.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={wasteType.id}
                      checked={formData.wasteTypesProcessed.includes(wasteType.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFormData({
                            ...formData,
                            wasteTypesProcessed: [...formData.wasteTypesProcessed, wasteType.id]
                          });
                        } else {
                          setFormData({
                            ...formData,
                            wasteTypesProcessed: formData.wasteTypesProcessed.filter(type => type !== wasteType.id)
                          });
                        }
                      }}
                    />
                    <Label htmlFor={wasteType.id} className="text-sm font-normal cursor-pointer">
                      {wasteType.label}
                    </Label>
                  </div>
                ))}
              </div>
              {formData.wasteTypesProcessed.length === 0 && (
                <p className="text-xs text-red-500">Please select at least one waste type</p>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
              Phone {formData.role === 'recycler' ? '*' : '(Optional)'}
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="phone"
                placeholder="Phone number"
                className="pl-10 h-11 border-gray-300 focus:border-green-500 focus:ring-green-500"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required={formData.role === 'recycler'}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="text-sm font-medium text-gray-700">
              Address {formData.role === 'recycler' ? '*' : '(Optional)'}
            </Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="address"
                placeholder="Your address"
                className="pl-10 h-11 border-gray-300 focus:border-green-500 focus:ring-green-500"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required={formData.role === 'recycler'}
              />
            </div>
          </div>
        </div>
      </div>

      <Button 
        type="submit" 
        className="w-full h-11 bg-green-600 hover:bg-green-700 text-white font-medium mt-6" 
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating Account...
          </>
        ) : (
          'Create Account'
        )}
      </Button>
    </form>
  );
};