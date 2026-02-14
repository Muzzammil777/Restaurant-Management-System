import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Separator } from '@/app/components/ui/separator';
import { Wrench, Save, Upload, MapPin, Phone, Mail, Clock, Globe } from 'lucide-react';
import { toast } from 'sonner';

interface SystemConfig {
  restaurantName: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  contactNumber: string;
  email: string;
  website: string;
  operatingHours: string;
  currency: string;
  timezone: string;
  language: string;
  dateFormat: string;
  timeFormat: string;
}

const STORAGE_KEY = 'rms_system_config';

export function SystemConfiguration() {
  const [config, setConfig] = useState<SystemConfig>({
    restaurantName: 'Restaurant Management System',
    address: '123, MG Road, Koramangala',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560095',
    contactNumber: '+91 98765 43210',
    email: 'contact@restaurant.com',
    website: 'www.restaurant.com',
    operatingHours: '10:00 AM - 11:00 PM',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    language: 'English',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12-hour',
  });

  // Load configuration from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setConfig(JSON.parse(stored));
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    toast.success('System configuration saved successfully!');
  };

  const handleLogoUpload = () => {
    toast.success('Logo upload functionality will be connected with backend');
  };

  return (
    <div className="bg-settings-module min-h-screen space-y-6 p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>System Configuration</CardTitle>
                <CardDescription>Configure restaurant details and system preferences</CardDescription>
              </div>
            </div>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save Configuration
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Restaurant Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Restaurant Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="restaurant-name">Restaurant Name</Label>
                <Input
                  id="restaurant-name"
                  value={config.restaurantName}
                  onChange={(e) => setConfig({ ...config, restaurantName: e.target.value })}
                  placeholder="Enter restaurant name"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Street Address</Label>
                <Input
                  id="address"
                  value={config.address}
                  onChange={(e) => setConfig({ ...config, address: e.target.value })}
                  placeholder="Building, Street, Locality"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={config.city}
                  onChange={(e) => setConfig({ ...config, city: e.target.value })}
                  placeholder="City"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={config.state}
                  onChange={(e) => setConfig({ ...config, state: e.target.value })}
                  placeholder="State"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pincode">Pincode</Label>
                <Input
                  id="pincode"
                  value={config.pincode}
                  onChange={(e) => setConfig({ ...config, pincode: e.target.value })}
                  placeholder="6-digit pincode"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo">Restaurant Logo</Label>
                <Button variant="outline" className="w-full" onClick={handleLogoUpload}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Logo
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          {/* Contact Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Contact Details</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact-number">Contact Number</Label>
                <Input
                  id="contact-number"
                  value={config.contactNumber}
                  onChange={(e) => setConfig({ ...config, contactNumber: e.target.value })}
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={config.email}
                  onChange={(e) => setConfig({ ...config, email: e.target.value })}
                  placeholder="contact@restaurant.com"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="website">Website URL</Label>
                <Input
                  id="website"
                  value={config.website}
                  onChange={(e) => setConfig({ ...config, website: e.target.value })}
                  placeholder="www.restaurant.com"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="operating-hours">Operating Hours</Label>
                <Input
                  id="operating-hours"
                  value={config.operatingHours}
                  onChange={(e) => setConfig({ ...config, operatingHours: e.target.value })}
                  placeholder="e.g., 10:00 AM - 11:00 PM"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Regional & Localization Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Regional & Localization</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select value={config.currency} onValueChange={(value) => setConfig({ ...config, currency: value })}>
                  <SelectTrigger id="currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INR">₹ Indian Rupee (INR)</SelectItem>
                    <SelectItem value="USD">$ US Dollar (USD)</SelectItem>
                    <SelectItem value="EUR">€ Euro (EUR)</SelectItem>
                    <SelectItem value="GBP">£ British Pound (GBP)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Time Zone</Label>
                <Select value={config.timezone} onValueChange={(value) => setConfig({ ...config, timezone: value })}>
                  <SelectTrigger id="timezone">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST +5:30)</SelectItem>
                    <SelectItem value="America/New_York">America/New York (EST -5:00)</SelectItem>
                    <SelectItem value="Europe/London">Europe/London (GMT +0:00)</SelectItem>
                    <SelectItem value="Asia/Dubai">Asia/Dubai (GST +4:00)</SelectItem>
                    <SelectItem value="Asia/Singapore">Asia/Singapore (SGT +8:00)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">System Language</Label>
                <Select value={config.language} onValueChange={(value) => setConfig({ ...config, language: value })}>
                  <SelectTrigger id="language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Hindi">हिंदी (Hindi)</SelectItem>
                    <SelectItem value="Tamil">தமிழ் (Tamil)</SelectItem>
                    <SelectItem value="Bengali">বাংলা (Bengali)</SelectItem>
                    <SelectItem value="Telugu">తెలుగు (Telugu)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date-format">Date Format</Label>
                <Select value={config.dateFormat} onValueChange={(value) => setConfig({ ...config, dateFormat: value })}>
                  <SelectTrigger id="date-format">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="time-format">Time Format</Label>
                <Select value={config.timeFormat} onValueChange={(value) => setConfig({ ...config, timeFormat: value })}>
                  <SelectTrigger id="time-format">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12-hour">12-hour (AM/PM)</SelectItem>
                    <SelectItem value="24-hour">24-hour</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Save Button at Bottom */}
          <div className="flex justify-end pt-4">
            <Button onClick={handleSave} size="lg">
              <Save className="h-4 w-4 mr-2" />
              Save All Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
