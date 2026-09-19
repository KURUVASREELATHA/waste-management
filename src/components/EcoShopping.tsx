import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  ShoppingBag,
  ShoppingCart,
  Leaf,
  X,
  Search,
  Filter
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const EcoShopping = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    let filtered = products;
    
    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.materials.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by price range
    if (priceRange.min) {
      filtered = filtered.filter(p => p.price >= parseFloat(priceRange.min));
    }
    if (priceRange.max) {
      filtered = filtered.filter(p => p.price <= parseFloat(priceRange.max));
    }
    
    setFilteredProducts(filtered);
  }, [products, selectedCategory, searchTerm, priceRange]);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      setProducts(response);
      setFilteredProducts(response);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [purchaseDetails, setPurchaseDetails] = useState({
    quantity: 1,
    deliveryAddress: '',
    phoneNumber: '',
    notes: ''
  });

  const openPurchaseModal = (product: any) => {
    setSelectedProduct(product);
    setShowPurchaseModal(true);
  };

  const purchaseProduct = async () => {
    if (!purchaseDetails.deliveryAddress || !purchaseDetails.phoneNumber) {
      toast({
        title: "Missing Information",
        description: "Please fill in delivery address and phone number",
        variant: "destructive"
      });
      return;
    }

    try {
      await api.post(`/products/${selectedProduct._id}/purchase`, purchaseDetails);
      
      toast({
        title: "Order Placed Successfully",
        description: `Your order for ${selectedProduct.name} has been placed`
      });
      
      setShowPurchaseModal(false);
      setPurchaseDetails({ quantity: 1, deliveryAddress: '', phoneNumber: '', notes: '' });
      fetchProducts();
    } catch (error) {
      toast({
        title: "Purchase Failed",
        description: "Could not complete purchase",
        variant: "destructive"
      });
    }
  };

  const categories = [
    { value: 'all', label: 'All Products' },
    { value: 'bags', label: 'Eco Bags' },
    { value: 'containers', label: 'Containers' },
    { value: 'furniture', label: 'Furniture' },
    { value: 'decor', label: 'Home Decor' },
    { value: 'stationery', label: 'Stationery' }
  ];

  return (
    <Card className="card-shadow">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Leaf className="h-5 w-5 text-green-600" />
          <span>Eco-Friendly Shopping</span>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Shop sustainable products made from recycled waste materials
        </p>
      </CardHeader>
      <CardContent>
        {/* Search and Filter Section */}
        <div className="space-y-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Min ₹"
                value={priceRange.min}
                onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                className="w-20"
              />
              <Input
                type="number"
                placeholder="Max ₹"
                value={priceRange.max}
                onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                className="w-20"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.value}
                variant={selectedCategory === category.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.value)}
              >
                {category.label}
              </Button>
            ))}
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No eco-friendly products available yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product._id} className="overflow-hidden">
                <div className="h-48 bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center overflow-hidden rounded-t-lg">
                  {product.imageUrl ? (
                    <img 
                      src={product.imageUrl} 
                      alt={product.name}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className={`w-full h-full flex items-center justify-center ${product.imageUrl ? 'hidden' : 'flex'}`}>
                    <ShoppingBag className="h-16 w-16 text-green-600" />
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-lg">{product.name}</h3>
                    <Badge className="bg-green-100 text-green-800">
                      <Leaf className="h-3 w-3 mr-1" />
                      Eco
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3">
                    {product.description}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-green-600">₹{product.price}</span>
                      <span className="text-sm text-muted-foreground">Stock: {product.stock}</span>
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      <span className="font-medium">Made from:</span> {product.materials}
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      <span className="font-medium">Seller:</span> {product.sellerId?.name || 'Recycling Center'}
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => openPurchaseModal(product)}
                    className="w-full"
                    disabled={product.stock === 0}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {product.stock === 0 ? 'Out of Stock' : 'Buy Now'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
      
      {/* Purchase Modal */}
      {showPurchaseModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Purchase Details</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowPurchaseModal(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center space-x-4 p-3 bg-muted/30 rounded-lg">
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                  {selectedProduct.imageUrl ? (
                    <img src={selectedProduct.imageUrl} alt={selectedProduct.name} className="w-full h-full object-contain" />
                  ) : (
                    <ShoppingBag className="h-8 w-8 text-gray-400" />
                  )}
                </div>
                <div>
                  <h4 className="font-medium">{selectedProduct.name}</h4>
                  <p className="text-sm text-muted-foreground">₹{selectedProduct.price} each</p>
                  <p className="text-xs text-muted-foreground">Stock: {selectedProduct.stock}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input
                  type="number"
                  min="1"
                  max={selectedProduct.stock}
                  value={purchaseDetails.quantity}
                  onChange={(e) => setPurchaseDetails(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Delivery Address *</Label>
                <Textarea
                  placeholder="Enter your complete delivery address"
                  value={purchaseDetails.deliveryAddress}
                  onChange={(e) => setPurchaseDetails(prev => ({ ...prev, deliveryAddress: e.target.value }))}
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Phone Number *</Label>
                <Input
                  placeholder="Enter your phone number"
                  value={purchaseDetails.phoneNumber}
                  onChange={(e) => setPurchaseDetails(prev => ({ ...prev, phoneNumber: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Notes (Optional)</Label>
                <Textarea
                  placeholder="Any special instructions..."
                  value={purchaseDetails.notes}
                  onChange={(e) => setPurchaseDetails(prev => ({ ...prev, notes: e.target.value }))}
                  rows={2}
                />
              </div>
              
              <div className="p-3 bg-muted/30 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Amount:</span>
                  <span className="text-lg font-bold text-green-600">
                    ₹{(selectedProduct.price * purchaseDetails.quantity).toFixed(2)}
                  </span>
                </div>
              </div>
              
              <div className="flex space-x-2 pt-4">
                <Button onClick={purchaseProduct} className="flex-1">
                  Place Order
                </Button>
                <Button variant="outline" onClick={() => setShowPurchaseModal(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};