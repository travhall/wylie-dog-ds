import { Button } from "@wyliedog/ui/button";
import { Badge } from "@wyliedog/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@wyliedog/ui/card";
import { Input } from "@wyliedog/ui/input";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 space-y-8">
      <div className="space-y-4 text-center">
        <h1 className="text-4xl font-bold">Wylie Dog Design System</h1>
        
        <div className="space-x-4">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
        </div>

        <div className="space-x-2">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="destructive">Error</Badge>
        </div>

        <div className="w-64">
          <Input placeholder="Test input" />
        </div>

        <Card className="w-80">
          <CardHeader>
            <CardTitle>Card Example</CardTitle>
          </CardHeader>
          <CardContent>
            <p>This is a card component with proper styling.</p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}