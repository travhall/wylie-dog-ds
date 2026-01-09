import { Card, CardHeader, CardTitle, CardContent } from "@wyliedog/ui/card";
import { Input } from "@wyliedog/ui/input";
import { Label } from "@wyliedog/ui/label";
import { Checkbox } from "@wyliedog/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@wyliedog/ui/radio-group";
import { Switch } from "@wyliedog/ui/switch";
import { Slider } from "@wyliedog/ui/slider";
import { Textarea } from "@wyliedog/ui/textarea";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";

const getStatusIcon = (status: string) => {
  switch (status) {
    case "stable":
      return (
        <CheckCircle2 className="h-3.5 w-3.5 text-(--color-text-success)" />
      );
    case "beta":
      return <Clock className="h-3.5 w-3.5 text-(--color-text-warning)" />;
    default:
      return <AlertCircle className="h-3.5 w-3.5 text-(--color-text-danger)" />;
  }
};

export default function FormsPage() {
  const components = [
    {
      name: "Input",
      description:
        "Textual input fields for labels and interactive data entry.",
      status: "stable",
      preview: (
        <Input placeholder="Type something..." className="max-w-[200px]" />
      ),
    },
    {
      name: "Checkbox",
      description: "Allows the user to select one or more items from a set.",
      status: "stable",
      preview: (
        <div className="flex items-center space-x-2">
          <Checkbox id="terms" />
          <Label htmlFor="terms" className="text-xs">
            Accept terms
          </Label>
        </div>
      ),
    },
    {
      name: "Radio Group",
      description:
        "A set of checkable buttons where only one can be checked at a time.",
      status: "stable",
      preview: (
        <RadioGroup defaultValue="option-one" className="scale-75 origin-left">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="option-one" id="option-one" />
            <Label htmlFor="option-one">Selected</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="option-two" id="option-two" />
            <Label htmlFor="option-two">Unselected</Label>
          </div>
        </RadioGroup>
      ),
    },
    {
      name: "Switch",
      description:
        "A control that allows the user to toggle a setting on or off.",
      status: "beta",
      preview: <Switch />,
    },
    {
      name: "Slider",
      description:
        "An input where the user selects a value from a range of values.",
      status: "stable",
      preview: (
        <Slider defaultValue={[50]} max={100} step={1} className="w-[150px]" />
      ),
    },
    {
      name: "Textarea",
      description: "Multi-line text input for longer responses.",
      status: "stable",
      preview: <Textarea placeholder="Message..." className="h-12 text-xs" />,
    },
  ];

  return (
    <div className="space-y-12">
      <section className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight text-(--color-text-primary)">
          Forms
        </h1>
        <p className="text-lg text-(--color-text-secondary) leading-relaxed">
          Interactive components for gathering user input and data.
        </p>
      </section>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {components.map((comp) => (
          <Card
            key={comp.name}
            className="glass border-(--color-border-primary)/10 group hover:border-(--color-interactive-primary)/30 transition-all duration-500 flex flex-col"
          >
            <CardHeader className="p-6">
              <div className="flex items-center justify-between mb-2">
                <CardTitle className="text-xl font-bold group-hover:text-(--color-interactive-primary) transition-colors text-(--color-text-primary)">
                  {comp.name}
                </CardTitle>
                <div className="flex items-center gap-1.5 glass border-(--color-border-primary)/5 px-2 py-0.5 rounded-full scale-90">
                  {getStatusIcon(comp.status)}
                  <span className="text-[9px] uppercase font-black tracking-widest text-(--color-text-secondary)">
                    {comp.status}
                  </span>
                </div>
              </div>
              <p className="text-sm text-(--color-text-secondary) leading-relaxed">
                {comp.description}
              </p>
            </CardHeader>
            <CardContent className="p-6 pt-0 mt-auto">
              <div className="glass bg-(--color-background-secondary)/20 rounded-xl p-4 min-h-[100px] flex items-center justify-center border border-(--color-border-primary)/5">
                {comp.preview}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
