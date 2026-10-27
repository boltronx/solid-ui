import { fireEvent, screen } from "@solidjs/testing-library";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { message } from "./Message";

// The container is created once and lives on document.body, outside the per-test cleanup, so
// every test waits for its own messages to leave.
describe("message", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runAllTimers();
    vi.useRealTimers();
  });

  it("announces messages in a polite live region", () => {
    message.success("Saved");
    const region = screen.getByRole("status", { name: "Notifications" });
    expect(region).toHaveAttribute("aria-live", "polite");
    expect(region).toHaveTextContent("Saved");
    expect(screen.getByText("Saved").closest(".bx-Message-item")).toHaveAttribute(
      "data-type",
      "success"
    );
  });

  it("leaves after its duration, with an exit transition first", () => {
    message.info("Heads up", 2);
    const item = screen.getByText("Heads up").closest(".bx-Message-item")!;

    vi.advanceTimersByTime(1999);
    expect(item).not.toHaveAttribute("data-exiting");
    vi.advanceTimersByTime(1);
    expect(item).toHaveAttribute("data-exiting");
    vi.advanceTimersByTime(320);
    expect(screen.queryByText("Heads up")).toBeNull();
  });

  it("pauses while the pointer is over it and resumes with the time left", () => {
    message.error("Failed", 2);
    const item = screen.getByText("Failed").closest(".bx-Message-item")!;

    vi.advanceTimersByTime(1500);
    fireEvent.pointerEnter(item);
    vi.advanceTimersByTime(10_000);
    expect(item).not.toHaveAttribute("data-exiting");

    fireEvent.pointerLeave(item);
    vi.advanceTimersByTime(499);
    expect(item).not.toHaveAttribute("data-exiting");
    vi.advanceTimersByTime(1);
    expect(item).toHaveAttribute("data-exiting");
  });

  it("uses longer defaults for errors than for successes", () => {
    message.success("Done");
    message.error("Broken");
    vi.advanceTimersByTime(3000);
    expect(screen.getByText("Done").closest(".bx-Message-item")).toHaveAttribute("data-exiting");
    expect(screen.getByText("Broken").closest(".bx-Message-item")).not.toHaveAttribute(
      "data-exiting"
    );
  });
});
