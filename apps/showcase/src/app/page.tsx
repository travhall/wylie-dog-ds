import { Button } from "@wyliedog/ui/button";
import { Badge } from "@wyliedog/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@wyliedog/ui/card";
import { Input } from "@wyliedog/ui/input";
import { Label } from "@wyliedog/ui/label";
import { Textarea } from "@wyliedog/ui/textarea";
import { Checkbox } from "@wyliedog/ui/checkbox";
import { Switch } from "@wyliedog/ui/switch";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@wyliedog/ui/select";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Wylie Dog Design System
          </h1>
          <p className="text-lg text-gray-600">
            Showcase of components with OKLCH colors and modern design tokens
          </p>
        </div>

        {/* Buttons */}
        <Card>
          <CardHeader>
            <CardTitle>Buttons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
            </div>
            <div className="flex flex-wrap gap-4 mt-4">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
            </div>
          </CardContent>
        </Card>

        {/* Form Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Form Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Input Fields */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="Enter your email" 
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="message" required>Message</Label>
                  <Textarea 
                    id="message" 
                    placeholder="Enter your message"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="country">Country</Label>
                  <Select>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select a country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="us">United States</SelectItem>
                      <SelectItem value="ca">Canada</SelectItem>
                      <SelectItem value="uk">United Kingdom</SelectItem>
                      <SelectItem value="de">Germany</SelectItem>
                      <SelectItem value="fr">France</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Checkboxes and Switches */}
              <div className="space-y-4">
                <div className="space-y-3">
                  <h3 className="font-medium">Preferences</h3>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox id="newsletter" />
                    <Label htmlFor="newsletter">Subscribe to newsletter</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox id="terms" />
                    <Label htmlFor="terms" required>Accept terms and conditions</Label>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-medium">Settings</h3>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="notifications">Email notifications</Label>
                    <Switch id="notifications" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="dark-mode">Dark mode</Label>
                    <Switch id="dark-mode" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Component Sizes */}
        <Card>
          <CardHeader>
            <CardTitle>Component Sizes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-medium mb-3">Small</h3>
                <div className="space-y-3">
                  <Button size="sm" className="w-full">Small Button</Button>
                  <Input size="sm" placeholder="Small input" />
                  <div className="flex items-center space-x-2">
                    <Checkbox size="sm" id="small-check" />
                    <Label htmlFor="small-check" size="sm">Small checkbox</Label>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label size="sm">Small switch</Label>
                    <Switch size="sm" />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-3">Medium (Default)</h3>
                <div className="space-y-3">
                  <Button className="w-full">Medium Button</Button>
                  <Input placeholder="Medium input" />
                  <div className="flex items-center space-x-2">
                    <Checkbox id="medium-check" />
                    <Label htmlFor="medium-check">Medium checkbox</Label>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Medium switch</Label>
                    <Switch />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-3">Large</h3>
                <div className="space-y-3">
                  <Button size="lg" className="w-full">Large Button</Button>
                  <Input size="lg" placeholder="Large input" />
                  <div className="flex items-center space-x-2">
                    <Checkbox size="lg" id="large-check" />
                    <Label htmlFor="large-check" size="lg">Large checkbox</Label>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label size="lg">Large switch</Label>
                    <Switch size="lg" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error States */}
        <Card>
          <CardHeader>
            <CardTitle>Error States</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="error-input" error>Username (with error)</Label>
                <Input 
                  id="error-input" 
                  error 
                  placeholder="This field has an error"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="error-textarea" error>Description (with error)</Label>
                <Textarea 
                  id="error-textarea" 
                  error 
                  placeholder="This field has an error"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="error-select" error>Category (with error)</Label>
                <Select>
                  <SelectTrigger error className="mt-1">
                    <SelectValue placeholder="This field has an error" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="option1">Option 1</SelectItem>
                    <SelectItem value="option2">Option 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="error-checkbox" error />
                <Label htmlFor="error-checkbox" error>Checkbox with error</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* OKLCH Color Demo */}
        <Card>
          <CardHeader>
            <CardTitle>OKLCH Color System</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-500 text-white p-4 rounded text-center">
                <div className="font-medium">Blue 500</div>
                <div className="text-xs opacity-90">OKLCH Colors</div>
              </div>
              <div className="bg-green-500 text-white p-4 rounded text-center">
                <div className="font-medium">Green 500</div>
                <div className="text-xs opacity-90">Perceptual Uniform</div>
              </div>
              <div className="bg-red-500 text-white p-4 rounded text-center">
                <div className="font-medium">Red 500</div>
                <div className="text-xs opacity-90">P3 Gamut</div>
              </div>
              <div className="bg-purple-500 text-white p-4 rounded text-center">
                <div className="font-medium">Purple 500</div>
                <div className="text-xs opacity-90">Future Ready</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}