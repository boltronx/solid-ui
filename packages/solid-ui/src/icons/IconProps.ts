// The icons in this folder are internal: only the components draw them, and they are not exported.
// Apps that want icons install @tabler/icons-solidjs, which these are taken from (MIT, see LICENSE).
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
