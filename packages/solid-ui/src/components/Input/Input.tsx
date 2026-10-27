import type { JSX } from "solid-js";
import { createUniqueId, splitProps } from "solid-js";

import { keepControlledOnReset } from "../../utils/form";
import { type BaseProps, type StyleProp } from "../../utils/style";
import { describedBy, Field, type FieldOwnProps } from "../Field/Field";
import { useReadOnly } from "../ReadOnly/ReadOnly";

/** Content beside the input. Pass `{ node, pointerEvents: "all" }` for something clickable. */
export type InputSection = JSX.Element | { pointerEvents: "none" | "all"; node: JSX.Element };

type NativeInputProps = Omit<
  JSX.InputHTMLAttributes<HTMLInputElement>,
  "class" | "style" | "value" | "defaultValue" | "ref" | "children" | "readOnly" | "readonly"
>;

export interface InputProps extends NativeInputProps, FieldOwnProps, BaseProps {
  /** Controlled value. The parent owns it; a form reset leaves it in place. */
  value?: string | number;
  /** Uncontrolled starting value; a form reset restores it. */
  defaultValue?: string | number;
  readOnly?: boolean;
  autoFocus?: boolean;
  leftSection?: InputSection;
  rightSection?: InputSection;
  inputStyle?: StyleProp;
  inputClass?: string;
  ref?: (el: HTMLInputElement) => void;
}

function resolveSection(section: InputSection | undefined) {
  if (section && typeof section === "object" && !Array.isArray(section) && "node" in section) {
    return section as { pointerEvents: "none" | "all"; node: JSX.Element };
  }
  return { node: section as JSX.Element, pointerEvents: "none" as const };
}

export function Input(props: InputProps) {
  const [local, field, inputProps] = splitProps(
    props,
    [
      "class",
      "style",
      "id",
      "value",
      "defaultValue",
      "readOnly",
      "autoFocus",
      "leftSection",
      "rightSection",
      "inputStyle",
      "inputClass",
      "ref"
    ],
    ["label", "description", "error"]
  );

  const generatedId = createUniqueId();
  const inputId = () => local.id ?? `bx-input-${generatedId}`;
  const left = () => resolveSection(local.leftSection);
  const right = () => resolveSection(local.rightSection);
  const isReadOnly = useReadOnly(() => local.readOnly === true);
  let input: HTMLInputElement | undefined;

  keepControlledOnReset(
    () => input,
    () => local.value
  );

  return (
    <Field
      id={inputId()}
      label={field.label}
      description={field.description}
      error={field.error}
      required={inputProps.required}
      class={local.class}
      style={local.style}
    >
      <div
        class="bx-Input"
        data-with-left={left().node ? "" : undefined}
        data-with-right={right().node ? "" : undefined}
        data-disabled={inputProps.disabled ? "" : undefined}
      >
        {left().node ? (
          <span
            class="bx-Input-section"
            data-position="left"
            style={{ "pointer-events": left().pointerEvents }}
          >
            {left().node}
          </span>
        ) : null}
        <input
          type="text"
          {...inputProps}
          ref={el => {
            input = el;
            // Setting the default also sets the value of an untouched input, and is what reset restores.
            if (local.defaultValue !== undefined) el.defaultValue = String(local.defaultValue);
            if (local.autoFocus) queueMicrotask(() => el.focus());
            local.ref?.(el);
          }}
          id={inputId()}
          class={local.inputClass ? `bx-Input-control ${local.inputClass}` : "bx-Input-control"}
          style={local.inputStyle}
          value={local.value ?? undefined}
          readOnly={isReadOnly()}
          data-readonly={isReadOnly() ? "" : undefined}
          aria-invalid={field.error ? true : undefined}
          aria-describedby={describedBy(inputId(), field)}
        />
        {right().node ? (
          <span
            class="bx-Input-section"
            data-position="right"
            style={{ "pointer-events": right().pointerEvents }}
          >
            {right().node}
          </span>
        ) : null}
      </div>
    </Field>
  );
}
