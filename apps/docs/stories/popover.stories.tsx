import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@wyliedog/ui/popover";
import { Button } from "@wyliedog/ui/button";
import { Input } from "@wyliedog/ui/input";
import { Label } from "@wyliedog/ui/label";
import { Separator } from "@wyliedog/ui/separator";
import { SettingsIcon, HelpCircleIcon, FilterIcon, CalendarIcon, MoreHorizontalIcon } from "lucide-react";

const meta: Meta<typeof Popover> = {
  title: "Components/Popover",
  component: Popover,
  parameters: { 
    layout: "centered",
    docs: {
      description: {
        component: 'Click-triggered content overlays for displaying additional information, forms, or controls. Built on Radix UI primitives with flexible positioning and smooth animations.'
      }
    }
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Open popover</Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Dimensions</h4>
            <p className="text-sm text-muted-foreground">
              Set the dimensions for the layer.
            </p>
          </div>
          <div className="grid gap-2">
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="width">Width</Label>
              <Input
                id="width"
                defaultValue="100%"
                className="col-span-2 h-8"
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="maxWidth">Max. width</Label>
              <Input
                id="maxWidth"
                defaultValue="300px"
                className="col-span-2 h-8"
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="height">Height</Label>
              <Input
                id="height"
                defaultValue="25px"
                className="col-span-2 h-8"
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

export const WithForm: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button>Add User</Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Add New User</h4>
            <p className="text-sm text-neutral-600">
              Enter the user details below.
            </p>
          </div>
          <div className="grid gap-3">
            <div className="space-y-1">
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" placeholder="John" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" placeholder="Doe" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="john@example.com" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="role">Role</Label>
              <select id="role" className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm">
                <option>User</option>
                <option>Admin</option>
                <option>Editor</option>
              </select>
            </div>
            <div className="flex gap-2 pt-2">
              <Button size="sm" className="flex-1">Add User</Button>
              <Button size="sm" variant="outline" className="flex-1">Cancel</Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
  parameters: {
    docs: {
      description: {
        story: "Popover with a complete form for data entry."
      }
    }
  }
};

export const Settings: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <SettingsIcon className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56">
        <div className="grid gap-3">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Settings</h4>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications" className="text-sm">Notifications</Label>
              <input type="checkbox" id="notifications" defaultChecked className="rounded" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="darkMode" className="text-sm">Dark Mode</Label>
              <input type="checkbox" id="darkMode" className="rounded" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="autoSave" className="text-sm">Auto Save</Label>
              <input type="checkbox" id="autoSave" defaultChecked className="rounded" />
            </div>
          </div>
          <Separator />
          <div className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="language" className="text-sm">Language</Label>
              <select id="language" className="w-full px-2 py-1 border border-neutral-300 rounded text-sm">
                <option>English</option>
                <option>Spanish</option>
                <option>French</option>
                <option>German</option>
              </select>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
  parameters: {
    docs: {
      description: {
        story: "Settings panel with toggles and dropdown options."
      }
    }
  }
};

export const FilterMenu: Story = {
  render: () => (
    <div className="space-y-4">
      <p className="text-sm text-neutral-600">Filter your search results:</p>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">
            <FilterIcon className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="grid gap-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">Filter Options</h4>
              <p className="text-sm text-neutral-600">
                Refine your search results
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Category</Label>
                <div className="space-y-1">
                  <label className="flex items-center space-x-2 text-sm">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span>Electronics</span>
                  </label>
                  <label className="flex items-center space-x-2 text-sm">
                    <input type="checkbox" className="rounded" />
                    <span>Clothing</span>
                  </label>
                  <label className="flex items-center space-x-2 text-sm">
                    <input type="checkbox" className="rounded" />
                    <span>Books</span>
                  </label>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">Price Range</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="Min" size="sm" />
                  <Input placeholder="Max" size="sm" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">Rating</Label>
                <div className="space-y-1">
                  <label className="flex items-center space-x-2 text-sm">
                    <input type="radio" name="rating" className="rounded-full" />
                    <span>4+ Stars</span>
                  </label>
                  <label className="flex items-center space-x-2 text-sm">
                    <input type="radio" name="rating" className="rounded-full" />
                    <span>3+ Stars</span>
                  </label>
                  <label className="flex items-center space-x-2 text-sm">
                    <input type="radio" name="rating" defaultChecked className="rounded-full" />
                    <span>Any Rating</span>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button size="sm" className="flex-1">Apply Filters</Button>
              <Button size="sm" variant="outline">Clear</Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Complex filter interface with multiple input types."
      }
    }
  }
};

export const Positioning: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-8 p-8">
      <div className="space-y-4">
        <p className="text-sm font-medium">Top positioning:</p>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">Open (top)</Button>
          </PopoverTrigger>
          <PopoverContent side="top" className="w-64">
            <p className="text-sm">
              This popover appears above the trigger button.
            </p>
          </PopoverContent>
        </Popover>
      </div>
      
      <div className="space-y-4">
        <p className="text-sm font-medium">Bottom positioning:</p>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">Open (bottom)</Button>
          </PopoverTrigger>
          <PopoverContent side="bottom" className="w-64">
            <p className="text-sm">
              This popover appears below the trigger button.
            </p>
          </PopoverContent>
        </Popover>
      </div>
      
      <div className="space-y-4">
        <p className="text-sm font-medium">Left positioning:</p>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">Open (left)</Button>
          </PopoverTrigger>
          <PopoverContent side="left" className="w-64">
            <p className="text-sm">
              This popover appears to the left of the trigger button.
            </p>
          </PopoverContent>
        </Popover>
      </div>
      
      <div className="space-y-4">
        <p className="text-sm font-medium">Right positioning:</p>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">Open (right)</Button>
          </PopoverTrigger>
          <PopoverContent side="right" className="w-64">
            <p className="text-sm">
              This popover appears to the right of the trigger button.
            </p>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Different positioning options for popover placement."
      }
    }
  }
};

export const DatePicker: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">
          <CalendarIcon className="h-4 w-4 mr-2" />
          Select Date
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <div className="p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Select Date</h4>
              <Button variant="ghost" size="sm">Today</Button>
            </div>
            
            <div className="grid grid-cols-7 gap-1 text-center text-sm">
              <div className="p-2 font-medium text-neutral-600">S</div>
              <div className="p-2 font-medium text-neutral-600">M</div>
              <div className="p-2 font-medium text-neutral-600">T</div>
              <div className="p-2 font-medium text-neutral-600">W</div>
              <div className="p-2 font-medium text-neutral-600">T</div>
              <div className="p-2 font-medium text-neutral-600">F</div>
              <div className="p-2 font-medium text-neutral-600">S</div>
              
              {Array.from({ length: 35 }, (_, i) => {
                const day = i - 6;
                const isCurrentMonth = day > 0 && day <= 31;
                const isSelected = day === 15;
                return (
                  <button
                    key={i}
                    className={`p-2 rounded text-sm hover:bg-neutral-100 ${
                      !isCurrentMonth ? 'text-neutral-300' : ''
                    } ${isSelected ? 'bg-blue-500 text-white hover:bg-blue-600' : ''}`}
                  >
                    {isCurrentMonth ? day : ''}
                  </button>
                );
              })}
            </div>
            
            <div className="flex gap-2">
              <Button size="sm" className="flex-1">Confirm</Button>
              <Button size="sm" variant="outline">Cancel</Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
  parameters: {
    docs: {
      description: {
        story: "Custom date picker implementation using popover."
      }
    }
  }
};

export const ActionMenu: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div>
          <h4 className="font-medium">Project Alpha</h4>
          <p className="text-sm text-neutral-600">Last updated 2 hours ago</p>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontalIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-1">
            <div className="space-y-1">
              <button className="w-full text-left px-3 py-2 text-sm hover:bg-neutral-100 rounded">
                Edit Project
              </button>
              <button className="w-full text-left px-3 py-2 text-sm hover:bg-neutral-100 rounded">
                Duplicate
              </button>
              <button className="w-full text-left px-3 py-2 text-sm hover:bg-neutral-100 rounded">
                Export
              </button>
              <Separator className="my-1" />
              <button className="w-full text-left px-3 py-2 text-sm hover:bg-neutral-100 rounded">
                Archive
              </button>
              <button className="w-full text-left px-3 py-2 text-sm hover:bg-red-100 text-red-600 rounded">
                Delete
              </button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Action menu popover for contextual operations."
      }
    }
  }
};

export const Help: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Label htmlFor="password">Password</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="p-1">
              <HelpCircleIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-2">
              <h4 className="font-medium">Password Requirements</h4>
              <ul className="text-sm space-y-1 text-neutral-600">
                <li>• At least 8 characters long</li>
                <li>• Contains at least one uppercase letter</li>
                <li>• Contains at least one lowercase letter</li>
                <li>• Contains at least one number</li>
                <li>• Contains at least one special character (!@#$%^&*)</li>
              </ul>
              <p className="text-xs text-neutral-500 pt-2">
                A strong password helps protect your account from unauthorized access.
              </p>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <Input 
        id="password" 
        type="password" 
        placeholder="Enter your password"
        className="w-64"
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Help popover providing contextual assistance for form fields."
      }
    }
  }
};

export const Accessibility: Story = {
  render: () => (
    <div className="space-y-6 max-w-md">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Accessibility Features</h3>
        <p className="text-sm text-neutral-600">
          Popovers support keyboard navigation. Use Tab to focus triggers,
          Enter/Space to open, Escape to close, and Tab to navigate within.
        </p>
      </div>
      
      <Popover>
        <PopoverTrigger asChild>
          <Button aria-describedby="accessible-description">
            Account Settings
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" role="dialog" aria-labelledby="settings-title">
          <div className="space-y-4">
            <h4 id="settings-title" className="font-medium">
              Account Settings
            </h4>
            
            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="display-name">Display Name</Label>
                <Input 
                  id="display-name" 
                  defaultValue="John Doe"
                  aria-describedby="name-help"
                />
                <p id="name-help" className="text-xs text-neutral-600">
                  This name will be visible to other users
                </p>
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="email-settings">Email</Label>
                <Input 
                  id="email-settings" 
                  type="email"
                  defaultValue="john@example.com"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="email-notifications" className="text-sm">
                  Email Notifications
                </Label>
                <input 
                  type="checkbox" 
                  id="email-notifications" 
                  defaultChecked 
                  className="rounded"
                  aria-describedby="notification-help"
                />
              </div>
              <p id="notification-help" className="text-xs text-neutral-600">
                Receive updates about your account activity
              </p>
            </div>
            
            <div className="flex gap-2 pt-2">
              <Button size="sm">Save Changes</Button>
              <Button size="sm" variant="outline">Cancel</Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      
      <p id="accessible-description" className="text-xs text-neutral-600">
        Click to open account settings panel
      </p>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Demonstrates comprehensive accessibility features including ARIA attributes and keyboard navigation."
      }
    }
  }
};