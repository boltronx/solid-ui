import type { JSX } from "solid-js";
import {
  createEffect,
  createMemo,
  createSignal,
  createUniqueId,
  For,
  onCleanup,
  Show,
  splitProps
} from "solid-js";

import { ChevronDownIcon } from "../../icons";
import { createSearchCall } from "../../utils/debounce";
import { createControllableSignal, onFormReset } from "../../utils/form";
import { ComboboxOptionContent, ComboboxState, minLengthHint } from "../Combobox/Combobox";
import { FloatingPanel } from "../FloatingPanel/FloatingPanel";
import { Input, type InputProps } from "../Input/Input";
import { Loader } from "../Loader/Loader";
import type { SelectOption } from "../Select/Select";

export interface AutocompleteProps extends Omit<
  InputProps,
  | "type"
  | "min"
  | "max"
  | "step"
  | "inputMode"
  | "pattern"
  | "value"
  | "defaultValue"
  | "onInput"
  | "onChange"
  | "rightSection"
> {
  /** Suggestions. The field accepts any text; picking one fills in its label. */
  options: SelectOption[];
  /** Controlled text. The parent owns it; a form reset leaves it in place. */
  value?: string;
  /** Uncontrolled starting text; a form reset restores it. */
  defaultValue?: string;
  loading?: boolean;
  nothingFoundMessage?: string;
  renderOption?: (option: SelectOption) => JSX.Element;
  /** Replaces the chevron at the end of the field. */
  chevronIcon?: JSX.Element;
  /** Called with the text on every keystroke and when a suggestion is picked. */
  onChange?: (value: string) => void;
  onOptionSubmit?: (option: SelectOption) => void;
  /**
   * Set to search on the server: options are then shown as given, without local filtering. Called
   * once typing pauses (see `onSearchChangeDebounceMs`), and right away when a suggestion is picked.
   * The signal aborts when a newer search starts, so pass it to fetch to drop stale responses.
   */
  onSearchChange?: (value: string, signal: AbortSignal) => void;
  /** How long typing must pause before `onSearchChange` is called, in ms. Default 300; 0 calls on every keystroke. */
  onSearchChangeDebounceMs?: number;
  /** Text shorter than this is not sent to `onSearchChange`, e.g. 3 for trigram search. */
  onSearchChangeMinLength?: number;
  /** Shown while the text is shorter than `onSearchChangeMinLength`. Default "Type at least N characters". */
  searchMinLengthMessage?: string;
}

export function Autocomplete(props: AutocompleteProps) {
  const [, inputProps] = splitProps(props, [
    "options",
    "value",
    "defaultValue",
    "loading",
    "nothingFoundMessage",
    "renderOption",
    "chevronIcon",
    "onChange",
    "onOptionSubmit",
    "onSearchChange",
    "onSearchChangeDebounceMs",
    "onSearchChangeMinLength",
    "searchMinLengthMessage",
    "onFocus",
    "onKeyDown",
    "ref",
    "class"
  ]);
  const generatedId = createUniqueId();
  const inputId = () => props.id ?? `bx-autocomplete-${generatedId}`;
  const listboxId = () => `${inputId()}-listbox`;
  const [open, setOpen] = createSignal(false);
  const [activeIndex, setActiveIndex] = createSignal(-1);
  const text = createControllableSignal<string>({
    value: () => props.value,
    defaultValue: () => props.defaultValue ?? ""
  });
  let inputRef: HTMLInputElement | undefined;
  let dropdownRef: HTMLDivElement | undefined;

  onFormReset(() => inputRef, text.reset);
  const serverSearch = createSearchCall({
    callback: () => props.onSearchChange,
    delay: () => props.onSearchChangeDebounceMs,
    minLength: () => props.onSearchChangeMinLength
  });
  // Too short to search the server: the dropdown asks for more instead of showing stale options.
  const hint = () =>
    props.onSearchChange && serverSearch.tooShort(text.value())
      ? minLengthHint(props.onSearchChangeMinLength, props.searchMinLengthMessage)
      : undefined;

  const visibleOptions = createMemo(() => {
    const search = text.value().trim().toLocaleLowerCase();
    if (props.onSearchChange || !search) return props.options;
    return props.options.filter(option =>
      `${option.label} ${option.description ?? ""}`.toLocaleLowerCase().includes(search)
    );
  });

  const firstEnabledIndex = () => visibleOptions().findIndex(option => !option.disabled);

  createEffect(() => {
    visibleOptions();
    if (open()) setActiveIndex(firstEnabledIndex());
  });

  const openDropdown = () => {
    if (props.disabled || props.readOnly) return;
    setOpen(true);
    setActiveIndex(firstEnabledIndex());
  };

  const closeDropdown = () => {
    setOpen(false);
    setActiveIndex(-1);
  };

  /** Typing waits for a pause before searching; a picked suggestion searches right away. */
  const setText = (value: string, searchNow = false) => {
    text.setValue(value);
    props.onChange?.(value);
    if (searchNow) serverSearch.now(value);
    else serverSearch.schedule(value);
  };

  const submitOption = (option: SelectOption) => {
    if (option.disabled) return;
    setText(option.label, true);
    props.onOptionSubmit?.(option);
    closeDropdown();
    inputRef?.focus();
  };

  const moveActive = (direction: 1 | -1) => {
    const options = visibleOptions();
    if (!options.some(option => !option.disabled)) return;
    let next = activeIndex();
    do {
      next = (next + direction + options.length) % options.length;
    } while (options[next]?.disabled);
    setActiveIndex(next);
  };

  const handleKeyDown: JSX.EventHandler<HTMLInputElement, KeyboardEvent> = event => {
    if (typeof props.onKeyDown === "function") props.onKeyDown(event);
    if (event.defaultPrevented || props.disabled || props.readOnly) return;

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open()) openDropdown();
      else moveActive(event.key === "ArrowDown" ? 1 : -1);
      return;
    }
    if (event.key === "Home" && open()) {
      event.preventDefault();
      setActiveIndex(firstEnabledIndex());
      return;
    }
    if (event.key === "End" && open()) {
      event.preventDefault();
      setActiveIndex(visibleOptions().findLastIndex(option => !option.disabled));
      return;
    }
    if (event.key === "Enter" && open()) {
      const option = visibleOptions()[activeIndex()];
      if (option) {
        event.preventDefault();
        submitOption(option);
      }
      return;
    }
    if (event.key === "Escape" && open()) {
      event.preventDefault();
      closeDropdown();
    }
    if (event.key === "Tab") closeDropdown();
  };

  const closeOnOutsideClick = (event: MouseEvent) => {
    const target = event.target as Node;
    const field = inputRef?.closest(".bx-Autocomplete");
    if (!field?.contains(target) && !dropdownRef?.contains(target)) closeDropdown();
  };

  createEffect(() => {
    if (!open()) return;
    document.addEventListener("mousedown", closeOnOutsideClick);
    onCleanup(() => document.removeEventListener("mousedown", closeOnOutsideClick));
  });

  return (
    <>
      <Input
        {...inputProps}
        id={inputId()}
        class={props.class ? `bx-Autocomplete ${props.class}` : "bx-Autocomplete"}
        value={text.value()}
        role="combobox"
        autocomplete="off"
        aria-autocomplete="list"
        aria-controls={listboxId()}
        aria-expanded={open()}
        aria-activedescendant={
          open() && !props.loading && !hint() && activeIndex() >= 0
            ? `${listboxId()}-${activeIndex()}`
            : undefined
        }
        ref={element => {
          inputRef = element;
          props.ref?.(element);
        }}
        onInput={event => {
          setText(event.currentTarget.value);
          openDropdown();
        }}
        onFocus={event => {
          if (typeof props.onFocus === "function") props.onFocus(event);
          if (!event.defaultPrevented) openDropdown();
        }}
        onKeyDown={handleKeyDown}
        rightSection={
          <span class="bx-Autocomplete-indicator" data-expanded={open() ? "" : undefined}>
            <Show when={!props.loading} fallback={<Loader size="xs" />}>
              {props.chevronIcon ?? <ChevronDownIcon />}
            </Show>
          </span>
        }
      />
      <FloatingPanel
        open={open()}
        target={() => inputRef}
        matchTargetWidth
        ref={element => (dropdownRef = element)}
        class="bx-Dropdown bx-Combobox-dropdown"
        onClick={event => event.stopPropagation()}
      >
        <ComboboxState
          loading={props.loading}
          empty={visibleOptions().length === 0}
          nothingFoundMessage={props.nothingFoundMessage}
          hint={hint()}
        />
        <div
          id={listboxId()}
          class="bx-Combobox-options"
          role="listbox"
          aria-label={typeof props.label === "string" ? props.label : props["aria-label"]}
        >
          <Show when={!props.loading && !hint()}>
            <For each={visibleOptions()}>
              {(option, index) => (
                <div
                  id={`${listboxId()}-${index()}`}
                  class="bx-Combobox-option"
                  data-active={index() === activeIndex() ? "" : undefined}
                  data-disabled={option.disabled ? "" : undefined}
                  role="option"
                  aria-selected={index() === activeIndex()}
                  aria-disabled={option.disabled}
                  onMouseEnter={() => !option.disabled && setActiveIndex(index())}
                  onMouseDown={event => event.preventDefault()}
                  onClick={() => submitOption(option)}
                >
                  <ComboboxOptionContent option={option} render={props.renderOption} />
                </div>
              )}
            </For>
          </Show>
        </div>
      </FloatingPanel>
    </>
  );
}
