import type { JSX } from "solid-js";
import { render } from "@solidjs/testing-library";

/** Renders `children` inside a <form> and returns helpers to read and reset it. */
export function renderInForm(children: () => JSX.Element) {
  const result = render(() => <form data-testid="form">{children()}</form>);
  const form = result.getByTestId("form") as HTMLFormElement;
  return {
    ...result,
    form,
    data: () => new FormData(form),
    /** Resets the form and waits for the components' post-reset work (microtasks). */
    reset: async () => {
      form.reset();
      await Promise.resolve();
      await Promise.resolve();
    }
  };
}
