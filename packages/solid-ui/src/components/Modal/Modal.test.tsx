import { screen, waitFor } from "@solidjs/testing-library";

import { userEvent } from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { Button } from "../Button/Button";

import { Modal, modal } from "./Modal";

describe("modal", () => {
  it("resolves with the value passed to close", async () => {
    const result = modal.open<"ok">({
      content: ctx => (
        <Modal>
          <Modal.Header title="Delete item?" {...ctx} />
          <Modal.Body>This cannot be undone.</Modal.Body>
          <Modal.Footer>
            <Button onClick={() => ctx.close("ok")}>Delete</Button>
          </Modal.Footer>
        </Modal>
      )
    });
    const dialog = await screen.findByRole("dialog", { name: "Delete item?" });
    expect(document.documentElement).toHaveClass("bx-scroll-locked");
    await userEvent.click(screen.getByRole("button", { name: "Delete" }));
    await expect(result).resolves.toBe("ok");
    expect(dialog).not.toBeInTheDocument();
    await waitFor(() => expect(document.documentElement).not.toHaveClass("bx-scroll-locked"));
  });

  it("closes on Escape unless locked", async () => {
    let lock: ((locked: boolean) => void) | undefined;
    const result = modal.open({
      content: ctx => {
        lock = ctx.lock;
        return (
          <Modal>
            <Modal.Header title="Editing" {...ctx} />
          </Modal>
        );
      }
    });
    await screen.findByRole("dialog");
    lock?.(true);
    await userEvent.keyboard("{Escape}");
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    lock?.(false);
    await userEvent.keyboard("{Escape}");
    await expect(result).resolves.toBe("escape");
  });
});
