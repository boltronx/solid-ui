import { createRoot, createSignal, For, type JSX } from "solid-js";
import { render } from "solid-js/web";

import { ErrorIcon, InfoIcon, SuccessIcon, WarningIcon } from "../../icons";

export type MessageType = "success" | "error" | "warning" | "info";

export interface MessageOptions {
  /** How long the message stays, in seconds. */
  seconds?: number;
  /** Replaces the icon for its type. */
  icon?: JSX.Element;
}

interface MessageItem {
  id: number;
  type: MessageType;
  text: string;
  icon: JSX.Element | undefined;
  exiting: () => boolean;
  pause: () => void;
  resume: () => void;
}

let idCounter = 0;
let setMessages: ((updater: (prev: MessageItem[]) => MessageItem[]) => void) | undefined;

const ICONS: Record<MessageType, () => JSX.Element> = {
  success: () => <SuccessIcon />,
  error: () => <ErrorIcon />,
  warning: () => <WarningIcon />,
  info: () => <InfoIcon />
};

function MessageContainer() {
  const [messages, setMessageList] = createSignal<MessageItem[]>([]);
  setMessages = setMessageList;

  return (
    <div class="bx-Message" role="status" aria-live="polite" aria-label="Notifications">
      <For each={messages()}>
        {item => (
          <div
            class="bx-Message-item"
            data-type={item.type}
            data-exiting={item.exiting() ? "" : undefined}
            onPointerEnter={item.pause}
            onPointerLeave={item.resume}
          >
            <span class="bx-Message-icon">{item.icon ?? ICONS[item.type]()}</span>
            <span class="bx-Message-text">{item.text}</span>
          </div>
        )}
      </For>
    </div>
  );
}

function ensureContainer() {
  if (setMessages) return;
  const host = document.createElement("div");
  document.body.appendChild(host);
  render(() => <MessageContainer />, host);
}

/** `options` is the seconds to show for, or an options object; defaultSeconds is used without. */
function show(
  type: MessageType,
  text: string,
  options: number | MessageOptions | undefined,
  defaultSeconds: number
) {
  const { seconds = defaultSeconds, icon } =
    typeof options === "number" ? { seconds: options } : (options ?? {});
  ensureContainer();
  const id = ++idCounter;

  // Each message owns its exiting signal inside a root so it has a proper
  // reactive owner and is cleaned up when the message is removed.
  createRoot(dispose => {
    const [exiting, setExiting] = createSignal(false);
    let remaining = Math.max(0, seconds * 1000);
    let startedAt = 0;
    let dismissTimer: ReturnType<typeof setTimeout> | undefined;

    const dismiss = () => {
      dismissTimer = undefined;
      setExiting(true);
      setTimeout(() => {
        setMessages!(prev => prev.filter(m => m.id !== id));
        dispose();
      }, 320);
    };

    const resume = () => {
      if (exiting() || dismissTimer !== undefined) return;
      startedAt = performance.now();
      dismissTimer = setTimeout(dismiss, remaining);
    };

    const pause = () => {
      if (exiting() || dismissTimer === undefined) return;
      clearTimeout(dismissTimer);
      dismissTimer = undefined;
      remaining = Math.max(0, remaining - (performance.now() - startedAt));
    };

    // The item object is never replaced — only `exiting` (a signal) changes.
    // This keeps <For> from recreating DOM nodes during the exit transition.
    setMessages!(prev => [...prev, { id, type, text, icon, exiting, pause, resume }]);
    startedAt = performance.now();
    dismissTimer = setTimeout(dismiss, remaining);
  });
}

/**
 * Short notifications at the top of the screen. The second argument is how long to show the
 * message, in seconds, or `{ seconds, icon }` to also replace its icon.
 */
export const message = {
  success(text: string, options?: number | MessageOptions) {
    show("success", text, options, 3);
  },
  error(text: string, options?: number | MessageOptions) {
    show("error", text, options, 6);
  },
  warning(text: string, options?: number | MessageOptions) {
    show("warning", text, options, 4);
  },
  info(text: string, options?: number | MessageOptions) {
    show("info", text, options, 3);
  }
};
