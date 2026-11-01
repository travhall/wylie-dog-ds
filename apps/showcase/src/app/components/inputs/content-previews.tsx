"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@wyliedog/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@wyliedog/ui/alert";
import { Avatar, AvatarFallback } from "@wyliedog/ui/avatar";
import { Badge } from "@wyliedog/ui/badge";
import { Calendar } from "@wyliedog/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@wyliedog/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@wyliedog/ui/carousel";
import { Progress } from "@wyliedog/ui/progress";
import { Skeleton } from "@wyliedog/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@wyliedog/ui/table";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastTitle,
} from "@wyliedog/ui/toast";

/*
 * Live previews for the Content Display and Feedback & Status cards on
 * /components. Like control-previews.tsx, every piece is the real
 * @wyliedog/ui component, so the cards follow the tokens and variants.
 */

export function AccordionPreview() {
  return (
    <Accordion
      type="single"
      collapsible
      defaultValue="shipping"
      className="max-w-60"
    >
      <AccordionItem value="shipping">
        <AccordionTrigger>Shipping</AccordionTrigger>
        <AccordionContent>
          Free over $50, 2-day delivery on stock items.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="returns">
        <AccordionTrigger>Returns</AccordionTrigger>
        <AccordionContent>Returns accepted within 30 days.</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

export function AvatarPreview() {
  return (
    <div className="flex max-w-60 flex-wrap items-center justify-center gap-2">
      {["EM", "JR", "AK", "+8"].map((initials) => (
        <Avatar key={initials} size="md" semanticRole="decorative">
          <AvatarFallback size="md" initials={initials} />
        </Avatar>
      ))}
    </div>
  );
}

export function BadgePreview() {
  return (
    <div className="flex max-w-60 flex-wrap justify-center gap-1.5">
      <Badge>Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="success">Active</Badge>
      <Badge variant="warning">Beta</Badge>
      <Badge variant="destructive">Deprecated</Badge>
    </div>
  );
}

export function CalendarPreview() {
  return (
    <div className="rounded-md border border-(--color-border-default) bg-(--color-background-default)">
      <Calendar mode="single" className="w-full max-w-60" />
    </div>
  );
}

export function CardPreview() {
  return (
    <Card className="w-full max-w-60">
      <CardHeader>
        <CardTitle>Release 1.4</CardTitle>
        <CardDescription>68 components migrated</CardDescription>
      </CardHeader>
      <CardContent>
        <Badge variant="success">On track</Badge>
      </CardContent>
    </Card>
  );
}

export function CarouselPreview() {
  const tiles = [
    "bg-(--color-background-primary-muted)",
    "bg-(--color-background-info-muted)",
    "bg-(--color-background-success-muted)",
  ];
  return (
    <div className="w-full max-w-60">
      <Carousel>
        <CarouselContent>
          {tiles.map((tile, i) => (
            <CarouselItem key={tile} className="basis-1/2">
              <div
                role="img"
                aria-label={`Slide ${i + 1}`}
                className={`aspect-3/4 rounded-md ${tile}`}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-1" />
        <CarouselNext className="right-1" />
      </Carousel>
    </div>
  );
}

export function TablePreview() {
  const rows = [
    ["Elena", "Active", "success"],
    ["Jude", "Away", "warning"],
    ["Ari", "Active", "success"],
  ] as const;
  return (
    <div className="w-full max-w-64 overflow-hidden rounded-md border border-(--color-border-default) bg-(--color-background-default)">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map(([name, status, variant]) => (
            <TableRow key={name}>
              <TableCell>{name}</TableCell>
              <TableCell>
                <Badge variant={variant} size="sm">
                  {status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

/* `role="region"` keeps these static demos from being announced as live
   alerts on page load; the real variants set `alert` or `status`. AlertTitle
   renders an h5, and demo UI is not page structure (docs/showcase-audit), so
   its heading role is dropped here. */
export function AlertPreview() {
  return (
    <div className="flex w-full max-w-64 flex-col gap-2">
      <Alert variant="success" role="region" aria-label="Build status">
        <AlertTitle role="presentation">Build passed</AlertTitle>
        <AlertDescription>3,402 tests</AlertDescription>
      </Alert>
      <Alert variant="warning" role="region" aria-label="Deprecations">
        <AlertTitle role="presentation">2 deprecation warnings</AlertTitle>
      </Alert>
      <Alert variant="destructive" role="region" aria-label="Connection">
        <AlertTitle role="presentation">Connection lost</AlertTitle>
        <AlertDescription>Retrying…</AlertDescription>
      </Alert>
    </div>
  );
}

export function ProgressPreview() {
  const rows = [
    ["Uploading", 68, "default"],
    ["Published", 100, "success"],
    ["Quota", 92, "warning"],
    ["Failed", 24, "destructive"],
  ] as const;
  return (
    <div className="flex w-full max-w-60 flex-col gap-2.5">
      {rows.map(([label, value, variant]) => (
        <div key={label} className="flex flex-col gap-1">
          <div className="flex justify-between text-xs text-(--color-foreground-muted)">
            <span>{label}</span>
            <span className="font-mono">{value}%</span>
          </div>
          <Progress value={value} variant={variant} aria-label={label} />
        </div>
      ))}
    </div>
  );
}

export function SkeletonPreview() {
  return (
    <div className="flex w-full max-w-60 items-center gap-3">
      <Skeleton variant="circular" size="xl" className="shrink-0" />
      <div className="flex flex-1 flex-col gap-2">
        <Skeleton variant="text" className="w-3/4" />
        <Skeleton variant="text" className="w-1/2" />
        <Skeleton variant="text" className="w-2/3" />
      </div>
    </div>
  );
}

export function ToastPreview() {
  return (
    <div className="flex w-full max-w-64 flex-col gap-2">
      <Toast
        variant="success"
        role="group"
        aria-live="off"
        aria-label="Theme published"
        className="w-full"
      >
        <div className="flex flex-col gap-1 pr-6">
          <ToastTitle>Theme published</ToastTitle>
          <ToastDescription>v1.4.0 is live in production</ToastDescription>
        </div>
        <ToastClose srText="Dismiss" />
      </Toast>
    </div>
  );
}
