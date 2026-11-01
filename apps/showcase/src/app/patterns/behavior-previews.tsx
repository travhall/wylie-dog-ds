"use client";

import { Component, useState, type ReactNode } from "react";
import { Alert, AlertDescription, AlertTitle } from "@wyliedog/ui/alert";
import { Avatar, AvatarFallback } from "@wyliedog/ui/avatar";
import { Badge } from "@wyliedog/ui/badge";
import { Button } from "@wyliedog/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@wyliedog/ui/card";
import { CardGrid } from "@wyliedog/ui/card-grid";
import { Input } from "@wyliedog/ui/input";
import { Label } from "@wyliedog/ui/label";
import { Separator } from "@wyliedog/ui/separator";
import { Field } from "./form-previews";

/*
 * Live previews for the error boundary, layout, responsive and accessibility
 * patterns on /patterns. Everything is a real @wyliedog/ui component, and the
 * behaviors (error recovery, live regions, focus) are real too.
 */

/* ── Error boundary ─────────────────────────────────────────────── */

class Boundary extends Component<
  { fallback: (reset: () => void) => ReactNode; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed
      ? this.props.fallback(() => this.setState({ failed: false }))
      : this.props.children;
  }
}

function Chart({ broken }: { broken: boolean }) {
  if (broken) throw new Error("Chart data is out of range");
  return (
    <div
      className="flex h-16 items-end gap-1.5"
      role="img"
      aria-label="Weekly signups chart"
    >
      {[40, 65, 50, 80, 60, 90, 75].map((h, i) => (
        <div
          key={i}
          className="flex-1 rounded-sm bg-(--color-background-primary-muted)"
          style={{ height: `${h}%` }}
        />
      ))}
    </div>
  );
}

export function ErrorBoundaryPreview() {
  const [broken, setBroken] = useState(false);
  return (
    <div className="grid w-full max-w-2xl gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle role="presentation">Weekly signups</CardTitle>
          <CardDescription>This card has its own boundary.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Boundary
            fallback={(reset) => (
              <Alert
                variant="destructive"
                role="region"
                aria-label="Chart error"
              >
                <AlertTitle role="presentation">
                  Chart failed to render
                </AlertTitle>
                <AlertDescription>
                  The rest of the page still works.
                </AlertDescription>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-2"
                  onClick={() => {
                    setBroken(false);
                    reset();
                  }}
                >
                  Try again
                </Button>
              </Alert>
            )}
          >
            <Chart broken={broken} />
          </Boundary>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setBroken(true)}
            disabled={broken}
          >
            Break the chart
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle role="presentation">Everything else</CardTitle>
          <CardDescription>
            A failure stays inside its boundary, so this card keeps working.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Badge variant="success">Still running</Badge>
        </CardContent>
      </Card>
    </div>
  );
}

/* ── Layout ─────────────────────────────────────────────────────── */

export function LayoutPreview() {
  const people = [
    ["EM", "Elena Mori", "Published tokens"],
    ["JR", "Jude Reyes", "Reviewed a pull request"],
    ["AK", "Ari Klein", "Added a component"],
  ];
  return (
    <div className="flex w-full max-w-2xl flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ["Tokens", "In sync"],
          ["Components", "Documented"],
          ["Checks", "Passing"],
        ].map(([label, value]) => (
          <Card key={label}>
            <CardHeader>
              <CardDescription>{label}</CardDescription>
              <CardTitle role="presentation">{value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle role="presentation">Recent activity</CardTitle>
        </CardHeader>
        <CardContent>
          {people.map(([initials, name, what], i) => (
            <div key={name}>
              {i > 0 ? <Separator className="my-3" /> : null}
              <div className="flex items-center gap-3">
                <Avatar size="sm" semanticRole="decorative">
                  <AvatarFallback size="sm" initials={initials} />
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-(--color-foreground-default)">
                    {name}
                  </p>
                  <p className="text-xs text-(--color-foreground-muted)">
                    {what}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

/* ── Responsive ─────────────────────────────────────────────────── */

export function ResponsivePreview() {
  return (
    <div className="flex w-full max-w-2xl flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2 text-sm text-(--color-foreground-muted)">
        <span>Window size:</span>
        <Badge variant="secondary">
          <span className="md:hidden">Mobile, 1 column</span>
          <span className="hidden md:inline lg:hidden">Tablet, 2 columns</span>
          <span className="hidden lg:inline">Desktop, 3 columns</span>
        </Badge>
        <span>Resize the window to see the grid change.</span>
      </div>
      <CardGrid columns={{ sm: 1, md: 2, lg: 3, xl: 3 }} variant="compact">
        {["Tokens", "Components", "Patterns"].map((name) => (
          <Card key={name}>
            <CardHeader>
              <CardTitle role="presentation">{name}</CardTitle>
              <CardDescription>Fits the space it is given.</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </CardGrid>
    </div>
  );
}

/* ── Accessibility ──────────────────────────────────────────────── */

export function AccessibilityPreview() {
  const [saved, setSaved] = useState(false);
  return (
    <div className="grid w-full max-w-4xl gap-4 md:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle role="presentation">Focus ring</CardTitle>
          <CardDescription>
            Press Tab. The ring comes from the focus tokens.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Button size="sm">Save draft</Button>
          <Label htmlFor="a11y-focus-input" size="sm">
            Project name
          </Label>
          <Input id="a11y-focus-input" size="sm" defaultValue="Wylie Dog" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle role="presentation">Error announcement</CardTitle>
          <CardDescription>
            The message is tied to the field and announced when it appears.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Field
            label="Email"
            type="email"
            required
            defaultValue="elena@wyl"
            error
            message="Enter a full email address."
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle role="presentation">Live region</CardTitle>
          <CardDescription>
            A polite status message, announced without moving focus.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Button size="sm" onClick={() => setSaved(true)}>
            Save changes
          </Button>
          <div aria-live="polite" role="status" className="min-h-10">
            {saved ? (
              <Alert variant="success" role="region">
                <AlertDescription>Changes saved.</AlertDescription>
              </Alert>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
