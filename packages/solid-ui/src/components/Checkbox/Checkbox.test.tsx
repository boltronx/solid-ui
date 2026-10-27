import { screen } from "@solidjs/testing-library";

import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { renderInForm } from "../../../test/helpers";

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

  it("renders a switch", () => {
    renderInForm(() => <Checkbox label="Wi-Fi" role="switch" />);
    expect(screen.getByRole("switch", { name: "Wi-Fi" })).toBeInTheDocument();
  });
});
