"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@wyliedog/ui/card";
import { Badge } from "@wyliedog/ui/badge";
import { Button } from "@wyliedog/ui/button";
import { Input } from "@wyliedog/ui/input";
import { Label } from "@wyliedog/ui/label";
import { Checkbox } from "@wyliedog/ui/checkbox";
import { Switch } from "@wyliedog/ui/switch";
import { Slider } from "@wyliedog/ui/slider";
import { Textarea } from "@wyliedog/ui/textarea";
import { CheckCircle2 } from "lucide-react";
import { useState } from "react";

const StatusBadge = ({ status }: { status: "stable" | "beta" | "alpha" }) => {
  const map = {
    stable: "text-(--color-text-success)",
    beta: "text-(--color-text-warning)",
    alpha: "text-(--color-text-danger)",
  } as const;
  return (
    <div className="flex items-center gap-1.5 glass border-(--color-border-primary)/5 px-2 py-0.5 rounded-full scale-90">
      <CheckCircle2 className={`h-3.5 w-3.5 ${map[status]}`} />
      <span className="text-[9px] uppercase font-black tracking-widest text-(--color-text-secondary)">
        {status}
      </span>
    </div>
  );
};

function InputsContent() {
  const [sliderValue, setSliderValue] = useState([50]);
  const [switchOn, setSwitchOn] = useState(false);
  const [checked, setChecked] = useState<boolean>(false);

  const components = [
    {
      name: "Button",
      description:
        "Interactive trigger with primary, secondary, outline, ghost, and destructive variants.",
      status: "stable" as const,
      preview: (
        <div className="flex flex-wrap gap-2">
          <Button size="sm">Primary</Button>
          <Button variant="secondary" size="sm">
            Secondary
          </Button>
          <Button variant="outline" size="sm">
            Outline
          </Button>
          <Button variant="ghost" size="sm">
            Ghost
          </Button>
        </div>
      ),
    },
    {
      name: "Calendar",
      description:
        "Date picker with month navigation, range selection, and disabled date support.",
      status: "stable" as const,
      preview: (
        <div className="w-full h-20 border border-(--color-border-primary)/20 rounded-lg flex items-center justify-center text-xs text-(--color-text-secondary)">
          Calendar component — open in Storybook
        </div>
      ),
    },
    {
      name: "Checkbox",
      description:
        "A control that allows the user to toggle between checked and unchecked states.",
      status: "stable" as const,
      preview: (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Checkbox
              id="check1"
              checked={checked}
              onCheckedChange={(val) => setChecked(val === true)}
            />
            <Label htmlFor="check1" className="text-sm">
              Accept terms
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="check2" defaultChecked />
            <Label htmlFor="check2" className="text-sm">
              Subscribe to updates
            </Label>
          </div>
        </div>
      ),
    },
    {
      name: "Form",
      description:
        "Accessible form wrapper with built-in validation, error messages, and field descriptions.",
      status: "stable" as const,
      preview: (
        <div className="w-full space-y-2">
          <div className="space-y-1">
            <Label className="text-xs">Email address</Label>
            <Input
              type="email"
              placeholder="you@example.com"
              className="h-8 text-xs"
            />
          </div>
          <div className="text-[10px] text-(--color-text-secondary)">
            Validation and error states supported.
          </div>
        </div>
      ),
    },
    {
      name: "Input",
      description:
        "Text field with support for types, placeholders, disabled state, and icons.",
      status: "stable" as const,
      preview: (
        <div className="w-full space-y-2">
          <Input placeholder="Default input" className="h-8 text-xs" />
          <Input placeholder="Disabled" disabled className="h-8 text-xs" />
        </div>
      ),
    },
    {
      name: "Label",
      description:
        "Accessible label for form controls with proper htmlFor association.",
      status: "stable" as const,
      preview: (
        <div className="flex flex-col gap-2 w-full">
          <Label>First name</Label>
          <Label className="text-xs text-(--color-text-secondary)">
            Optional label variant
          </Label>
        </div>
      ),
    },
    {
      name: "Radio Group",
      description:
        "A set of radio buttons where only one option can be selected at a time.",
      status: "stable" as const,
      preview: (
        <div className="space-y-2 text-sm">
          {["Option A", "Option B", "Option C"].map((opt) => (
            <div key={opt} className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full border-2 border-(--color-border-primary)/40" />
              <span className="text-xs text-(--color-text-secondary)">
                {opt}
              </span>
            </div>
          ))}
        </div>
      ),
    },
    {
      name: "Select",
      description:
        "Dropdown selection with search, groups, and keyboard navigation.",
      status: "stable" as const,
      preview: (
        <div className="w-full h-8 border border-(--color-border-primary)/20 rounded-md flex items-center justify-between px-3 text-xs text-(--color-text-secondary) bg-(--color-background-secondary)/20">
          <span>Select an option…</span>
          <span>▾</span>
        </div>
      ),
    },
    {
      name: "Slider",
      description:
        "Range input for selecting a numeric value within a defined range.",
      status: "stable" as const,
      preview: (
        <div className="w-full px-2">
          <Slider
            value={sliderValue}
            onValueChange={setSliderValue}
            min={0}
            max={100}
            step={1}
          />
          <div className="text-center text-xs text-(--color-text-secondary) mt-2">
            {sliderValue[0]}
          </div>
        </div>
      ),
    },
    {
      name: "Switch",
      description:
        "Toggle control for binary on/off states with accessible labeling.",
      status: "stable" as const,
      preview: (
        <div className="flex items-center gap-3">
          <Switch
            checked={switchOn}
            onCheckedChange={setSwitchOn}
            id="switch-demo"
          />
          <Label htmlFor="switch-demo" className="text-sm">
            {switchOn ? "Enabled" : "Disabled"}
          </Label>
        </div>
      ),
    },
    {
      name: "Textarea",
      description:
        "Multi-line text input for longer form content with resize handling.",
      status: "stable" as const,
      preview: (
        <Textarea
          placeholder="Enter your message…"
          className="text-xs resize-none h-16"
        />
      ),
    },
    {
      name: "Toggle Group",
      description:
        "A set of two-state toggle buttons where one or more can be active.",
      status: "stable" as const,
      preview: (
        <div className="flex gap-1">
          {["Bold", "Italic", "Underline"].map((item) => (
            <button
              key={item}
              className="px-3 py-1.5 text-xs rounded border border-(--color-border-primary)/20 hover:bg-(--color-interactive-primary)/10 transition-colors"
            >
              {item}
            </button>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-12">
      <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex items-center gap-3">
          <h1 className="text-4xl font-bold tracking-tight text-(--color-text-primary)">
            Inputs & Controls
          </h1>
          <Badge
            variant="outline"
            className="glass rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-(--color-interactive-primary) border-(--color-interactive-primary)/20"
          >
            12 components
          </Badge>
        </div>
        <p className="text-lg text-(--color-text-secondary) leading-relaxed max-w-2xl">
          Form controls for user data entry: buttons, calendars, checkboxes,
          form wrappers, inputs, labels, radio groups, selects, sliders,
          switches, textareas, and toggle groups.
        </p>
      </section>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {components.map((comp, i) => (
          <Card
            key={comp.name}
            className="glass border-(--color-border-primary)/10 group hover:border-(--color-interactive-primary)/30 transition-all duration-500 flex flex-col animate-in fade-in slide-in-from-bottom-4"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <CardHeader className="p-6">
              <div className="flex items-center justify-between mb-2">
                <CardTitle className="text-xl font-bold group-hover:text-(--color-interactive-primary) transition-colors text-(--color-text-primary)">
                  {comp.name}
                </CardTitle>
                <StatusBadge status={comp.status} />
              </div>
              <p className="text-sm text-(--color-text-secondary) leading-relaxed">
                {comp.description}
              </p>
            </CardHeader>
            <CardContent className="p-6 pt-0 mt-auto">
              <div className="glass bg-(--color-background-secondary)/20 rounded-xl p-4 min-h-25 flex items-center justify-center border border-(--color-border-primary)/5">
                {comp.preview}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function InputsPage() {
  return <InputsContent />;
}
