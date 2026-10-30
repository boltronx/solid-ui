import { createSignal } from "solid-js";
import { screen } from "@solidjs/testing-library";

import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { renderInForm } from "../../../test/helpers";
import { focusFirstInvalid } from "../../utils/form";

import { Checkbox } from "./Checkbox";

describe("Checkbox", () => {
  it("submits its value when checked", async () => {
    const { data } = renderInForm(() => <Checkbox label="Agree" name="agree" value="yes" />);
    expect(data().get("agree")).toBeNull();
    await userEvent.click(screen.getByLabelText("Agree"));
    expect(data().get("agree")).toBe("yes");
  });

  it("restores defaultChecked on form reset", async () => {
    const { reset } = renderInForm(() => <Checkbox label="Agree" name="agree" defaultChecked />);
    const box = screen.getByLabelText("Agree");
    await userEvent.click(box);
    expect(box).not.toBeChecked();
    await reset();
    expect(box).toBeChecked();
  });

  it("keeps a controlled state until the parent changes it", async () => {
    const onChange = vi.fn();
    renderInForm(() => <Checkbox label="Agree" checked={false} onChange={onChange} />);
    const box = screen.getByLabelText("Agree");
    await userEvent.click(box);
    await Promise.resolve();
    expect(onChange).toHaveBeenCalledOnce();
    expect(box).not.toBeChecked();
  });

  it("does not toggle when read-only", async () => {
    renderInForm(() => <Checkbox label="Agree" readOnly />);
    const box = screen.getByLabelText("Agree");
    await userEvent.click(box);
    expect(box).not.toBeChecked();
  });

  it("is announced as a checkbox", () => {
    renderInForm(() => <Checkbox label="Agree" />);
    expect(screen.getByRole("checkbox", { name: "Agree" })).not.toHaveAttribute("role");
  });

  it("can be named without a visible label", () => {
    renderInForm(() => (
      <>
        <span id="row-name">Order SO-1042</span>
        <Checkbox aria-label="Select all orders" />
        <Checkbox aria-labelledby="row-name" />
      </>
    ));
    expect(screen.getByRole("checkbox", { name: "Select all orders" })).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "Order SO-1042" })).toBeInTheDocument();
    // No empty body beside a box that has nothing to show.
    expect(document.querySelector(".bx-Checkbox-body")).toBeNull();
  });

  it("shows an error, marks the box invalid and describes it", async () => {
    const [error, setError] = createSignal<string>();
    renderInForm(() => (
      <Checkbox label="Accept the terms" description="Required to continue" error={error()} />
    ));
    const box = screen.getByRole("checkbox", { name: "Accept the terms" });
    expect(box).not.toHaveAttribute("aria-invalid");
    expect(box).toHaveAccessibleDescription("Required to continue");
    setError("Accept the terms to continue");
    expect(box).toHaveAttribute("aria-invalid", "true");
    expect(box).toHaveAccessibleDescription("Required to continue Accept the terms to continue");
    expect(await focusFirstInvalid()).toBe(box);
  });
});

describe("Checkbox options", () => {
  it("shows the indeterminate dash, and puts it back after a click clears it", async () => {
    const onChange = vi.fn();
    renderInForm(() => <Checkbox label="All" checked={false} indeterminate onChange={onChange} />);
    const box = screen.getByLabelText<HTMLInputElement>("All");
    expect(box.indeterminate).toBe(true);
    expect(box).toBePartiallyChecked();
    await userEvent.click(box);
    expect(onChange).toHaveBeenCalledOnce();
    // The parent kept `indeterminate`, so it is still shown.
    expect(box.indeterminate).toBe(true);
  });

  it("puts the label on the left", () => {
    renderInForm(() => <Checkbox label="Agree" labelPosition="left" />);
    expect(screen.getByLabelText("Agree").closest(".bx-Checkbox")).toHaveAttribute(
      "data-label-position",
      "left"
    );
  });
});
