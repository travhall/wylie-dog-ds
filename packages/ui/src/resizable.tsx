import React from "react";
import { GripVerticalIcon } from "lucide-react";
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
  type ImperativePanelGroupHandle,
  type ImperativePanelHandle,
  type PanelGroupProps,
  type PanelProps,
  type PanelResizeHandleProps,
} from "react-resizable-panels";
import { cn } from "./lib/utils";

interface ResizablePanelGroupProps extends Omit<PanelGroupProps, "direction"> {
  direction?: PanelGroupProps["direction"];
}

const ResizablePanelGroup = React.forwardRef<
  ImperativePanelGroupHandle,
  ResizablePanelGroupProps
>(({ className, direction = "horizontal", ...props }, ref) => (
  <PanelGroup
    ref={ref}
    direction={direction}
    className={cn(
      "flex w-full data-[panel-group-direction=vertical]:flex-col",
      className
    )}
    {...props}
  />
));
ResizablePanelGroup.displayName = "ResizablePanelGroup";

type ResizablePanelProps = PanelProps;

const ResizablePanel = React.forwardRef<
  ImperativePanelHandle,
  ResizablePanelProps
>(({ className, ...props }, ref) => (
  <Panel ref={ref} className={cn("flex-1", className)} {...props} />
));
ResizablePanel.displayName = "ResizablePanel";

interface ResizableHandleProps extends PanelResizeHandleProps {
  withHandle?: boolean;
}

const ResizableHandle = ({
  className,
  withHandle,
  ...props
}: ResizableHandleProps) => (
  <PanelResizeHandle
    className={cn(
      "relative flex w-px items-center justify-center bg-(--color-resizable-handle) after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:outline-none focus-visible:ring-(length:--space-resizable-handle-focus-ring-width) focus-visible:ring-(--color-border-focus) focus-visible:ring-offset-(length:--space-resizable-handle-focus-ring-offset) data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0 [&[data-panel-group-direction=vertical]>div]:rotate-90",
      className
    )}
    {...props}
  >
    {withHandle && (
      <div className="z-(--z-index-dropdown) flex h-(--space-resizable-handle-height) w-(--space-resizable-handle-width) items-center justify-center rounded-(--space-resizable-handle-radius) border border-(--color-resizable-handle-border) bg-(--color-resizable-handle-background)">
        <GripVerticalIcon className="h-(--space-resizable-grip-icon-size) w-(--space-resizable-grip-icon-size)" />
      </div>
    )}
  </PanelResizeHandle>
);
ResizableHandle.displayName = "ResizableHandle";

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
