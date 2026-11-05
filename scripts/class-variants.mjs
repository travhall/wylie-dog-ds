// The utility of a Tailwind class without its variants, shared by the guards that read
// class names (audit-raw-values, check-component-binding, check-design-utilities).
//
// A variant may hold brackets, nested ones too (`[&[data-state=open]>svg]:rotate-180`,
// `**:[[cmdk-group-heading]]:px-2`), so a regex that stops at the first `]` leaves the
// variant behind and the utility unread. The last colon outside any bracket or
// parenthesis splits the class instead.
export function stripVariants(cls) {
  let depth = 0;
  let cut = -1;
  for (let i = 0; i < cls.length; i++) {
    const c = cls[i];
    if (c === "[" || c === "(") depth++;
    else if (c === "]" || c === ")") depth--;
    else if (c === ":" && depth === 0) cut = i;
  }
  return cls.slice(cut + 1);
}
