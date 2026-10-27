import { screen } from "@solidjs/testing-library";

import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { renderInForm } from "../../../test/helpers";

import { Textarea } from "./Textarea";

describe("Textarea", () => {
  it("submits, counts and resets to defaultValue", async () => {
    const { data, reset } = renderInForm(() => (
      <Textarea label="Notes" name="notes" defaultValue="hi" showCount maxLength={10} />
    ));
    const textarea = screen.getByLabelText("Notes");
    expect(screen.getByText("2/10")).toBeInTheDocument();
    await userEvent.type(textarea, "!!");
    expect(data().get("notes")).toBe("hi!!");
    expect(screen.getByText("4/10")).toBeInTheDocument();
    await reset();
    expect(textarea).toHaveValue("hi");
    expect(screen.getByText("2/10")).toBeInTheDocument();
  });

  it("submits the form on Enter with submitOnEnter", async () => {
    const { form } = renderInForm(() => <Textarea label="Message" submitOnEnter />);
    const onSubmit = vi.fn((event: Event) => event.preventDefault());
    form.addEventListener("submit", onSubmit);
    await userEvent.type(screen.getByLabelText("Message"), "hello{Enter}");
    expect(onSubmit).toHaveBeenCalledOnce();
  });
});
