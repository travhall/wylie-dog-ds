"use client";

import { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@wyliedog/ui/card";
import { Input } from "@wyliedog/ui/input";
import { Badge } from "@wyliedog/ui/badge";
import { Button } from "@wyliedog/ui/button";
import {
  Search,
  X,
  Filter,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

// Define types for our data
interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  inStock: boolean;
  rating: number;
  tags: string[];
}

// Sample data
const sampleProducts: Product[] = [
  {
    id: "1",
    name: "Wireless Headphones",
    category: "Electronics",
    price: 199.99,
    inStock: true,
    rating: 4.5,
    tags: ["wireless", "audio", "bluetooth"],
  },
  {
    id: "2",
    name: "Smart Watch",
    category: "Wearables",
    price: 299.99,
    inStock: true,
    rating: 4.2,
    tags: ["smartwatch", "fitness", "bluetooth"],
  },
  {
    id: "3",
    name: "Laptop Backpack",
    category: "Accessories",
    price: 79.99,
    inStock: true,
    rating: 4.7,
    tags: ["laptop", "travel", "office"],
  },
  {
    id: "4",
    name: "Mechanical Keyboard",
    category: "Electronics",
    price: 129.99,
    inStock: false,
    rating: 4.8,
    tags: ["keyboard", "gaming", "mechanical"],
  },
  {
    id: "5",
    name: "Wireless Mouse",
    category: "Electronics",
    price: 49.99,
    inStock: true,
    rating: 4.3,
    tags: ["mouse", "wireless", "bluetooth"],
  },
];

// Available categories and tags
const categories = [...new Set(sampleProducts.map((p) => p.category))];
const allTags = Array.from(new Set(sampleProducts.flatMap((p) => p.tags)));

export default function SearchFilterPage() {
  // State for search and filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);

  // Filter products based on search and filters
  const filteredProducts = useMemo(() => {
    return sampleProducts.filter((product) => {
      // Search by name or category
      const matchesSearch =
        searchQuery === "" ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase());

      // Filter by category
      const matchesCategory =
        !selectedCategory || product.category === selectedCategory;

      // Filter by tags (all selected tags must be present)
      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.every((tag) => product.tags.includes(tag));

      // Filter by stock status
      const matchesStock = !inStockOnly || product.inStock;

      // Filter by price range
      const matchesPrice =
        product.price >= priceRange[0] && product.price <= priceRange[1];

      return (
        matchesSearch &&
        matchesCategory &&
        matchesTags &&
        matchesStock &&
        matchesPrice
      );
    });
  }, [searchQuery, selectedCategory, selectedTags, inStockOnly, priceRange]);

  // Toggle tag selection
  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory(null);
    setSelectedTags([]);
    setInStockOnly(false);
    setPriceRange([0, 500]);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-4 text-(--color-text-primary)">
          Search & Filter
        </h1>
        <p className="text-lg text-(--color-text-secondary) max-w-3xl">
          Implement powerful search and filtering capabilities with a clean,
          intuitive interface. Help users find exactly what they're looking for
          with real-time results.
        </p>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Search Bar */}
        <Card className="glass border-(--color-border-primary)/10 shadow-lg">
          <CardHeader>
            <CardTitle className="text-(--color-text-primary)">
              Search Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--color-text-tertiary)" />
              <Input
                type="search"
                placeholder="Search by name or category..."
                className="pl-10 border-(--color-border-primary)/20 bg-(--color-background-primary)/50 focus:ring-(--color-border-focus)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Filters and Results */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="space-y-4">
            <Button
              variant="outline"
              className="w-full justify-between lg:hidden border-(--color-border-primary)/20 text-(--color-text-secondary)"
              onClick={() => setShowFilters(!showFilters)}
            >
              <span>Filters</span>
              {showFilters ? (
                <ChevronUp className="ml-2 h-4 w-4" />
              ) : (
                <ChevronDown className="ml-2 h-4 w-4" />
              )}
            </Button>

            <Card
              className={`lg:block glass-dark border-(--color-border-primary)/10 shadow-md ${!showFilters ? "hidden" : ""}`}
            >
              <CardHeader className="pb-3 border-b border-(--color-border-primary)/5">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base text-(--color-text-primary)">
                    Filters
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="h-8 px-2 text-xs font-medium text-(--color-text-tertiary) hover:text-(--color-interactive-danger) hover:bg-(--color-interactive-danger)/5"
                  >
                    Clear all
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-8 pt-6">
                {/* Category Filter */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-(--color-text-tertiary) mb-4">
                    Category
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 cursor-pointer group">
                      <input
                        type="radio"
                        id="category-all"
                        name="category"
                        checked={selectedCategory === null}
                        onChange={() => setSelectedCategory(null)}
                        className="h-4 w-4 border-(--color-border-primary)/30 bg-transparent text-(--color-interactive-primary) focus:ring-(--color-interactive-primary)/20"
                      />
                      <label
                        htmlFor="category-all"
                        className="text-sm font-medium text-(--color-text-secondary) group-hover:text-(--color-text-primary) cursor-pointer transition-colors"
                      >
                        All Categories
                      </label>
                    </div>
                    {categories.map((category) => (
                      <div
                        key={category}
                        className="flex items-center space-x-3 cursor-pointer group"
                      >
                        <input
                          type="radio"
                          id={`category-${category}`}
                          name="category"
                          checked={selectedCategory === category}
                          onChange={() => setSelectedCategory(category)}
                          className="h-4 w-4 border-(--color-border-primary)/30 bg-transparent text-(--color-interactive-primary) focus:ring-(--color-interactive-primary)/20"
                        />
                        <label
                          htmlFor={`category-${category}`}
                          className="text-sm font-medium text-(--color-text-secondary) group-hover:text-(--color-text-primary) cursor-pointer transition-colors"
                        >
                          {category}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-(--color-text-tertiary) mb-4">
                    Price Range
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1">
                        <label
                          htmlFor="min-price"
                          className="block text-[10px] uppercase font-bold text-(--color-text-tertiary) mb-1.5 ml-1"
                        >
                          Min
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-(--color-text-tertiary)">
                            $
                          </span>
                          <input
                            type="number"
                            id="min-price"
                            min="0"
                            max={priceRange[1]}
                            value={priceRange[0]}
                            onChange={(e) =>
                              setPriceRange([
                                Math.min(
                                  Number(e.target.value),
                                  priceRange[1] - 1
                                ),
                                priceRange[1],
                              ])
                            }
                            className="flex h-9 w-full rounded-lg border border-(--color-border-primary)/20 bg-(--color-background-primary)/50 px-3 pl-7 py-1 text-sm text-(--color-text-secondary) focus:ring-1 focus:ring-(--color-border-focus) focus:outline-none transition-all"
                          />
                        </div>
                      </div>
                      <div className="mt-7 text-(--color-text-tertiary)">-</div>
                      <div className="flex-1">
                        <label
                          htmlFor="max-price"
                          className="block text-[10px] uppercase font-bold text-(--color-text-tertiary) mb-1.5 ml-1"
                        >
                          Max
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-(--color-text-tertiary)">
                            $
                          </span>
                          <input
                            type="number"
                            id="max-price"
                            min={priceRange[0]}
                            max="1000"
                            value={priceRange[1]}
                            onChange={(e) =>
                              setPriceRange([
                                priceRange[0],
                                Math.max(
                                  Number(e.target.value),
                                  priceRange[0] + 1
                                ),
                              ])
                            }
                            className="flex h-9 w-full rounded-lg border border-(--color-border-primary)/20 bg-(--color-background-primary)/50 px-3 pl-7 py-1 text-sm text-(--color-text-secondary) focus:ring-1 focus:ring-(--color-border-focus) focus:outline-none transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* In Stock Toggle */}
                <div className="flex items-center space-x-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    id="in-stock"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="h-4 w-4 rounded border-(--color-border-primary)/30 bg-transparent text-(--color-interactive-primary) focus:ring-(--color-interactive-primary)/20"
                  />
                  <label
                    htmlFor="in-stock"
                    className="text-sm font-medium text-(--color-text-secondary) group-hover:text-(--color-text-primary) cursor-pointer transition-colors"
                  >
                    In stock only
                  </label>
                </div>

                {/* Tags Filter */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-(--color-text-tertiary) mb-4">
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {allTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant={
                          selectedTags.includes(tag) ? "default" : "outline"
                        }
                        className={`cursor-pointer capitalize text-[10px] font-bold px-2 py-0.5 border-(--color-border-primary)/20 transition-all ${
                          selectedTags.includes(tag)
                            ? "bg-(--color-interactive-primary) text-white border-transparent"
                            : "text-(--color-text-tertiary) hover:border-(--color-interactive-primary) hover:text-(--color-interactive-primary)"
                        }`}
                        onClick={() => toggleTag(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            <Card className="glass border-(--color-border-primary)/10 shadow-lg min-h-[600px] flex flex-col">
              <CardHeader className="pb-4 border-b border-(--color-border-primary)/5 bg-(--color-background-secondary)/5">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base text-(--color-text-primary)">
                      {filteredProducts.length}{" "}
                      {filteredProducts.length === 1 ? "product" : "products"}{" "}
                      found
                    </CardTitle>
                    <p className="text-xs text-(--color-text-tertiary)">
                      Refined specifically for your selection
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-(--color-text-tertiary)">
                      Sort:
                    </span>
                    <select className="h-9 rounded-lg border border-(--color-border-primary)/20 bg-(--color-background-primary)/50 px-3 pl-2 py-1 text-sm text-(--color-text-secondary) focus:ring-1 focus:ring-(--color-border-focus) focus:outline-none transition-all">
                      <option>Featured</option>
                      <option>Price: Low to High</option>
                      <option>Price: High to Low</option>
                      <option>Rating</option>
                    </select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 flex-1">
                {filteredProducts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredProducts.map((product) => (
                      <Card
                        key={product.id}
                        className="overflow-hidden border-(--color-border-primary)/10 bg-(--color-background-primary)/30 group hover:border-(--color-border-primary)/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                      >
                        <div className="aspect-video bg-(--color-background-secondary)/20 flex items-center justify-center relative overflow-hidden">
                          <div className="text-(--color-text-tertiary) text-xs font-medium uppercase tracking-[0.2em]">
                            {product.name}
                          </div>
                          {!product.inStock && (
                            <div className="absolute inset-0 bg-(--color-background-primary)/80 backdrop-blur-sm flex items-center justify-center">
                              <Badge
                                variant="destructive"
                                className="bg-(--color-interactive-danger) text-white border-transparent"
                              >
                                Out of Stock
                              </Badge>
                            </div>
                          )}
                        </div>
                        <div className="p-5">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-bold text-(--color-text-primary) mb-1 group-hover:text-(--color-interactive-primary) transition-colors">
                                {product.name}
                              </h3>
                              <p className="text-xs font-semibold text-(--color-text-tertiary) uppercase tracking-wider">
                                {product.category}
                              </p>
                            </div>
                            <div className="text-lg font-bold text-(--color-text-primary)">
                              ${product.price}
                            </div>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {product.tags.map((tag) => (
                              <Badge
                                key={tag}
                                variant="outline"
                                className="text-[10px] font-medium border-(--color-border-primary)/10 text-(--color-text-tertiary) bg-(--color-background-secondary)/5"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <div className="mt-5 flex items-center justify-between border-t border-(--color-border-primary)/5 pt-4">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <svg
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < Math.floor(product.rating)
                                      ? "text-(--color-interactive-warning)"
                                      : "text-(--color-text-tertiary)/20"
                                  }`}
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                              <span className="ml-2 text-xs font-bold text-(--color-text-secondary)">
                                {product.rating}
                              </span>
                            </div>
                            <Button
                              size="sm"
                              className="h-8 bg-(--color-interactive-primary) text-white hover:opacity-90"
                            >
                              View Details
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-20 h-20 bg-(--color-background-secondary)/50 rounded-full flex items-center justify-center mb-6 border border-(--color-border-primary)/10 shadow-inner">
                      <Search className="h-10 w-10 text-(--color-text-tertiary) opacity-40" />
                    </div>
                    <h3 className="text-lg font-bold text-(--color-text-primary) mb-2">
                      No products found
                    </h3>
                    <p className="text-sm text-(--color-text-tertiary) max-w-xs mx-auto mb-8">
                      We couldn't find any products matching your current search
                      or filter criteria. Try adjusting them!
                    </p>
                    <Button
                      variant="outline"
                      className="border-(--color-border-primary)/20 text-(--color-text-secondary) hover:text-(--color-interactive-danger) hover:border-(--color-interactive-danger)/20"
                      onClick={clearFilters}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Reset all filters
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Usage Guidelines */}
      <Card className="glass border-(--color-border-primary)/10 shadow-lg">
        <CardHeader className="border-b border-(--color-border-primary)/5 bg-(--color-background-secondary)/5">
          <CardTitle className="text-(--color-text-primary)">
            Implementation Guide
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-(--color-text-primary) mb-4">
                Core Features
              </h3>
              <ul className="space-y-3">
                {[
                  "Real-time search with instant visual feedback",
                  "Multi-dimensional filtering (category, price, stock, tags)",
                  "Adaptive responsive layout for all device sizes",
                  "One-tap reset for all active filter states",
                  "Advanced sorting logic with clean UI controls",
                  "Empty state handling with actionable recovery",
                ].map((feature, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 text-sm text-(--color-text-secondary)"
                  >
                    <div className="mt-1 h-1.5 w-1.5 rounded-full bg-(--color-interactive-primary) shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-(--color-text-primary) mb-4">
                Design Best Practices
              </h3>
              <ul className="space-y-3">
                {[
                  "Maintain ultra-fast feedback loops for user actions",
                  "Clearly display the total count of matched results",
                  "Ensure filter categories are logically grouped",
                  "Utilize persistent URL states for shareable results",
                  "Implement debounced search for high-volume data",
                  "Use clear visual cues for active filter states",
                ].map((practice, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 text-sm text-(--color-text-secondary)"
                  >
                    <div className="mt-1 h-1.5 w-1.5 rounded-full bg-(--color-interactive-primary) shrink-0" />
                    {practice}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
