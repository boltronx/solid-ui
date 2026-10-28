import { createEffect, createSignal, type JSX, splitProps, untrack } from "solid-js";

import { CloseIcon } from "../../icons";
import { onFormReset } from "../../utils/form";
import { Input, type InputProps } from "../Input/Input";

export interface InputSearchProps extends Omit<InputProps, "type" | "rightSection" | "inputMode"> {
  /** Replaces the cross on the clear button. */
  clearIcon?: JSX.Element;
}

export function InputSearch(props: InputSearchProps) {
  const [local, inputProps] = splitProps(props, ["ref", "inputClass", "clearIcon"]);
  const [hasValue, setHasValue] = createSignal(
    untrack(() => String(inputProps.value ?? inputProps.defaultValue ?? "").length > 0)
  );
  let input: HTMLInputElement | undefined;

  createEffect(() => {
    if (inputProps.value !== undefined) setHasValue(String(inputProps.value).length > 0);
  });

  onFormReset(
    () => input,
    () => queueMicrotask(() => setHasValue((input?.value.length ?? 0) > 0))
  );

  const clear = () => {
    if (!input) return;
    input.value = "";
    // An input event, so onInput handlers and form listeners see the clear like typing.
    input.dispatchEvent(
      new InputEvent("input", { bubbles: true, inputType: "deleteContentBackward" })
    );
    input.focus();
  };

  return (
    <Input
      {...inputProps}
      inputClass={local.inputClass ? `bx-InputSearch ${local.inputClass}` : "bx-InputSearch"}
      type="search"
      ref={element => {
        input = element;
        element.addEventListener("input", () => setHasValue(element.value.length > 0));
        local.ref?.(element);
      }}
      rightSection={
        hasValue() && !inputProps.disabled && !inputProps.readOnly
          ? {
              pointerEvents: "all",
              node: (
                <button
                  type="button"
                  class="bx-Input-sectionButton"
                  aria-label="Clear search"
                  tabindex={-1}
                  onClick={clear}
                >
                  {local.clearIcon ?? <CloseIcon />}
                </button>
              )
            }
          : undefined
      }
    />
  );
}
