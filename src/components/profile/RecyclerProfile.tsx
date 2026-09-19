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
  Building,
  Award,
  TrendingUp,
  Recycle
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export const RecyclerProfile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    address: user?.address || "",
    centerName: user?.centerName || ""
  });

  // Recycling center data - populated from actual operations
  const centerData = {
    centerId: "Not assigned",
    centerName: user?.centerName || "Recycling Center",
    establishedDate: "Not available",
    licenseNumber: "Not available",
    capacity: "0 tons/month",
    certifications: [],
    operatingHours: "Not set",
    employeeCount: 0,
    monthlyStats: {
      wasteProcessed: 0,
      wasteReceived: 0,
      efficiency: 0,
      revenue: 0,
      municipalityConnections: 0
    },
    specializations: [],
    achievements: []
  };

  const handleSave = () => {
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({
      name: user?.name || "",
      phone: user?.phone || "",
      address: user?.address || "",
      centerName: user?.centerName || ""
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="card-shadow">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building className="h-5 w-5 text-primary" />
            <span>Recycling Center Profile</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="w-24 h-24">
                <AvatarImage src={user?.profileImage} />
                <AvatarFallback className="text-2xl">
                  {centerData.centerName?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="text-center space-y-1">
                <Badge variant="secondary" className="text-sm">
                  Licensed Recycler
                </Badge>
                <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                  <Award className="h-3 w-3" />
                  <span>{centerData.certifications.length} Certifications</span>
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-4">
              {!isEditing ? (
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm text-muted-foreground">Center Name</Label>
                    <p className="font-medium">{centerData.centerName}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Center ID</Label>
                    <p className="font-medium">{centerData.centerId}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">License Number</Label>
                    <p className="font-medium">{centerData.licenseNumber}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Contact Person</Label>
                    <p className="font-medium">{user?.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Email</Label>
                    <p className="font-medium flex items-center space-x-2">
                      <Mail className="h-4 w-4" />
                      <span>{user?.email}</span>
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Phone</Label>
                    <p className="font-medium flex items-center space-x-2">
                      <Phone className="h-4 w-4" />
                      <span>{user?.phone}</span>
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Address</Label>
                    <p className="font-medium flex items-center space-x-2">
                      <MapPin className="h-4 w-4" />
                      <span>{user?.address}</span>
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Established</Label>
                    <p className="font-medium flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>{centerData.establishedDate}</span>
                    </p>
                  </div>
                  <Button onClick={() => setIsEditing(true)} variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="centerName">Center Name</Label>
                    <Input
                      id="centerName"
                      value={editData.centerName}
                      onChange={(e) => setEditData({ ...editData, centerName: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="name">Contact Person</Label>
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
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={editData.address}
                      onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={handleSave} variant="default">
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                    <Button onClick={handleCancel} variant="outline">
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Center Details */}
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building className="h-5 w-5 text-primary" />
              <span>Center Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <Label className="text-sm text-muted-foreground">Processing Capacity</Label>
                <p className="font-medium">{centerData.capacity}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Operating Hours</Label>
                <p className="font-medium">{centerData.operatingHours}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Employee Count</Label>
                <p className="font-medium">{centerData.employeeCount} employees</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Specializations</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {centerData.specializations.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No specializations set</p>
                  ) : (
                    centerData.specializations.map((spec, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {spec}
                      </Badge>
                    ))
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Performance */}
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span>Monthly Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold text-primary">{centerData.monthlyStats.wasteProcessed}</div>
                <p className="text-xs text-muted-foreground">Tons Processed</p>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold text-orange-500">{centerData.monthlyStats.wasteReceived}</div>
                <p className="text-xs text-muted-foreground">Tons Received</p>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold text-green-600">₹{(centerData.monthlyStats.revenue / 100000).toFixed(1)}L</div>
                <p className="text-xs text-muted-foreground">Revenue</p>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{centerData.monthlyStats.municipalityConnections}</div>
                <p className="text-xs text-muted-foreground">Connections</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processing Efficiency</span>
                <span>{centerData.monthlyStats.efficiency}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary rounded-full h-2"
                  style={{ width: `${centerData.monthlyStats.efficiency}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Certifications */}
      <Card className="card-shadow">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="h-5 w-5 text-primary" />
            <span>Certifications & Licenses</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {centerData.certifications.length === 0 ? (
              <div className="col-span-3 text-center text-muted-foreground py-8">
                No certifications added yet.
              </div>
            ) : (
              centerData.certifications.map((cert, index) => (
                <div key={index} className="p-4 bg-muted/30 rounded-lg text-center">
                  <div className="text-2xl mb-2">📜</div>
                  <h4 className="font-semibold text-sm">{cert}</h4>
                  <p className="text-xs text-muted-foreground">Valid & Active</p>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card className="card-shadow">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Recycle className="h-5 w-5 text-primary" />
            <span>Awards & Recognition</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {centerData.achievements.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No awards received yet. Awards will appear based on performance.
              </div>
            ) : (
              centerData.achievements.map((achievement, index) => (
                <div key={index} className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl">🏆</div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{achievement.name}</h4>
                      <p className="text-sm text-muted-foreground">Awarded by {achievement.authority}</p>
                      <p className="text-xs text-muted-foreground">{achievement.date}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};