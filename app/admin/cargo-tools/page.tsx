'use client';

import * as React from 'react';
import { AdminLayout } from '@/components/admin/admin-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { 
  Package, 
  Calculator,
  Globe,
  Truck,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react';

export default function CargoToolsPage() {
  const [pricingData, setPricingData] = React.useState({
    content: '',
    country: '',
    weight: '',
    length: '',
    width: '',
    height: '',
    quantity: 1
  });
  const [pricingResult, setPricingResult] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleInputChange = (field: string, value: string | number) => {
    setPricingData(prev => ({ ...prev, [field]: value }));
  };

  const calculatePricing = async (type: 'draft' | 'multi' | 'mixed') => {
    setIsLoading(true);
    try {
      let endpoint = '';
      let payload: any = {
        content: pricingData.content,
        country: pricingData.country
      };

      switch (type) {
        case 'draft':
          endpoint = '/api/functions/cargo_draft_pricing/route';
          payload = {
            ...payload,
            weight: parseFloat(pricingData.weight),
            quantity: pricingData.quantity
          };
          break;
        case 'multi':
          endpoint = '/api/functions/cargo_multi_pricing/route';
          payload = {
            ...payload,
            weight: parseFloat(pricingData.weight),
            length: parseFloat(pricingData.length),
            width: parseFloat(pricingData.width),
            height: parseFloat(pricingData.height),
            quantity: pricingData.quantity
          };
          break;
        case 'mixed':
          endpoint = '/api/functions/cargo_mixed_pricing/route';
          payload = {
            ...payload,
            boxes: [{
              weight: parseFloat(pricingData.weight),
              length: parseFloat(pricingData.length),
              width: parseFloat(pricingData.width),
              height: parseFloat(pricingData.height)
            }]
          };
          break;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      setPricingResult({ type, data: result });
    } catch (error) {
      console.error('Error calculating pricing:', error);
      setPricingResult({ type, error: 'Failed to calculate pricing' });
    } finally {
      setIsLoading(false);
    }
  };

  const renderPricingResult = () => {
    if (!pricingResult) return null;

    if (pricingResult.error) {
      return (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center text-red-600">
              <AlertCircle className="mr-2 h-5 w-5" />
              Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">{pricingResult.error}</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center text-green-600">
            <CheckCircle className="mr-2 h-5 w-5" />
            Pricing Result ({pricingResult.type})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto">
            {JSON.stringify(pricingResult.data, null, 2)}
          </pre>
        </CardContent>
      </Card>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Cargo Tools</h1>
            <p className="text-muted-foreground">
              Test and manage cargo pricing functions and tools
            </p>
          </div>
        </div>

        <Tabs defaultValue="pricing" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pricing">Pricing Calculator</TabsTrigger>
            <TabsTrigger value="regions">Regions</TabsTrigger>
            <TabsTrigger value="carriers">Carriers</TabsTrigger>
            <TabsTrigger value="restrictions">Restrictions</TabsTrigger>
          </TabsList>

          <TabsContent value="pricing" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Input Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calculator className="mr-2 h-5 w-5" />
                    Pricing Calculator
                  </CardTitle>
                  <CardDescription>
                    Test cargo pricing functions with different parameters
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="content">Content Description</Label>
                    <Input
                      id="content"
                      placeholder="e.g., Electronics, Clothing, General Cargo"
                      value={pricingData.content}
                      onChange={(e) => handleInputChange('content', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="country">Destination Country</Label>
                    <Input
                      id="country"
                      placeholder="e.g., Germany, USA, UAE"
                      value={pricingData.country}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="weight">Weight (kg)</Label>
                      <Input
                        id="weight"
                        type="number"
                        step="0.1"
                        placeholder="5.2"
                        value={pricingData.weight}
                        onChange={(e) => handleInputChange('weight', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="1"
                        value={pricingData.quantity}
                        onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 1)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="length">Length (cm)</Label>
                      <Input
                        id="length"
                        type="number"
                        placeholder="50"
                        value={pricingData.length}
                        onChange={(e) => handleInputChange('length', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="width">Width (cm)</Label>
                      <Input
                        id="width"
                        type="number"
                        placeholder="40"
                        value={pricingData.width}
                        onChange={(e) => handleInputChange('width', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="height">Height (cm)</Label>
                      <Input
                        id="height"
                        type="number"
                        placeholder="30"
                        value={pricingData.height}
                        onChange={(e) => handleInputChange('height', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex space-x-2 pt-4">
                    <Button 
                      onClick={() => calculatePricing('draft')}
                      disabled={isLoading || !pricingData.content || !pricingData.country || !pricingData.weight}
                      className="flex-1"
                    >
                      Draft Pricing
                    </Button>
                    <Button 
                      onClick={() => calculatePricing('multi')}
                      disabled={isLoading || !pricingData.content || !pricingData.country || !pricingData.weight || !pricingData.length}
                      className="flex-1"
                    >
                      Multi Pricing
                    </Button>
                    <Button 
                      onClick={() => calculatePricing('mixed')}
                      disabled={isLoading || !pricingData.content || !pricingData.country || !pricingData.weight || !pricingData.length}
                      className="flex-1"
                    >
                      Mixed Pricing
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Result Display */}
              <div className="space-y-4">
                {renderPricingResult()}
                
                {/* Info Card */}
                <Card className="border-blue-200">
                  <CardHeader>
                    <CardTitle className="flex items-center text-blue-600">
                      <Info className="mr-2 h-5 w-5" />
                      Function Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div>
                      <strong>Draft Pricing:</strong> Calculate initial pricing based on weight only
                    </div>
                    <div>
                      <strong>Multi Pricing:</strong> Get quotes from multiple carriers with dimensions
                    </div>
                    <div>
                      <strong>Mixed Pricing:</strong> Calculate pricing for boxes with different dimensions
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="regions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="mr-2 h-5 w-5" />
                  Shipping Regions
                </CardTitle>
                <CardDescription>
                  Manage shipping regions and country mappings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Europe Zone 1</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div>Germany, France, Netherlands</div>
                        <div>Belgium, Austria, Denmark</div>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">North America</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div>USA, Canada</div>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Middle East</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div>UAE, Saudi Arabia, Qatar</div>
                        <div>Kuwait, Bahrain, Oman</div>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="carriers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Truck className="mr-2 h-5 w-5" />
                  Carrier Information
                </CardTitle>
                <CardDescription>
                  View and manage shipping carrier details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center">
                        <Badge className="bg-amber-100 text-amber-800 mr-2">UPS</Badge>
                        UPS Express
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div>Service: Express Worldwide</div>
                      <div>Transit: 1-3 business days</div>
                      <div>Max Weight: 70kg per package</div>
                      <div>Max Dimensions: 175cm any side</div>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center">
                        <Badge className="bg-red-100 text-red-800 mr-2">DHL</Badge>
                        DHL Express
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div>Service: Express Worldwide</div>
                      <div>Transit: 1-3 business days</div>
                      <div>Max Weight: 70kg per package</div>
                      <div>Max Dimensions: 175cm any side</div>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center">
                        <Badge className="bg-blue-100 text-blue-800 mr-2">ARAMEX</Badge>
                        Aramex
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div>Service: International Express</div>
                      <div>Transit: 2-5 business days</div>
                      <div>Max Weight: 50kg per package</div>
                      <div>Max Dimensions: 150cm any side</div>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="restrictions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertCircle className="mr-2 h-5 w-5" />
                  Shipping Restrictions
                </CardTitle>
                <CardDescription>
                  View prohibited and restricted items
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 lg:grid-cols-2">
                  <div>
                    <h3 className="font-semibold mb-3 text-red-600">Prohibited Items</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        <span>Alcoholic beverages</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        <span>Weapons and ammunition</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        <span>Explosive materials</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        <span>Illegal drugs</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        <span>Live animals</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        <span>Food and beverages</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-3 text-yellow-600">Restricted Items</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <Info className="h-4 w-4 text-yellow-500" />
                        <span>Branded products (require invoice)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Info className="h-4 w-4 text-yellow-500" />
                        <span>Cosmetic products (require MSDS)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Info className="h-4 w-4 text-yellow-500" />
                        <span>Chemical substances (require documentation)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Info className="h-4 w-4 text-yellow-500" />
                        <span>Electronics (certain restrictions apply)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
