"use client";

import { useId, useState } from "react";
import { AlignCenter, AlignLeft, AlignRight, Bold, Italic } from "lucide-react";
import { Button } from "@wyliedog/ui/button";
import { Checkbox } from "@wyliedog/ui/checkbox";
import {
  FormField,
  FormLabel,
  FormMessage,
  useFormField,
} from "@wyliedog/ui/form";
import { Input } from "@wyliedog/ui/input";
import { Label } from "@wyliedog/ui/label";
import { RadioGroup, RadioGroupItem } from "@wyliedog/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@wyliedog/ui/select";
import { Slider } from "@wyliedog/ui/slider";
import { Switch } from "@wyliedog/ui/switch";
import { Textarea } from "@wyliedog/ui/textarea";
import { Toggle } from "@wyliedog/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@wyliedog/ui/toggle-group";

/*
 * Live previews for the Inputs & Controls cards on /components. Every control
 * is the real @wyliedog/ui component, so a token or variant change shows up
 * here with no second copy to edit. They are client components because the
 * Radix primitives need state and generated ids.
 */

export function ButtonPreview() {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex flex-wrap justify-center gap-1.5">
        <Button size="sm">Primary</Button>
        <Button size="sm" variant="secondary">
          Secondary
        </Button>
        <Button size="sm" variant="outline">
          Outline
        </Button>
      </div>
      <div className="flex flex-wrap justify-center gap-1.5">
        <Button size="sm" variant="ghost">
          Ghost
        </Button>
        <Button size="sm" variant="destructive">
          Destructive
        </Button>
        <Button size="sm" loading>
          Loading
        </Button>
      </div>
    </div>
  );
}

export function CheckboxPreview() {
  const id = useId();
  const [digest, setDigest] = useState(true);
  const [releases, setReleases] = useState<boolean | "indeterminate">(
    "indeterminate"
  );
  const [breaking, setBreaking] = useState(false);
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center gap-2">
        <Checkbox
          id={`${id}-digest`}
          size="sm"
          checked={digest}
          onCheckedChange={(v) => setDigest(v === true)}
        />
        <Label htmlFor={`${id}-digest`} size="sm">
          Send weekly digest
        </Label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox
          id={`${id}-releases`}
          size="sm"
          checked={releases}
          onCheckedChange={setReleases}
        />
        <Label htmlFor={`${id}-releases`} size="sm">
          Notify on every release
        </Label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox
          id={`${id}-breaking`}
          size="sm"
          checked={breaking}
          onCheckedChange={(v) => setBreaking(v === true)}
        />
        <Label htmlFor={`${id}-breaking`} size="sm">
          Show breaking changes only
        </Label>
      </div>
    </div>
  );
}

function FormInput({ type }: { type: string }) {
  const { id, errorId, isInvalid } = useFormField();
  return (
    <Input
      id={id}
      type={type}
      size="sm"
      error={isInvalid}
      errorId={errorId}
      defaultValue={type === "email" ? "elena@example" : ""}
    />
  );
}

export function FormPreview() {
  return (
    <div className="flex w-full max-w-60 flex-col gap-3">
      <FormField error required>
        <FormLabel size="sm">Email</FormLabel>
        <FormInput type="email" />
        <FormMessage>Enter a full email address.</FormMessage>
      </FormField>
    </div>
  );
}

export function InputPreview() {
  return (
    <div className="flex w-full max-w-60 flex-col gap-2">
      <Input
        size="sm"
        type="search"
        aria-label="Search"
        placeholder="Search components…"
      />
      <Input size="sm" aria-label="Email" defaultValue="elena@wyliedog.dev" />
      <Input size="sm" aria-label="Disabled" placeholder="Disabled" disabled />
    </div>
  );
}

export function LabelPreview() {
  const id = useId();
  return (
    <div className="flex w-full max-w-60 flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${id}-name`} size="sm" required>
          Display name
        </Label>
        <Input id={`${id}-name`} size="sm" placeholder="e.g. Elena Mori" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${id}-email`} size="sm" error>
          Email
        </Label>
        <Input
          id={`${id}-email`}
          size="sm"
          error
          aria-describedby={`${id}-email-error`}
        />
        <p
          id={`${id}-email-error`}
          className="text-xs text-(--color-foreground-danger-muted)"
        >
          Email is required.
        </p>
      </div>
    </div>
  );
}

export function RadioGroupPreview() {
  const id = useId();
  return (
    <RadioGroup defaultValue="light" aria-label="Theme">
      {[
        ["light", "Light theme"],
        ["dark", "Dark theme"],
        ["system", "System default"],
      ].map(([value, text]) => (
        <div key={value} className="flex items-center gap-2">
          <RadioGroupItem id={`${id}-${value}`} value={value} size="sm" />
          <Label htmlFor={`${id}-${value}`} size="sm">
            {text}
          </Label>
        </div>
      ))}
    </RadioGroup>
  );
}

export function SelectPreview() {
  return (
    <div className="w-full max-w-55">
      <Select size="sm" defaultValue="engineering">
        <SelectTrigger aria-label="Team">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="engineering">Engineering</SelectItem>
          <SelectItem value="design">Design</SelectItem>
          <SelectItem value="operations">Operations</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

export function SliderPreview() {
  const [volume, setVolume] = useState([62]);
  const [range, setRange] = useState([24, 78]);
  return (
    <div className="flex w-full max-w-60 flex-col gap-5">
      <div className="flex flex-col gap-3">
        <div className="flex justify-between text-xs text-(--color-foreground-muted)">
          <span>Volume</span>
          <span className="font-mono">{volume[0]}</span>
        </div>
        <Slider
          value={volume}
          onValueChange={setVolume}
          thumbLabels="Volume"
          max={100}
        />
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex justify-between text-xs text-(--color-foreground-muted)">
          <span>Range</span>
          <span className="font-mono">
            {range[0]} – {range[1]}
          </span>
        </div>
        <Slider
          value={range}
          onValueChange={setRange}
          thumbLabels={["Range start", "Range end"]}
          max={100}
        />
      </div>
    </div>
  );
}

export function SwitchPreview() {
  const id = useId();
  const [deploy, setDeploy] = useState(true);
  const [beta, setBeta] = useState(false);
  return (
    <div className="flex w-full max-w-50 flex-col gap-2.5">
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor={`${id}-deploy`} size="sm">
          Auto-deploy
        </Label>
        <Switch
          id={`${id}-deploy`}
          size="sm"
          checked={deploy}
          onCheckedChange={setDeploy}
        />
      </div>
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor={`${id}-beta`} size="sm">
          Beta channel
        </Label>
        <Switch
          id={`${id}-beta`}
          size="sm"
          checked={beta}
          onCheckedChange={setBeta}
        />
      </div>
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor={`${id}-telemetry`} size="sm">
          Telemetry
        </Label>
        <Switch id={`${id}-telemetry`} size="sm" disabled />
      </div>
    </div>
  );
}

export function TextareaPreview() {
  return (
    <div className="w-full max-w-60">
      <Textarea
        size="sm"
        resize="none"
        aria-label="Message"
        rows={3}
        defaultValue="Edit tokens in Figma; the bridge opens a pull request."
      />
    </div>
  );
}

export function TogglePreview() {
  return (
    <div className="flex gap-1.5">
      <Toggle aria-label="Bold" size="sm" defaultPressed>
        <Bold className="size-4" aria-hidden />
      </Toggle>
      <Toggle aria-label="Italic" size="sm">
        <Italic className="size-4" aria-hidden />
      </Toggle>
      <Toggle aria-label="Italic, disabled" size="sm" disabled>
        <Italic className="size-4" aria-hidden />
      </Toggle>
    </div>
  );
}

export function ToggleGroupPreview() {
  return (
    <div className="flex flex-col items-center gap-3">
      <ToggleGroup type="single" defaultValue="day" aria-label="Range">
        <ToggleGroupItem value="day">Day</ToggleGroupItem>
        <ToggleGroupItem value="week">Week</ToggleGroupItem>
        <ToggleGroupItem value="month">Month</ToggleGroupItem>
      </ToggleGroup>
      <ToggleGroup type="single" defaultValue="left" aria-label="Alignment">
        <ToggleGroupItem value="left" aria-label="Align left">
          <AlignLeft className="size-4" aria-hidden />
        </ToggleGroupItem>
        <ToggleGroupItem value="center" aria-label="Align center">
          <AlignCenter className="size-4" aria-hidden />
        </ToggleGroupItem>
        <ToggleGroupItem value="right" aria-label="Align right">
          <AlignRight className="size-4" aria-hidden />
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
