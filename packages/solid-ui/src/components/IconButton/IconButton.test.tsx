import { render, screen } from "@solidjs/testing-library";

import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { IconButton } from "./IconButton";

describe("IconButton", () => {
  it("uses the tooltip as its accessible name, without repeating it as the description", () => {
    render(() => <IconButton tooltip="Delete">×</IconButton>);
    const button = screen.getByRole("button", { name: "Delete" });
    expect(button).not.toHaveAttribute("aria-describedby");
    expect(screen.getByRole("tooltip")).toHaveTextContent("Delete");
  });

  it("prefers an explicit aria-label, and then the tooltip describes the button", () => {
    render(() => (
      <IconButton tooltip="Delete" aria-label="Delete row 3">
        ×
      </IconButton>
    ));
    const button = screen.getByRole("button", { name: "Delete row 3" });
    expect(button).toHaveAccessibleDescription("Delete");
  });

  it("defaults to type=button and passes clicks through", async () => {
    const onClick = vi.fn();
    render(() => (
      <IconButton aria-label="Close" onClick={onClick}>
        ×
      </IconButton>
    ));
    const button = screen.getByRole("button", { name: "Close" });
    expect(button).toHaveAttribute("type", "button");
    expect(screen.queryByRole("tooltip")).toBeNull();
    await userEvent.click(button);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("focuses itself with autoFocus", async () => {
    render(() => (
      <IconButton aria-label="Close" autoFocus>
        ×
      </IconButton>
    ));
    await Promise.resolve();
    expect(screen.getByRole("button", { name: "Close" })).toHaveFocus();
  });
});
