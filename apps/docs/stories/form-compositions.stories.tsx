import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "@wyliedog/ui/button";
import { Input } from "@wyliedog/ui/input";
import { Label } from "@wyliedog/ui/label";
import { Textarea } from "@wyliedog/ui/textarea";
import { Checkbox } from "@wyliedog/ui/checkbox";
import { Switch } from "@wyliedog/ui/switch";
import { Badge } from "@wyliedog/ui/badge";
import { Separator } from "@wyliedog/ui/separator";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@wyliedog/ui/select";
import { RadioGroup, RadioGroupItem } from "@wyliedog/ui/radio-group";
import { Card, CardHeader, CardTitle, CardContent } from "@wyliedog/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@wyliedog/ui/tabs";
import { useState } from "react";

const meta: Meta = {
  title: "Examples/Form Compositions",
  parameters: { 
    layout: "centered",
    docs: {
      description: {
        component: 'Complete form examples showcasing how all Wylie Dog components work together in real-world scenarios.'
      }
    }
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const ContactForm: Story = {
  render: () => (
    <Card className="w-[500px]">
      <CardHeader>
        <CardTitle>Contact Us</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="first-name" required>First Name</Label>
            <Input id="first-name" placeholder="John" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="last-name" required>Last Name</Label>
            <Input id="last-name" placeholder="Doe" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" required>Email Address</Label>
          <Input id="email" type="email" placeholder="john@example.com" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="company">Company</Label>
          <Input id="company" placeholder="Acme Corp" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="inquiry-type">Type of Inquiry</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select inquiry type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sales">Sales</SelectItem>
              <SelectItem value="support">Support</SelectItem>
              <SelectItem value="partnership">Partnership</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="message" required>Message</Label>
          <Textarea 
            id="message" 
            placeholder="Tell us how we can help you..."
            className="min-h-[120px]"
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-start space-x-2">
            <Checkbox id="consent" className="mt-1" />
            <Label htmlFor="consent" required className="leading-5">
              I agree to be contacted regarding my inquiry
            </Label>
          </div>
          
          <div className="flex items-start space-x-2">
            <Checkbox id="newsletter" className="mt-1" />
            <Label htmlFor="newsletter" className="leading-5">
              Subscribe to our newsletter for updates and insights
            </Label>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button className="flex-1">Send Message</Button>
          <Button variant="ghost">Cancel</Button>
        </div>
      </CardContent>
    </Card>
  ),
};

export const MultiStepForm: Story = {
  render: () => {
    const [activeTab, setActiveTab] = useState("account");
    
    return (
      <Card className="w-[600px]">
        <CardHeader>
          <CardTitle>Create Account</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
            </TabsList>
            
            <TabsContent value="account" className="space-y-6 mt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" required>Username</Label>
                  <Input id="username" placeholder="johndoe" />
                  <p className="text-xs text-gray-500">This will be your unique identifier</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" required>Email</Label>
                  <Input id="email" type="email" placeholder="john@example.com" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password" required>Password</Label>
                    <Input id="password" type="password" placeholder="••••••••" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password" required>Confirm Password</Label>
                    <Input id="confirm-password" type="password" placeholder="••••••••" />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox id="terms" />
                  <Label htmlFor="terms" required>I agree to the Terms of Service</Label>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={() => setActiveTab("profile")}>Next: Profile</Button>
              </div>
            </TabsContent>
            
            <TabsContent value="profile" className="space-y-6 mt-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first-name">First Name</Label>
                    <Input id="first-name" placeholder="John" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last-name">Last Name</Label>
                    <Input id="last-name" placeholder="Doe" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea id="bio" placeholder="Tell us about yourself..." />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="us">United States</SelectItem>
                        <SelectItem value="ca">Canada</SelectItem>
                        <SelectItem value="uk">United Kingdom</SelectItem>
                        <SelectItem value="au">Australia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pst">Pacific Time</SelectItem>
                        <SelectItem value="mst">Mountain Time</SelectItem>
                        <SelectItem value="cst">Central Time</SelectItem>
                        <SelectItem value="est">Eastern Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab("account")}>
                  Previous
                </Button>
                <Button onClick={() => setActiveTab("preferences")}>
                  Next: Preferences
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="preferences" className="space-y-6 mt-6">
              <div className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Notification Preferences</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email-notifications">Email notifications</Label>
                      <Switch id="email-notifications" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="push-notifications">Push notifications</Label>
                      <Switch id="push-notifications" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="sms-notifications">SMS notifications</Label>
                      <Switch id="sms-notifications" />
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h4 className="font-medium">Privacy Settings</h4>
                  <RadioGroup defaultValue="public">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="public" id="public" />
                      <Label htmlFor="public">Public profile</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="friends" id="friends" />
                      <Label htmlFor="friends">Friends only</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="private" id="private" />
                      <Label htmlFor="private">Private</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
              
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab("profile")}>
                  Previous
                </Button>
                <Button>Create Account</Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    );
  },
};

export const FormWithValidation: Story = {
  render: () => {
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitted, setSubmitted] = useState(false);
    
    const validate = (formData: FormData) => {
      const newErrors: Record<string, string> = {};
      
      if (!formData.get('email')) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.get('email') as string)) {
        newErrors.email = 'Please enter a valid email';
      }
      
      if (!formData.get('password')) {
        newErrors.password = 'Password is required';
      } else if ((formData.get('password') as string).length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }
      
      if (!formData.get('confirm-password')) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.get('password') !== formData.get('confirm-password')) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
      
      return newErrors;
    };
    
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const formData = new FormData(e.target as HTMLFormElement);
      const newErrors = validate(formData);
      
      setErrors(newErrors);
      setSubmitted(true);
      
      if (Object.keys(newErrors).length === 0) {
        alert('Form submitted successfully!');
      }
    };
    
    return (
      <Card className="w-[500px]">
        <CardHeader>
          <CardTitle>Sign Up</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" required>Email</Label>
              <Input 
                id="email" 
                name="email"
                type="email" 
                placeholder="Enter your email"
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" required>Password</Label>
              <Input 
                id="password" 
                name="password"
                type="password" 
                placeholder="Create a password"
                className={errors.password ? 'border-red-500' : ''}
              />
              {errors.password && (
                <p className="text-sm text-red-600">{errors.password}</p>
              )}
              <p className="text-xs text-gray-500">
                Must be at least 8 characters long
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirm-password" required>Confirm Password</Label>
              <Input 
                id="confirm-password" 
                name="confirm-password"
                type="password" 
                placeholder="Confirm your password"
                className={errors.confirmPassword ? 'border-red-500' : ''}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select name="role">
                <SelectTrigger>
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="developer">Developer</SelectItem>
                  <SelectItem value="designer">Designer</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="terms" name="terms" />
                <Label htmlFor="terms" required>
                  I agree to the Terms of Service and Privacy Policy
                </Label>
              </div>
            </div>
            
            {submitted && Object.keys(errors).length === 0 && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-800">
                  ✓ Account created successfully!
                </p>
              </div>
            )}
            
            <Button type="submit" className="w-full">
              Create Account
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  },
};

export const UserPreferences: Story = {
  render: () => (
    <Card className="w-[500px]">
      <CardHeader>
        <CardTitle>Account Preferences</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h4 className="text-sm font-semibold">Profile Information</h4>
          
          <div className="space-y-2">
            <Label htmlFor="display-name">Display Name</Label>
            <Input id="display-name" defaultValue="John Doe" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select defaultValue="pst">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pst">Pacific Time (PST)</SelectItem>
                  <SelectItem value="mst">Mountain Time (MST)</SelectItem>
                  <SelectItem value="cst">Central Time (CST)</SelectItem>
                  <SelectItem value="est">Eastern Time (EST)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select defaultValue="en">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-semibold">Notifications</h4>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-notifications">Email notifications</Label>
                <p className="text-xs text-neutral-600">Get notified about important updates</p>
              </div>
              <Switch id="email-notifications" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="push-notifications">Push notifications</Label>
                <p className="text-xs text-neutral-600">Receive browser notifications</p>
              </div>
              <Switch id="push-notifications" />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="marketing-emails">Marketing emails</Label>
                <p className="text-xs text-neutral-600">Product updates and promotions</p>
              </div>
              <Switch id="marketing-emails" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-semibold">Privacy</h4>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox id="profile-public" />
              <Label htmlFor="profile-public">Make my profile public</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox id="analytics" defaultChecked />
              <Label htmlFor="analytics">Share usage analytics</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox id="third-party" />
              <Label htmlFor="third-party">Allow third-party integrations</Label>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button className="flex-1">Save Changes</Button>
          <Button variant="ghost">Reset</Button>
        </div>
      </CardContent>
    </Card>
  ),
};

export const ProjectCreation: Story = {
  render: () => (
    <Card className="w-[600px]">
      <CardHeader>
        <CardTitle>Create New Project</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="project-name" required>Project Name</Label>
          <Input id="project-name" placeholder="My Awesome Project" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="project-description">Description</Label>
          <Textarea 
            id="project-description"
            placeholder="Brief description of your project..."
            size="sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="project-type" required>Project Type</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="web">Web Application</SelectItem>
                <SelectItem value="mobile">Mobile App</SelectItem>
                <SelectItem value="desktop">Desktop App</SelectItem>
                <SelectItem value="api">API Service</SelectItem>
                <SelectItem value="library">Library/Package</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="framework">Framework</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Choose framework" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="react">React</SelectItem>
                <SelectItem value="vue">Vue.js</SelectItem>
                <SelectItem value="angular">Angular</SelectItem>
                <SelectItem value="svelte">Svelte</SelectItem>
                <SelectItem value="vanilla">Vanilla JS</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="visibility">Visibility</Label>
            <Select defaultValue="private">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="private">Private</SelectItem>
                <SelectItem value="team">Team Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="license">License</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select license" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mit">MIT</SelectItem>
                <SelectItem value="apache">Apache 2.0</SelectItem>
                <SelectItem value="gpl">GPL v3</SelectItem>
                <SelectItem value="bsd">BSD 3-Clause</SelectItem>
                <SelectItem value="none">No License</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="team-size">Team Size</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="solo">Solo (1 person)</SelectItem>
                <SelectItem value="small">Small (2-5)</SelectItem>
                <SelectItem value="medium">Medium (6-15)</SelectItem>
                <SelectItem value="large">Large (16+)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-semibold">Project Features</h4>
          
          <div className="grid grid-cols-2 gap-y-2 gap-x-4">
            <div className="flex items-center space-x-2">
              <Checkbox id="feature-auth" />
              <Label htmlFor="feature-auth">Authentication</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox id="feature-db" />
              <Label htmlFor="feature-db">Database</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox id="feature-api" defaultChecked />
              <Label htmlFor="feature-api">REST API</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox id="feature-tests" defaultChecked />
              <Label htmlFor="feature-tests">Unit Tests</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox id="feature-ci" />
              <Label htmlFor="feature-ci">CI/CD Pipeline</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox id="feature-docs" />
              <Label htmlFor="feature-docs">Documentation</Label>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="auto-deploy">Auto-deploy to staging</Label>
              <p className="text-xs text-neutral-600">Automatically deploy commits to staging environment</p>
            </div>
            <Switch id="auto-deploy" />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notifications">Build notifications</Label>
              <p className="text-xs text-neutral-600">Get notified about build status</p>
            </div>
            <Switch id="notifications" defaultChecked />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button className="flex-1">Create Project</Button>
          <Button variant="secondary">Save as Template</Button>
          <Button variant="ghost">Cancel</Button>
        </div>
      </CardContent>
    </Card>
  ),
};

export const PaymentForm: Story = {
  render: () => (
    <Card className="w-[500px]">
      <CardHeader>
        <CardTitle>Payment Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium">Pro Plan</p>
              <p className="text-sm text-gray-600">Monthly subscription</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-lg">$29.99</p>
              <Badge variant="success">Save 20%</Badge>
            </div>
          </div>
        </div>
        
        <Separator />
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="card-number" required>Card Number</Label>
            <Input id="card-number" placeholder="1234 5678 9012 3456" />
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2 col-span-2">
              <Label htmlFor="expiry" required>Expiry Date</Label>
              <Input id="expiry" placeholder="MM/YY" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cvc" required>CVC</Label>
              <Input id="cvc" placeholder="123" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="cardholder-name" required>Cardholder Name</Label>
            <Input id="cardholder-name" placeholder="John Doe" />
          </div>
        </div>
        
        <Separator />
        
        <div className="space-y-4">
          <h4 className="font-medium">Billing Address</h4>
          
          <div className="space-y-2">
            <Label htmlFor="billing-country" required>Country</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="us">United States</SelectItem>
                <SelectItem value="ca">Canada</SelectItem>
                <SelectItem value="uk">United Kingdom</SelectItem>
                <SelectItem value="au">Australia</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="billing-city">City</Label>
              <Input id="billing-city" placeholder="San Francisco" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="billing-zip">ZIP Code</Label>
              <Input id="billing-zip" placeholder="94102" />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox id="save-payment" />
            <Label htmlFor="save-payment">Save payment method for future purchases</Label>
          </div>
        </div>
        
        <div className="flex gap-3 pt-4">
          <Button className="flex-1">Complete Payment</Button>
          <Button variant="ghost">Cancel</Button>
        </div>
      </CardContent>
    </Card>
  ),
};
