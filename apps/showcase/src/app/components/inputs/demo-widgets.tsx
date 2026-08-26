"use client";

import { useState } from "react";
import { Checkbox } from "@wyliedog/ui/checkbox";
import { Label } from "@wyliedog/ui/label";
import { Slider } from "@wyliedog/ui/slider";
import { Switch } from "@wyliedog/ui/switch";

export function CheckboxDemo() {
  const [checked, setChecked] = useState(false);
  return (
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
  );
}

export function SliderDemo() {
  const [sliderValue, setSliderValue] = useState([50]);
  return (
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
  );
}

export function SwitchDemo() {
  const [switchOn, setSwitchOn] = useState(false);
  return (
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
  );
}
