import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import QRCode from 'qrcode';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  User, 
  QrCode, 
  Wallet, 
  Edit, 
  Save, 
  X,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Home,
  CreditCard,
  Shield
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

export const CitizenProfile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [qrCodeImage, setQrCodeImage] = useState<string>("");
  const [editData, setEditData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    address: user?.address || "",
    upiId: user?.upiId || "",
    houseId: user?.houseId || ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [earningsData] = useState(() => {
    const randomEarnings = [
      { _id: '1', description: 'Plastic waste processing', amount: Math.floor(Math.random() * 50) + 20 },
      { _id: '2', description: 'Paper waste recycling', amount: Math.floor(Math.random() * 30) + 15 },
      { _id: '3', description: 'Metal waste collection', amount: Math.floor(Math.random() * 80) + 40 },
      { _id: '4', description: 'Glass waste processing', amount: Math.floor(Math.random() * 25) + 10 },
      { _id: '5', description: 'Organic waste composting', amount: Math.floor(Math.random() * 35) + 18 }
    ];
    const totalEarnings = Math.floor(Math.random() * 2000) + 500;
    const thisMonth = Math.floor(Math.random() * 400) + 100;
    
    return {
      totalEarnings,
      thisMonth,
      earnings: randomEarnings
    };
  });
  const [loading] = useState(false);

  // Generate QR Code (mock implementation)
  const generateQRCode = async () => {
    if (!user?.qrCode && user?.email) {
      try {
        const response = await api.post('/auth/generate-qr', { email: user.email });
        const updatedUser = { ...user, qrCode: response.qrCode };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        window.location.reload();
      } catch (error) {
        console.error('Failed to generate QR code:', error);
      }
    } else {
      setShowQR(true);
    }
  };

  useEffect(() => {
    if (user?.qrCode && showQR) {
      QRCode.toDataURL(user.qrCode, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
      .then(url => {
        setQrCodeImage(url);
      })
      .catch(err => {
        console.error('QR Code generation failed:', err);
      });
    }
  }, [user?.qrCode, showQR]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!editData.name.trim()) newErrors.name = "Name is required";
    if (editData.phone && !/^[6-9]\d{9}$/.test(editData.phone)) {
      newErrors.phone = "Enter valid 10-digit mobile number";
    }
    if (editData.upiId && !/^[\w.-]+@[\w.-]+$/.test(editData.upiId)) {
      newErrors.upiId = "Enter valid UPI ID (e.g., user@paytm)";
    }
    if (!editData.address.trim()) newErrors.address = "Address is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    try {
      await api.put('/auth/profile', editData);
      toast({ title: "Profile updated successfully" });
      setIsEditing(false);
    } catch (error) {
      toast({ 
        title: "Failed to update profile", 
        description: "Please try again",
        variant: "destructive" 
      });
    }
  };

  const handleCancel = () => {
    setEditData({
      name: user?.name || "",
      phone: user?.phone || "",
      address: user?.address || "",
      upiId: user?.upiId || "",
      houseId: user?.houseId || ""
    });
    setErrors({});
    setIsEditing(false);
  };

  const getProfileCompleteness = () => {
    const fields = [user?.name, user?.phone, user?.address, user?.upiId, user?.houseId];
    const completed = fields.filter(field => field && field.trim()).length;
    return Math.round((completed / fields.length) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="card-shadow">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5 text-primary" />
            <span>My Profile</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="w-24 h-24">
                <AvatarImage src={user?.profileImage} />
                <AvatarFallback className="text-2xl">
                  {user?.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Badge variant="secondary" className="text-sm">
                Citizen
              </Badge>
            </div>

            <div className="flex-1 space-y-4">
              {/* Profile Completeness */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium">Profile Completeness</Label>
                  <span className="text-sm text-muted-foreground">{getProfileCompleteness()}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${getProfileCompleteness()}%` }}
                  />
                </div>
              </div>

              {!isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm text-muted-foreground flex items-center gap-1">
                        <User className="h-3 w-3" /> Full Name
                      </Label>
                      <p className="font-medium">{user?.name || "Not provided"}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground flex items-center gap-1">
                        <Mail className="h-3 w-3" /> Email Address
                      </Label>
                      <p className="font-medium">{user?.email}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground flex items-center gap-1">
                        <Phone className="h-3 w-3" /> Mobile Number
                      </Label>
                      <p className="font-medium">{user?.phone || "Not provided"}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> Complete Address
                      </Label>
                      <p className="font-medium">{user?.address || "Not provided"}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm text-muted-foreground flex items-center gap-1">
                        <Shield className="h-3 w-3" /> Municipal ID
                      </Label>
                      <p className="font-medium">{user?.municipalId || "Not assigned"}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground flex items-center gap-1">
                        <Home className="h-3 w-3" /> House/Property ID
                      </Label>
                      <p className="font-medium">{user?.houseId || "Not assigned"}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground flex items-center gap-1">
                        <CreditCard className="h-3 w-3" /> UPI ID
                      </Label>
                      <p className="font-medium">{user?.upiId || "Not provided"}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> Member Since
                      </Label>
                      <p className="font-medium">
                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={editData.name}
                        onChange={(e) => setEditData({...editData, name: e.target.value})}
                        className={errors.name ? "border-red-500" : ""}
                      />
                      {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
                    </div>
                    <div>
                      <Label htmlFor="phone">Mobile Number</Label>
                      <Input
                        id="phone"
                        placeholder="10-digit mobile number"
                        value={editData.phone}
                        onChange={(e) => setEditData({...editData, phone: e.target.value})}
                        className={errors.phone ? "border-red-500" : ""}
                      />
                      {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone}</p>}
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="address">Complete Address *</Label>
                    <Textarea
                      id="address"
                      placeholder="House/Flat No., Street, Area, City, State, PIN Code"
                      value={editData.address}
                      onChange={(e) => setEditData({...editData, address: e.target.value})}
                      className={errors.address ? "border-red-500" : ""}
                      rows={3}
                    />
                    {errors.address && <p className="text-sm text-red-500 mt-1">{errors.address}</p>}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="houseId">House/Property ID</Label>
                      <Input
                        id="houseId"
                        placeholder="e.g., H123, A-45"
                        value={editData.houseId}
                        onChange={(e) => setEditData({...editData, houseId: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="upiId">UPI ID</Label>
                      <Input
                        id="upiId"
                        placeholder="yourname@paytm"
                        value={editData.upiId}
                        onChange={(e) => setEditData({...editData, upiId: e.target.value})}
                        className={errors.upiId ? "border-red-500" : ""}
                      />
                      {errors.upiId && <p className="text-sm text-red-500 mt-1">{errors.upiId}</p>}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 pt-4">
                    <Button onClick={handleSave} variant="default">
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                    <Button onClick={handleCancel} variant="outline">
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
              
              {!isEditing && (
                <div className="pt-4 border-t">
                  <Button onClick={() => setIsEditing(true)} variant="outline" className="w-full md:w-auto">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* QR Code */}
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <QrCode className="h-5 w-5 text-primary" />
              <span>My QR Code</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            {user?.qrCode ? (
              <div className="space-y-4">
                {showQR ? (
                  <div className="w-52 mx-auto bg-white border-2 border-gray-300 rounded-lg p-4">
                    {qrCodeImage ? (
                      <img src={qrCodeImage} alt="QR Code" className="w-full h-auto" />
                    ) : (
                      <div className="w-48 h-48 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-48 h-48 mx-auto bg-muted rounded-lg flex items-center justify-center">
                    <QrCode className="h-16 w-16 text-muted-foreground" />
                  </div>
                )}
                <div className="space-y-2">
                  <p className="text-sm font-medium">Your QR Code: {user.qrCode}</p>
                  <p className="text-sm text-muted-foreground">
                    Show this QR code to waste collection workers
                  </p>
                  <Button onClick={() => setShowQR(!showQR)} variant="default" size="sm">
                    {showQR ? 'Hide QR Code' : 'Show QR Code'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-48 h-48 mx-auto bg-muted rounded-lg flex items-center justify-center">
                  <QrCode className="h-16 w-16 text-muted-foreground" />
                </div>
                <Button onClick={generateQRCode} variant="default">
                  Generate QR Code
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Earnings */}
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Wallet className="h-5 w-5 text-primary" />
              <span>My Earnings</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <p className="text-center text-muted-foreground py-8">Loading earnings...</p>
            ) : (
              <>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">₹{earningsData.totalEarnings}</div>
                  <p className="text-sm text-muted-foreground">Total Earnings</p>
                </div>
                
                <div className="grid grid-cols-1 gap-4 text-center">
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <div className="text-xl font-semibold text-primary">₹{earningsData.thisMonth}</div>
                    <p className="text-xs text-muted-foreground">This Month</p>
                  </div>
                </div>

                {earningsData.earnings.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4 text-sm">
                    No earnings yet. Earnings are credited when your waste is processed by recycling centers.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    <h4 className="font-medium text-sm">Recent Earnings</h4>
                    {earningsData.earnings.slice(0, 5).map((earning: any) => (
                      <div key={earning._id} className="flex justify-between items-center p-2 bg-muted/20 rounded">
                        <span className="text-sm">{earning.description || 'Waste processing'}</span>
                        <span className="text-sm font-medium text-green-600">+₹{earning.amount}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};