import type { Meta, StoryObj } from "@storybook/react-vite";
import { Progress } from "@wyliedog/ui/progress";
import { Button } from "@wyliedog/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@wyliedog/ui/card";
import { useState, useEffect } from "react";

const meta: Meta<typeof Progress> = {
  title: "3. Components/Feedback/Progress",
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
      },
    },
    max: {
      control: "number",
      description: "Maximum value",
      table: {
        type: { summary: "number" },
        defaultValue: { summary: "100" },
      },
    },
    variant: {
      control: "select",
      options: ["default", "success", "warning", "destructive"],
      description: "Visual variant of the progress bar",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "default" },
      },
    },
    size: {
      control: "radio",
      options: ["sm", "md", "lg"],
      description: "Size of the progress bar",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "md" },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: 33,
  },
};

export const AllVariants: Story = {
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
  render: () => {
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 4;
    const progress = (currentStep / totalSteps) * 100;

    return (
      <Card className="w-125">
        <CardHeader>
          <CardTitle>User Registration</CardTitle>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
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
                <input
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Full name"
                />
                <input
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Email address"
                />
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-3">
                <h3 className="font-medium">Account Details</h3>
                <input
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Username"
                />
                <input
                  type="password"
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Password"
                />
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-3">
                <h3 className="font-medium">Preferences</h3>
                <select className="w-full px-3 py-2 border rounded-md">
                  <option>Select timezone</option>
                  <option>EST</option>
                  <option>PST</option>
                  <option>GMT</option>
                </select>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-3">
                <h3 className="font-medium">Review & Confirm</h3>
                <p className="text-sm text-gray-600">
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
  render: () => (
    <div className="w-100 space-y-6">
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span>Storage Used</span>
          <span>7.5 GB / 10 GB</span>
        </div>
        <Progress value={75} variant="warning" />
        <div className="text-xs text-gray-500 mt-1">75% of storage used</div>
      </div>

      <div>
        <div className="flex justify-between text-sm mb-1">
          <span>Memory Usage</span>
          <span>4.2 GB / 8 GB</span>
        </div>
        <Progress value={52.5} variant="default" />
        <div className="text-xs text-gray-500 mt-1">Memory usage is normal</div>
      </div>

      <div>
        <div className="flex justify-between text-sm mb-1">
          <span>Project Completion</span>
          <span>18 / 20 tasks</span>
        </div>
        <Progress value={90} variant="success" />
        <div className="text-xs text-gray-500 mt-1">
          Almost done! 2 tasks remaining
        </div>
      </div>
    </div>
  ),
};
