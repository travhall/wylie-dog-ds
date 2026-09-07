import { Lock, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { PatternCard } from "@/components/pattern-card";

export default function AuthPatternsPage() {
  return (
    <div className="relative mx-auto max-w-7xl space-y-12 p-4 lg:p-8 xl:p-12">
      <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <Link
          href="/patterns"
          className="inline-flex items-center gap-2 text-sm text-(--color-text-secondary) hover:text-(--color-interactive-primary) transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          All Patterns
        </Link>
        <div className="flex items-center gap-4">
          <div className="p-3 bg-(--color-text-info)/10 rounded-2xl">
            <Lock className="h-8 w-8 text-(--color-text-info)" />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-(--color-text-primary)">
              Authentication
            </h1>
            <p className="text-(--color-text-secondary) mt-1">
              2 patterns — Login, registration, and password recovery
            </p>
          </div>
        </div>
        <p className="text-lg text-(--color-text-secondary) leading-relaxed max-w-2xl pt-2">
          Accessible authentication flows with form validation, error states,
          and WCAG-compliant labels and feedback.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <PatternCard
          name="Login & Registration"
          description="Combined login and sign-up form with email/password fields, social auth placeholders, validation, and inline error messages."
          components={["Card", "Form", "Input", "Button", "Label"]}
          storybookPath="/story/patterns-authentication-login-registration--default"
        />
        <PatternCard
          name="Password Recovery"
          description="Forgot password flow with email input, submission confirmation, and accessible alert feedback for errors and success states."
          components={["Card", "Form", "Input", "Button", "Alert"]}
          storybookPath="/story/patterns-authentication-password-recovery--default"
        />
      </div>
    </div>
  );
}
