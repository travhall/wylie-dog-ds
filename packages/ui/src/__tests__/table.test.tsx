import React from "react";
import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from "../table";

expect.extend(toHaveNoViolations);

const TestTable = () => (
  <Table>
    <TableCaption>A list of users</TableCaption>
    <TableHeader>
      <TableRow>
        <TableHead>Name</TableHead>
        <TableHead>Email</TableHead>
        <TableHead>Role</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow>
        <TableCell>John Doe</TableCell>
        <TableCell>john@example.com</TableCell>
        <TableCell>Admin</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>Jane Smith</TableCell>
        <TableCell>jane@example.com</TableCell>
        <TableCell>User</TableCell>
      </TableRow>
    </TableBody>
    <TableFooter>
      <TableRow>
        <TableCell colSpan={3}>Total: 2 users</TableCell>
      </TableRow>
    </TableFooter>
  </Table>
);

describe("Table", () => {
  describe("Accessibility", () => {
    it("should pass accessibility audit", async () => {
      const { container } = render(<TestTable />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should have proper table structure", () => {
      render(<TestTable />);
      expect(screen.getByRole("table")).toBeInTheDocument();
    });

    it("should have accessible headers", () => {
      render(<TestTable />);
      expect(
        screen.getByRole("columnheader", { name: "Name" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("columnheader", { name: "Email" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("columnheader", { name: "Role" })
      ).toBeInTheDocument();
    });
  });

  describe("Table Component", () => {
    it("should render with children", () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Content</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      expect(screen.getByText("Content")).toBeInTheDocument();
    });

    it("should forward ref correctly", () => {
      const ref = React.createRef<HTMLTableElement>();
      render(
        <Table ref={ref}>
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );

      expect(ref.current).toBeInstanceOf(HTMLTableElement);
    });

    it("should apply custom className", () => {
      render(
        <Table className="custom-table">
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      const table = screen.getByRole("table");
      expect(table).toHaveClass("custom-table");
    });
  });

  describe("TableHeader Component", () => {
    it("should render as thead", () => {
      const { container } = render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Header</TableHead>
            </TableRow>
          </TableHeader>
        </Table>
      );
      const thead = container.querySelector("thead");
      expect(thead).toBeInTheDocument();
    });

    it("should forward ref correctly", () => {
      const ref = React.createRef<HTMLTableSectionElement>();
      render(
        <Table>
          <TableHeader ref={ref}>
            <TableRow>
              <TableHead>Header</TableHead>
            </TableRow>
          </TableHeader>
        </Table>
      );

      expect(ref.current).toBeInstanceOf(HTMLTableSectionElement);
    });
  });

  describe("TableBody Component", () => {
    it("should render as tbody", () => {
      const { container } = render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      const tbody = container.querySelector("tbody");
      expect(tbody).toBeInTheDocument();
    });

    it("should forward ref correctly", () => {
      const ref = React.createRef<HTMLTableSectionElement>();
      render(
        <Table>
          <TableBody ref={ref}>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );

      expect(ref.current).toBeInstanceOf(HTMLTableSectionElement);
    });
  });

  describe("TableFooter Component", () => {
    it("should render as tfoot", () => {
      const { container } = render(
        <Table>
          <TableFooter>
            <TableRow>
              <TableCell>Footer</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      );
      const tfoot = container.querySelector("tfoot");
      expect(tfoot).toBeInTheDocument();
    });

    it("should forward ref correctly", () => {
      const ref = React.createRef<HTMLTableSectionElement>();
      render(
        <Table>
          <TableFooter ref={ref}>
            <TableRow>
              <TableCell>Footer</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      );

      expect(ref.current).toBeInstanceOf(HTMLTableSectionElement);
    });
  });

  describe("TableRow Component", () => {
    it("should render as tr", () => {
      const { container } = render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      const rows = container.querySelectorAll("tr");
      expect(rows.length).toBeGreaterThan(0);
    });

    it("should forward ref correctly", () => {
      const ref = React.createRef<HTMLTableRowElement>();
      render(
        <Table>
          <TableBody>
            <TableRow ref={ref}>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );

      expect(ref.current).toBeInstanceOf(HTMLTableRowElement);
    });

    it("should apply custom className", () => {
      const { container } = render(
        <Table>
          <TableBody>
            <TableRow className="custom-row">
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      const row = container.querySelector(".custom-row");
      expect(row).toBeInTheDocument();
    });
  });

  describe("TableHead Component", () => {
    it("should render as th", () => {
      const { container } = render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Header</TableHead>
            </TableRow>
          </TableHeader>
        </Table>
      );
      const th = container.querySelector("th");
      expect(th).toBeInTheDocument();
    });

    it("should forward ref correctly", () => {
      const ref = React.createRef<HTMLTableCellElement>();
      render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead ref={ref}>Header</TableHead>
            </TableRow>
          </TableHeader>
        </Table>
      );

      expect(ref.current).toBeInstanceOf(HTMLTableCellElement);
    });

    it("should apply custom className", () => {
      render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="custom-head">Header</TableHead>
            </TableRow>
          </TableHeader>
        </Table>
      );
      const head = screen.getByText("Header");
      expect(head).toHaveClass("custom-head");
    });
  });

  describe("TableCell Component", () => {
    it("should render as td", () => {
      const { container } = render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      const td = container.querySelector("td");
      expect(td).toBeInTheDocument();
    });

    it("should forward ref correctly", () => {
      const ref = React.createRef<HTMLTableCellElement>();
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell ref={ref}>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );

      expect(ref.current).toBeInstanceOf(HTMLTableCellElement);
    });

    it("should apply custom className", () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell className="custom-cell">Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      const cell = screen.getByText("Cell");
      expect(cell).toHaveClass("custom-cell");
    });
  });

  describe("TableCaption Component", () => {
    it("should render as caption", () => {
      const { container } = render(
        <Table>
          <TableCaption>Caption text</TableCaption>
        </Table>
      );
      const caption = container.querySelector("caption");
      expect(caption).toBeInTheDocument();
      expect(caption).toHaveTextContent("Caption text");
    });

    it("should forward ref correctly", () => {
      const ref = React.createRef<HTMLTableCaptionElement>();
      render(
        <Table>
          <TableCaption ref={ref}>Caption</TableCaption>
        </Table>
      );

      expect(ref.current).toBeInstanceOf(HTMLTableCaptionElement);
    });

    it("should apply custom className", () => {
      render(
        <Table>
          <TableCaption className="custom-caption">Caption</TableCaption>
        </Table>
      );
      const caption = screen.getByText("Caption");
      expect(caption).toHaveClass("custom-caption");
    });
  });

  describe("Integration", () => {
    it("should compose all sub-components correctly", () => {
      render(<TestTable />);

      expect(screen.getByText("A list of users")).toBeInTheDocument();
      expect(screen.getByText("Name")).toBeInTheDocument();
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("Total: 2 users")).toBeInTheDocument();
    });

    it("should work with multiple rows", () => {
      render(<TestTable />);

      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    });

    it("should handle colSpan", () => {
      const { container } = render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell colSpan={3}>Spanning cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      const cell = container.querySelector('td[colspan="3"]');
      expect(cell).toBeInTheDocument();
    });

    it("should handle rowSpan", () => {
      const { container } = render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell rowSpan={2}>Spanning cell</TableCell>
              <TableCell>Cell 2</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Cell 3</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      const cell = container.querySelector('td[rowspan="2"]');
      expect(cell).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty table", () => {
      render(<Table />);
      expect(screen.getByRole("table")).toBeInTheDocument();
    });

    it("should handle table without header", () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      expect(screen.getByText("Cell")).toBeInTheDocument();
    });

    it("should handle table without footer", () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      expect(screen.getByText("Cell")).toBeInTheDocument();
    });

    it("should handle table without caption", () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      expect(screen.getByText("Cell")).toBeInTheDocument();
    });

    it("should handle many columns", () => {
      render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Col 1</TableHead>
              <TableHead>Col 2</TableHead>
              <TableHead>Col 3</TableHead>
              <TableHead>Col 4</TableHead>
              <TableHead>Col 5</TableHead>
            </TableRow>
          </TableHeader>
        </Table>
      );

      for (let i = 1; i <= 5; i++) {
        expect(screen.getByText(`Col ${i}`)).toBeInTheDocument();
      }
    });

    it("should handle many rows", () => {
      const rows = Array.from({ length: 50 }, (_, i) => `Row ${i + 1}`);
      render(
        <Table>
          <TableBody>
            {rows.map((row, i) => (
              <TableRow key={i}>
                <TableCell>{row}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      );

      rows.forEach((row) => {
        expect(screen.getByText(row)).toBeInTheDocument();
      });
    });
  });
});
