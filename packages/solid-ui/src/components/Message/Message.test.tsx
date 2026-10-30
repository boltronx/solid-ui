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

  it("announces errors as an alert, read once", () => {
    message.error("Payment failed");
    vi.advanceTimersByTime(50);
    expect(screen.getByRole("alert")).toHaveTextContent("Error: Payment failed");
    expect(screen.getByText("Payment failed").closest(".bx-Message-content")).toHaveAttribute(
      "aria-hidden",
      "true"
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

  it("shows three at a time and queues the rest, each timed from when it appears", () => {
    for (const n of [1, 2, 3, 4, 5]) message.info(`Message ${n}`, 2);
    expect(screen.getByText("Message 3")).toBeInTheDocument();
    expect(screen.queryByText("Message 4")).toBeNull();

    // The first three leave together; the queued two come in as they start leaving.
    vi.advanceTimersByTime(2000);
    expect(screen.getByText("Message 4")).toBeInTheDocument();
    expect(screen.getByText("Message 5")).toBeInTheDocument();
    const fourth = screen.getByText("Message 4").closest(".bx-Message-item")!;
    expect(fourth).not.toHaveAttribute("data-exiting");

    // Its own two seconds, not two seconds from when it was queued.
    vi.advanceTimersByTime(1999);
    expect(fourth).not.toHaveAttribute("data-exiting");
    vi.advanceTimersByTime(1);
    expect(fourth).toHaveAttribute("data-exiting");
  });

  it("takes a different limit from config", () => {
    message.config({ limit: 1 });
    try {
      message.success("First", 2);
      message.success("Second", 2);
      expect(screen.queryByText("Second")).toBeNull();
      vi.advanceTimersByTime(2000);
      expect(screen.getByText("Second")).toBeInTheDocument();
    } finally {
      message.config({ limit: 3 });
    }
  });

  it("shows a close button when closable", () => {
    message.success("Saved", { closable: true });
    const item = screen.getByText("Saved").closest(".bx-Message-item")!;
    fireEvent.click(screen.getByRole("button", { name: "Close notification" }));
    expect(item).toHaveAttribute("data-exiting");
  });

  it("stays until closed with 0 seconds, and is then closable", () => {
    message.warning("Connection lost", 0);
    const item = screen.getByText("Connection lost").closest(".bx-Message-item")!;
    fireEvent.pointerEnter(item);
    fireEvent.pointerLeave(item);
    vi.advanceTimersByTime(60_000);
    expect(item).not.toHaveAttribute("data-exiting");
    fireEvent.click(screen.getByRole("button", { name: "Close notification" }));
    expect(item).toHaveAttribute("data-exiting");
  });

  it("returns a function that closes the message, or drops it from the queue", () => {
    message.config({ limit: 1 });
    try {
      const closeUploading = message.info("Uploading", 0);
      const closeQueued = message.info("Queued", 0);
      const closeNext = message.info("Next", 0);
      closeQueued();
      closeUploading();
      closeUploading();
      expect(screen.getByText("Next")).toBeInTheDocument();
      expect(screen.queryByText("Queued")).toBeNull();
      closeNext();
    } finally {
      message.config({ limit: 3 });
    }
  });
});
