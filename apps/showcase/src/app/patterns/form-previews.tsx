"use client";

import { useState, type FormEvent } from "react";
import { Alert, AlertDescription } from "@wyliedog/ui/alert";
import { Button } from "@wyliedog/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@wyliedog/ui/card";
import { Checkbox } from "@wyliedog/ui/checkbox";
import {
  Form,
  FormDescription,
  FormField,
  FormLabel,
  FormMessage,
  useFormField,
} from "@wyliedog/ui/form";
import { Input, type InputProps } from "@wyliedog/ui/input";
import { Label } from "@wyliedog/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@wyliedog/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@wyliedog/ui/tabs";
import { Textarea } from "@wyliedog/ui/textarea";

/*
 * Live previews for the form and authentication patterns on /patterns. Every
 * control is a real @wyliedog/ui component at its small size, and each card
 * shows one idea. The forms work: nothing is submitted anywhere, the submit
 * handlers only change local state.
 */

const stay = (e: FormEvent) => e.preventDefault();

/* An Input wired to the surrounding FormField for id, error and description. */
function FieldInput(props: InputProps) {
  const { id, errorId, descriptionId, isInvalid } = useFormField();
  return (
    <Input
      id={id}
      size="sm"
      error={isInvalid}
      errorId={errorId}
      aria-describedby={descriptionId}
      {...props}
    />
  );
}

function Field({
  label,
  required,
  error,
  message,
  hint,
  ...input
}: InputProps & {
  label: string;
  error?: boolean;
  message?: string;
  hint?: string;
}) {
  return (
    <FormField error={error} required={required}>
      <FormLabel size="sm">{label}</FormLabel>
      <FieldInput {...input} />
      {hint ? <FormDescription>{hint}</FormDescription> : null}
      <FormMessage>{message}</FormMessage>
    </FormField>
  );
}

export function LoginPreview() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Welcome</CardTitle>
        <CardDescription>Sign in or create an account.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="signin">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign in</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          <TabsContent value="signin">
            <Form onSubmit={stay}>
              <Field
                label="Email"
                type="email"
                autoComplete="email"
                defaultValue="elena@example.com"
              />
              <Field
                label="Password"
                type="password"
                autoComplete="current-password"
                defaultValue="correct horse"
              />
              <div className="flex items-center gap-2">
                <Checkbox id="login-remember" size="sm" defaultChecked />
                <Label htmlFor="login-remember" size="sm">
                  Remember me
                </Label>
              </div>
              <Button size="sm" type="submit" className="w-full">
                Sign in
              </Button>
            </Form>
          </TabsContent>
          <TabsContent value="register">
            <Form onSubmit={stay}>
              <Field
                label="Name"
                autoComplete="name"
                placeholder="Elena Mori"
              />
              <Field
                label="Email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
              />
              <Button size="sm" type="submit" className="w-full">
                Create account
              </Button>
            </Form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export function RecoveryPreview() {
  const [sent, setSent] = useState(false);
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Reset your password</CardTitle>
        <CardDescription>
          Enter your email and we will send a link.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
          }}
        >
          <Field
            label="Email"
            type="email"
            autoComplete="email"
            defaultValue="elena@example.com"
            required
          />
          {sent ? (
            <Alert variant="success" role="status">
              <AlertDescription>
                Check your inbox. The link works for 30 minutes.
              </AlertDescription>
            </Alert>
          ) : null}
          <Button size="sm" type="submit" className="w-full">
            {sent ? "Send again" : "Send reset link"}
          </Button>
        </Form>
      </CardContent>
    </Card>
  );
}

export function ContactFormPreview() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Contact us</CardTitle>
      </CardHeader>
      <CardContent>
        <Form onSubmit={stay}>
          <Field label="Name" autoComplete="name" placeholder="Elena Mori" />
          <div className="space-y-(--space-form-label-gap)">
            <Label htmlFor="contact-topic" size="sm">
              Topic
            </Label>
            <Select size="sm" defaultValue="tokens">
              <SelectTrigger id="contact-topic">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tokens">Tokens</SelectItem>
                <SelectItem value="components">Components</SelectItem>
                <SelectItem value="other">Something else</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-(--space-form-label-gap)">
            <Label htmlFor="contact-message" size="sm">
              Message
            </Label>
            <Textarea
              id="contact-message"
              size="sm"
              resize="none"
              rows={3}
              placeholder="How can we help?"
            />
          </div>
          <Button size="sm" type="submit" className="w-full">
            Send message
          </Button>
        </Form>
      </CardContent>
    </Card>
  );
}

export function ValidationPreview() {
  const [email, setEmail] = useState("elena@example");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState({ email: true, password: false });
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const passwordValid = password.length >= 8;
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Validate as you type</CardTitle>
        <CardDescription>
          Errors show once a field has been visited.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form onSubmit={stay} noValidate>
          <Field
            label="Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, email: true }))}
            error={touched.email && !emailValid}
            message="Enter a full email address, like you@example.com."
          />
          <Field
            label="Password"
            type="password"
            required
            value={password}
            autoComplete="new-password"
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, password: true }))}
            error={touched.password && !passwordValid}
            hint="At least 8 characters."
            message="Use at least 8 characters."
          />
          <Button
            size="sm"
            type="submit"
            className="w-full"
            disabled={!emailValid || !passwordValid}
          >
            Create account
          </Button>
        </Form>
      </CardContent>
    </Card>
  );
}
