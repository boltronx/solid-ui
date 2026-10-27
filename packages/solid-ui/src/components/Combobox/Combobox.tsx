import type { JSX } from "solid-js";
import { Show } from "solid-js";

import { Loader } from "../Loader/Loader";
import type { SelectOption } from "../Select/Select";

/** Shows a loading or empty state in place of a dropdown's options. */
export function ComboboxState(props: {
  loading?: boolean;
  empty: boolean;
  nothingFoundMessage?: string;
  children: JSX.Element;
}) {
  return (
    <Show
      when={!props.loading}
      fallback={
        <div class="bx-Combobox-state">
          <Loader size="xs" /> Loading...
        </div>
      }
    >
      <Show
        when={!props.empty}
        fallback={
          <div class="bx-Combobox-state">{props.nothingFoundMessage ?? "No options found"}</div>
        }
      >
        {props.children}
      </Show>
    </Show>
  );
}

export function ComboboxOptionContent(props: {
  option: SelectOption;
  render?: (option: SelectOption) => JSX.Element;
}) {
  return (
    <span class="bx-Combobox-optionBody">
      <Show
        when={props.render}
        fallback={
          <>
            <span class="bx-Combobox-optionLabel">{props.option.label}</span>
            <Show when={props.option.description}>
              <small class="bx-Combobox-optionDescription">{props.option.description}</small>
            </Show>
          </>
        }
      >
        {render => render()(props.option)}
      </Show>
    </span>
  );
}
