"use client";

import { Card, CardContent } from "@wyliedog/ui/card";
import { Badge } from "@wyliedog/ui/badge";
import { Avatar, AvatarFallback } from "@wyliedog/ui/avatar";
import { Button } from "@wyliedog/ui/button";
import { Progress } from "@wyliedog/ui/progress";
import { Switch } from "@wyliedog/ui/switch";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@wyliedog/ui/select";

const TEAM = [
  {
    initials: "EM",
    bg: "var(--color-fiery-coral-300)",
    fg: "var(--color-fiery-coral-950)",
  },
  {
    initials: "JR",
    bg: "var(--color-green-300)",
    fg: "var(--color-green-950)",
  },
  { initials: "AK", bg: "var(--color-blue-300)", fg: "var(--color-blue-950)" },
];

export function HeroPreview() {
  return (
    <div className="relative">
      {/* floating tag */}
      <div className="absolute -top-3 left-6 z-10 inline-flex items-center gap-1.5 rounded-full glass-dark px-2.5 py-1 font-mono text-xs uppercase tracking-wider text-(--color-foreground-muted)">
        <svg
          viewBox="0 0 24 24"
          className="h-3 w-3"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
        Live components
      </div>

      <div className="glass rounded-2xl p-5 sm:p-6 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.12)]">
        {/* Project card */}
        <Card
          className="p-5 gap-0"
          style={{ background: "var(--color-background-default)" }}
        >
          <CardContent className="p-0">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-(--color-foreground-faint)">
                  Project
                </p>
                <p className="mt-1 text-base font-semibold">
                  Migration to v1.4
                </p>
              </div>
              <Badge variant="success" className="gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                On track
              </Badge>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-(--color-foreground-muted)">
                  68 of 100 components migrated
                </span>
                <span className="font-mono text-(--color-foreground-faint)">
                  68%
                </span>
              </div>
              <Progress value={68} className="h-1.5" />
            </div>

            <div className="mt-5 flex items-center justify-between">
              <div className="flex -space-x-2">
                {TEAM.map((a) => (
                  <Avatar
                    key={a.initials}
                    size="sm"
                    className="border-2"
                    style={{ borderColor: "var(--color-background-default)" }}
                  >
                    <AvatarFallback
                      initials={a.initials}
                      size="sm"
                      style={{ background: a.bg, color: a.fg }}
                    />
                  </Avatar>
                ))}
                <Avatar
                  size="sm"
                  semanticRole="decorative"
                  className="border-2"
                  style={{ borderColor: "var(--color-background-default)" }}
                >
                  <AvatarFallback initials="+4" size="sm" />
                </Avatar>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1 px-2 text-xs font-medium text-(--color-foreground-muted)"
              >
                View team
                <svg
                  viewBox="0 0 24 24"
                  className="h-3 w-3"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Second row: Switch + Select */}
        <div className="mt-3 grid grid-cols-2 gap-3">
          <Card
            className="p-3 gap-0"
            style={{ background: "var(--color-background-default)" }}
          >
            <CardContent className="p-0 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold">Auto-deploy</p>
                <p className="text-xs text-(--color-foreground-faint)">
                  on merge to main
                </p>
              </div>
              <Switch
                size="sm"
                defaultChecked
                aria-label="Auto-deploy on merge to main"
              />
            </CardContent>
          </Card>
          <Card
            className="p-3 gap-0"
            style={{ background: "var(--color-background-default)" }}
          >
            <CardContent className="p-0">
              <p className="text-xs font-semibold mb-1.5">Theme</p>
              <Select defaultValue="system">
                <SelectTrigger
                  size="sm"
                  className="h-7 text-xs"
                  aria-label="Theme"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="system">System</SelectItem>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Corner annotation */}
      <div className="absolute -bottom-3 right-6 inline-flex items-center gap-1.5 rounded-full glass-dark px-2.5 py-1 font-mono text-xs uppercase tracking-wider text-(--color-foreground-muted)">
        7 components rendered
      </div>
    </div>
  );
}
