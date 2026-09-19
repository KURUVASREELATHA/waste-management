import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building, Calendar, DollarSign, Package, Search, Filter, Users, Truck } from "lucide-react";

export const WasteSellingHistory = () => {
  const [wasteSales, setWasteSales] = useState<any[]>([]);
  const [filteredSales, setFilteredSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchWasteSales();
  }, []);

  useEffect(() => {
    filterSales();
  }, [wasteSales, searchTerm, statusFilter]);

  const fetchWasteSales = async () => {
    try {
      const response = await api.get('/waste/debug/sales');
      setWasteSales(response || []);
    } catch (error) {
      console.error('Failed to fetch waste sales:', error);
      setWasteSales([]);
    } finally {
      setLoading(false);
    }
  };

  const filterSales = () => {
    let filtered = [...wasteSales];

    if (searchTerm) {
      filtered = filtered.filter(sale =>
        sale.sellerId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.recyclerId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.wasteType.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(sale => sale.status === statusFilter);
    }

    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setFilteredSales(filtered);
  };

  const getStatusBadge = (status: string) => {
    if (status === 'pending') return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    if (status === 'accepted') return <Badge className="bg-blue-100 text-blue-800">Accepted</Badge>;
    if (status === 'completed') return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
    return <Badge variant="outline">{status}</Badge>;
  };

  if (loading) {
    return <div className="text-center py-8">Loading waste selling history...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Transactions</p>
                <p className="text-lg font-bold">{filteredSales.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-lg font-bold">₹{filteredSales.reduce((sum, sale) => sum + sale.totalAmount, 0).toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Weight</p>
                <p className="text-lg font-bold">{filteredSales.reduce((sum, sale) => sum + sale.weight, 0)} kg</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by worker, center, or waste type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History ({filteredSales.length} transactions)</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredSales.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-lg font-medium mb-2">No transactions found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSales.map((sale) => (
                <div key={sale._id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start space-x-4">
                      <div className="flex flex-col items-center space-y-2">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Truck className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="w-px h-8 bg-gray-300"></div>
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <Building className="h-5 w-5 text-green-600" />
                        </div>
                      </div>
                      <div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-semibold text-blue-900 mb-1">
                              <Users className="h-4 w-4 inline mr-1" />
                              Municipal Worker
                            </h4>
                            <p className="text-sm font-medium">{sale.sellerId?.name || 'Unknown Worker'}</p>
                          </div>
                          <div>
                            <h4 className="font-semibold text-green-900 mb-1">
                              <Building className="h-4 w-4 inline mr-1" />
                              Recycling Center
                            </h4>
                            <p className="text-sm font-medium">{sale.recyclerId?.name || 'Unknown Center'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    {getStatusBadge(sale.status)}
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Waste Type</p>
                      <p className="font-medium capitalize">{sale.wasteType}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Weight</p>
                      <p className="font-bold">{sale.weight} kg</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Rate</p>
                      <p className="font-bold">₹{sale.pricePerKg}/kg</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Amount</p>
                      <p className="font-bold text-green-600">₹{sale.totalAmount}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t text-xs text-muted-foreground">
                    <span className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(sale.createdAt).toLocaleString()}
                    </span>
                    <span>ID: {sale._id.slice(-8).toUpperCase()}</span>
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