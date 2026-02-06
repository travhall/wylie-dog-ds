import type { Meta, StoryObj } from "@storybook/react-vite";
import { Progress } from "@wyliedog/ui/progress";
import { Button } from "@wyliedog/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@wyliedog/ui/card";
import { Input } from "@wyliedog/ui/input";
import { Label } from "@wyliedog/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@wyliedog/ui/select";
import { useState, useEffect } from "react";

const meta: Meta<typeof Progress> = {
  title: "Components/Feedback & Status/Progress",
  component: Progress,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Progress component for displaying completion progress with different variants and sizes. Supports linear progress bars with smooth animations.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    value: {
      control: "range",
      min: 0,
      max: 100,
      description: "Current progress value",
      table: {
        type: { summary: "number" },
        defaultValue: { summary: "0" },
        category: "State",
      },
    },
    max: {
      control: "number",
      description: "Maximum value",
      table: {
        type: { summary: "number" },
        defaultValue: { summary: "100" },
        category: "State",
      },
    },
    variant: {
      control: "select",
      options: ["default", "success", "warning", "destructive"],
      description: "Visual variant of the progress bar",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "default" },
        category: "Appearance",
      },
    },
    size: {
      control: "radio",
      options: ["sm", "md", "lg"],
      description: "Size of the progress bar",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "md" },
        category: "Appearance",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: "Default progress bar at 33% completion.",
      },
    },
  },
  args: {
    value: 33,
  },
};

export const AllVariants: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "All progress bar color variants displayed together for comparison.",
      },
    },
  },
  render: () => (
    <div className="w-100 space-y-6">
      <div>
        <div className="text-sm font-medium mb-2">Default (75%)</div>
        <Progress value={75} variant="default" />
      </div>

      <div>
        <div className="text-sm font-medium mb-2">Success (90%)</div>
        <Progress value={90} variant="success" />
      </div>

      <div>
        <div className="text-sm font-medium mb-2">Warning (45%)</div>
        <Progress value={45} variant="warning" />
      </div>

      <div>
        <div className="text-sm font-medium mb-2">Destructive (25%)</div>
        <Progress value={25} variant="destructive" />
      </div>
    </div>
  ),
};

export const AllSizes: Story = {
  parameters: {
    docs: {
      description: {
        story: "Progress bars in small, medium, and large sizes.",
      },
    },
  },
  render: () => (
    <div className="w-100 space-y-6">
      <div>
        <div className="text-sm font-medium mb-2">Small</div>
        <Progress value={60} size="sm" />
      </div>

      <div>
        <div className="text-sm font-medium mb-2">Medium (Default)</div>
        <Progress value={60} size="md" />
      </div>

      <div>
        <div className="text-sm font-medium mb-2">Large</div>
        <Progress value={60} size="lg" />
      </div>
    </div>
  ),
};

export const AnimatedProgress: Story = {
  parameters: {
    docs: {
      description: {
        story: "Progress bar with animated transition from 0% to 66%.",
      },
    },
  },
  render: () => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
      const timer = setTimeout(() => setProgress(66), 500);
      return () => clearTimeout(timer);
    }, []);

    return (
      <div className="w-100 space-y-4">
        <div className="flex justify-between text-sm">
          <span>Animated Progress</span>
          <span>{progress}%</span>
        </div>
        <Progress value={progress} />
      </div>
    );
  },
};

export const LoadingStates: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Multiple concurrent progress bars simulating real-time loading states.",
      },
    },
  },
  render: () => {
    const [fileProgress, setFileProgress] = useState(0);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [installProgress, setInstallProgress] = useState(0);

    useEffect(() => {
      const fileTimer = setInterval(() => {
        setFileProgress((prev) => {
          if (prev >= 100) return 100;
          return prev + Math.random() * 10;
        });
      }, 200);

      const uploadTimer = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) return 100;
          return prev + Math.random() * 5;
        });
      }, 300);

      const installTimer = setInterval(() => {
        setInstallProgress((prev) => {
          if (prev >= 100) return 100;
          return prev + Math.random() * 15;
        });
      }, 150);

      return () => {
        clearInterval(fileTimer);
        clearInterval(uploadTimer);
        clearInterval(installTimer);
      };
    }, []);

    return (
      <div className="w-125 space-y-6">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Downloading file...</span>
            <span>{Math.round(fileProgress)}%</span>
          </div>
          <Progress value={fileProgress} variant="default" />
        </div>

        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Uploading to server...</span>
            <span>{Math.round(uploadProgress)}%</span>
          </div>
          <Progress value={uploadProgress} variant="warning" />
        </div>

        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Installing updates...</span>
            <span>{Math.round(installProgress)}%</span>
          </div>
          <Progress value={installProgress} variant="success" />
        </div>
      </div>
    );
  },
};

export const FormProgress: Story = {
  parameters: {
    docs: {
      description: {
        story: "Progress bar used within a multi-step registration form.",
      },
    },
  },
  render: () => {
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 4;
    const progress = (currentStep / totalSteps) * 100;

    return (
      <Card className="w-125">
        <CardHeader>
          <CardTitle>User Registration</CardTitle>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-(--color-text-secondary)">
              <span>
                Step {currentStep} of {totalSteps}
              </span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {currentStep === 1 && (
              <div className="space-y-3">
                <h3 className="font-medium">Basic Information</h3>
                <div className="space-y-2">
                  <Label htmlFor="fullname">Full name</Label>
                  <Input id="fullname" placeholder="Full name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input id="email" type="email" placeholder="Email address" />
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-3">
                <h3 className="font-medium">Account Details</h3>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" placeholder="Username" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" placeholder="Password" />
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-3">
                <h3 className="font-medium">Preferences</h3>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select>
                    <SelectTrigger id="timezone" className="w-full">
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="est">EST</SelectItem>
                      <SelectItem value="pst">PST</SelectItem>
                      <SelectItem value="gmt">GMT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-3">
                <h3 className="font-medium">Review & Confirm</h3>
                <p className="text-sm text-(--color-text-secondary)">
                  Please review your information and click confirm to create
                  your account.
                </p>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button
                variant="ghost"
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1}
              >
                Previous
              </Button>
              <Button
                onClick={() =>
                  setCurrentStep(Math.min(totalSteps, currentStep + 1))
                }
                disabled={currentStep === totalSteps}
              >
                {currentStep === totalSteps ? "Confirm" : "Next"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  },
};

export const ProgressWithLabels: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Progress bars with descriptive labels and contextual information.",
      },
    },
  },
  render: () => (
    <div className="w-100 space-y-6">
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span>Storage Used</span>
          <span>7.5 GB / 10 GB</span>
        </div>
        <Progress value={75} variant="warning" />
        <div className="text-xs text-(--color-text-tertiary) mt-1">
          75% of storage used
        </div>
      </div>

      <div>
        <div className="flex justify-between text-sm mb-1">
          <span>Memory Usage</span>
          <span>4.2 GB / 8 GB</span>
        </div>
        <Progress value={52.5} variant="default" />
        <div className="text-xs text-(--color-text-tertiary) mt-1">
          Memory usage is normal
        </div>
      </div>

      <div>
        <div className="flex justify-between text-sm mb-1">
          <span>Project Completion</span>
          <span>18 / 20 tasks</span>
        </div>
        <Progress value={90} variant="success" />
        <div className="text-xs text-(--color-text-tertiary) mt-1">
          Almost done! 2 tasks remaining
        </div>
      </div>
    </div>
  ),
};
