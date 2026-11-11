import React from "react";
import { render, screen } from "@testing-library/react";
import {
  Form,
  FormDescription,
  FormField,
  FormLabel,
  FormMessage,
} from "../form";
import { Input } from "../input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../select";
import { Textarea } from "../textarea";

// A control inside a FormField takes its id, error state, description and required state from the
// field, so FormLabel points at it with no wrapper. Anything set on the control itself wins.

const renderField = (
  control: React.ReactNode,
  field: { error?: boolean; required?: boolean } = {}
) =>
  render(
    <Form>
      <FormField {...field}>
        <FormLabel>Name</FormLabel>
        {control}
        <FormDescription>Your full name</FormDescription>
        <FormMessage>Name is required</FormMessage>
      </FormField>
    </Form>
  );

const select = (props: React.ComponentProps<typeof SelectTrigger> = {}) => (
  <Select>
    <SelectTrigger {...props}>
      <SelectValue placeholder="Choose" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="a">A</SelectItem>
    </SelectContent>
  </Select>
);

const controls: Array<[string, (props?: object) => React.ReactNode, string]> = [
  ["Input", (p) => <Input {...p} />, "textbox"],
  ["Textarea", (p) => <Textarea {...p} />, "textbox"],
  ["Select trigger", (p) => select(p), "combobox"],
];

describe.each(controls)("%s inside a FormField", (_name, make, role) => {
  it("is the label's control, and is described by the description", () => {
    renderField(make());
    const control = screen.getByLabelText("Name");
    expect(control).toBe(screen.getByRole(role));
    expect(control).toHaveAttribute(
      "aria-describedby",
      expect.stringContaining("-description")
    );
    expect(
      document.getElementById(
        control.getAttribute("aria-describedby")!.split(" ")[0]
      )
    ).toHaveTextContent("Your full name");
  });

  it("is not invalid or required by default", () => {
    renderField(make());
    const control = screen.getByRole(role);
    expect(control).not.toHaveAttribute("aria-invalid", "true");
    expect(control).not.toHaveAttribute("aria-required");
  });

  it("follows the field's error: invalid, and described by the message too", () => {
    renderField(make(), { error: true });
    const control = screen.getByRole(role);
    expect(control).toHaveAttribute("aria-invalid", "true");
    const ids = control.getAttribute("aria-describedby")!.split(" ");
    expect(ids).toHaveLength(2);
    expect(document.getElementById(ids[1])).toHaveTextContent(
      "Name is required"
    );
  });

  it("is announced as required when the field is required", () => {
    renderField(make(), { required: true });
    expect(screen.getByRole(role)).toHaveAttribute("aria-required", "true");
  });

  it("lets its own props win", () => {
    renderField(
      make({ id: "mine", error: false, "aria-describedby": "elsewhere" }),
      { error: true }
    );
    const control = screen.getByRole(role);
    expect(control).toHaveAttribute("id", "mine");
    expect(control).not.toHaveAttribute("aria-invalid", "true");
    expect(control).toHaveAttribute("aria-describedby", "elsewhere");
  });
});

describe("controls used on their own", () => {
  it("get no id and no required state from anywhere", () => {
    render(<Input aria-label="Solo" />);
    const input = screen.getByLabelText("Solo");
    expect(input).not.toHaveAttribute("id");
    expect(input).toHaveAttribute("aria-invalid", "false");
    expect(input).not.toHaveAttribute("aria-required");
    expect(input).not.toHaveAttribute("aria-describedby");
  });

  it("keep Radix's own aria-required on a select with a required root", () => {
    render(
      <Select required>
        <SelectTrigger aria-label="Solo">
          <SelectValue placeholder="Choose" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">A</SelectItem>
        </SelectContent>
      </Select>
    );
    expect(screen.getByRole("combobox")).toHaveAttribute(
      "aria-required",
      "true"
    );
  });
});

describe("FormLabel", () => {
  it("is a Label: it takes the field's error and required state", () => {
    renderField(<Input />, { error: true, required: true });
    const label = screen.getByText("Name").closest("label")!;
    expect(label).toHaveClass("text-(--color-label-error-text)");
    expect(
      label.querySelector('span[aria-label="required"]')
    ).toHaveTextContent("*");
  });
});
