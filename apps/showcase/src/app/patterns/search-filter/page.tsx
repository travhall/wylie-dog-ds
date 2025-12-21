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
        <h1 className="text-3xl font-bold tracking-tight mb-4">
          Search & Filter
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl">
          Implement powerful search and filtering capabilities with a clean,
          intuitive interface. Help users find exactly what they're looking for
          with real-time results.
        </p>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Search Bar */}
        <Card>
          <CardHeader>
            <CardTitle>Search Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by name or category..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Filters and Results */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div
            className="space-y-4
          "
          >
            <Button
              variant="outline"
              className="w-full justify-between lg:hidden"
              onClick={() => setShowFilters(!showFilters)}
            >
              <span>Filters</span>
              {showFilters ? (
                <ChevronUp className="ml-2 h-4 w-4" />
              ) : (
                <ChevronDown className="ml-2 h-4 w-4" />
              )}
            </Button>

            <Card className={`lg:block ${!showFilters ? "hidden" : ""}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Filters</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="h-8 px-2 text-sm text-muted-foreground"
                  >
                    Clear all
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Category Filter */}
                <div>
                  <h3 className="text-sm font-medium mb-2">Category</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="category-all"
                        name="category"
                        checked={selectedCategory === null}
                        onChange={() => setSelectedCategory(null)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <label
                        htmlFor="category-all"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        All Categories
                      </label>
                    </div>
                    {categories.map((category) => (
                      <div
                        key={category}
                        className="flex items-center space-x-2"
                      >
                        <input
                          type="radio"
                          id={`category-${category}`}
                          name="category"
                          checked={selectedCategory === category}
                          onChange={() => setSelectedCategory(category)}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <label
                          htmlFor={`category-${category}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {category}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <h3 className="text-sm font-medium mb-2">Price Range</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between space-x-4">
                      <div>
                        <label
                          htmlFor="min-price"
                          className="block text-xs text-muted-foreground mb-1"
                        >
                          Min
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
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
                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 pl-8 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                          />
                        </div>
                      </div>
                      <div className="mt-5">-</div>
                      <div>
                        <label
                          htmlFor="max-price"
                          className="block text-xs text-muted-foreground mb-1"
                        >
                          Max
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
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
                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 pl-8 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* In Stock Toggle */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="in-stock"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label
                    htmlFor="in-stock"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    In stock only
                  </label>
                </div>

                {/* Tags Filter */}
                <div>
                  <h3 className="text-sm font-medium mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {allTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant={
                          selectedTags.includes(tag) ? "default" : "outline"
                        }
                        className="cursor-pointer capitalize"
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
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    {filteredProducts.length} products found
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">
                      Sort by:
                    </span>
                    <select className="h-8 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring">
                      <option>Featured</option>
                      <option>Price: Low to High</option>
                      <option>Price: High to Low</option>
                      <option>Rating</option>
                    </select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredProducts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredProducts.map((product) => (
                      <Card key={product.id} className="overflow-hidden">
                        <div className="aspect-video bg-muted/20 flex items-center justify-center">
                          <div className="text-muted-foreground text-sm">
                            {product.name} Image
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium">{product.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {product.category}
                              </p>
                            </div>
                            <div className="font-bold">${product.price}</div>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {product.tags.map((tag) => (
                              <Badge
                                key={tag}
                                variant="outline"
                                className="text-xs capitalize"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <div className="mt-3 flex items-center justify-between">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <svg
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < Math.floor(product.rating)
                                      ? "text-yellow-400"
                                      : "text-muted-foreground/20"
                                  }`}
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                              <span className="ml-1 text-xs text-muted-foreground">
                                {product.rating}
                              </span>
                            </div>
                            {!product.inStock && (
                              <span className="text-xs text-destructive">
                                Out of Stock
                              </span>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Search className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-sm font-medium">
                      No products found
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Try adjusting your search or filter to find what you're
                      looking for.
                    </p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={clearFilters}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Clear all filters
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Usage Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle>Implementation Guide</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-medium mb-2">Features</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              <li>Real-time search as you type</li>
              <li>
                Multiple filter categories (category, price, stock status, tags)
              </li>
              <li>Responsive design with mobile-friendly filters</li>
              <li>Clear all filters option</li>
              <li>Sorting functionality</li>
              <li>Visual feedback for active filters</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium mb-2">Best Practices</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              <li>Provide immediate feedback when filters are applied</li>
              <li>Show the number of results</li>
              <li>Make it easy to clear all filters</li>
              <li>Use URL parameters for shareable/filterable links</li>
              <li>Optimize for performance with debounced search</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
