import type { Accessor, JSX } from "solid-js";
import {
  createContext,
  createEffect,
  createSignal,
  onCleanup,
  onMount,
  Show,
  useContext
} from "solid-js";

import { type BaseProps, cx } from "../../utils/style";
import { FloatingPanel, type FloatingPosition } from "../FloatingPanel/FloatingPanel";

export type MenuPosition = FloatingPosition;

interface MenuContextValue {
  open: Accessor<boolean>;
  position: Accessor<MenuPosition>;
  menuRef: Accessor<HTMLDivElement | undefined>;
  setDropdownRef: (element: HTMLDivElement | undefined) => void;
  close: () => void;
}

const MenuContext = createContext<MenuContextValue>();

export interface MenuProps extends BaseProps {
  children?: JSX.Element;
  position?: MenuPosition;
}

function MenuRoot(props: MenuProps) {
  let menuRef: HTMLDivElement | undefined;
  let dropdownRef: HTMLDivElement | undefined;
  const [open, setOpen] = createSignal(false);
  const position = () => props.position ?? "bottom";

  const closeMenu = () => setOpen(false);

  const closeOnOutsideClick = (event: MouseEvent) => {
    const target = event.target as Node;
    if (menuRef?.contains(target) || dropdownRef?.contains(target)) return;
    closeMenu();
  };

  const closeOnEscape = (event: KeyboardEvent) => {
    if (event.key !== "Escape" || event.defaultPrevented) return;
    // Handled here, so an open modal behind the menu stays open.
    event.preventDefault();
    closeMenu();
  };

  createEffect(() => {
    if (!open()) return;
    document.addEventListener("click", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    onCleanup(() => {
      document.removeEventListener("click", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    });
  });

  const context: MenuContextValue = {
    open,
    position,
    menuRef: () => menuRef,
    setDropdownRef: element => {
      dropdownRef = element;
    },
    close: closeMenu
  };

  return (
    <MenuContext.Provider value={context}>
      <div
        ref={el => (menuRef = el)}
        class={cx("bx-Menu", props.class)}
        style={props.style}
        data-open={open() ? "" : undefined}
        onClick={event => {
          event.stopPropagation();
          setOpen(current => !current);
        }}
      >
        {props.children}
      </div>
    </MenuContext.Provider>
  );
}

const FOCUSABLE = "a[href], button, input, select, textarea, [tabindex]";

export function MenuTarget(props: { children?: JSX.Element; class?: string; ariaLabel?: string }) {
  const menu = useContext(MenuContext);
  // Content that isn't focusable on its own (e.g. an Avatar) makes the target itself the button.
  const [standalone, setStandalone] = createSignal(false);
  let targetRef: HTMLDivElement | undefined;

  onMount(() => setStandalone(!targetRef?.querySelector(FOCUSABLE)));

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    targetRef?.click();
  };

  return (
    <div
      ref={el => (targetRef = el)}
      class={cx("bx-Menu-target", props.class)}
      role={standalone() ? "button" : undefined}
      tabIndex={standalone() ? 0 : undefined}
      aria-haspopup={standalone() ? "menu" : undefined}
      aria-expanded={standalone() && menu ? menu.open() : undefined}
      aria-label={standalone() ? props.ariaLabel : undefined}
      onKeyDown={event => standalone() && handleKeyDown(event)}
    >
      {props.children}
    </div>
  );
}

export function MenuDivider(props: BaseProps) {
  return <div class={cx("bx-Menu-divider", props.class)} role="separator" style={props.style} />;
}

function StaticMenuDropdown(props: { children?: JSX.Element; class?: string }) {
  return (
    <div class={cx("bx-Dropdown", "bx-Menu-dropdown", props.class)} role="menu">
      {props.children}
    </div>
  );
}

function ConnectedMenuDropdown(props: { children?: JSX.Element; class?: string }) {
  const menu = useContext(MenuContext)!;

  return (
    <FloatingPanel
      open={menu.open()}
      target={menu.menuRef}
      position={menu.position()}
      exitDuration={160}
      ref={menu.setDropdownRef}
      class={cx("bx-Dropdown", "bx-Menu-dropdown", props.class)}
      onClick={event => event.stopPropagation()}
    >
      <div role="menu" class="bx-Menu-items">
        {props.children}
      </div>
    </FloatingPanel>
  );
}

export function MenuDropdown(props: { children?: JSX.Element; class?: string }) {
  return (
    <Show when={useContext(MenuContext)} fallback={<StaticMenuDropdown {...props} />}>
      <ConnectedMenuDropdown {...props} />
    </Show>
  );
}

export interface MenuItemProps extends BaseProps {
  label?: JSX.Element;
  children?: JSX.Element;
  leftSection?: JSX.Element;
  onClick?: (event: MouseEvent) => void;
  disabled?: boolean;
  selected?: boolean;
  danger?: boolean;
}

export function MenuItem(props: MenuItemProps) {
  const menu = useContext(MenuContext);

  const activate = (event: MouseEvent) => {
    if (props.disabled) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    props.onClick?.(event);
    menu?.close();
  };

  return (
    <div
      class={cx("bx-Menu-item", props.class)}
      style={props.style}
      data-disabled={props.disabled ? "" : undefined}
      data-selected={props.selected ? "" : undefined}
      data-danger={props.danger ? "" : undefined}
      role="menuitem"
      tabIndex={props.disabled ? -1 : 0}
      aria-disabled={props.disabled === true}
      onClick={activate}
      onKeyDown={event => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        event.currentTarget.click();
      }}
    >
      {props.leftSection}
      {props.label ?? props.children}
    </div>
  );
}

// Marked pure so bundlers can drop Menu from apps that never import it; a plain
// `Menu.Target = ...` assignment counts as a side effect and would keep it.
export const Menu = /* @__PURE__ */ Object.assign(MenuRoot, {
  Target: MenuTarget,
  Dropdown: MenuDropdown,
  Divider: MenuDivider,
  Item: MenuItem
});
