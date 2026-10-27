import type { JSX } from "solid-js";

import { ChevronDownIcon } from "../../icons/ChevronDownIcon";
import { type BaseProps, cx } from "../../utils/style";
import { Button, type ButtonVariant } from "../Button/Button";
import { Menu, MenuDropdown, type MenuPosition, MenuTarget } from "../Menu/Menu";

export interface SplitButtonProps extends BaseProps {
  children?: JSX.Element;
  /** Menu items (MenuItem, MenuDivider) for the arrow half. */
  dropdown?: JSX.Element;
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  variant?: ButtonVariant;
  type?: "button" | "submit" | "reset";
  leftSection?: JSX.Element;
  menuPosition?: MenuPosition;
  "aria-label"?: string;
  toggleAriaLabel?: string;
  onClick?: (event: MouseEvent) => void;
}

export function SplitButton(props: SplitButtonProps) {
  const handlePrimaryClick = (event: MouseEvent) => {
    // The menu opens from its own half only.
    event.stopPropagation();
    if (props.disabled || props.loading) return;
    props.onClick?.(event);
    const menuRoot = (event.currentTarget as HTMLElement).closest<HTMLElement>(".bx-Menu");
    if (menuRoot?.hasAttribute("data-open")) menuRoot.click();
  };

  return (
    <Menu
      position={props.menuPosition ?? "bottom-end"}
      class={cx("bx-SplitButton-menu", props.fullWidth && "bx-SplitButton-fullWidth")}
    >
      <MenuTarget class={cx("bx-SplitButton", props.class)}>
        <Button
          class="bx-SplitButton-main"
          style={props.style}
          variant={props.variant}
          disabled={props.disabled}
          loading={props.loading}
          type={props.type ?? "button"}
          leftSection={props.leftSection}
          fullWidth={props.fullWidth}
          aria-label={props["aria-label"]}
          onClick={handlePrimaryClick}
        >
          {props.children}
        </Button>
        <Button
          class="bx-SplitButton-toggle"
          variant={props.variant}
          disabled={props.disabled || props.loading}
          aria-label={props.toggleAriaLabel ?? "More options"}
          aria-haspopup="menu"
        >
          <ChevronDownIcon ariaHidden />
        </Button>
      </MenuTarget>
      <MenuDropdown>{props.dropdown}</MenuDropdown>
    </Menu>
  );
}
