import { createRoot, createSignal, For, type JSX } from "solid-js";
import { render } from "solid-js/web";

export type MessageType = "success" | "error" | "warning" | "info";

interface MessageItem {
  id: number;
  type: MessageType;
  text: string;
  exiting: () => boolean;
  pause: () => void;
  resume: () => void;
}

let idCounter = 0;
let setMessages: ((updater: (prev: MessageItem[]) => MessageItem[]) => void) | undefined;

const ICON_PATHS: Record<MessageType, string> = {
  success:
    "M17 3.34a10 10 0 1 1 -14.995 8.984l-.005 -.324l.005 -.324a10 10 0 0 1 14.995 -8.336zm-1.293 5.953a1 1 0 0 0 -1.32 -.083l-.094 .083l-3.293 3.292l-1.293 -1.292l-.094 -.083a1 1 0 0 0 -1.403 1.403l.083 .094l2 2l.094 .083a1 1 0 0 0 1.226 0l.094 -.083l4 -4l.083 -.094a1 1 0 0 0 -.083 -1.32z",
  error:
    "M12 2c5.523 0 10 4.477 10 10s-4.477 10 -10 10s-10 -4.477 -10 -10s4.477 -10 10 -10m3.6 5.2a1 1 0 0 0 -1.4 .2l-2.2 2.933l-2.2 -2.933a1 1 0 1 0 -1.6 1.2l2.55 3.4l-2.55 3.4a1 1 0 1 0 1.6 1.2l2.2 -2.933l2.2 2.933a1 1 0 0 0 1.6 -1.2l-2.55 -3.4l2.55 -3.4a1 1 0 0 0 -.2 -1.4",
  warning:
    "M12 1.67c.955 0 1.845 .467 2.39 1.247l.105 .16l8.114 13.548a2.914 2.914 0 0 1 -2.307 4.363l-.195 .008h-16.225a2.914 2.914 0 0 1 -2.582 -4.2l.099 -.185l8.11 -13.538a2.914 2.914 0 0 1 2.491 -1.403zm.01 13.33l-.127 .007a1 1 0 0 0 0 1.986l.117 .007l.127 -.007a1 1 0 0 0 0 -1.986l-.117 -.007zm-.01 -7a1 1 0 0 0 -.993 .883l-.007 .117v4l.007 .117a1 1 0 0 0 1.986 0l.007 -.117v-4l-.007 -.117a1 1 0 0 0 -.993 -.883z",
  info: "M12 2c5.523 0 10 4.477 10 10a10 10 0 0 1 -19.995 .324l-.005 -.324l.004 -.28c.148 -5.393 4.566 -9.72 9.996 -9.72zm0 9h-1l-.117 .007a1 1 0 0 0 0 1.986l.117 .007v3l.007 .117a1 1 0 0 0 .876 .876l.117 .007h1l.117 -.007a1 1 0 0 0 .876 -.876l.007 -.117l-.007 -.117a1 1 0 0 0 -.764 -.857l-.112 -.02l-.117 -.006v-3l-.007 -.117a1 1 0 0 0 -.876 -.876l-.117 -.007zm.01 -3l-.127 .007a1 1 0 0 0 0 1.986l.117 .007l.127 -.007a1 1 0 0 0 0 -1.986l-.117 -.007z"
};

function MessageIcon(props: { type: MessageType }): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d={ICON_PATHS[props.type]} />
    </svg>
  );
}

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
            <span class="bx-Message-icon">
              <MessageIcon type={item.type} />
            </span>
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

function show(type: MessageType, text: string, seconds: number) {
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
    setMessages!(prev => [...prev, { id, type, text, exiting, pause, resume }]);
    startedAt = performance.now();
    dismissTimer = setTimeout(dismiss, remaining);
  });
}

/** Short notifications at the top of the screen. Durations are in seconds. */
export const message = {
  success(text: string, seconds = 3) {
    show("success", text, seconds);
  },
  error(text: string, seconds = 6) {
    show("error", text, seconds);
  },
  warning(text: string, seconds = 4) {
    show("warning", text, seconds);
  },
  info(text: string, seconds = 3) {
    show("info", text, seconds);
  }
};
