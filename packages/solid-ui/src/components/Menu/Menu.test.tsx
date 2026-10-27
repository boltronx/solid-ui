import { render, screen, waitFor } from "@solidjs/testing-library";

import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Button } from "../Button/Button";

import { Menu, MenuDropdown, MenuItem, MenuTarget } from "./Menu";

describe("Menu", () => {
  it("opens from its target and closes after an item is picked", async () => {
    const onEdit = vi.fn();
    render(() => (
      <Menu>
        <MenuTarget>
          <Button>Actions</Button>
        </MenuTarget>
        <MenuDropdown>
          <MenuItem onClick={onEdit}>Edit</MenuItem>
          <MenuItem disabled>Archive</MenuItem>
        </MenuDropdown>
      </Menu>
    ));
    expect(screen.queryByRole("menuitem")).toBeNull();
    await userEvent.click(screen.getByRole("button", { name: "Actions" }));
    await userEvent.click(await screen.findByRole("menuitem", { name: "Edit" }));
    expect(onEdit).toHaveBeenCalledOnce();
    await waitFor(() => expect(screen.queryByRole("menuitem")).toBeNull());
  });

  it("closes on Escape", async () => {
    render(() => (
      <Menu>
        <MenuTarget>
          <Button>Actions</Button>
        </MenuTarget>
        <MenuDropdown>
          <MenuItem>Edit</MenuItem>
        </MenuDropdown>
      </Menu>
    ));
    await userEvent.click(screen.getByRole("button", { name: "Actions" }));
    await screen.findByRole("menuitem");
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("menuitem")).toBeNull());
  });
});
