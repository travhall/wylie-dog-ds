import type { ReactNode } from "react";
import { lengthParts, type TokenRow } from "./token-data";

/**
 * Layout shared by the Foundations token pages. These pages are the one place
 * stories read tokens directly: they exist to display them.
 */

export function PageIntro({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <header className="mb-8 max-w-3xl space-y-2">
      <h2 className="text-3xl font-semibold tracking-tight text-(--color-foreground-default)">
        {title}
      </h2>
      <div className="text-sm text-(--color-foreground-muted) space-y-2">
        {children}
      </div>
    </header>
  );
}

export function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="mb-10 space-y-4">
      <div className="max-w-3xl space-y-1">
        <h3 className="text-xl font-semibold tracking-tight text-(--color-foreground-default)">
          {title}
        </h3>
        {description ? (
          <p className="text-sm text-(--color-foreground-muted)">
            {description}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

/** A length as rem with px beside it (Figma shows px); anything else as is. */
export function TokenValue({ value }: { value: string }) {
  const { rem, px } = lengthParts(value);
  if (!rem || !px) {
    return <span>{value}</span>;
  }
  return (
    <span>
      {rem} <span className="text-(--color-foreground-muted)">({px})</span>
    </span>
  );
}

export function TokenTable({
  caption,
  rows,
  specimenLabel = "Specimen",
  variableLabel = "CSS variable",
  specimen,
  renderValue,
}: {
  caption: string;
  rows: TokenRow[];
  specimenLabel?: string;
  variableLabel?: string;
  specimen: (row: TokenRow) => ReactNode;
  renderValue?: (row: TokenRow) => ReactNode;
}) {
  return (
    <div className="overflow-x-auto rounded-md border border-(--color-border-default)">
      <table className="w-full border-collapse text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead className="bg-(--color-background-muted) text-(--color-foreground-default)">
          <tr>
            <th scope="col" className="px-4 py-2 font-semibold">
              {specimenLabel}
            </th>
            <th scope="col" className="px-4 py-2 font-semibold">
              Token
            </th>
            <th scope="col" className="px-4 py-2 font-semibold">
              {variableLabel}
            </th>
            <th scope="col" className="px-4 py-2 font-semibold">
              Value
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.variable}
              className="border-t border-(--color-border-default) align-middle"
            >
              <td className="px-4 py-3">{specimen(row)}</td>
              <th
                scope="row"
                className="px-4 py-3 font-mono font-semibold text-(--color-foreground-default)"
              >
                {row.key}
              </th>
              <td className="px-4 py-3 font-mono text-(--color-foreground-muted)">
                {row.variable}
              </td>
              <td className="px-4 py-3 font-mono text-(--color-foreground-default)">
                {renderValue ? (
                  renderValue(row)
                ) : (
                  <TokenValue value={row.value} />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
