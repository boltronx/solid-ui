import { render, screen, within } from "@solidjs/testing-library";

import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { pageItems } from "../Pagination/Pagination";

import { paginationSummary, Table, type TableColumn } from "./Table";

interface Order {
  id: number;
  customer: string;
  total: number;
}

const orders: Order[] = [
  { id: 1, customer: "Ada", total: 120 },
  { id: 2, customer: "Grace", total: 80 }
];

const columns: TableColumn<Order>[] = [
  { header: "Customer", render: order => order.customer, fixed: "left" },
  { header: "Total", render: order => order.total, align: "right" },
  { header: "Internal", render: () => "x", hidden: true }
];

describe("Table", () => {
  it("renders headers and rows, skipping hidden columns", () => {
    render(() => <Table aria-label="Orders" columns={columns} data={orders} stackBelow={0} />);
    const table = screen.getByRole("table", { name: "Orders" });
    expect(
      within(table)
        .getAllByRole("columnheader")
        .map(th => th.textContent)
    ).toEqual(["Customer", "Total"]);
    expect(within(table).getAllByRole("row")).toHaveLength(3);
    expect(screen.getByText("Grace")).toBeInTheDocument();
    expect(screen.queryByText("Internal")).toBeNull();
  });

  it("shows an empty state", () => {
    render(() => <Table columns={columns} data={[]} emptyMessage="No orders yet" stackBelow={0} />);
    expect(screen.getByRole("status")).toHaveTextContent("No orders yet");
  });

  it("stacks rows with labels when narrow", () => {
    // The test environment reports every element as 100px wide.
    render(() => <Table columns={columns} data={orders} stackBelow={576} />);
    expect(document.querySelector(".bx-Table")).toHaveAttribute("data-stacked");
    expect(screen.getAllByText("Customer", { selector: ".bx-Table-label" })).toHaveLength(2);
  });

  it("reports row clicks, by mouse and Enter", async () => {
    const onRowClick = vi.fn();
    render(() => <Table columns={columns} data={orders} stackBelow={0} onRowClick={onRowClick} />);
    await userEvent.click(screen.getByText("Ada"));
    expect(onRowClick).toHaveBeenLastCalledWith(orders[0], expect.anything());
    screen.getByText("Grace").closest("tr")!.focus();
    await userEvent.keyboard("{Enter}");
    expect(onRowClick).toHaveBeenLastCalledWith(orders[1], expect.anything());
  });

  it("leaves clicks on a control inside a row to that control", async () => {
    const onRowClick = vi.fn();
    const onEdit = vi.fn();
    const withAction: TableColumn<Order>[] = [
      ...columns,
      { header: "", render: order => <button onClick={() => onEdit(order)}>Edit</button> }
    ];
    render(() => (
      <Table columns={withAction} data={orders} stackBelow={0} onRowClick={onRowClick} />
    ));
    await userEvent.click(screen.getAllByRole("button", { name: "Edit" })[0]!);
    expect(onEdit).toHaveBeenCalledWith(orders[0]);
    expect(onRowClick).not.toHaveBeenCalled();
  });

  it("paginates", async () => {
    const onChange = vi.fn();
    render(() => (
      <Table
        columns={columns}
        data={orders}
        stackBelow={0}
        pagination={{ page: 1, pageSize: 2, totalItems: 7, onChange, itemName: "order" }}
      />
    ));
    expect(screen.getByText("Showing 1 – 2 of 7 orders")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Page 1" })).toHaveAttribute("aria-current", "page");
    await userEvent.click(screen.getByRole("button", { name: "Next page" }));
    expect(onChange).toHaveBeenCalledWith(2);
  });
});

describe("pagination helpers", () => {
  it("lists pages with gaps", () => {
    expect(pageItems(1, 4)).toEqual([1, 2, 3, 4]);
    expect(pageItems(1, 10)).toEqual([1, 2, "…", 10]);
    expect(pageItems(5, 10)).toEqual([1, "…", 4, 5, 6, "…", 10]);
    expect(pageItems(10, 10)).toEqual([1, "…", 9, 10]);
  });

  it("summarizes the shown range", () => {
    const base = { pageSize: 25, onChange: () => {}, itemName: "item" };
    expect(paginationSummary({ ...base, page: 2, totalItems: 40 })).toBe(
      "Showing 26 – 40 of 40 items"
    );
    expect(paginationSummary({ ...base, page: 1, totalItems: 1 })).toBe("Showing 1 – 1 of 1 item");
  });
});
