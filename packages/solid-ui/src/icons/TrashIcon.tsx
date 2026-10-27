import type { IconProps } from "./IconProps";

export function TrashIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      stroke={props.color ?? "currentColor"}
      stroke-width="2"
      fill="none"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-label={props.ariaLabel}
      aria-hidden={props.ariaHidden}
      role={props.role}
      onClick={event => props.onClick?.(event)}
      class={props.class}
      style={props.style}
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M4 7l16 0" />
      <path d="M10 11l0 6" />
      <path d="M14 11l0 6" />
      <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
      <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
    </svg>
  );
}
