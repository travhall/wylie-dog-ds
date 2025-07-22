import type { Meta, StoryObj } from "@storybook/react-vite";
import { Skeleton } from "@wyliedog/ui/skeleton";
import { Card, CardContent, CardHeader } from "@wyliedog/ui/card";

const meta: Meta<typeof Skeleton> = {
  title: "Components/Skeleton",
  component: Skeleton,
  parameters: { 
    layout: "centered",
    docs: {
      description: {
        component: 'Skeleton component for displaying loading placeholders with different variants and sizes. Provides visual feedback while content is loading.'
      }
    }
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "text", "circular", "rectangular"],
      description: "Shape variant of the skeleton",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "default" },
      },
    },
    size: {
      control: "radio",
      options: ["sm", "md", "lg", "xl"],
      description: "Predefined size for circular/square skeletons",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Skeleton className="w-48 h-4" />
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-medium mb-2">Default Rectangle</h4>
        <Skeleton className="w-48 h-4" />
      </div>
      
      <div>
        <h4 className="text-sm font-medium mb-2">Text Lines</h4>
        <div className="space-y-2">
          <Skeleton variant="text" className="w-full" />
          <Skeleton variant="text" className="w-5/6" />
          <Skeleton variant="text" className="w-4/6" />
        </div>
      </div>
      
      <div>
        <h4 className="text-sm font-medium mb-2">Circular</h4>
        <Skeleton variant="circular" className="w-12 h-12" />
      </div>
      
      <div>
        <h4 className="text-sm font-medium mb-2">Rectangular</h4>
        <Skeleton variant="rectangular" className="w-32 h-20" />
      </div>
    </div>
  ),
};

export const CircularSizes: Story = {
  render: () => (
    <div className="space-y-4">
      <h4 className="text-sm font-medium">Circular Skeleton Sizes</h4>
      <div className="flex items-center gap-4">
        <div className="text-center">
          <Skeleton variant="circular" size="sm" />
          <p className="text-xs mt-1">Small</p>
        </div>
        <div className="text-center">
          <Skeleton variant="circular" size="md" />
          <p className="text-xs mt-1">Medium</p>
        </div>
        <div className="text-center">
          <Skeleton variant="circular" size="lg" />
          <p className="text-xs mt-1">Large</p>
        </div>
        <div className="text-center">
          <Skeleton variant="circular" size="xl" />
          <p className="text-xs mt-1">Extra Large</p>
        </div>
      </div>
    </div>
  ),
};

export const CardLoading: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <div className="flex items-center space-x-4">
          <Skeleton variant="circular" className="w-12 h-12" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Skeleton className="h-32 w-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
      </CardContent>
    </Card>
  ),
};

export const TableLoading: Story = {
  render: () => (
    <div className="w-[600px] space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-8 w-24" />
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        {/* Table Header */}
        <div className="bg-gray-50 p-4 border-b">
          <div className="grid grid-cols-4 gap-4">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-18" />
            <Skeleton className="h-4 w-14" />
          </div>
        </div>
        
        {/* Table Rows */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="p-4 border-b last:border-b-0">
            <div className="grid grid-cols-4 gap-4 items-center">
              <div className="flex items-center gap-2">
                <Skeleton variant="circular" className="w-8 h-8" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-6 w-16" />
              <div className="flex gap-1">
                <Skeleton className="h-6 w-6" />
                <Skeleton className="h-6 w-6" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  ),
};

export const ListLoading: Story = {
  render: () => (
    <div className="w-[400px] space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-8 w-20" />
      </div>
      
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-3 p-3 border rounded-lg">
            <Skeleton variant="circular" className="w-10 h-10" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>
    </div>
  ),
};

export const FormLoading: Story = {
  render: () => (
    <div className="w-[400px] space-y-6">
      <div>
        <Skeleton className="h-6 w-32 mb-4" />
        
        <div className="space-y-4">
          <div>
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-10 w-full" />
          </div>
          
          <div>
            <Skeleton className="h-4 w-16 mb-2" />
            <Skeleton className="h-10 w-full" />
          </div>
          
          <div>
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-20 w-full" />
          </div>
          
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-48" />
          </div>
          
          <div className="flex gap-2 pt-2">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-16" />
          </div>
        </div>
      </div>
    </div>
  ),
};

export const DashboardLoading: Story = {
  render: () => (
    <div className="w-[800px] space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Chart Section */}
      <Card>
        <CardHeader>
          <div className="flex justify-between">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-8 w-24" />
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
      
      {/* Recent Activity */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-28" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton variant="circular" className="w-8 h-8" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                  <Skeleton className="h-2 w-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  ),
};
