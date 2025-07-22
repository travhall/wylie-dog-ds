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
  SelectValue,
} from "@wyliedog/ui/select";
import { Separator } from "@wyliedog/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@wyliedog/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@wyliedog/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@wyliedog/ui/dropdown-menu";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@wyliedog/ui/sheet";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Wylie Dog Design System
          </h1>
          <p className="text-lg text-gray-600">
            Complete component showcase with OKLCH colors and modern design
            tokens
          </p>
          <div className="flex justify-center gap-2 mt-4">
            <Badge>Form Components</Badge>
            <Badge>Layout Components</Badge>
            <Badge>Interactive Components</Badge>
          </div>
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
                  <Label htmlFor="message" required>
                    Message
                  </Label>
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
                    <Label htmlFor="terms" required>
                      Accept terms and conditions
                    </Label>
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
                  <Button size="sm" className="w-full">
                    Small Button
                  </Button>
                  <Input size="sm" placeholder="Small input" />
                  <div className="flex items-center space-x-2">
                    <Checkbox size="sm" id="small-check" />
                    <Label htmlFor="small-check" size="sm">
                      Small checkbox
                    </Label>
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
                  <Button size="lg" className="w-full">
                    Large Button
                  </Button>
                  <Input size="lg" placeholder="Large input" />
                  <div className="flex items-center space-x-2">
                    <Checkbox size="lg" id="large-check" />
                    <Label htmlFor="large-check" size="lg">
                      Large checkbox
                    </Label>
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
                <Label htmlFor="error-input" error>
                  Username (with error)
                </Label>
                <Input
                  id="error-input"
                  error
                  placeholder="This field has an error"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="error-textarea" error>
                  Description (with error)
                </Label>
                <Textarea
                  id="error-textarea"
                  error
                  placeholder="This field has an error"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="error-select" error>
                  Category (with error)
                </Label>
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
                <Label htmlFor="error-checkbox" error>
                  Checkbox with error
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Tabs Component</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="account" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="account">Account</TabsTrigger>
                <TabsTrigger value="password">Password</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
              <TabsContent value="account" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" defaultValue="John Doe" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" defaultValue="@johndoe" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    defaultValue="I love building great UIs."
                  />
                </div>
              </TabsContent>
              <TabsContent value="password" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="current">Current password</Label>
                  <Input id="current" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new">New password</Label>
                  <Input id="new" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm">Confirm password</Label>
                  <Input id="confirm" type="password" />
                </div>
              </TabsContent>
              <TabsContent value="settings" className="space-y-4 mt-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Email notifications</Label>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Marketing emails</Label>
                    <Switch />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="terms" />
                    <Label htmlFor="terms">Accept terms and conditions</Label>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Dialog and Sheet Demo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Dialog Demo */}
          <Card>
            <CardHeader>
              <CardTitle>Dialog Component</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Dialog>
                <DialogTrigger asChild>
                  <Button>Open Dialog</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Project</DialogTitle>
                    <DialogDescription>
                      Fill out the form below to create a new project. Click
                      save when you're done.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="project-name">Project Name</Label>
                      <Input
                        id="project-name"
                        placeholder="My Awesome Project"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="project-desc">Description</Label>
                      <Textarea
                        id="project-desc"
                        placeholder="Brief description..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Project Type</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="web">Web App</SelectItem>
                          <SelectItem value="mobile">Mobile App</SelectItem>
                          <SelectItem value="desktop">Desktop App</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="ghost">Cancel</Button>
                    <Button>Create Project</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="destructive">Delete Account</Button>
                </DialogTrigger>
                <DialogContent size="sm">
                  <DialogHeader>
                    <DialogTitle>Are you absolutely sure?</DialogTitle>
                    <DialogDescription>
                      This action cannot be undone. This will permanently delete
                      your account and remove your data from our servers.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="ghost">Cancel</Button>
                    <Button variant="destructive">Delete Account</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Sheet Demo */}
          <Card>
            <CardHeader>
              <CardTitle>Sheet Component</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost">From Right</Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Account Settings</SheetTitle>
                      <SheetDescription>
                        Make changes to your account here. Click save when
                        you're done.
                      </SheetDescription>
                    </SheetHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="sheet-name">Name</Label>
                        <Input id="sheet-name" defaultValue="John Doe" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sheet-email">Email</Label>
                        <Input
                          id="sheet-email"
                          defaultValue="john@example.com"
                        />
                      </div>
                      <Separator />
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label>Notifications</Label>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Dark Mode</Label>
                          <Switch />
                        </div>
                      </div>
                    </div>
                    <SheetFooter>
                      <SheetClose asChild>
                        <Button>Save changes</Button>
                      </SheetClose>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>

                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost">From Left</Button>
                  </SheetTrigger>
                  <SheetContent side="left">
                    <SheetHeader>
                      <SheetTitle>Navigation</SheetTitle>
                      <SheetDescription>
                        Site navigation and quick actions
                      </SheetDescription>
                    </SheetHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                        >
                          Dashboard
                        </Button>
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                        >
                          Projects
                        </Button>
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                        >
                          Settings
                        </Button>
                      </div>
                      <Separator />
                      <div className="space-y-2">
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                        >
                          Help
                        </Button>
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                        >
                          Feedback
                        </Button>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dropdown Menu Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Dropdown Menu Component</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              {/* Simple Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost">User Menu</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Billing</DropdownMenuItem>
                  <DropdownMenuItem>Team</DropdownMenuItem>
                  <DropdownMenuItem>Subscription</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Log out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Dropdown with Checkboxes */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost">View Options</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>View</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem checked>
                    Show completed
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem>
                    Show archived
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem checked>
                    Show drafts
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Dropdown with Radio Group */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost">Sort By</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup value="recent">
                    <DropdownMenuRadioItem value="recent">
                      Most recent
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="name">
                      Name
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="size">
                      File size
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>

        {/* Separators Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Separator Component</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium">Horizontal Separators</h4>
                <div className="space-y-2 mt-2">
                  <p className="text-sm text-gray-600">Above separator</p>
                  <Separator />
                  <p className="text-sm text-gray-600">Below separator</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium">Vertical Separators</h4>
                <div className="flex items-center space-x-4 mt-2">
                  <span className="text-sm">Left</span>
                  <Separator orientation="vertical" className="h-6" />
                  <span className="text-sm">Center</span>
                  <Separator orientation="vertical" className="h-6" />
                  <span className="text-sm">Right</span>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium">In Lists</h4>
                <div className="mt-2">
                  <div className="py-2">Profile Settings</div>
                  <Separator />
                  <div className="py-2">Privacy Settings</div>
                  <Separator />
                  <div className="py-2">Notification Settings</div>
                  <Separator />
                  <div className="py-2">Account Settings</div>
                </div>
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
