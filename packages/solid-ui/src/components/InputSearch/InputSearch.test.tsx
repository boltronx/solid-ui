import { screen } from "@solidjs/testing-library";

import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { renderInForm } from "../../../test/helpers";

import { InputSearch } from "./InputSearch";

describe("InputSearch", () => {
  it("shows a clear button once there is text, and clearing fires onInput", async () => {
    const onInput = vi.fn();
    const { data } = renderInForm(() => <InputSearch label="Search" name="q" onInput={onInput} />);
    const input = screen.getByLabelText("Search");
    expect(screen.queryByRole("button", { name: "Clear search" })).toBeNull();

    await userEvent.type(input, "cebu");
    expect(data().get("q")).toBe("cebu");
    onInput.mockClear();

    await userEvent.click(screen.getByRole("button", { name: "Clear search" }));
    expect(input).toHaveValue("");
    expect(input).toHaveFocus();
    expect(onInput).toHaveBeenCalledOnce();
    expect(data().get("q")).toBe("");
    expect(screen.queryByRole("button", { name: "Clear search" })).toBeNull();
  });

  it("drops the clear button when the form resets to an empty value", async () => {
    const { reset } = renderInForm(() => <InputSearch label="Search" defaultValue="" />);
    await userEvent.type(screen.getByLabelText("Search"), "x");
    expect(screen.getByRole("button", { name: "Clear search" })).toBeInTheDocument();
    await reset();
    expect(screen.queryByRole("button", { name: "Clear search" })).toBeNull();
  });

  it("follows a controlled value", () => {
    renderInForm(() => <InputSearch label="Search" value="manila" />);
    expect(screen.getByRole("button", { name: "Clear search" })).toBeInTheDocument();
  });

  it("hides the clear button when disabled or read-only", () => {
    renderInForm(() => (
      <>
        <InputSearch label="Disabled" defaultValue="a" disabled />
        <InputSearch label="Read-only" defaultValue="b" readOnly />
      </>
    ));
    expect(screen.queryByRole("button", { name: "Clear search" })).toBeNull();
  });
});
