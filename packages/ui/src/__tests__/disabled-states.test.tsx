import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button } from "../button";
import { Checkbox } from "../checkbox";
import { Input } from "../input";
import { Label } from "../label";
import { RadioGroup, RadioGroupItem } from "../radio-group";
import { Switch } from "../switch";
import { Tabs, TabsList, TabsTrigger } from "../tabs";
import { Textarea } from "../textarea";
import { Toggle } from "../toggle";

// Disabled controls keep their normal colours and dim with one opacity token per
// component (Plan 223). No control may carry a disabled colour class.
const disabledColour = /--color-[a-z-]*disabled[a-z-]*\)/;

const cases: [
  string,
  () => ReturnType<typeof render>,
  () => HTMLElement,
  string,
][] = [
  [
    "Button",
    () => render(<Button disabled>Save</Button>),
    () => screen.getByRole("button", { name: "Save" }),
    "disabled:opacity-(--button-opacity-disabled)",
  ],
  [
    "Input",
    () => render(<Input disabled aria-label="Name" />),
    () => screen.getByLabelText("Name"),
    "disabled:opacity-(--input-opacity-disabled)",
  ],
  [
    "Textarea",
    () => render(<Textarea disabled aria-label="Notes" />),
    () => screen.getByLabelText("Notes"),
    "disabled:opacity-(--textarea-opacity-disabled)",
  ],
  [
    "Checkbox",
    () => render(<Checkbox disabled aria-label="Agree" />),
    () => screen.getByRole("checkbox"),
    "disabled:opacity-(--checkbox-opacity-disabled)",
  ],
  [
    "Switch",
    () => render(<Switch disabled aria-label="Notify" />),
    () => screen.getByRole("switch"),
    "disabled:opacity-(--switch-track-opacity-disabled)",
  ],
  [
    "Toggle",
    () => render(<Toggle disabled>Bold</Toggle>),
    () => screen.getByRole("button", { name: "Bold" }),
    "disabled:opacity-(--toggle-opacity-disabled)",
  ],
  [
    "RadioGroupItem",
    () =>
      render(
        <RadioGroup aria-label="Plan">
          <RadioGroupItem value="a" disabled aria-label="A" />
        </RadioGroup>
      ),
    () => screen.getByRole("radio"),
    "disabled:opacity-(--radio-opacity-disabled)",
  ],
  [
    "TabsTrigger",
    () =>
      render(
        <Tabs defaultValue="a">
          <TabsList aria-label="Sections">
            <TabsTrigger value="a" disabled>
              A
            </TabsTrigger>
          </TabsList>
        </Tabs>
      ),
    () => screen.getByRole("tab"),
    "disabled:opacity-(--tabs-trigger-opacity-disabled)",
  ],
];

describe("Disabled states", () => {
  it.each(cases)(
    "%s dims with its opacity token",
    (_name, mount, find, cls) => {
      mount();
      const el = find();
      expect(el).toBeDisabled();
      expect(el).toHaveClass(cls);
    }
  );

  it.each(cases)("%s has no disabled colour class", (_name, mount, find) => {
    mount();
    expect(find().className).not.toMatch(disabledColour);
  });

  it("dims a label whose control is disabled", () => {
    render(<Label htmlFor="x">Name</Label>);
    expect(screen.getByText("Name")).toHaveClass(
      "peer-disabled:opacity-(--label-opacity-disabled)"
    );
  });

  it("keeps a loading button disabled, dimmed, with the spinner shown", () => {
    const { container } = render(<Button loading>Saving</Button>);
    const button = screen.getByRole("button", { name: "Saving" });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-disabled", "true");
    expect(button).toHaveClass("disabled:opacity-(--button-opacity-disabled)");
    expect(container.querySelector("span[aria-hidden='true']")).not.toBeNull();
  });

  it("shows not-allowed instead of ignoring pointer events when a button is disabled", () => {
    render(<Button disabled>Save</Button>);
    const button = screen.getByRole("button", { name: "Save" });
    expect(button).toHaveClass("disabled:cursor-not-allowed");
    expect(button).not.toHaveClass("disabled:pointer-events-none");
  });
});
