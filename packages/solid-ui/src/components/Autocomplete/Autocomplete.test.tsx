import { screen } from "@solidjs/testing-library";

import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { renderInForm } from "../../../test/helpers";

import { Autocomplete } from "./Autocomplete";

const cities = [
  { value: "mnl", label: "Manila" },
  { value: "ceb", label: "Cebu" },
  { value: "dvo", label: "Davao" }
];

describe("Autocomplete", () => {
  it("filters suggestions as you type and fills in the picked one", async () => {
    const onOptionSubmit = vi.fn();
    const { data } = renderInForm(() => (
      <Autocomplete label="City" name="city" options={cities} onOptionSubmit={onOptionSubmit} />
    ));
    await userEvent.type(screen.getByLabelText("City"), "ce");
    expect(screen.queryByRole("option", { name: "Manila" })).toBeNull();
    await userEvent.click(screen.getByRole("option", { name: "Cebu" }));
    expect(onOptionSubmit).toHaveBeenCalledWith(cities[1]);
    expect(data().get("city")).toBe("Cebu");
  });

  it("accepts free text and resets to defaultValue", async () => {
    const { data, reset } = renderInForm(() => (
      <Autocomplete label="City" name="city" options={cities} defaultValue="Davao" />
    ));
    const input = screen.getByLabelText("City");
    await userEvent.clear(input);
    await userEvent.type(input, "Iloilo");
    expect(data().get("city")).toBe("Iloilo");
    await reset();
    expect(input).toHaveValue("Davao");
  });
});
