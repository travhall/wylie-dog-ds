import { Button } from "@wyliedog/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Test heading with Tailwind utilities */}
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Wylie Dog Design System Test
        </h1>
        
        {/* Test UI components */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">UI Components</h2>
          <div className="flex gap-4">
            <Button variant="primary">Primary Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="ghost">Ghost Button</Button>
          </div>
        </div>

        {/* Test Tailwind utilities with design tokens */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Tailwind Utilities</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-primary-500 text-white p-4 rounded text-center">
              Primary 500
            </div>
            <div className="bg-blue-400 text-white p-4 rounded text-center">
              Blue 400
            </div>
            <div className="bg-green-500 text-white p-4 rounded text-center">
              Green 500
            </div>
            <div className="bg-gray-700 text-white p-4 rounded text-center">
              Gray 700
            </div>
          </div>
        </div>

        {/* Test responsive and spacing */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Responsive & Spacing</h2>
          <div className="space-y-4">
            <div className="p-2 bg-blue-100 rounded">Small spacing (p-2)</div>
            <div className="p-4 bg-green-100 rounded">Medium spacing (p-4)</div>
            <div className="p-8 bg-purple-100 rounded">Large spacing (p-8)</div>
          </div>
        </div>
      </div>
    </div>
  );
}
