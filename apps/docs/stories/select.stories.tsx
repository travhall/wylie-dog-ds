import type { Meta, StoryObj } from "@storybook/react-vite";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue,
  SelectSeparator 
} from "@wyliedog/ui/select";
import { Label } from "@wyliedog/ui/label";

const meta: Meta<typeof Select> = {
  title: "Components/Select",
  component: Select,
  parameters: { 
    layout: "centered",
    docs: {
      description: {
        component: 'Select component built on Radix UI primitives with keyboard navigation, search, and full accessibility support. Includes trigger, content, items, and separator sub-components.'
      }
    }
  },
  tags: ["autodocs"],
  argTypes: {
    disabled: {
      control: "boolean",
      description: "Whether the select is disabled",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="w-64 space-y-2">
      <Label htmlFor="default-select">Choose a country</Label>
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select a country" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="us">United States</SelectItem>
          <SelectItem value="ca">Canada</SelectItem>
          <SelectItem value="uk">United Kingdom</SelectItem>
          <SelectItem value="de">Germany</SelectItem>
          <SelectItem value="fr">France</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
};

export const WithError: Story = {
  render: () => (
    <div className="w-64 space-y-2">
      <Label htmlFor="error-select" error required>Choose a category</Label>
      <Select>
        <SelectTrigger error>
          <SelectValue placeholder="This field is required" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="tech">Technology</SelectItem>
          <SelectItem value="design">Design</SelectItem>
          <SelectItem value="business">Business</SelectItem>
        </SelectContent>
      </Select>
      <p className="text-xs text-red-600">Please select a category</p>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="w-64 space-y-2">
        <Label size="sm">Small Select</Label>
        <Select>
          <SelectTrigger size="sm">
            <SelectValue placeholder="Small select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="xs">Extra Small</SelectItem>
            <SelectItem value="sm">Small</SelectItem>
            <SelectItem value="md">Medium</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="w-64 space-y-2">
        <Label size="md">Medium Select (Default)</Label>
        <Select>
          <SelectTrigger size="md">
            <SelectValue placeholder="Medium select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sm">Small</SelectItem>
            <SelectItem value="md">Medium</SelectItem>
            <SelectItem value="lg">Large</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="w-64 space-y-2">
        <Label size="lg">Large Select</Label>
        <Select>
          <SelectTrigger size="lg">
            <SelectValue placeholder="Large select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="md">Medium</SelectItem>
            <SelectItem value="lg">Large</SelectItem>
            <SelectItem value="xl">Extra Large</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  ),
};

export const WithSeparators: Story = {
  render: () => (
    <div className="w-64 space-y-2">
      <Label>Choose your timezone</Label>
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select timezone" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="pst">Pacific Standard Time (PST)</SelectItem>
          <SelectItem value="mst">Mountain Standard Time (MST)</SelectItem>
          <SelectItem value="cst">Central Standard Time (CST)</SelectItem>
          <SelectItem value="est">Eastern Standard Time (EST)</SelectItem>
          <SelectSeparator />
          <SelectItem value="gmt">Greenwich Mean Time (GMT)</SelectItem>
          <SelectItem value="cet">Central European Time (CET)</SelectItem>
          <SelectItem value="jst">Japan Standard Time (JST)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
};

export const LongLists: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-6">
      <div className="w-64 space-y-2">
        <Label>Choose a language</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="es">Español</SelectItem>
            <SelectItem value="fr">Français</SelectItem>
            <SelectItem value="de">Deutsch</SelectItem>
            <SelectItem value="it">Italiano</SelectItem>
            <SelectItem value="pt">Português</SelectItem>
            <SelectItem value="ru">Русский</SelectItem>
            <SelectItem value="ja">日本語</SelectItem>
            <SelectItem value="ko">한국어</SelectItem>
            <SelectItem value="zh">中文</SelectItem>
            <SelectItem value="ar">العربية</SelectItem>
            <SelectItem value="hi">हिन्दी</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="w-64 space-y-2">
        <Label>Programming language</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="js">JavaScript</SelectItem>
            <SelectItem value="ts">TypeScript</SelectItem>
            <SelectItem value="py">Python</SelectItem>
            <SelectItem value="java">Java</SelectItem>
            <SelectItem value="cpp">C++</SelectItem>
            <SelectItem value="cs">C#</SelectItem>
            <SelectItem value="go">Go</SelectItem>
            <SelectItem value="rust">Rust</SelectItem>
            <SelectItem value="php">PHP</SelectItem>
            <SelectItem value="ruby">Ruby</SelectItem>
            <SelectItem value="swift">Swift</SelectItem>
            <SelectItem value="kotlin">Kotlin</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  ),
};

export const FormExamples: Story = {
  render: () => (
    <div className="max-w-2xl space-y-8">
      {/* User Profile Form */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">User Profile</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="first-name" required>First Name</Label>
            <input 
              id="first-name"
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="John"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="last-name" required>Last Name</Label>
            <input 
              id="last-name"
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Doe"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Country</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="us">United States</SelectItem>
                <SelectItem value="ca">Canada</SelectItem>
                <SelectItem value="uk">United Kingdom</SelectItem>
                <SelectItem value="de">Germany</SelectItem>
                <SelectItem value="fr">France</SelectItem>
                <SelectItem value="jp">Japan</SelectItem>
                <SelectItem value="au">Australia</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Occupation</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select occupation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="developer">Software Developer</SelectItem>
                <SelectItem value="designer">UI/UX Designer</SelectItem>
                <SelectItem value="manager">Product Manager</SelectItem>
                <SelectItem value="analyst">Data Analyst</SelectItem>
                <SelectItem value="marketing">Marketing Specialist</SelectItem>
                <SelectSeparator />
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Project Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Project Settings</h3>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label required>Project Type</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="web">Web Application</SelectItem>
                <SelectItem value="mobile">Mobile App</SelectItem>
                <SelectItem value="desktop">Desktop App</SelectItem>
                <SelectItem value="api">API Service</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Framework</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Choose framework" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="react">React</SelectItem>
                <SelectItem value="vue">Vue.js</SelectItem>
                <SelectItem value="angular">Angular</SelectItem>
                <SelectItem value="svelte">Svelte</SelectItem>
                <SelectSeparator />
                <SelectItem value="next">Next.js</SelectItem>
                <SelectItem value="nuxt">Nuxt.js</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Team Size</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="solo">Solo (1 person)</SelectItem>
                <SelectItem value="small">Small (2-5 people)</SelectItem>
                <SelectItem value="medium">Medium (6-15 people)</SelectItem>
                <SelectItem value="large">Large (16+ people)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  ),
};