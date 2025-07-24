import type { Meta, StoryObj } from "@storybook/react-vite";
import { Calendar } from "@wyliedog/ui/calendar";
import { useState } from "react";

const meta: Meta<typeof Calendar> = {
  title: "Components/Calendar",
  component: Calendar,
  parameters: { 
    layout: "centered",
    docs: {
      description: {
        component: "A flexible calendar component for date selection with support for single dates, multiple dates, and date ranges."
      }
    }
  },
  tags: ["autodocs"],
  argTypes: {
    mode: {
      control: "select",
      options: ["single", "multiple", "range"],
      description: "Selection mode for the calendar",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [date, setDate] = useState<Date | undefined>(new Date());
    
    return (
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        className="rounded-md border"
      />
    );
  },
};

export const Multiple: Story = {
  render: () => {
    const [dates, setDates] = useState<Date[]>([]);
    
    return (
      <Calendar
        mode="multiple"
        selected={dates}
        onSelect={setDates}
        className="rounded-md border"
      />
    );
  },
};

export const Range: Story = {
  render: () => {
    const [range, setRange] = useState<{ from?: Date; to?: Date }>({});
    
    return (
      <Calendar
        mode="range"
        selected={range}
        onSelect={setRange}
        className="rounded-md border"
      />
    );
  },
};

export const WithPreselected: Story = {
  render: () => {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const [range, setRange] = useState<{ from?: Date; to?: Date }>({
      from: today,
      to: nextWeek,
    });
    
    return (
      <Calendar
        mode="range"
        selected={range}
        onSelect={setRange}
        className="rounded-md border"
      />
    );
  },
};

export const InForm: Story = {
  render: () => {
    const [date, setDate] = useState<Date | undefined>();
    
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Date</label>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border"
          />
        </div>
        <p className="text-sm text-gray-600">
          Selected: {date ? date.toLocaleDateString() : "None"}
        </p>
      </div>
    );
  },
};
