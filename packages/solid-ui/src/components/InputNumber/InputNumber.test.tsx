import { screen } from "@solidjs/testing-library";

import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { renderInForm } from "../../../test/helpers";

import { formatNumber, InputNumber, parseNumber, roundNumber } from "./InputNumber";

describe("number helpers", () => {
  it("rounds half away from zero without float noise", () => {
    expect(roundNumber(1559.25 / 1.12, 3)).toBe(1392.188);
    expect(roundNumber(-2.5, 0)).toBe(-3);
  });

  it("formats and parses grouped numbers", () => {
    expect(formatNumber(1234.5, 2)).toBe("1,234.50");
    expect(formatNumber(null)).toBe("");
    expect(parseNumber("1,234.5")).toBe(1234.5);
    expect(parseNumber("-")).toBeNull();
    expect(parseNumber("abc")).toBeNull();
  });
});

describe("InputNumber", () => {
  it("shows grouped digits but submits the plain number", () => {
    const { data } = renderInForm(() => (
      <InputNumber label="Amount" name="amount" defaultValue={1234.5} decimals={2} />
    ));
    expect(screen.getByLabelText("Amount")).toHaveValue("1,234.50");
    expect(data().get("amount")).toBe("1234.5");
  });

  it("parses, clamps and reports the value on blur", async () => {
    const onChange = vi.fn();
    const { data } = renderInForm(() => (
      <InputNumber label="Qty" name="qty" max={10} onChange={onChange} />
    ));
    const input = screen.getByLabelText("Qty");
    await userEvent.type(input, "25");
    await userEvent.tab();
    expect(onChange).toHaveBeenCalledWith(10);
    expect(input).toHaveValue("10");
    expect(data().get("qty")).toBe("10");
  });

  it("restores defaultValue on form reset", async () => {
    const { data, reset } = renderInForm(() => (
      <InputNumber label="Qty" name="qty" defaultValue={3} />
    ));
    const input = screen.getByLabelText("Qty");
    await userEvent.clear(input);
    await userEvent.type(input, "8");
    await userEvent.tab();
    expect(data().get("qty")).toBe("8");
    await reset();
    expect(data().get("qty")).toBe("3");
    expect(input).toHaveValue("3");
  });

  it("submits an empty string when empty, like a native input", () => {
    const { data } = renderInForm(() => <InputNumber label="Qty" name="qty" />);
    expect(data().get("qty")).toBe("");
  });

  it("shows the currency symbol", () => {
    renderInForm(() => <InputNumber label="Price" currency="PHP" defaultValue={5} />);
    expect(screen.getByText("₱")).toBeInTheDocument();
    expect(screen.getByLabelText("Price")).toHaveValue("5.00");
  });

  it("submits the typed value when Enter submits the form before blur", async () => {
    const { data } = renderInForm(() => <InputNumber label="Qty" name="qty" defaultValue={1} />);
    await userEvent.click(screen.getByRole("textbox"));
    await userEvent.keyboard("{Control>}a{/Control}5");
    expect(data().get("qty")).toBe("5");
  });
});
