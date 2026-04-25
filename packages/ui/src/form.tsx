"use client";

import React, { createContext, useContext, useId } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./lib/utils";

export const formLabelVariants = cva(
  "font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-(--state-opacity-muted)",
  {
    variants: {
      size: {
        sm: "text-(length:--font-size-label-font-size-sm)",
        md: "text-(length:--font-size-label-font-size-md)",
        lg: "text-(length:--font-size-label-font-size-lg)",
      },
      invalid: {
        true: "text-(--color-text-danger)",
        false: "text-(--color-form-label)",
      },
    },
    defaultVariants: {
      size: "md",
      invalid: false,
    },
  }
);

// Form Field Context for accessibility
interface FormFieldContextValue {
  id: string;
  errorId?: string;
  descriptionId?: string;
  isInvalid?: boolean;
  isRequired?: boolean;
}

const FormFieldContext = createContext<FormFieldContextValue | null>(null);

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
interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {}

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
interface FormItemProps extends React.HTMLAttributes<HTMLDivElement> {}

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

// Enhanced FormLabel with automatic accessibility features
interface FormLabelProps
  extends
    React.LabelHTMLAttributes<HTMLLabelElement>,
    Omit<VariantProps<typeof formLabelVariants>, "invalid"> {}

const FormLabel = React.forwardRef<HTMLLabelElement, FormLabelProps>(
  ({ className, size, children, ...props }, ref) => {
    const { id, isRequired, isInvalid } = useFormField();

    return (
      <label
        ref={ref}
        htmlFor={id}
        className={cn(
          formLabelVariants({ size, invalid: isInvalid }),
          className
        )}
        {...props}
      >
        {children}
        {isRequired && (
          <span
            className="text-(--color-text-danger) ml-(--space-form-error-margin)"
            aria-hidden="true"
          >
            *
          </span>
        )}
      </label>
    );
  }
);
FormLabel.displayName = "FormLabel";

// Maintained for backwards compatibility
interface FormControlProps extends React.HTMLAttributes<HTMLDivElement> {}

const FormControl = React.forwardRef<HTMLDivElement, FormControlProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("", className)} {...props} />
  )
);
FormControl.displayName = "FormControl";

// Enhanced FormDescription with automatic ID assignment
interface FormDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

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
        "text-(length:--font-size-form-description-font-size) text-(--color-form-description)",
        className
      )}
      {...props}
    />
  );
});
FormDescription.displayName = "FormDescription";

// Enhanced FormMessage with accessibility attributes
interface FormMessageProps extends React.HTMLAttributes<HTMLParagraphElement> {}

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
          "text-(length:--font-size-form-error-font-size) font-medium text-(--color-form-error)",
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
