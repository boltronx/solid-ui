import { render, screen } from "@solidjs/testing-library";

import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { MenuItem } from "../Menu/Menu";

import { SplitButton } from "./SplitButton";

describe("SplitButton", () => {
  it("runs the main action without opening the menu", async () => {
    const onClick = vi.fn();
    render(() => (
      <SplitButton onClick={onClick} dropdown={<MenuItem>Save as draft</MenuItem>}>
        Save
      </SplitButton>
    ));
    await userEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(onClick).toHaveBeenCalledOnce();
    expect(screen.queryByRole("menuitem")).toBeNull();
  });

  it("opens the menu from the arrow half", async () => {
    const onDraft = vi.fn();
    render(() => (
      <SplitButton dropdown={<MenuItem onClick={onDraft}>Save as draft</MenuItem>}>
        Save
      </SplitButton>
    ));
    const toggle = screen.getByRole("button", { name: "More options" });
    expect(toggle).toHaveAttribute("aria-haspopup", "menu");
    await userEvent.click(toggle);
    await userEvent.click(await screen.findByRole("menuitem", { name: "Save as draft" }));
    expect(onDraft).toHaveBeenCalledOnce();
  });

  it("blocks both halves while disabled", async () => {
    const onClick = vi.fn();
    render(() => (
      <SplitButton disabled onClick={onClick} toggleAriaLabel="Other saves">
        Save
      </SplitButton>
    ));
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Other saves" })).toBeDisabled();
    await userEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("defaults to type=button so it never submits a form by accident", () => {
    render(() => <SplitButton>Save</SplitButton>);
    expect(screen.getByRole("button", { name: "Save" })).toHaveAttribute("type", "button");
  });
});
