import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@wyliedog/ui/carousel";
import { Card, CardContent } from "@wyliedog/ui/card";

const meta: Meta<typeof Carousel> = {
  title: "Components/Content Display/Carousel",
  component: Carousel,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A carousel component for displaying content in a scrollable container with navigation controls. Built with Embla Carousel for smooth touch and keyboard navigation.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    orientation: {
      control: "radio",
      options: ["horizontal", "vertical"],
      description: "The orientation of the carousel",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "horizontal" },
      },
    },
    opts: {
      description:
        "Embla Carousel options for advanced configuration (loop, align, etc.)",
      table: {
        type: { summary: "EmblaOptionsType" },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Carousel className="w-full max-w-xs">
      <CarouselContent>
        {Array.from({ length: 5 }, (_, index) => (
          <CarouselItem key={index}>
            <div className="p-1">
              <Card>
                <CardContent className="flex aspect-square items-center justify-center p-6">
                  <span className="text-4xl font-semibold">{index + 1}</span>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  ),
};

export const ProductCarousel: Story = {
  render: () => (
    <Carousel className="w-full max-w-sm">
      <CarouselContent>
        {[
          {
            name: "Product 1",
            price: "$99",
            color: "bg-(--color-background-tertiary)",
          },
          {
            name: "Product 2",
            price: "$149",
            color: "bg-(--color-background-tertiary)",
          },
          {
            name: "Product 3",
            price: "$199",
            color: "bg-(--color-background-tertiary)",
          },
          {
            name: "Product 4",
            price: "$79",
            color: "bg-(--color-background-tertiary)",
          },
        ].map((product, index) => (
          <CarouselItem key={index}>
            <div className="p-1">
              <Card>
                <CardContent className="p-4">
                  <div
                    className={`${product.color} h-32 rounded mb-4 flex items-center justify-center`}
                  >
                    <span className="text-sm text-(--color-text-secondary)">
                      Image
                    </span>
                  </div>
                  <h3 className="font-semibold">{product.name}</h3>
                  <p className="text-xl font-bold text-(--color-text-primary)">
                    {product.price}
                  </p>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  ),
};

export const MultipleItems: Story = {
  render: () => (
    <Carousel className="w-full max-w-4xl mx-auto">
      <CarouselContent className="-ml-1">
        {Array.from({ length: 10 }, (_, index) => (
          <CarouselItem key={index} className="pl-1 md:basis-1/2 lg:basis-1/3">
            <div className="p-1">
              <Card>
                <CardContent className="flex aspect-square items-center justify-center p-6">
                  <span className="text-2xl font-semibold">{index + 1}</span>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  ),
};

export const Testimonials: Story = {
  render: () => (
    <Carousel className="w-full max-w-lg">
      <CarouselContent>
        {[
          {
            quote:
              "This product has completely transformed our workflow. Highly recommended!",
            author: "Sarah Johnson",
            role: "Product Manager",
          },
          {
            quote:
              "Outstanding customer service and excellent quality. Will definitely buy again.",
            author: "Mike Chen",
            role: "Developer",
          },
          {
            quote:
              "Simple to use and incredibly powerful. Exactly what we needed.",
            author: "Lisa Rodriguez",
            role: "Designer",
          },
        ].map((testimonial, index) => (
          <CarouselItem key={index}>
            <div className="p-1">
              <Card>
                <CardContent className="p-6">
                  <blockquote className="text-lg italic mb-4">
                    "{testimonial.quote}"
                  </blockquote>
                  <div className="text-right">
                    <p className="font-semibold">{testimonial.author}</p>
                    <p className="text-sm text-(--color-text-secondary)">
                      {testimonial.role}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  ),
};

export const WithoutControls: Story = {
  render: () => (
    <Carousel className="w-full max-w-xs">
      <CarouselContent>
        {Array.from({ length: 5 }, (_, index) => (
          <CarouselItem key={index}>
            <div className="p-1">
              <Card>
                <CardContent className="flex aspect-square items-center justify-center p-6">
                  <span className="text-4xl font-semibold">{index + 1}</span>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  ),
};

export const ImageGallery: Story = {
  render: () => (
    <Carousel className="w-full max-w-lg">
      <CarouselContent>
        {Array.from({ length: 6 }, (_, index) => (
          <CarouselItem key={index}>
            <div className="p-1">
              <Card>
                <CardContent className="p-0">
                  <div
                    className={`aspect-video rounded bg-linear-to-br from-gray-200 to-gray-300 flex items-center justify-center`}
                  >
                    <span className="text-lg text-(--color-text-secondary)">
                      Image {index + 1}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  ),
};
