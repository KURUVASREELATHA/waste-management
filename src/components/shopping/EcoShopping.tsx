import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { 
  ShoppingCart, 
  ExternalLink, 
  Star,
  Truck,
  Shield,
  Leaf,
  X
} from "lucide-react";

interface Product {
  _id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  stock: number;
  materials: string;
  sellerId: {
    _id: string;
    name: string;
  };
  imageUrl?: string;
  isActive: boolean;
  sold: number;
  createdAt: string;
}

interface StaticProduct {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  image: string;
  description: string;
  features: string[];
  category: "dustbin" | "compost" | "accessories";
  shopUrl: string;
  shopName: string;
  inStock: boolean;
  freeShipping: boolean;
  ecoFriendly: boolean;
}

export const EcoShopping = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [purchaseData, setPurchaseData] = useState({
    quantity: 1,
    deliveryAddress: '',
    phoneNumber: '',
    notes: ''
  });

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      setProducts(response || []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handlePurchase = async () => {
    if (!selectedProduct || !purchaseData.deliveryAddress || !purchaseData.phoneNumber) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      await api.post(`/products/${selectedProduct._id}/purchase`, purchaseData);
      toast({
        title: "Purchase Successful!",
        description: `Your order for ${selectedProduct.name} has been placed successfully.`
      });
      setShowPurchaseModal(false);
      setSelectedProduct(null);
      setPurchaseData({ quantity: 1, deliveryAddress: '', phoneNumber: '', notes: '' });
      fetchProducts(); // Refresh to update stock
    } catch (error: any) {
      toast({
        title: "Purchase Failed",
        description: error.message || "Failed to place order. Please try again.",
        variant: "destructive"
      });
    }
  };

  const openPurchaseModal = (product: Product) => {
    setSelectedProduct(product);
    setShowPurchaseModal(true);
  };

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  const staticProducts: StaticProduct[] = [
    {
      id: "db1",
      name: "Smart Segregation Dustbin - 3 Compartments",
      price: 2499,
      originalPrice: 3299,
      rating: 4.5,
      reviews: 1247,
      image: "🗂️",
      description: "Automatic sensor-based dustbin with separate compartments for wet, dry, and recyclable waste",
      features: ["Motion Sensor", "3 Compartments", "Odor Control", "Easy Clean"],
      category: "dustbin",
      shopUrl: "https://amazon.in/dp/B08XYZ123",
      shopName: "Amazon",
      inStock: true,
      freeShipping: true,
      ecoFriendly: true
    },
    {
      id: "db2",
      name: "Stainless Steel Pedal Dustbin Set",
      price: 1899,
      rating: 4.3,
      reviews: 856,
      image: "🗑️",
      description: "Durable stainless steel dustbins with foot pedal operation, set of 2",
      features: ["Foot Pedal", "Rust Resistant", "Set of 2", "5L + 10L"],
      category: "dustbin",
      shopUrl: "https://flipkart.com/stainless-steel-dustbin",
      shopName: "Flipkart",
      inStock: true,
      freeShipping: false,
      ecoFriendly: false
    },
    {
      id: "ck1",
      name: "Home Composting Kit - Complete Set",
      price: 3999,
      originalPrice: 4999,
      rating: 4.7,
      reviews: 2134,
      image: "🌱",
      description: "Complete home composting solution with aerobic composter, activator, and tools",
      features: ["20L Capacity", "Activator Included", "Tool Set", "Instruction Manual"],
      category: "compost",
      shopUrl: "https://amazon.in/dp/B09ABC456",
      shopName: "Amazon",
      inStock: true,
      freeShipping: true,
      ecoFriendly: true
    },
    {
      id: "ck2",
      name: "Khamba Composting System",
      price: 2799,
      rating: 4.4,
      reviews: 967,
      image: "🏺",
      description: "Traditional earthen pot composting system for organic kitchen waste",
      features: ["Earthen Pots", "Natural Process", "No Electricity", "Compact Design"],
      category: "compost",
      shopUrl: "https://dailyobjects.com/khamba-composter",
      shopName: "Daily Objects",
      inStock: true,
      freeShipping: true,
      ecoFriendly: true
    },
    {
      id: "ck3",
      name: "Electric Food Waste Composter",
      price: 12999,
      originalPrice: 15999,
      rating: 4.6,
      reviews: 543,
      image: "⚡",
      description: "Automatic electric composter that converts food waste to compost in 24 hours",
      features: ["24hr Composting", "Odorless", "Auto Mixing", "App Control"],
      category: "compost",
      shopUrl: "https://amazon.in/dp/B0ADEF789",
      shopName: "Amazon",
      inStock: false,
      freeShipping: true,
      ecoFriendly: true
    },
    {
      id: "ac1",
      name: "Biodegradable Garbage Bags - 100 Pack",
      price: 299,
      rating: 4.2,
      reviews: 3421,
      image: "🛍️",
      description: "Eco-friendly biodegradable garbage bags, medium size, pack of 100",
      features: ["Biodegradable", "Medium Size", "100 Pack", "Strong Material"],
      category: "accessories",
      shopUrl: "https://amazon.in/dp/B07GHI012",
      shopName: "Amazon",
      inStock: true,
      freeShipping: false,
      ecoFriendly: true
    },
    {
      id: "ac2",
      name: "Waste Segregation Labels Set",
      price: 199,
      rating: 4.1,
      reviews: 1876,
      image: "🏷️",
      description: "Waterproof labels for waste segregation, set of 20 different labels",
      features: ["Waterproof", "20 Labels", "Easy Apply", "Color Coded"],
      category: "accessories",
      shopUrl: "https://flipkart.com/waste-labels",
      shopName: "Flipkart",
      inStock: true,
      freeShipping: false,
      ecoFriendly: false
    },
    {
      id: "db3",
      name: "Bamboo Fiber Dustbin - Eco Friendly",
      price: 899,
      originalPrice: 1299,
      rating: 4.0,
      reviews: 432,
      image: "🎋",
      description: "Sustainable bamboo fiber dustbin, lightweight and biodegradable",
      features: ["Bamboo Fiber", "Lightweight", "Biodegradable", "10L Capacity"],
      category: "dustbin",
      shopUrl: "https://nykaa.com/bamboo-dustbin",
      shopName: "Nykaa",
      inStock: true,
      freeShipping: false,
      ecoFriendly: true
    }
  ];

  const handleShopNow = (product: StaticProduct) => {
    window.open(product.shopUrl, '_blank');
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const categories = [
    { key: "all", name: "All Products", icon: "🛍️" },
    { key: "bags", name: "Eco Bags", icon: "👜" },
    { key: "containers", name: "Containers", icon: "📦" },
    { key: "furniture", name: "Furniture", icon: "🪑" },
    { key: "decor", name: "Home Decor", icon: "🏠" },
    { key: "stationery", name: "Stationery", icon: "📝" },
    { key: "dustbin", name: "Dustbins", icon: "🗑️" },
    { key: "compost", name: "Composting Kits", icon: "🌱" },
    { key: "accessories", name: "Accessories", icon: "🛍️" }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-foreground">Eco-Friendly Shopping</h2>
          <p className="text-muted-foreground">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-foreground">Eco-Friendly Shopping</h2>
        <p className="text-muted-foreground">
          Products from verified recycling centers and essential waste management items
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 justify-center">
        {categories.map((category) => (
          <Button
            key={category.key}
            variant={selectedCategory === category.key ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category.key)}
            className="flex items-center space-x-1"
          >
            <span>{category.icon}</span>
            <span>{category.name}</span>
          </Button>
        ))}
      </div>

      {/* Products from Recycling Centers */}
      {filteredProducts.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">♻️</span>
            <h3 className="text-2xl font-bold text-foreground">Products from Recycling Centers</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product._id} className="card-shadow hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                      {product.imageUrl ? (
                        <img 
                          src={product.imageUrl} 
                          alt={product.name}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling!.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className={`w-full h-full flex items-center justify-center ${product.imageUrl ? 'hidden' : 'flex'}`}>
                        <ShoppingCart className="h-8 w-8 text-gray-400" />
                      </div>
                    </div>
                    <div className="flex flex-col space-y-1">
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        <Leaf className="h-3 w-3 mr-1" />
                        Eco
                      </Badge>
                      {product.stock === 0 && (
                        <Badge variant="destructive" className="text-xs">
                          Out of Stock
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardTitle className="text-lg leading-tight">{product.name}</CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {product.description}
                  </p>

                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="outline" className="text-xs">
                        {product.category}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Made from {product.materials}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xl font-bold text-primary">₹{product.price}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <span>By {product.sellerId.name}</span>
                        <span>Stock: {product.stock}</span>
                      </div>
                    </div>
                  </div>

                  <Button 
                    onClick={() => openPurchaseModal(product)}
                    className="w-full"
                    variant={product.stock > 0 ? "default" : "secondary"}
                    disabled={product.stock === 0}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {product.stock > 0 ? "Buy Now" : "Out of Stock"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Static Products */}
      {categories.filter(cat => ['dustbin', 'compost', 'accessories'].includes(cat.key)).map((category) => (
        <div key={category.key} className="space-y-4">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{category.icon}</span>
            <h3 className="text-2xl font-bold text-foreground">{category.name}</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {staticProducts
              .filter(product => product.category === category.key)
              .map((product) => (
                <Card key={product.id} className="card-shadow hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="text-4xl mb-2">{product.image}</div>
                      <div className="flex flex-col space-y-1">
                        {product.ecoFriendly && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            <Leaf className="h-3 w-3 mr-1" />
                            Eco
                          </Badge>
                        )}
                        {!product.inStock && (
                          <Badge variant="destructive" className="text-xs">
                            Out of Stock
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardTitle className="text-lg leading-tight">{product.name}</CardTitle>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1">
                        {renderStars(product.rating)}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {product.rating} ({product.reviews})
                      </span>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {product.description}
                    </p>

                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-1">
                        {product.features.slice(0, 2).map((feature, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-xl font-bold text-primary">₹{product.price}</span>
                          {product.originalPrice && (
                            <span className="text-sm text-muted-foreground line-through">
                              ₹{product.originalPrice}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          <span>{product.shopName}</span>
                          {product.freeShipping && (
                            <div className="flex items-center space-x-1">
                              <Truck className="h-3 w-3" />
                              <span>Free Ship</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <Button 
                      onClick={() => handleShopNow(product)}
                      className="w-full"
                      variant={product.inStock ? "default" : "secondary"}
                      disabled={!product.inStock}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      {product.inStock ? "Shop Now" : "Notify Me"}
                      <ExternalLink className="h-3 w-3 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      ))}

      <div className="bg-muted/30 rounded-lg p-6 text-center">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <Shield className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Trusted Partners</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Products from verified recycling centers and trusted external sellers. 
          Support local eco-friendly businesses while contributing to sustainability.
        </p>
      </div>

      {/* Purchase Modal */}
      {showPurchaseModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Purchase Product</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowPurchaseModal(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="font-medium mb-2">{selectedProduct.name}</p>
                <p className="text-sm text-muted-foreground mb-2">{selectedProduct.description}</p>
                <p className="text-lg font-bold text-green-600">₹{selectedProduct.price}</p>
                <p className="text-sm text-muted-foreground">Available: {selectedProduct.stock} units</p>
              </div>
              
              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input
                  type="number"
                  min="1"
                  max={selectedProduct.stock}
                  value={purchaseData.quantity}
                  onChange={(e) => setPurchaseData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Delivery Address *</Label>
                <Textarea
                  placeholder="Enter your complete delivery address"
                  value={purchaseData.deliveryAddress}
                  onChange={(e) => setPurchaseData(prev => ({ ...prev, deliveryAddress: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Phone Number *</Label>
                <Input
                  placeholder="Enter your phone number"
                  value={purchaseData.phoneNumber}
                  onChange={(e) => setPurchaseData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Notes (Optional)</Label>
                <Textarea
                  placeholder="Any special instructions..."
                  value={purchaseData.notes}
                  onChange={(e) => setPurchaseData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={2}
                />
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-medium">Total Amount:</span>
                  <span className="text-xl font-bold text-green-600">
                    ₹{(selectedProduct.price * purchaseData.quantity).toLocaleString()}
                  </span>
                </div>
                
                <div className="flex space-x-2">
                  <Button onClick={handlePurchase} className="flex-1">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Place Order
                  </Button>
                  <Button variant="outline" onClick={() => setShowPurchaseModal(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};