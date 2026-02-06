import type { Meta, StoryObj } from "@storybook/react-vite";
import { Calendar } from "@wyliedog/ui/calendar";
import { useState } from "react";

const meta: Meta<typeof Calendar> = {
  title: "Components/Content Display/Calendar",
  component: Calendar,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A flexible calendar component for date selection with support for single dates, multiple dates, and date ranges.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    mode: {
      control: "select",
      options: ["single", "multiple", "range"],
      description: "Selection mode for the calendar",
      table: {
        type: { summary: '"single" | "multiple" | "range"' },
        category: "Behavior",
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
        story: "Single date selection calendar with today pre-selected.",
      },
    },
  },
  render: () => {
    const [date, setDate] = useState<Date | undefined>(new Date());

    return (
      <Calendar
        mode="single"
        selected={date}
        onSelect={(selectedDate) => {
          if (selectedDate instanceof Date) {
            setDate(selectedDate);
          } else {
            setDate(undefined);
          }
        }}
        className="rounded-md border"
      />
    );
  },
};

export const Multiple: Story = {
  parameters: {
    docs: {
      description: {
        story: "Calendar allowing multiple individual dates to be selected.",
      },
    },
  },
  render: () => {
    const [dates, setDates] = useState<Date[]>([]);

    return (
      <Calendar
        mode="multiple"
        selected={dates}
        onSelect={(selectedDates) => {
          if (Array.isArray(selectedDates)) {
            setDates(selectedDates);
          }
        }}
        className="rounded-md border"
      />
    );
  },
};

export const Range: Story = {
  parameters: {
    docs: {
      description: {
        story: "Calendar with date range selection for start and end dates.",
      },
    },
  },
  render: () => {
    const [range, setRange] = useState<{ from?: Date; to?: Date }>({});

    return (
      <Calendar
        mode="range"
        selected={range}
        onSelect={(selectedRange) => {
          if (
            selectedRange &&
            typeof selectedRange === "object" &&
            "from" in selectedRange
          ) {
            setRange(selectedRange);
          }
        }}
        className="rounded-md border"
      />
    );
  },
};

export const WithPreselected: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Range calendar initialized with a pre-selected one-week date range.",
      },
    },
  },
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
        onSelect={(selectedRange) => {
          if (
            selectedRange &&
            typeof selectedRange === "object" &&
            "from" in selectedRange
          ) {
            setRange(selectedRange);
          }
        }}
        className="rounded-md border"
      />
    );
  },
};

export const InForm: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Calendar embedded within a form layout with a label and selected date display.",
      },
    },
  },
  render: () => {
    const [date, setDate] = useState<Date | undefined>();

    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Date</label>
          <Calendar
            mode="single"
            selected={date}
            onSelect={(selectedDate) => {
              if (selectedDate instanceof Date) {
                setDate(selectedDate);
              } else {
                setDate(undefined);
              }
            }}
            className="rounded-md border"
          />
        </div>
        <p className="text-sm text-(--color-text-secondary)">
          Selected: {date ? date.toLocaleDateString() : "None"}
        </p>
      </div>
    );
  },
};
