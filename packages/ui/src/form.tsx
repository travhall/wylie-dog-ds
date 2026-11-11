"use client";

import React, { useContext, useId } from "react";
import { cn } from "./lib/utils";
import { FormFieldContext } from "./form-field-context";
import { Label, labelVariants, type LabelProps } from "./label";

/**
 * @deprecated A form label is a Label, with the same tokens. Use `labelVariants` from
 * `@wyliedog/ui/label`; this alias stays so existing imports keep working.
 */
export const formLabelVariants = labelVariants;

export const useFormField = () => {
  const context = useContext(FormFieldContext);
  if (!context) {
    throw new Error(
      "useFormField must be used within a FormField component. Wrap your form elements with <FormField>."
    );
  }
  return context;
};

// Form Root
type FormProps = React.FormHTMLAttributes<HTMLFormElement>;

const Form = React.forwardRef<HTMLFormElement, FormProps>(
  ({ className, ...props }, ref) => (
    <form
      ref={ref}
      className={cn("space-y-(--space-form-item-gap)", className)}
      {...props}
    />
  )
);
Form.displayName = "Form";

// Enhanced FormField with accessibility context
interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  error?: boolean;
  required?: boolean;
}

const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  ({ className, error = false, required = false, ...props }, ref) => {
    const id = useId();
    const errorId = error ? `${id}-error` : undefined;
    const descriptionId = `${id}-description`;

    return (
      <FormFieldContext.Provider
        value={{
          id,
          errorId,
          descriptionId,
          isInvalid: error,
          isRequired: required,
        }}
      >
        <div
          ref={ref}
          className={cn("space-y-(--space-form-label-gap)", className)}
          {...props}
        />
      </FormFieldContext.Provider>
    );
  }
);
FormField.displayName = "FormField";

// Maintained for backwards compatibility
type FormItemProps = React.HTMLAttributes<HTMLDivElement>;

const FormItem = React.forwardRef<HTMLDivElement, FormItemProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("space-y-(--space-form-label-gap)", className)}
      {...props}
    />
  )
);
FormItem.displayName = "FormItem";

// FormLabel is a Label wired to the nearest FormField: it points at the field's control and takes
// the field's error and required state. The look (and its tokens) is the Label's.
type FormLabelProps = Omit<LabelProps, "error" | "required">;

const FormLabel = React.forwardRef<HTMLLabelElement, FormLabelProps>(
  ({ children, ...props }, ref) => {
    const { id, isRequired, isInvalid } = useFormField();

    return (
      <Label
        ref={ref}
        htmlFor={id}
        error={isInvalid}
        required={isRequired}
        {...props}
      >
        {children}
      </Label>
    );
  }
);
FormLabel.displayName = "FormLabel";

// Maintained for backwards compatibility
type FormControlProps = React.HTMLAttributes<HTMLDivElement>;

const FormControl = React.forwardRef<HTMLDivElement, FormControlProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("", className)} {...props} />
  )
);
FormControl.displayName = "FormControl";

// Enhanced FormDescription with automatic ID assignment
type FormDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>;

const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  FormDescriptionProps
>(({ className, ...props }, ref) => {
  const { descriptionId } = useFormField();

  return (
    <p
      ref={ref}
      id={descriptionId}
      className={cn(
        "text-(length:--font-size-form-description-font-size) leading-(--line-height-form-description-line-height) text-(--color-form-description)",
        className
      )}
      {...props}
    />
  );
});
FormDescription.displayName = "FormDescription";

// Enhanced FormMessage with accessibility attributes
type FormMessageProps = React.HTMLAttributes<HTMLParagraphElement>;

const FormMessage = React.forwardRef<HTMLParagraphElement, FormMessageProps>(
  ({ className, ...props }, ref) => {
    const { errorId, isInvalid } = useFormField();

    if (!isInvalid) return null;

    return (
      <p
        ref={ref}
        id={errorId}
        role="alert"
        aria-live="polite"
        className={cn(
          "text-(length:--font-size-form-error-font-size) leading-(--line-height-form-error-line-height) font-(--font-weight-form-error-font-weight) text-(--color-form-error)",
          className
        )}
        {...props}
      />
    );
  }
);
FormMessage.displayName = "FormMessage";

export {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
};
