import React from "react";
import { GripVerticalIcon } from "lucide-react";
import { cn } from "./lib/utils";

interface ResizablePanelGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: "horizontal" | "vertical";
}

const ResizablePanelGroup = React.forwardRef<
  HTMLDivElement,
  ResizablePanelGroupProps
>(({ className, direction = "horizontal", ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex w-full data-[panel-group-direction=vertical]:flex-col",
      className
    )}
    data-panel-group-direction={direction}
    {...props}
  />
));
ResizablePanelGroup.displayName = "ResizablePanelGroup";

interface ResizablePanelProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultSize?: number;
  minSize?: number;
  maxSize?: number;
}

const ResizablePanel = React.forwardRef<HTMLDivElement, ResizablePanelProps>(
  ({ className, defaultSize, minSize, maxSize, ...props }, ref) => (
    <div ref={ref} className={cn("flex-1", className)} {...props} />
  )
);
ResizablePanel.displayName = "ResizablePanel";

interface ResizableHandleProps extends React.HTMLAttributes<HTMLDivElement> {
  withHandle?: boolean;
}

const ResizableHandle = React.forwardRef<HTMLDivElement, ResizableHandleProps>(
  ({ className, withHandle, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative flex w-px items-center justify-center bg-(--color-resizable-handle) after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-(--color-border-focus) focus-visible:ring-offset-1 data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0 [&[data-panel-group-direction=vertical]>div]:rotate-90",
        className
      )}
      {...props}
    >
      {withHandle && (
        <div className="z-10 flex h-4 w-3 items-center justify-center rounded-(--spacing-resizable-handle-radius) border border-(--color-resizable-handle-border) bg-(--color-resizable-handle-background)">
          <GripVerticalIcon className="h-2.5 w-2.5" />
        </div>
      )}
    </div>
  )
);
ResizableHandle.displayName = "ResizableHandle";

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
