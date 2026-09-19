import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertTriangle, Plus, Eye, CheckCircle, X, IndianRupee } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Penalty {
  _id: string;
  citizenId: string;
  citizenName: string;
  citizenHouseId: string;
  violationType: string;
  description: string;
  amount: number;
  status: 'pending' | 'paid' | 'disputed' | 'waived';
  createdAt: string;
  dueDate: string;
  evidenceImage?: string;
  location?: string;
  issuedBy: {
    name: string;
    workerId: string;
  };
  disputeReason?: string;
  disputeResolution?: string;
}

interface Citizen {
  _id: string;
  name: string;
  houseId: string;
}

export const MunicipalPenalties = () => {
  const { toast } = useToast();
  const [penalties, setPenalties] = useState<Penalty[]>([]);
  const [citizens, setCitizens] = useState<Citizen[]>([]);
  const [loading, setLoading] = useState(true);
  const [showIssueForm, setShowIssueForm] = useState(false);
  
  // Form state
  const [selectedCitizen, setSelectedCitizen] = useState("");
  const [violationType, setViolationType] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [location, setLocation] = useState("");
  const [evidenceImage, setEvidenceImage] = useState<File | null>(null);

  const fetchPenalties = async () => {
    try {
      console.log('Fetching penalties...');
      const response = await api.get('/penalties/all');
      console.log('Penalties fetched:', response);
      setPenalties(Array.isArray(response) ? response : []);
    } catch (error: any) {
      console.error('Failed to fetch penalties:', error);
      console.error('Error details:', error.message);
      toast({
        title: "Failed to Load Penalties",
        description: "Could not fetch penalties data. Please check your connection.",
        variant: "destructive",
      });
      setPenalties([]);
    }
  };

  const fetchCitizens = async () => {
    try {
      console.log('Fetching citizens...');
      const response = await api.get('/auth/users/role/citizen');
      console.log('Citizens fetched:', response);
      setCitizens(response || []);
    } catch (error: any) {
      console.error('Failed to fetch citizens:', error);
      console.error('Error details:', error.message);
      setCitizens([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPenalties();
    fetchCitizens();
  }, []);

  const handleIssuePenalty = async () => {
    if (!selectedCitizen || !violationType || !description || !amount) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Issuing penalty with data:', {
        citizenId: selectedCitizen,
        violationType,
        description,
        amount,
        location,
        hasEvidence: !!evidenceImage
      });
      
      const formData = new FormData();
      formData.append('citizenId', selectedCitizen);
      formData.append('violationType', violationType);
      formData.append('description', description);
      formData.append('amount', amount);
      formData.append('location', location);
      
      if (evidenceImage) {
        formData.append('evidenceImage', evidenceImage);
      }

      // Use fetch directly for FormData to avoid JSON serialization issues
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/penalties/issue', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to issue penalty');
      }
      
      const result = await response.json();
      console.log('Penalty issued successfully:', result);

      toast({
        title: "Penalty Issued",
        description: `Penalty of ₹${amount} issued to ${citizens.find(c => c._id === selectedCitizen)?.name || 'citizen'} successfully.`,
      });

      // Reset form
      setSelectedCitizen("");
      setViolationType("");
      setDescription("");
      setAmount("");
      setLocation("");
      setEvidenceImage(null);
      setShowIssueForm(false);
      
      fetchPenalties();
    } catch (error: any) {
      console.error('Penalty issue error:', error);
      toast({
        title: "Failed to Issue Penalty",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleResolveDispute = async (penaltyId: string, resolution: string, newStatus: 'waived' | 'pending') => {
    try {
      await api.patch(`/penalties/${penaltyId}/resolve-dispute`, {
        resolution,
        newStatus
      });

      toast({
        title: "Dispute Resolved",
        description: `Penalty has been ${newStatus === 'waived' ? 'waived' : 'reinstated'}.`,
      });

      fetchPenalties();
    } catch (error) {
      toast({
        title: "Failed to Resolve Dispute",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-orange-100 text-orange-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'disputed': return 'bg-blue-100 text-blue-800';
      case 'waived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getViolationLabel = (type: string) => {
    const labels = {
      'improper_segregation': 'Improper Segregation',
      'mixed_waste': 'Mixed Waste',
      'hazardous_disposal': 'Hazardous Disposal',
      'overweight': 'Overweight Waste',
      'no_segregation': 'No Segregation'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const stats = {
    total: penalties.length,
    pending: penalties.filter(p => p.status === 'pending').length,
    paid: penalties.filter(p => p.status === 'paid').length,
    disputed: penalties.filter(p => p.status === 'disputed').length,
    totalRevenue: penalties.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0)
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <p className="text-center text-muted-foreground">Loading penalties...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total Penalties</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.paid}</p>
              <p className="text-sm text-muted-foreground">Paid</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.disputed}</p>
              <p className="text-sm text-muted-foreground">Disputed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">₹{stats.totalRevenue}</p>
              <p className="text-sm text-muted-foreground">Revenue</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Issue Penalty Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Penalty Management</h2>
        <Dialog open={showIssueForm} onOpenChange={setShowIssueForm}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Issue Penalty
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Issue New Penalty</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Select Citizen</Label>
                <Select value={selectedCitizen} onValueChange={setSelectedCitizen}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose citizen" />
                  </SelectTrigger>
                  <SelectContent>
                    {citizens.map((citizen) => (
                      <SelectItem key={citizen._id} value={citizen._id}>
                        {citizen.name} ({citizen.houseId})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Violation Type</Label>
                <Select value={violationType} onValueChange={setViolationType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select violation type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="improper_segregation">Improper Segregation</SelectItem>
                    <SelectItem value="mixed_waste">Mixed Waste</SelectItem>
                    <SelectItem value="hazardous_disposal">Hazardous Disposal</SelectItem>
                    <SelectItem value="overweight">Overweight Waste</SelectItem>
                    <SelectItem value="no_segregation">No Segregation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  placeholder="Describe the violation..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Penalty Amount (₹)</Label>
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Location</Label>
                  <Input
                    placeholder="Location of violation"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label>Evidence Photo (Optional)</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setEvidenceImage(e.target.files?.[0] || null)}
                />
              </div>

              <div className="flex space-x-2">
                <Button onClick={handleIssuePenalty}>Issue Penalty</Button>
                <Button variant="outline" onClick={() => setShowIssueForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Penalties List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-primary" />
            <span>All Penalties</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {penalties.length === 0 ? (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No penalties issued yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {penalties.map((penalty) => (
                <div key={penalty._id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-semibold">{getViolationLabel(penalty.violationType)}</h4>
                        <Badge className={getStatusColor(penalty.status)}>
                          {penalty.status.charAt(0).toUpperCase() + penalty.status.slice(1)}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">{penalty.description}</p>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Citizen: </span>
                          <span>{penalty.citizenName || 'Unknown'} ({penalty.citizenHouseId || 'No ID'})</span>
                        </div>
                        <div>
                          <span className="font-medium">Amount: </span>
                          <span className="text-red-600 font-bold">₹{penalty.amount}</span>
                        </div>
                        <div>
                          <span className="font-medium">Issued: </span>
                          <span>{new Date(penalty.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div>
                          <span className="font-medium">Due Date: </span>
                          <span className={new Date(penalty.dueDate) < new Date() ? 'text-red-600 font-medium' : ''}>
                            {new Date(penalty.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">Issued by: </span>
                          <span>{penalty.issuedBy?.name || 'Municipal Worker'}</span>
                        </div>
                        {penalty.location && (
                          <div>
                            <span className="font-medium">Location: </span>
                            <span>{penalty.location}</span>
                          </div>
                        )}
                      </div>

                      {penalty.status === 'disputed' && penalty.disputeReason && (
                        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                          <p className="text-sm font-medium text-blue-800">Dispute Reason:</p>
                          <p className="text-sm text-blue-700">{penalty.disputeReason}</p>
                          <div className="flex space-x-2 mt-2">
                            <Button 
                              size="sm" 
                              onClick={() => handleResolveDispute(penalty._id, "Dispute accepted - penalty waived", "waived")}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Accept Dispute
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleResolveDispute(penalty._id, "Dispute rejected - penalty stands", "pending")}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Reject Dispute
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col space-y-2 ml-4">
                      {penalty.evidenceImage && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4 mr-1" />
                              Evidence
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Evidence Photo</DialogTitle>
                            </DialogHeader>
                            <img 
                              src={`http://localhost:3001/uploads/${penalty.evidenceImage}`}
                              alt="Penalty evidence"
                              className="w-full h-auto rounded-lg"
                            />
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};