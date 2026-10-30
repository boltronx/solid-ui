import { type Accessor, createSignal, onCleanup, onMount, untrack } from "solid-js";

/**
 * Runs `handler` when the element's form is reset. The reset event fires before the browser
 * restores native controls, so state set here is in place by the time they repaint. Work that
 * must see or override the restored controls goes through `afterFormReset`.
 */
export function onFormReset(element: Accessor<HTMLElement | undefined>, handler: () => void) {
  onMount(() => {
    const el = element();
    const form = (el as HTMLInputElement | undefined)?.form ?? el?.closest("form");
    if (!form) return;
    form.addEventListener("reset", handler);
    onCleanup(() => form.removeEventListener("reset", handler));
  });
}

/**
 * Runs `fn` once a form reset has finished restoring the native controls. Not a microtask: after a
 * user clicks a reset button, microtasks run between the reset event and the restore, so work
 * queued that way is undone. A task runs after it.
 */
export function afterFormReset(fn: () => void) {
  setTimeout(fn);
}

/**
 * Keeps a controlled value on a native control after a form reset. The browser resets a control to
 * its default, but a controlled value belongs to the parent, so it is written back once the reset
 * finishes.
 */
export function keepControlledOnReset(
  element: Accessor<HTMLInputElement | HTMLTextAreaElement | undefined>,
  value: Accessor<string | number | undefined>
) {
  onFormReset(element, () => {
    if (value() === undefined) return;
    afterFormReset(() => {
      const el = element();
      const current = value();
      if (el && current !== undefined) el.value = String(current);
    });
  });
}

/**
 * State for a component that is controlled when `value` is defined and keeps its own state
 * otherwise, starting from (and resetting to) `defaultValue`.
 */
export function createControllableSignal<T>(options: {
  value: Accessor<T | undefined>;
  defaultValue: Accessor<T>;
}) {
  const [internal, setInternal] = createSignal<T>(untrack(options.defaultValue));
  const isControlled = () => options.value() !== undefined;
  const value = () => (isControlled() ? (options.value() as T) : internal());
  /** Stores the value when uncontrolled; a controlled parent applies it through `value`. */
  const setValue = (next: T) => {
    if (!untrack(isControlled)) setInternal(() => next);
  };
  const reset = () => setValue(untrack(options.defaultValue));
  return { value, setValue, reset, isControlled };
}

/**
 * Whether a key press belongs to an IME composition, e.g. the Enter that confirms Japanese or
 * Chinese text, so it must not submit. Safari sends that Enter after the composition has ended,
 * with `isComposing` false, but still with keyCode 229.
 */
export function isCompositionKey(event: KeyboardEvent): boolean {
  // keyCode is deprecated, but it is the only signal Safari gives.
  return event.isComposing || event.keyCode === 229;
}

/**
 * Moves focus to the first field marked invalid, so after a failed submit a screen reader reads
 * that field, "invalid" and its error, and a keyboard user lands where the fix is needed. Call it
 * once the errors are set; it waits a microtask so they have rendered. Resolves with the field it
 * focused, or undefined when every field is valid.
 */
export async function focusFirstInvalid(
  root: ParentNode = document
): Promise<HTMLElement | undefined> {
  await Promise.resolve();
  const field = root.querySelector<HTMLElement>('[aria-invalid="true"]:not([disabled])');
  field?.focus();
  return field ?? undefined;
}
