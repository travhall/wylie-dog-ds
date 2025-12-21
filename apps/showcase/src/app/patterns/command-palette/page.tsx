"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@wyliedog/ui/card";
import { Input } from "@wyliedog/ui/input";
import { Badge } from "@wyliedog/ui/badge";
import { Button } from "@wyliedog/ui/button";
import { Command, CommandItem } from "@wyliedog/ui/command";
import {
  Search,
  File,
  Settings,
  User,
  Mail,
  Calendar,
  Clock,
  Plus,
  ArrowRight,
  Check,
  Command as CommandIcon,
} from "lucide-react";

// Define command types
type CommandAction = {
  id: string;
  name: string;
  icon: React.ReactNode;
  group: string;
  shortcut?: string;
  callback?: () => void;
};

// Sample commands
const commands: CommandAction[] = [
  {
    id: "new-document",
    name: "New Document",
    icon: <File className="h-4 w-4" />,
    group: "General",
    shortcut: "⌘N",
  },
  {
    id: "settings",
    name: "Settings",
    icon: <Settings className="h-4 w-4" />,
    group: "General",
    shortcut: "⌘,",
  },
  {
    id: "profile",
    name: "View Profile",
    icon: <User className="h-4 w-4" />,
    group: "User",
    shortcut: "⌘P",
  },
  {
    id: "inbox",
    name: "Inbox",
    icon: <Mail className="h-4 w-4" />,
    group: "User",
    shortcut: "⌘I",
  },
  {
    id: "calendar",
    name: "Open Calendar",
    icon: <Calendar className="h-4 w-4" />,
    group: "Navigation",
    shortcut: "⌘K C",
  },
  {
    id: "recent",
    name: "Recent Files",
    icon: <Clock className="h-4 w-4" />,
    group: "Navigation",
    shortcut: "⌘O",
  },
];

// Group commands by category
const groupedCommands = commands.reduce<Record<string, CommandAction[]>>(
  (groups, command) => {
    const { group } = command;
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(command);
    return groups;
  },
  {}
);

export default function CommandPalettePage() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const commandListRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter commands based on search query
  const filteredCommands = useMemo(() => {
    if (!searchQuery) return groupedCommands;

    const query = searchQuery.toLowerCase();
    const filtered: Record<string, CommandAction[]> = {};

    Object.entries(groupedCommands).forEach(([group, items]) => {
      const matchingItems = items.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.group.toLowerCase().includes(query)
      );
      if (matchingItems.length > 0) {
        filtered[group] = matchingItems;
      }
    });

    return filtered;
  }, [searchQuery]);

  // Flattened list of commands for keyboard navigation
  const commandList = useMemo(
    () => Object.values(filteredCommands).flat(),
    [filteredCommands]
  );

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Toggle command palette with Cmd+K or Cmd+P
      if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "p")) {
        e.preventDefault();
        setIsOpen(!isOpen);
      }

      if (!isOpen) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < commandList.length - 1 ? prev + 1 : 0
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : commandList.length - 1
          );
          break;
        case "Enter":
          e.preventDefault();
          if (commandList[selectedIndex]) {
            // In a real app, you would execute the command here
            console.log("Executing command:", commandList[selectedIndex].name);
            setIsOpen(false);
          }
          break;
        case "Escape":
          e.preventDefault();
          setIsOpen(false);
          break;
      }
    },
    [isOpen, commandList, selectedIndex]
  );

  // Add keyboard event listeners
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Focus input when command palette opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setSearchQuery("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        commandListRef.current &&
        !commandListRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Scroll selected item into view
  useEffect(() => {
    const selectedItem = document.querySelector("[data-selected=true]");
    if (selectedItem) {
      selectedItem.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [selectedIndex]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-4">
          Command Palette
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl">
          A fast and accessible command palette with keyboard navigation,
          search, and command grouping. Press <kbd className="kbd">⌘</kbd> +{" "}
          <kbd className="kbd">K</kbd> to open.
        </p>
      </div>

      {/* Demo Section */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Interactive Demo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Click the button below or press <kbd className="kbd">⌘</kbd> +{" "}
                <kbd className="kbd">K</kbd> to open the command palette.
              </p>
              <Button onClick={() => setIsOpen(true)}>
                <CommandIcon className="mr-2 h-4 w-4" />
                Open Command Palette
              </Button>
            </div>

            <div className="border rounded-lg p-4 bg-muted/20">
              <h3 className="font-medium mb-2">Try these commands:</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center">
                  <CommandIcon className="mr-2 h-3 w-3" />
                  Type "settings" or "user" to filter commands
                </li>
                <li className="flex items-center">
                  <ArrowRight className="mr-2 h-3 w-3" />
                  Use arrow keys to navigate
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-3 w-3" />
                  Press Enter to select
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Command Palette Overlay */}
        {isOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center p-4 z-50">
            <div
              ref={commandListRef}
              className="w-full max-w-2xl mt-20 bg-background rounded-lg shadow-xl overflow-hidden border"
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="Type a command or search..."
                  className="w-full border-0 border-b rounded-none pl-10 pr-4 py-5 text-base focus-visible:ring-0 focus-visible:ring-offset-0"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSelectedIndex(0);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      e.preventDefault();
                      setIsOpen(false);
                    }
                  }}
                />
              </div>

              <div className="max-h-[60vh] overflow-y-auto p-2">
                {Object.keys(filteredCommands).length > 0 ? (
                  Object.entries(filteredCommands).map(([group, items]) => (
                    <div key={group} className="mb-4">
                      <div className="px-2 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {group}
                      </div>
                      <Command>
                        {items.map((cmd, index) => {
                          const isSelected =
                            commandList.findIndex((c) => c.id === cmd.id) ===
                            selectedIndex;
                          return (
                            <CommandItem
                              key={cmd.id}
                              className={`flex items-center justify-between px-3 py-2 rounded-md text-sm cursor-pointer ${
                                isSelected ? "bg-muted" : "hover:bg-muted/50"
                              }`}
                              onMouseEnter={() =>
                                setSelectedIndex(
                                  commandList.findIndex((c) => c.id === cmd.id)
                                )
                              }
                              onClick={() => {
                                console.log("Executing command:", cmd.name);
                                setIsOpen(false);
                              }}
                              data-selected={isSelected}
                            >
                              <div className="flex items-center">
                                <span className="mr-3 text-muted-foreground">
                                  {cmd.icon}
                                </span>
                                <span>{cmd.name}</span>
                              </div>
                              {cmd.shortcut && (
                                <kbd className="kbd kbd-sm">{cmd.shortcut}</kbd>
                              )}
                            </CommandItem>
                          );
                        })}
                      </Command>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    <p>No commands found</p>
                    <p className="text-xs mt-1">Try a different search term</p>
                  </div>
                )}
              </div>

              <div className="border-t px-4 py-2 text-xs text-muted-foreground flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center">
                    <ArrowRight className="h-3 w-3 mr-1" /> Select
                  </span>
                  <span className="flex items-center">
                    <ArrowRight className="h-3 w-3 mr-1 rotate-180" /> Navigate
                  </span>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  ESC to close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Usage Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle>Implementation Guide</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-medium mb-2">Key Features</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              <li>Keyboard accessible (arrow keys, enter, escape)</li>
              <li>Fuzzy search across command names and groups</li>
              <li>Command grouping and keyboard shortcuts</li>
              <li>Responsive design</li>
              <li>Click outside to close</li>
              <li>Visual feedback for selected item</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium mb-2">Best Practices</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              <li>Use consistent keyboard shortcuts (Cmd+K is standard)</li>
              <li>Group related commands logically</li>
              <li>Keep command names clear and concise</li>
              <li>Provide visual feedback for actions</li>
              <li>Make it accessible via keyboard navigation</li>
              <li>Consider adding icons for better scannability</li>
              {/* cSpell:ignore scannability */}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
