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
import { Alert, AlertTitle, AlertDescription } from "@wyliedog/ui/alert";
import { Avatar, AvatarImage, AvatarFallback } from "@wyliedog/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@wyliedog/ui/tooltip";
import { Progress } from "@wyliedog/ui/progress";
import { Skeleton } from "@wyliedog/ui/skeleton";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@wyliedog/ui/accordion";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@wyliedog/ui/breadcrumb";
import { RadioGroup, RadioGroupItem } from "@wyliedog/ui/radio-group";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@wyliedog/ui/alert-dialog";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@wyliedog/ui/hover-card";
import { Popover, PopoverContent, PopoverTrigger } from "@wyliedog/ui/popover";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger, ContextMenuSeparator, ContextMenuCheckboxItem } from "@wyliedog/ui/context-menu";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut } from "@wyliedog/ui/command";
import { Toggle } from "@wyliedog/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@wyliedog/ui/toggle-group";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@wyliedog/ui/collapsible";
import { CheckIcon, ChevronDownIcon, InfoIcon, ShieldCheckIcon, XIcon } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Wylie Dog Design System
          </h1>
          <p className="text-lg text-gray-600">
            Complete component showcase with OKLCH colors and modern design tokens
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Button Component */}
        <Card>
          <CardHeader>
            <CardTitle>Button</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Variants</h4>
                <div className="flex gap-2 flex-wrap">
                  <Button variant="default">Default</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="link">Link</Button>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Sizes</h4>
                <div className="flex gap-2 items-center">
                  <Button size="sm">Small</Button>
                  <Button size="default">Default</Button>
                  <Button size="lg">Large</Button>
                  <Button size="icon">
                    <CheckIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">States</h4>
                <div className="flex gap-2">
                  <Button>Normal</Button>
                  <Button disabled>Disabled</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Badge Component */}
        <Card>
          <CardHeader>
            <CardTitle>Badge</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Variants</h4>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="default">Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="destructive">Destructive</Badge>
                  <Badge variant="outline">Outline</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Input Component */}
        <Card>
          <CardHeader>
            <CardTitle>Input</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="normal">Normal Input</Label>
                <Input id="normal" placeholder="Enter text..." />
              </div>
              
              <div>
                <Label htmlFor="disabled">Disabled Input</Label>
                <Input id="disabled" placeholder="Disabled" disabled />
              </div>
              
              <div>
                <Label htmlFor="error">Error Input</Label>
                <Input id="error" placeholder="Error state" error />
              </div>

              <div>
                <Label htmlFor="password">Password Input</Label>
                <Input id="password" type="password" placeholder="Password" />
              </div>

              <div>
                <Label htmlFor="email">Email Input</Label>
                <Input id="email" type="email" placeholder="email@example.com" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Textarea Component */}
        <Card>
          <CardHeader>
            <CardTitle>Textarea</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" placeholder="Enter your message..." />
              </div>
              
              <div>
                <Label htmlFor="large">Large Textarea</Label>
                <Textarea 
                  id="large" 
                  placeholder="Larger text area..." 
                  className="min-h-[120px]"
                />
              </div>
              
              <div>
                <Label htmlFor="disabled-textarea">Disabled Textarea</Label>
                <Textarea 
                  id="disabled-textarea" 
                  placeholder="Disabled" 
                  disabled 
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Checkbox Component */}
        <Card>
          <CardHeader>
            <CardTitle>Checkbox</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox id="terms" />
                <Label htmlFor="terms">Accept terms and conditions</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox id="checked" defaultChecked />
                <Label htmlFor="checked">Pre-checked option</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox id="disabled" disabled />
                <Label htmlFor="disabled">Disabled checkbox</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="disabled-checked" disabled defaultChecked />
                <Label htmlFor="disabled-checked">Disabled + checked</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Switch Component */}
        <Card>
          <CardHeader>
            <CardTitle>Switch</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch id="notifications" />
                <Label htmlFor="notifications">Enable notifications</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch id="enabled" defaultChecked />
                <Label htmlFor="enabled">Pre-enabled option</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch id="disabled-switch" disabled />
                <Label htmlFor="disabled-switch">Disabled switch</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Select Component */}
        <Card>
          <CardHeader>
            <CardTitle>Select</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>Choose a fruit</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a fruit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="apple">Apple</SelectItem>
                    <SelectItem value="banana">Banana</SelectItem>
                    <SelectItem value="orange">Orange</SelectItem>
                    <SelectItem value="grape">Grape</SelectItem>
                    <SelectItem value="strawberry">Strawberry</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Separator Component */}
        <Card>
          <CardHeader>
            <CardTitle>Separator</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium mb-2">Horizontal</h4>
                <div className="space-y-4">
                  <p>Content above</p>
                  <Separator />
                  <p>Content below</p>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Vertical</h4>
                <div className="flex h-12 items-center space-x-4">
                  <span>Left</span>
                  <Separator orientation="vertical" />
                  <span>Right</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs Component */}
        <Card>
          <CardHeader>
            <CardTitle>Tabs</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="tab1">
              <TabsList>
                <TabsTrigger value="tab1">Tab 1</TabsTrigger>
                <TabsTrigger value="tab2">Tab 2</TabsTrigger>
                <TabsTrigger value="tab3">Tab 3</TabsTrigger>
              </TabsList>
              <TabsContent value="tab1" className="mt-4">
                <p>Content for Tab 1. This is where you would put your first tab content.</p>
              </TabsContent>
              <TabsContent value="tab2" className="mt-4">
                <p>Content for Tab 2. Here's the second tab with different content.</p>
              </TabsContent>
              <TabsContent value="tab3" className="mt-4">
                <p>Content for Tab 3. And this is the third tab's content area.</p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Dialog Component */}
        <Card>
          <CardHeader>
            <CardTitle>Dialog</CardTitle>
          </CardHeader>
          <CardContent>
            <Dialog>
              <DialogTrigger asChild>
                <Button>Open Dialog</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Profile</DialogTitle>
                  <DialogDescription>
                    Make changes to your profile here. Click save when you're done.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" placeholder="Your name" />
                  </div>
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" placeholder="@username" />
                  </div>
                </div>
                <DialogFooter>
                  <Button>Save changes</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* DropdownMenu Component */}
        <Card>
          <CardHeader>
            <CardTitle>DropdownMenu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">Open Menu</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Billing</DropdownMenuItem>
                  <DropdownMenuItem>Team</DropdownMenuItem>
                  <DropdownMenuItem>Subscription</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>

        {/* Sheet Component */}
        <Card>
          <CardHeader>
            <CardTitle>Sheet</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline">Open Sheet</Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Edit Profile</SheetTitle>
                    <SheetDescription>
                      Make changes to your profile here. Click save when you're done.
                    </SheetDescription>
                  </SheetHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <Label htmlFor="sheet-name">Name</Label>
                      <Input id="sheet-name" placeholder="Your name" />
                    </div>
                    <div>
                      <Label htmlFor="sheet-username">Username</Label>
                      <Input id="sheet-username" placeholder="@username" />
                    </div>
                  </div>
                  <SheetFooter>
                    <SheetClose asChild>
                      <Button>Save changes</Button>
                    </SheetClose>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            </div>
          </CardContent>
        </Card>

        {/* Alert Component */}
        <Card>
          <CardHeader>
            <CardTitle>Alert</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert>
                <InfoIcon className="h-4 w-4" />
                <AlertTitle>Info</AlertTitle>
                <AlertDescription>
                  This is an informational alert with some important information.
                </AlertDescription>
              </Alert>

              <Alert variant="destructive">
                <XIcon className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  Something went wrong. Please try again later.
                </AlertDescription>
              </Alert>

              <Alert variant="default">
                <ShieldCheckIcon className="h-4 w-4" />
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>
                  Your action was completed successfully!
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>

        {/* Avatar Component */}
        <Card>
          <CardHeader>
            <CardTitle>Avatar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium mb-2">With Image</h4>
                <div className="flex gap-2">
                  <Avatar size="sm">
                    <AvatarImage src="https://github.com/shadcn.png" alt="User" />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  <Avatar size="md">
                    <AvatarImage src="https://github.com/shadcn.png" alt="User" />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  <Avatar size="lg">
                    <AvatarImage src="https://github.com/shadcn.png" alt="User" />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  <Avatar size="xl">
                    <AvatarImage src="https://github.com/shadcn.png" alt="User" />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Fallback</h4>
                <div className="flex gap-2">
                  <Avatar size="sm">
                    <AvatarFallback>AB</AvatarFallback>
                  </Avatar>
                  <Avatar size="md">
                    <AvatarFallback>CD</AvatarFallback>
                  </Avatar>
                  <Avatar size="lg">
                    <AvatarFallback>EF</AvatarFallback>
                  </Avatar>
                  <Avatar size="xl">
                    <AvatarFallback>GH</AvatarFallback>
                  </Avatar>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tooltip Component */}
        <Card>
          <CardHeader>
            <CardTitle>Tooltip</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <TooltipProvider>
                <div className="flex gap-4">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline">Hover me</Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>This is a tooltip</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline">Top tooltip</Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>Tooltip on top</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline">Right tooltip</Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>Tooltip on right</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </TooltipProvider>
            </div>
          </CardContent>
        </Card>

        {/* Progress Component */}
        <Card>
          <CardHeader>
            <CardTitle>Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium mb-2">Values</h4>
                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-gray-600 mb-1">25%</div>
                    <Progress value={25} />
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 mb-1">50%</div>
                    <Progress value={50} />
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 mb-1">75%</div>
                    <Progress value={75} />
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 mb-1">100%</div>
                    <Progress value={100} />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Sizes</h4>
                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-gray-600 mb-1">Small</div>
                    <Progress value={60} size="sm" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 mb-1">Medium (Default)</div>
                    <Progress value={60} size="md" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 mb-1">Large</div>
                    <Progress value={60} size="lg" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Skeleton Component */}
        <Card>
          <CardHeader>
            <CardTitle>Skeleton</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium mb-2">Card Loading State</h4>
                <div className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center space-x-4">
                    <Skeleton variant="circular" className="w-12 h-12" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-[250px]" />
                      <Skeleton className="h-4 w-[200px]" />
                    </div>
                  </div>
                  <Skeleton className="h-32 w-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Text Loading</h4>
                <div className="space-y-2">
                  <Skeleton variant="text" className="w-full" />
                  <Skeleton variant="text" className="w-5/6" />
                  <Skeleton variant="text" className="w-4/6" />
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Avatar Loading</h4>
                <div className="flex gap-2">
                  <Skeleton variant="circular" size="sm" />
                  <Skeleton variant="circular" size="md" />
                  <Skeleton variant="circular" size="lg" />
                  <Skeleton variant="circular" size="xl" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Accordion Component */}
        <Card>
          <CardHeader>
            <CardTitle>Accordion</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible>
              <AccordionItem value="item-1">
                <AccordionTrigger>Is it accessible?</AccordionTrigger>
                <AccordionContent>
                  Yes. It adheres to the WAI-ARIA design pattern and uses semantic HTML elements.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Is it styled?</AccordionTrigger>
                <AccordionContent>
                  Yes. It comes with default styles that matches the other components' aesthetic.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>Is it animated?</AccordionTrigger>
                <AccordionContent>
                  Yes. It's animated by default, but you can disable it if you prefer.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* Breadcrumb Component */}
        <Card>
          <CardHeader>
            <CardTitle>Breadcrumb</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/">Home</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/components">Components</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </CardContent>
        </Card>

        {/* RadioGroup Component */}
        <Card>
          <CardHeader>
            <CardTitle>RadioGroup</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <Label className="text-base font-medium">Choose a plan</Label>
                <RadioGroup defaultValue="standard" className="mt-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="basic" id="basic" />
                    <Label htmlFor="basic">Basic Plan - $9/month</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="standard" id="standard" />
                    <Label htmlFor="standard">Standard Plan - $19/month</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="premium" id="premium" />
                    <Label htmlFor="premium">Premium Plan - $39/month</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AlertDialog Component */}
        <Card>
          <CardHeader>
            <CardTitle>AlertDialog</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">Delete Account</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction>Continue</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>

        {/* HoverCard Component */}
        <Card>
          <CardHeader>
            <CardTitle>HoverCard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <HoverCard>
                <HoverCardTrigger asChild>
                  <Button variant="ghost">@username</Button>
                </HoverCardTrigger>
                <HoverCardContent className="w-80">
                  <div className="flex justify-between space-x-4">
                    <Avatar>
                      <AvatarImage src="https://github.com/vercel.png" />
                      <AvatarFallback>VC</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <h4 className="text-sm font-semibold">@username</h4>
                      <p className="text-sm">
                        The React Framework – created and maintained by @vercel.
                      </p>
                      <div className="flex items-center pt-2">
                        <span className="text-xs text-muted-foreground">
                          Joined December 2021
                        </span>
                      </div>
                    </div>
                  </div>
                </HoverCardContent>
              </HoverCard>
            </div>
          </CardContent>
        </Card>

        {/* Popover Component */}
        <Card>
          <CardHeader>
            <CardTitle>Popover</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">Open Popover</Button>
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
                        <Input id="width" defaultValue="100%" className="col-span-2 h-8" />
                      </div>
                      <div className="grid grid-cols-3 items-center gap-4">
                        <Label htmlFor="height">Height</Label>
                        <Input id="height" defaultValue="25px" className="col-span-2 h-8" />
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>
        </Card>

        {/* ContextMenu Component */}
        <Card>
          <CardHeader>
            <CardTitle>ContextMenu</CardTitle>
          </CardHeader>
          <CardContent>
            <ContextMenu>
              <ContextMenuTrigger className="flex h-20 w-full items-center justify-center rounded-md border border-dashed text-sm">
                Right click here
              </ContextMenuTrigger>
              <ContextMenuContent className="w-64">
                <ContextMenuItem>Profile</ContextMenuItem>
                <ContextMenuItem>Billing</ContextMenuItem>
                <ContextMenuItem>Team</ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuCheckboxItem checked>Show Bookmarks</ContextMenuCheckboxItem>
                <ContextMenuCheckboxItem>Show Full URLs</ContextMenuCheckboxItem>
                <ContextMenuSeparator />
                <ContextMenuItem>Print</ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          </CardContent>
        </Card>

        {/* Command Component */}
        <Card>
          <CardHeader>
            <CardTitle>Command</CardTitle>
          </CardHeader>
          <CardContent>
            <Command className="rounded-lg border shadow-md">
              <CommandInput placeholder="Type a command or search..." />
              <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup>
                  <div className="px-2 py-1.5 text-xs font-medium text-gray-500">Suggestions</div>
                  <CommandItem>Calendar</CommandItem>
                  <CommandItem>Search Emoji</CommandItem>
                  <CommandItem>Calculator</CommandItem>
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup>
                  <div className="px-2 py-1.5 text-xs font-medium text-gray-500">Settings</div>
                  <CommandItem>Profile</CommandItem>
                  <CommandItem>Billing</CommandItem>
                  <CommandItem>Settings</CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </CardContent>
        </Card>

        {/* Toggle Component */}
        <Card>
          <CardHeader>
            <CardTitle>Toggle</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Toggle aria-label="Toggle bold">Bold</Toggle>
                <Toggle aria-label="Toggle italic">Italic</Toggle>
                <Toggle aria-label="Toggle underline">Underline</Toggle>
              </div>
              <div className="flex items-center space-x-2">
                <Toggle size="sm" aria-label="Small toggle">Sm</Toggle>
                <Toggle size="default" aria-label="Default toggle">Default</Toggle>
                <Toggle size="lg" aria-label="Large toggle">Lg</Toggle>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ToggleGroup Component */}
        <Card>
          <CardHeader>
            <CardTitle>ToggleGroup</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Single Selection</h4>
                <ToggleGroup type="single" defaultValue="center">
                  <ToggleGroupItem value="left" aria-label="Align left">Left</ToggleGroupItem>
                  <ToggleGroupItem value="center" aria-label="Align center">Center</ToggleGroupItem>
                  <ToggleGroupItem value="right" aria-label="Align right">Right</ToggleGroupItem>
                </ToggleGroup>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2">Multiple Selection</h4>
                <ToggleGroup type="multiple" defaultValue={["bold"]}>
                  <ToggleGroupItem value="bold" aria-label="Bold">Bold</ToggleGroupItem>
                  <ToggleGroupItem value="italic" aria-label="Italic">Italic</ToggleGroupItem>
                  <ToggleGroupItem value="underline" aria-label="Underline">Underline</ToggleGroupItem>
                </ToggleGroup>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Collapsible Component */}
        <Card>
          <CardHeader>
            <CardTitle>Collapsible</CardTitle>
          </CardHeader>
          <CardContent>
            <Collapsible>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="flex w-full justify-between p-0">
                  @peduarte starred 3 repositories
                  <ChevronDownIcon className="h-4 w-4" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 mt-2">
                <div className="rounded-md border px-4 py-2 font-mono text-sm shadow-sm">
                  @radix-ui/primitives
                </div>
                <div className="rounded-md border px-4 py-2 font-mono text-sm shadow-sm">
                  @radix-ui/colors
                </div>
                <div className="rounded-md border px-4 py-2 font-mono text-sm shadow-sm">
                  @stitches/react
                </div>
              </CollapsibleContent>
            </Collapsible>
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
    </div>
  );
}
