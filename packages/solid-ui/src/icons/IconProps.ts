import type { JSX } from "solid-js";

export interface IconProps {
  color?: string;
  ariaLabel?: string;
  ariaHidden?: boolean;
  role?: "img" | "presentation" | "none";
  onClick?: JSX.EventHandler<SVGSVGElement, MouseEvent>;
  class?: string;
  style?: string | JSX.CSSProperties | undefined;
}
