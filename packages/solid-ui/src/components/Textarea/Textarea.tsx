import type { JSX } from "solid-js";
import {
  createEffect,
  createSignal,
  createUniqueId,
  onCleanup,
  splitProps,
  untrack
} from "solid-js";

import { keepControlledOnReset, onFormReset } from "../../utils/form";
import type { BaseProps } from "../../utils/style";
import { describedBy, Field, type FieldOwnProps } from "../Field/Field";
import { useReadOnly } from "../ReadOnly/ReadOnly";

type NativeTextareaProps = Omit<
  JSX.TextareaHTMLAttributes<HTMLTextAreaElement>,
  "class" | "style" | "value" | "defaultValue" | "ref" | "children" | "readOnly" | "readonly"
>;

export interface TextareaProps extends NativeTextareaProps, FieldOwnProps, BaseProps {
  /** Controlled value. The parent owns it; a form reset leaves it in place. */
  value?: string;
  /** Uncontrolled starting value; a form reset restores it. */
  defaultValue?: string;
  readOnly?: boolean;
  autoFocus?: boolean;
  resize?: "none" | "both" | "horizontal" | "vertical";
  showCount?: boolean;
  /** Grows and shrinks with its content, starting at one row unless `rows` is given. */
  autoSize?: boolean;
  /** With `autoSize`, stops growing at this many rows and scrolls past it. */
  maxRows?: number;
  /** Enter submits the enclosing form, as in an input; Shift+Enter still adds a new line. */
  submitOnEnter?: boolean;
  ref?: (el: HTMLTextAreaElement) => void;
}

export function Textarea(props: TextareaProps) {
  const [local, field, rest] = splitProps(
    props,
    [
      "class",
      "style",
      "id",
      "value",
      "defaultValue",
      "readOnly",
      "autoFocus",
      "resize",
      "showCount",
      "autoSize",
      "maxRows",
      "submitOnEnter",
      "ref"
    ],
    ["label", "description", "error"]
  );

  const generatedId = createUniqueId();
  const textareaId = () => local.id ?? `bx-textarea-${generatedId}`;
  const isReadOnly = useReadOnly(() => local.readOnly === true);
  const [characterCount, setCharacterCount] = createSignal(
    untrack(() => String(local.value ?? local.defaultValue ?? "").length)
  );
  let textarea: HTMLTextAreaElement | undefined;

  /** Sizes the box to its content, borders included since the box is border-box. */
  function fit() {
    const el = textarea;
    if (!el || !local.autoSize) return;
    el.style.height = "auto";
    let height = el.scrollHeight + el.offsetHeight - el.clientHeight;
    let overflow = false;
    if (local.maxRows) {
      // With height auto the box is exactly `rows` tall, so borrowing maxRows measures the cap in
      // the box's own font and padding.
      const rows = el.rows;
      el.rows = local.maxRows;
      const max = el.offsetHeight;
      el.rows = rows;
      overflow = height > max;
      if (overflow) height = max;
    }
    el.style.overflowY = overflow ? "auto" : "hidden";
    el.style.height = `${height}px`;
  }

  createEffect(() => {
    if (local.value !== undefined) setCharacterCount(local.value.length);
    fit();
  });

  keepControlledOnReset(
    () => textarea,
    () => local.value
  );
  onFormReset(
    () => textarea,
    () =>
      queueMicrotask(() => {
        setCharacterCount(textarea?.value.length ?? 0);
        fit();
      })
  );

  return (
    <Field
      id={textareaId()}
      label={field.label}
      description={field.description}
      error={field.error}
      required={rest.required}
      class={local.class}
      style={local.style}
    >
      <textarea
        {...rest}
        ref={el => {
          textarea = el;
          if (local.defaultValue !== undefined) el.defaultValue = local.defaultValue;
          el.addEventListener("input", () => {
            setCharacterCount(el.value.length);
            fit();
          });
          el.addEventListener("keydown", event => {
            // isComposing: Enter that confirms an IME composition is not a submit.
            if (!local.submitOnEnter || event.key !== "Enter" || event.shiftKey) return;
            if (event.isComposing) return;
            event.preventDefault();
            el.form?.requestSubmit();
          });
          if (local.autoSize) {
            // Wrapping follows the width, which is unknown until the box is laid out and can change
            // with its container, so refit whenever the width changes.
            let width = 0;
            const observer = new ResizeObserver(() => {
              if (el.clientWidth === width) return;
              width = el.clientWidth;
              fit();
            });
            observer.observe(el);
            onCleanup(() => observer.disconnect());
          }
          if (local.autoFocus) queueMicrotask(() => el.focus());
          local.ref?.(el);
        }}
        id={textareaId()}
        class="bx-Input-control bx-Textarea"
        value={local.value ?? undefined}
        readOnly={isReadOnly()}
        data-readonly={isReadOnly() ? "" : undefined}
        aria-invalid={field.error ? true : undefined}
        aria-describedby={describedBy(textareaId(), field)}
        rows={rest.rows ?? (local.autoSize ? 1 : undefined)}
        style={{ resize: local.resize ?? "none" }}
      />
      {local.showCount ? (
        <div class="bx-Textarea-count" aria-live="polite">
          {characterCount()}
          {rest.maxLength !== undefined ? `/${rest.maxLength}` : null}
        </div>
      ) : null}
    </Field>
  );
}
