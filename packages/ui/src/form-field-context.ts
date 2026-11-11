"use client";

import { createContext, useContext } from "react";

/** What a <FormField> tells the controls and labels inside it. */
export interface FormFieldContextValue {
  id: string;
  errorId?: string;
  descriptionId?: string;
  isInvalid?: boolean;
  isRequired?: boolean;
}

// One context for every entry point. The package ships separate bundles per component and a
// CommonJS build does not share modules between them, so a plain createContext here could end up
// as two different contexts (a FormField from `@wyliedog/ui/form` that an Input from
// `@wyliedog/ui/input` cannot see). Registering it once on the global object avoids that.
const KEY = Symbol.for("@wyliedog/ui/form-field-context");
type Registry = { [KEY]?: React.Context<FormFieldContextValue | null> };

export const FormFieldContext = ((globalThis as Registry)[KEY] ??=
  createContext<FormFieldContextValue | null>(null));

/** The nearest <FormField>'s values, or null when the control is used on its own. */
export const useOptionalFormField = () => useContext(FormFieldContext);
