// What screen reader and keyboard users get beyond markup rules: focus that moves where it should,
// and announcements for changes that happen away from focus.
import { screen, waitFor } from "@solidjs/testing-library";

import { userEvent } from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import {
  Button,
  DatePicker,
  IconButton,
  Indicator,
  Input,
  Menu,
  MenuDropdown,
  MenuItem,
  MenuTarget,
  Modal,
  modal,
  Pagination,
  Progress,
  Select,
  Textarea
} from "../src";

import { renderInForm } from "./helpers";

function themeMenu() {
  return (
    <Menu>
      <MenuTarget>
        <IconButton tooltip="Theme">
          <svg aria-hidden="true" />
        </IconButton>
      </MenuTarget>
      <MenuDropdown>
        <MenuItem selected>Light</MenuItem>
        <MenuItem selected={false}>Dark</MenuItem>
        <MenuItem disabled>High contrast</MenuItem>
        <MenuItem>System</MenuItem>
      </MenuDropdown>
    </Menu>
  );
}

describe("Menu keyboard and state", () => {
  it("marks its button as a menu button and reports whether it is open", async () => {
    renderInForm(themeMenu);
    const button = screen.getByRole("button", { name: "Theme" });
    expect(button).toHaveAttribute("aria-haspopup", "menu");
    expect(button).toHaveAttribute("aria-expanded", "false");

    await userEvent.click(button);
    const menu = await screen.findByRole("menu", { name: "Theme" });
    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(button).toHaveAttribute("aria-controls", menu.id);
  });

  it("moves focus in, around with arrows (skipping disabled items), and back out", async () => {
    renderInForm(themeMenu);
    const button = screen.getByRole("button", { name: "Theme" });
    button.focus();
    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(screen.getByRole("menuitemradio", { name: "Light" })).toHaveFocus());

    await userEvent.keyboard("{ArrowDown}");
    expect(screen.getByRole("menuitemradio", { name: "Dark" })).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    expect(screen.getByRole("menuitem", { name: "System" })).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    expect(screen.getByRole("menuitemradio", { name: "Light" })).toHaveFocus();
    await userEvent.keyboard("{End}");
    expect(screen.getByRole("menuitem", { name: "System" })).toHaveFocus();

    await userEvent.keyboard("{Escape}");
    expect(button).toHaveFocus();
    expect(button).toHaveAttribute("aria-expanded", "false");
  });

  it("opens on ArrowUp at the last item, and returns focus after a pick", async () => {
    renderInForm(themeMenu);
    const button = screen.getByRole("button", { name: "Theme" });
    button.focus();
    await userEvent.keyboard("{ArrowUp}");
    await waitFor(() => expect(screen.getByRole("menuitem", { name: "System" })).toHaveFocus());
    await userEvent.keyboard("{Enter}");
    expect(button).toHaveFocus();
  });

  it("announces the selected item as checked", async () => {
    renderInForm(themeMenu);
    await userEvent.click(screen.getByRole("button", { name: "Theme" }));
    expect(await screen.findByRole("menuitemradio", { name: "Light" })).toHaveAttribute(
      "aria-checked",
      "true"
    );
  });
});

describe("Modal focus", () => {
  it("moves focus in, keeps Tab inside, and returns focus to the opener", async () => {
    renderInForm(() => (
      <Button
        onClick={() =>
          void modal.open({
            content: ctx => (
              <Modal>
                <Modal.Header title="Rename" {...ctx} />
                <Modal.Body>
                  <Input label="Name" />
                </Modal.Body>
                <Modal.Footer>
                  <Button onClick={() => ctx.close()}>Save</Button>
                </Modal.Footer>
              </Modal>
            )
          })
        }
      >
        Rename
      </Button>
    ));
    const opener = screen.getByRole("button", { name: "Rename" });
    await userEvent.click(opener);
    const dialog = await screen.findByRole("dialog", { name: "Rename" });
    await waitFor(() => expect(dialog).toHaveFocus());

    await userEvent.tab();
    expect(screen.getByRole("button", { name: "Close" })).toHaveFocus();
    await userEvent.tab();
    expect(screen.getByLabelText("Name")).toHaveFocus();
    await userEvent.tab();
    expect(screen.getByRole("button", { name: "Save" })).toHaveFocus();
    await userEvent.tab();
    expect(screen.getByRole("button", { name: "Close" })).toHaveFocus();
    await userEvent.tab({ shift: true });
    expect(screen.getByRole("button", { name: "Save" })).toHaveFocus();

    await userEvent.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    expect(opener).toHaveFocus();
  });
});

describe("announcements", () => {
  it("Select points at the highlighted option and says when nothing matches", async () => {
    renderInForm(() => (
      <Select
        label="Fruit"
        searchable
        nothingFoundMessage="No fruit"
        options={[
          { value: "apple", label: "Apple" },
          { value: "banana", label: "Banana" }
        ]}
      />
    ));
    const combobox = screen.getByRole("combobox", { name: "Fruit" });
    await userEvent.click(combobox);
    const search = await screen.findByRole("searchbox", { name: "Search options" });
    await userEvent.keyboard("{ArrowDown}");
    const active = search.getAttribute("aria-activedescendant");
    expect(document.getElementById(active!)).toHaveTextContent("Banana");
    expect(combobox).toHaveAttribute("aria-activedescendant", active);

    await userEvent.type(search, "kiwi");
    expect(screen.getByRole("status")).toHaveTextContent("No fruit");
    expect(search).not.toHaveAttribute("aria-activedescendant");
  });

  it("DatePicker reads out the highlighted day as the arrows move it", async () => {
    renderInForm(() => <DatePicker label="Due" defaultValue="2026-10-05" />);
    const field = screen.getByRole("combobox", { name: "Due" });
    await userEvent.click(field);
    expect(field).toHaveAttribute("aria-expanded", "true");
    await screen.findByRole("dialog", { name: "Choose a date" });
    await waitFor(() =>
      expect(screen.getByText("Monday, October 5, 2026, selected")).toBeInTheDocument()
    );
    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByText("Tuesday, October 6, 2026")).toBeInTheDocument();
  });

  it("Textarea says how many characters are left only near the limit", async () => {
    renderInForm(() => <Textarea label="Bio" showCount maxLength={100} />);
    const bio = screen.getByLabelText("Bio");
    const announcement = bio.parentElement!.parentElement!.querySelector("[aria-live]")!;
    await userEvent.type(bio, "a".repeat(80));
    expect(announcement).toHaveTextContent("");
    await userEvent.type(bio, "a".repeat(11));
    expect(announcement).toHaveTextContent("9 characters left");
  });
});

describe("labels", () => {
  it("Indicator reads its aria-label instead of the bare count", () => {
    renderInForm(() => (
      <Indicator label={3} aria-label="3 unread notifications">
        <span>Inbox</span>
      </Indicator>
    ));
    expect(screen.getByText("3")).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByText("3 unread notifications")).toHaveClass("bx-visually-hidden");
  });

  it("compact Pagination reads as 'Page 2 of 10'", () => {
    renderInForm(() => <Pagination page={2} totalPages={10} compact onChange={() => {}} />);
    expect(screen.getByText("Page 2 of 10")).toHaveClass("bx-visually-hidden");
  });

  it("Progress takes an aria-label when it has no visible label", () => {
    renderInForm(() => <Progress value={70} aria-label="Upload progress" />);
    expect(screen.getByRole("progressbar", { name: "Upload progress" })).toBeInTheDocument();
  });
});
