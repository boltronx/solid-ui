import { createSignal } from "solid-js";
import { screen } from "@solidjs/testing-library";

import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { renderInForm } from "../../../test/helpers";

import { Select } from "./Select";

const fruits = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
  { value: "cherry", label: "Cherry", disabled: true }
];

async function pick(label: string) {
  // findBy: the dropdown becomes visible once positioned, on the next animation frame.
  await userEvent.click(await screen.findByRole("option", { name: label }));
}

describe("Select", () => {
  it("submits one empty entry before anything is picked", () => {
    const { data } = renderInForm(() => <Select label="Fruit" name="fruit" options={fruits} />);
    expect(data().getAll("fruit")).toEqual([""]);
  });

  it("submits the picked value and reports it", async () => {
    const onChange = vi.fn();
    const { data } = renderInForm(() => (
      <Select label="Fruit" name="fruit" options={fruits} onChange={onChange} />
    ));
    await userEvent.click(screen.getByRole("combobox", { name: "Fruit" }));
    await pick("Banana");
    expect(data().get("fruit")).toBe("banana");
    expect(onChange).toHaveBeenCalledWith("banana", fruits[1]);
    expect(screen.getByRole("combobox")).toHaveTextContent("Banana");
  });

  it("ignores disabled options", async () => {
    const { data } = renderInForm(() => <Select label="Fruit" name="fruit" options={fruits} />);
    await userEvent.click(screen.getByRole("combobox"));
    await pick("Cherry");
    expect(data().get("fruit")).toBe("");
  });

  it("submits every value of a multiple select", async () => {
    const { data } = renderInForm(() => (
      <Select label="Fruit" name="fruit" options={fruits} multiple defaultValue={["apple"]} />
    ));
    await userEvent.click(screen.getByRole("combobox"));
    await pick("Banana");
    expect(data().getAll("fruit")).toEqual(["apple", "banana"]);
  });

  it("restores defaultValue on form reset", async () => {
    const { data, reset } = renderInForm(() => (
      <Select label="Fruit" name="fruit" options={fruits} defaultValue="apple" />
    ));
    await userEvent.click(screen.getByRole("combobox"));
    await pick("Banana");
    expect(data().get("fruit")).toBe("banana");
    await reset();
    expect(data().get("fruit")).toBe("apple");
  });

  it("stays valid after a reset when required with a default value", async () => {
    const { form, reset } = renderInForm(() => (
      <Select label="Fruit" name="fruit" options={fruits} defaultValue="apple" required />
    ));
    // Untouched, and then picked and reset: the browser resets the hidden validator to empty
    // after the reset event, so it has to be refilled or submit would open the dropdown.
    await reset();
    expect(form.checkValidity()).toBe(true);

    await userEvent.click(screen.getByRole("combobox"));
    await pick("Banana");
    await reset();
    expect(form.checkValidity()).toBe(true);
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("leaves a controlled value to the parent", async () => {
    const [value, setValue] = createSignal("apple");
    const onChange = vi.fn();
    const { data, reset } = renderInForm(() => (
      <Select label="Fruit" name="fruit" options={fruits} value={value()} onChange={onChange} />
    ));
    await userEvent.click(screen.getByRole("combobox"));
    await pick("Banana");
    // Not applied until the parent updates `value`
    expect(onChange).toHaveBeenCalledWith("banana", fruits[1]);
    expect(data().get("fruit")).toBe("apple");
    setValue("banana");
    await reset();
    expect(data().get("fruit")).toBe("banana");
  });

  it("is invalid when required and empty", () => {
    const { form } = renderInForm(() => (
      <Select label="Fruit" name="fruit" options={fruits} required />
    ));
    expect(form.checkValidity()).toBe(false);
  });

  it("opens with the keyboard and picks with Enter", async () => {
    const { data } = renderInForm(() => <Select label="Fruit" name="fruit" options={fruits} />);
    screen.getByRole("combobox").focus();
    await userEvent.keyboard("{ArrowDown}{ArrowDown}{Enter}");
    expect(data().get("fruit")).toBe("banana");
  });
});
