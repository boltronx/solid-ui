import type { JSX } from "solid-js";
import { createUniqueId, splitProps } from "solid-js";

import { afterFormReset, onFormReset } from "../../utils/form";
import { type BaseProps, cx } from "../../utils/style";
import { useReadOnly } from "../ReadOnly/ReadOnly";

export interface CheckboxProps extends BaseProps {
  id?: string;
  name?: string;
  /** Submitted when checked. Default "on", like a native checkbox. */
  value?: string;
  /** Controlled state. The parent owns it; clicks only report through `onChange`. */
  checked?: boolean;
  /** Uncontrolled starting state; a form reset restores it. */
  defaultChecked?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  label?: JSX.Element;
  description?: JSX.Element;
  /** "switch" renders a toggle switch. */
  role?: "checkbox" | "switch";
  ref?: (el: HTMLInputElement) => void;
  onChange?: JSX.EventHandler<HTMLInputElement, Event>;
}

export function Checkbox(props: CheckboxProps) {
  const [local, rest] = splitProps(props, [
    "class",
    "style",
    "id",
    "label",
    "description",
    "role",
    "readOnly",
    "defaultChecked",
    "ref"
  ]);

  const generatedId = createUniqueId();
  const inputId = () => local.id ?? `bx-checkbox-${generatedId}`;
  const isReadOnly = useReadOnly(() => local.readOnly === true);
  let input: HTMLInputElement | undefined;

  // A controlled box shows the parent's state, so a click or a reset is undone once it finishes.
  // A click has toggled the box before its events, so a microtask is late enough for it; a reset
  // restores the box after its event, so that waits for afterFormReset.
  const restore = (checked: boolean | undefined, schedule = queueMicrotask) => {
    if (checked === undefined) return;
    schedule(() => {
      if (input) input.checked = checked;
    });
  };
  onFormReset(
    () => input,
    () => restore(rest.checked, afterFormReset)
  );

  return (
    <div
      class={cx("bx-Checkbox", local.class)}
      style={local.style}
      data-readonly={isReadOnly() ? "" : undefined}
      data-disabled={rest.disabled ? "" : undefined}
      data-align-start={local.description ? "" : undefined}
      onClick={event => {
        // The whole row toggles, not just the box and its label.
        if ((event.target as HTMLElement).closest("input, label")) return;
        if (rest.disabled || isReadOnly()) return;
        input?.click();
      }}
    >
      <input
        type="checkbox"
        ref={el => {
          input = el;
          if (local.defaultChecked !== undefined) el.defaultChecked = local.defaultChecked;
          local.ref?.(el);
        }}
        id={inputId()}
        class="bx-Checkbox-input"
        name={rest.name}
        value={rest.value ?? "on"}
        // Solid assigns `checked` after the ref, so uncontrolled boxes start from defaultChecked here.
        checked={rest.checked ?? local.defaultChecked}
        disabled={rest.disabled}
        required={rest.required}
        role={local.role ?? "checkbox"}
        aria-readonly={isReadOnly() || undefined}
        aria-describedby={local.description ? `${inputId()}-description` : undefined}
        onClick={event => {
          if (isReadOnly()) event.preventDefault();
        }}
        onChange={event => {
          rest.onChange?.(event);
          // Read after onChange, so a parent that updates right away keeps the new state.
          restore(rest.checked);
        }}
      />
      {local.label || local.description ? (
        <div class="bx-Checkbox-body">
          {local.label ? (
            <label class="bx-Checkbox-label" for={inputId()}>
              {local.label}
            </label>
          ) : null}
          {local.description ? (
            <p id={`${inputId()}-description`} class="bx-Checkbox-description">
              {local.description}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
