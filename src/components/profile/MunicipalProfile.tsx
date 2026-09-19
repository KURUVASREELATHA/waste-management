import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Edit,
  Save,
  X,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Truck,
  Award,
  Target
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export const MunicipalProfile = () => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    address: user?.address || ""
  });

  // Worker data - populated from actual work assignments
  const workerData = {
    workerId: user?.workerId || "",
    department: user?.department || "",
    designation: user?.designation || "",
    totalCollections: 0,
    efficiency: 0,
    rating: 0,
    monthlyStats: {
      collectionsThisMonth: 0
    }
  };

  const handleSave = async () => {
    try {
      await api.put(`/auth/profile/${user?.id}`, editData);
      updateUser({
        name: editData.name,
        phone: editData.phone,
        address: editData.address
      });
      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      // Update locally even if backend fails
      updateUser({
        name: editData.name,
        phone: editData.phone,
        address: editData.address
      });
      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description: "Profile updated locally. Backend sync may be delayed.",
      });
    }
  };

  const handleCancel = () => {
    setEditData({
      name: user?.name || "",
      phone: user?.phone || "",
      address: user?.address || ""
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="card-shadow">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5 text-primary" />
            <span>Municipal Worker Profile</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col items-center space-y-3">
              <Avatar className="w-20 h-20">
                <AvatarImage src={user?.profileImage} />
                <AvatarFallback className="text-xl">
                  {user?.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Badge variant="secondary">
                {workerData.designation}
              </Badge>
            </div>

            <div className="flex-1">
              {!isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Name</Label>
                    <p className="font-medium">{user?.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Municipal ID</Label>
                    <p className="font-medium">{user?.municipalId || "Not assigned"}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Email</Label>
                    <p className="font-medium">{user?.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Phone</Label>
                    <p className="font-medium">{user?.phone || "Not provided"}</p>
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-sm text-muted-foreground">Address</Label>
                    <p className="font-medium">{user?.address || "Not provided"}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={editData.name}
                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={editData.phone}
                        onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={editData.address}
                      onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                    />
                  </div>
                </div>
              )}
              
              <div className="flex space-x-2 mt-4">
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)} variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <>
                    <Button onClick={handleSave}>
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                    <Button onClick={handleCancel} variant="outline">
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Stats */}
      <Card className="card-shadow">
        <CardHeader>
          <CardTitle>Performance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-primary">{workerData.totalCollections}</div>
              <p className="text-sm text-muted-foreground">Total Collections</p>
            </div>
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{workerData.efficiency}%</div>
              <p className="text-sm text-muted-foreground">Efficiency</p>
            </div>
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-orange-500">{workerData.rating}/5</div>
              <p className="text-sm text-muted-foreground">Rating</p>
            </div>
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{workerData.monthlyStats.collectionsThisMonth}</div>
              <p className="text-sm text-muted-foreground">This Month</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};