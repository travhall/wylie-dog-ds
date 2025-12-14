import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../accordion';

expect.extend(toHaveNoViolations);

const TestAccordion = ({
  type = 'single' as const,
  collapsible = false,
  defaultValue,
}: {
  type?: 'single' | 'multiple';
  collapsible?: boolean;
  defaultValue?: string | string[];
}) => (
  <Accordion type={type} collapsible={collapsible} defaultValue={defaultValue}>
    <AccordionItem value="item-1">
      <AccordionTrigger>Section 1</AccordionTrigger>
      <AccordionContent>Content for section 1</AccordionContent>
    </AccordionItem>
    <AccordionItem value="item-2">
      <AccordionTrigger>Section 2</AccordionTrigger>
      <AccordionContent>Content for section 2</AccordionContent>
    </AccordionItem>
    <AccordionItem value="item-3">
      <AccordionTrigger>Section 3</AccordionTrigger>
      <AccordionContent>Content for section 3</AccordionContent>
    </AccordionItem>
  </Accordion>
);

describe('Accordion', () => {
  describe('Accessibility', () => {
    it('should pass accessibility audit when closed', async () => {
      const { container } = render(<TestAccordion type="single" collapsible />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper aria-expanded state', async () => {
      const user = userEvent.setup();
      render(<TestAccordion type="single" collapsible />);

      const trigger = screen.getByText('Section 1');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');

      await user.click(trigger);

      await waitFor(() => {
        expect(trigger).toHaveAttribute('aria-expanded', 'true');
      });
    });

    it('should have proper aria-controls association', async () => {
      const user = userEvent.setup();
      render(<TestAccordion type="single" collapsible />);

      const trigger = screen.getByText('Section 1');
      await user.click(trigger);

      await waitFor(() => {
        const controlsId = trigger.getAttribute('aria-controls');
        expect(controlsId).toBeTruthy();

        const content = document.getElementById(controlsId!);
        expect(content).toBeInTheDocument();
      });
    });
  });

  describe('Functionality', () => {
    it('should render all triggers', () => {
      render(<TestAccordion type="single" collapsible />);

      expect(screen.getByText('Section 1')).toBeInTheDocument();
      expect(screen.getByText('Section 2')).toBeInTheDocument();
      expect(screen.getByText('Section 3')).toBeInTheDocument();
    });

    it('should not show content when closed', () => {
      render(<TestAccordion type="single" collapsible />);

      // Accordion content is not rendered in the DOM when closed
      expect(screen.queryByText('Content for section 1')).not.toBeInTheDocument();
    });

    it('should show content on trigger click', async () => {
      const user = userEvent.setup();
      render(<TestAccordion type="single" collapsible />);

      await user.click(screen.getByText('Section 1'));

      await waitFor(() => {
        expect(screen.getByText('Content for section 1')).toBeVisible();
      });
    });

    it('should close other items in single mode', async () => {
      const user = userEvent.setup();
      render(<TestAccordion type="single" collapsible />);

      await user.click(screen.getByText('Section 1'));

      await waitFor(() => {
        expect(screen.getByText('Content for section 1')).toBeVisible();
      });

      await user.click(screen.getByText('Section 2'));

      await waitFor(() => {
        expect(screen.getByText('Content for section 2')).toBeVisible();
        // Closed accordion content is removed from the DOM
        expect(screen.queryByText('Content for section 1')).not.toBeInTheDocument();
      });
    });

    it('should allow multiple items open in multiple mode', async () => {
      const user = userEvent.setup();
      render(<TestAccordion type="multiple" />);

      await user.click(screen.getByText('Section 1'));
      await user.click(screen.getByText('Section 2'));

      await waitFor(() => {
        expect(screen.getByText('Content for section 1')).toBeVisible();
        expect(screen.getByText('Content for section 2')).toBeVisible();
      });
    });

    it('should toggle item when clicked again in collapsible mode', async () => {
      const user = userEvent.setup();
      render(<TestAccordion type="single" collapsible />);

      const trigger = screen.getByText('Section 1');

      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('Content for section 1')).toBeVisible();
      });

      await user.click(trigger);

      await waitFor(() => {
        // Closed accordion content is removed from the DOM
        expect(screen.queryByText('Content for section 1')).not.toBeInTheDocument();
      });
    });

    it('should show default value', () => {
      render(<TestAccordion type="single" collapsible defaultValue="item-2" />);

      expect(screen.getByText('Content for section 2')).toBeVisible();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should navigate with arrow keys', async () => {
      const user = userEvent.setup();
      render(<TestAccordion type="single" collapsible />);

      const trigger1 = screen.getByText('Section 1');
      trigger1.focus();

      await user.keyboard('{ArrowDown}');

      const trigger2 = screen.getByText('Section 2');
      expect(trigger2).toHaveFocus();
    });

    it('should activate item with Enter key', async () => {
      const user = userEvent.setup();
      render(<TestAccordion type="single" collapsible />);

      const trigger = screen.getByText('Section 1');
      trigger.focus();

      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByText('Content for section 1')).toBeVisible();
      });
    });

    it('should activate item with Space key', async () => {
      const user = userEvent.setup();
      render(<TestAccordion type="single" collapsible />);

      const trigger = screen.getByText('Section 1');
      trigger.focus();

      await user.keyboard(' ');

      await waitFor(() => {
        expect(screen.getByText('Content for section 1')).toBeVisible();
      });
    });
  });

  describe('Styling', () => {
    it('should have chevron icon', () => {
      render(<TestAccordion type="single" collapsible />);

      const trigger = screen.getByText('Section 1');
      const icon = trigger.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('should rotate chevron when open', async () => {
      const user = userEvent.setup();
      render(<TestAccordion type="single" collapsible />);

      const trigger = screen.getByText('Section 1');

      await user.click(trigger);

      await waitFor(() => {
        expect(trigger).toHaveAttribute('data-state', 'open');
      });
    });

    it('should apply custom className to item', () => {
      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="item1" className="custom-item-class">
            <AccordionTrigger>Trigger</AccordionTrigger>
            <AccordionContent>Content</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      const item = screen.getByText('Trigger').closest('.custom-item-class');
      expect(item).toBeInTheDocument();
    });

    it('should have border styling', () => {
      render(<TestAccordion type="single" collapsible />);

      const item = screen.getByText('Section 1').closest('[class*="border-b"]');
      expect(item).toHaveClass('border-b');
    });
  });

  describe('Integration', () => {
    it('should forward ref to AccordionItem', () => {
      const ref = React.createRef<HTMLDivElement>();

      render(
        <Accordion type="single" collapsible>
          <AccordionItem ref={ref} value="item1">
            <AccordionTrigger>Trigger</AccordionTrigger>
            <AccordionContent>Content</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('Edge Cases', () => {
    it('should handle single item', () => {
      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="only">
            <AccordionTrigger>Only Item</AccordionTrigger>
            <AccordionContent>Only Content</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      expect(screen.getByText('Only Item')).toBeInTheDocument();
    });

    it('should handle many items', () => {
      render(
        <Accordion type="single" collapsible>
          {Array.from({ length: 10 }, (_, i) => (
            <AccordionItem key={i} value={`item${i}`}>
              <AccordionTrigger>Item {i}</AccordionTrigger>
              <AccordionContent>Content {i}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      );

      expect(screen.getByText('Item 0')).toBeInTheDocument();
      expect(screen.getByText('Item 9')).toBeInTheDocument();
    });

    it('should handle complex content', async () => {
      const user = userEvent.setup();

      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="complex">
            <AccordionTrigger>Complex</AccordionTrigger>
            <AccordionContent>
              <div>
                <h4>Heading</h4>
                <p>Paragraph</p>
                <button>Button</button>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      await user.click(screen.getByText('Complex'));

      await waitFor(() => {
        expect(screen.getByText('Heading')).toBeVisible();
        expect(screen.getByText('Paragraph')).toBeVisible();
        expect(screen.getByText('Button')).toBeVisible();
      });
    });
  });
});
