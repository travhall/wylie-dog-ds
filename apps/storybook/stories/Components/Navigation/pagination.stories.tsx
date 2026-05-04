import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { within, userEvent, expect } from "storybook/test";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@wyliedog/ui/pagination";

const meta: Meta<typeof Pagination> = {
  title: "Components/Navigation/Pagination",
  component: Pagination,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Navigation component for paginated content with customizable styling and accessibility support. Includes PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext, and PaginationEllipsis subcomponents for building flexible pagination interfaces. Built on semantic HTML with proper ARIA labels for screen readers.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    className: {
      control: "text",
      description:
        "Additional CSS classes to apply to the pagination container",
      table: {
        type: { summary: "string" },
        category: "Styling",
      },
    },
    children: {
      control: false,
      description:
        "Pagination content, typically PaginationContent with nested PaginationItems",
      table: {
        type: { summary: "React.ReactNode" },
        category: "Content",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Standard pagination with previous/next buttons, page numbers, and ellipsis.",
      },
    },
  },
  render: () => (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#" />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">1</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#" isActive>
            2
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">3</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
};

export const Simple: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Minimal pagination with just page numbers and navigation arrows.",
      },
    },
  },
  render: () => (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#" />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">1</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#" isActive>
            2
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">3</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
};

export const FirstPage: Story = {
  parameters: {
    docs: {
      description: {
        story: "Pagination on the first page with a disabled previous button.",
      },
    },
  },
  render: () => (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            className="opacity-50 pointer-events-none"
          />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#" isActive>
            1
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">2</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">3</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">10</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
};

export const LastPage: Story = {
  parameters: {
    docs: {
      description: {
        story: "Pagination on the last page with a disabled next button.",
      },
    },
  },
  render: () => (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#" />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">1</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">8</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">9</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#" isActive>
            10
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#" className="opacity-50 pointer-events-none" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
};

export const Interactive: Story = {
  render: () => {
    const [page, setPage] = React.useState(3);
    return (
      <div className="space-y-4">
        <p className="text-sm text-(--color-text-secondary)">Current page: {page}</p>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => { e.preventDefault(); setPage(p => Math.max(1, p - 1)); }}
                aria-disabled={page === 1}
              />
            </PaginationItem>
            {[1, 2, 3, 4, 5].map(n => (
              <PaginationItem key={n}>
                <PaginationLink
                  href="#"
                  isActive={page === n}
                  onClick={(e) => { e.preventDefault(); setPage(n); }}
                >
                  {n}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => { e.preventDefault(); setPage(p => Math.min(5, p + 1)); }}
                aria-disabled={page === 5}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const nextButton = canvas.getByRole('link', { name: /next/i });
    await userEvent.click(nextButton);
    expect(canvas.getByText('Current page: 4')).toBeInTheDocument();
    const prevButton = canvas.getByRole('link', { name: /previous/i });
    await userEvent.click(prevButton);
    expect(canvas.getByText('Current page: 3')).toBeInTheDocument();
  },
  parameters: {
    docs: { description: { story: 'Controlled pagination with next/previous navigation and active page tracking.' } },
  },
};

export const WithManyPages: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Pagination for large datasets with dual ellipsis and surrounding page numbers.",
      },
    },
  },
  render: () => (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#" />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">1</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">4</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#" isActive>
            5
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">6</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">20</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
};
