import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, CheckCircle, Clock, AlertCircle } from "lucide-react";

interface Order {
  _id: string;
  wasteType: string;
  weight: number;
  totalAmount: number;
  verificationCode?: string;
  status: string;
  sellerId: { name: string };
  createdAt: string;
}

export const PaymentProcessor = () => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProcessedOrders();
  }, []);

  const fetchProcessedOrders = async () => {
    try {
      const response = await api.get('/waste/orders/recycler');
      const processedOrders = response.filter((order: Order) => 
        order.status === 'accepted' && order.verificationCode
      );
      setOrders(processedOrders);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    }
  };

  const handlePayment = async () => {
    if (!selectedOrder || !verificationCode || !transactionId || !paymentMethod) {
      toast({
        title: "Missing Information",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      await api.patch(`/waste-sales/${selectedOrder._id}/payment`, {
        verificationCode,
        transactionId,
        paymentProof: paymentMethod,
        paymentNotes: `Payment for ${selectedOrder.wasteType} waste - ${selectedOrder.weight}kg`
      });

      toast({
        title: "Payment Completed",
        description: `Payment of ₹${selectedOrder.totalAmount} processed successfully`
      });

      setSelectedOrder(null);
      setVerificationCode("");
      setTransactionId("");
      setPaymentMethod("");
      fetchProcessedOrders();
    } catch (error: any) {
      toast({
        title: "Payment Failed",
        description: error.message || "Invalid verification code",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Process Payments</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Orders List */}
            <div className="space-y-4">
              <h3 className="font-medium">Orders Ready for Payment</h3>
              {orders.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No orders ready for payment
                </p>
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => (
                    <div
                      key={order._id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedOrder?._id === order._id
                          ? 'border-primary bg-primary/5'
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedOrder(order)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{order.wasteType} - {order.weight}kg</p>
                          <p className="text-sm text-muted-foreground">
                            From: {order.sellerId?.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">₹{order.totalAmount}</p>
                          <Badge variant="outline" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            Awaiting Payment
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Payment Form */}
            <div className="space-y-4">
              <h3 className="font-medium">Payment Details</h3>
              {selectedOrder ? (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900">Order Summary</h4>
                    <p className="text-sm text-blue-800">
                      {selectedOrder.wasteType} - {selectedOrder.weight}kg
                    </p>
                    <p className="text-lg font-bold text-blue-900">
                      Amount: ₹{selectedOrder.totalAmount}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Verification Code</Label>
                    <Input
                      placeholder="Enter 6-digit code from municipality"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
                      maxLength={6}
                      className="font-mono text-center"
                    />
                    <p className="text-xs text-muted-foreground">
                      Get this code from the municipality after waste collection
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Payment Method</Label>
                    <select
                      className="w-full p-2 border rounded"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    >
                      <option value="">Select payment method</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="upi">UPI</option>
                      <option value="cheque">Cheque</option>
                      <option value="cash">Cash</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>Transaction ID</Label>
                    <Input
                      placeholder="Enter transaction reference"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                    />
                  </div>

                  <Button
                    onClick={handlePayment}
                    disabled={loading || !verificationCode || !transactionId || !paymentMethod}
                    className="w-full"
                  >
                    {loading ? (
                      "Processing..."
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Complete Payment ₹{selectedOrder.totalAmount}
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p>Select an order to process payment</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};