import type { IconProps } from "./IconProps";

export function ShoppingCartIcon(props: IconProps) {
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
      <path d="M6 19m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
      <path d="M17 19m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
      <path d="M17 17h-11v-14h-2" />
      <path d="M6 5l14 1l-1 7h-13" />
    </svg>
  );
}
