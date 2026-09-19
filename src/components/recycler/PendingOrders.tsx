import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export const PendingOrders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/waste/orders/recycler');
      console.log('Fetched orders:', response);
      setOrders(response || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOrder = async (orderId: string) => {
    try {
      await api.patch(`/waste/orders/${orderId}/status`, { status: 'accepted' });
      toast({ title: "Order accepted successfully" });
      fetchOrders();
    } catch (error) {
      toast({ title: "Failed to accept order", variant: "destructive" });
    }
  };

  const handleRejectOrder = async (orderId: string) => {
    try {
      await api.patch(`/waste/orders/${orderId}/status`, { status: 'rejected' });
      toast({ title: "Order rejected" });
      fetchOrders();
    } catch (error) {
      toast({ title: "Failed to reject order", variant: "destructive" });
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading orders...</div>;
  }

  if (orders.length === 0) {
    return <div className="text-center text-muted-foreground py-8">No pending orders</div>;
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div key={order._id} className="p-4 border rounded-lg bg-yellow-50">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h4 className="font-semibold">{order.wasteType} Waste</h4>
              <p className="text-sm text-muted-foreground">
                From: {order.sellerId?.name || 'Municipal Worker'}
              </p>
              <p className="text-sm text-muted-foreground">
                Email: {order.sellerId?.email}
              </p>
              <p className="text-sm text-muted-foreground">
                Phone: {order.sellerId?.phone || 'Not provided'}
              </p>
            </div>
            <Badge variant="outline" className="text-orange-600">
              <Clock className="h-3 w-3 mr-1" />
              Pending
            </Badge>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
            <div>
              <p className="text-muted-foreground">Weight</p>
              <p className="font-bold">{order.weight} kg</p>
            </div>
            <div>
              <p className="text-muted-foreground">Rate</p>
              <p className="font-bold">₹{order.pricePerKg}/kg</p>
            </div>
            <div>
              <p className="text-muted-foreground">Total</p>
              <p className="font-bold text-green-600">₹{order.totalAmount}</p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button 
              size="sm" 
              onClick={() => handleAcceptOrder(order._id)}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Accept
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => handleRejectOrder(order._id)}
            >
              <X className="h-4 w-4 mr-1" />
              Reject
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};