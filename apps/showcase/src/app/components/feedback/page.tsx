import { Card, CardHeader, CardTitle, CardContent } from "@wyliedog/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@wyliedog/ui/alert";
import { Progress } from "@wyliedog/ui/progress";
import { Skeleton } from "@wyliedog/ui/skeleton";
import { CheckCircle2, Clock, AlertCircle, Info } from "lucide-react";

const getStatusIcon = (status: string) => {
  switch (status) {
    case "stable":
      return (
        <CheckCircle2 className="h-3.5 w-3.5 text-(--color-text-success)" />
      );
    case "beta":
      return <Clock className="h-3.5 w-3.5 text-(--color-text-warning)" />;
    default:
      return null;
  }
};

export default function FeedbackPage() {
  const components = [
    {
      name: "Alert",
      description: "Displays a callout for user attention.",
      status: "stable",
      preview: (
        <Alert className="glass py-2 scale-90 origin-center bg-(--color-interactive-primary)/3 border-(--color-interactive-primary)/10">
          <Info className="h-4 w-4 text-(--color-interactive-primary)" />
          <AlertTitle className="text-xs font-bold">Heads up!</AlertTitle>
          <AlertDescription className="text-[10px] opacity-70">
            You can add components to your app.
          </AlertDescription>
        </Alert>
      ),
    },
    {
      name: "Progress",
      description:
        "Displays an indicator showing the completion progress of a task, typically displayed as a progress bar.",
      status: "beta",
      preview: (
        <Progress
          value={66}
          className="w-[150px] h-2 bg-(--color-interactive-primary)/10"
        />
      ),
    },
    {
      name: "Skeleton",
      description: "Used to show a placeholder while content is loading.",
      status: "stable",
      preview: (
        <div className="flex items-center space-x-4">
          <Skeleton className="h-10 w-10 rounded-full bg-(--color-border-primary)/10" />
          <div className="space-y-2">
            <Skeleton className="h-3 w-[80px] bg-(--color-border-primary)/10" />
            <Skeleton className="h-3 w-[50px] bg-(--color-border-primary)/10" />
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-12">
      <section className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight text-(--color-text-primary)">
          Feedback
        </h1>
        <p className="text-lg text-(--color-text-secondary) leading-relaxed">
          Status indicators and messaging components that communicate states to
          the user.
        </p>
      </section>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {components.map((comp) => (
          <Card
            key={comp.name}
            className="glass border-(--color-border-primary)/10 group hover:border-(--color-interactive-primary)/30 transition-all duration-500 flex flex-col"
          >
            <CardHeader className="p-6">
              <div className="flex items-center justify-between mb-2">
                <CardTitle className="text-xl font-bold group-hover:text-(--color-interactive-primary) transition-colors text-(--color-text-primary)">
                  {comp.name}
                </CardTitle>
                <div className="flex items-center gap-1.5 glass border-(--color-border-primary)/5 px-2 py-0.5 rounded-full scale-90">
                  {getStatusIcon(comp.status)}
                  <span className="text-[9px] uppercase font-black tracking-widest text-(--color-text-secondary)">
                    {comp.status}
                  </span>
                </div>
              </div>
              <p className="text-sm text-(--color-text-secondary) leading-relaxed">
                {comp.description}
              </p>
            </CardHeader>
            <CardContent className="p-6 pt-0 mt-auto">
              <div className="glass bg-(--color-background-secondary)/20 rounded-xl p-4 min-h-[100px] flex items-center justify-center border border-(--color-border-primary)/5">
                {comp.preview}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
