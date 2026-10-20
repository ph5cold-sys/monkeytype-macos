import { createSignal, For, JSX, onCleanup, Show } from "solid-js";

import { Button } from "../../common/Button";
import { getFingerInfo, HandGuide } from "../test/finger-guide";

const drills = [
  "asdf jkl; asdf jkl;",
  "asdfghjkl; lkjhgfdsa",
  "qwertyuiop poiuytrewq",
  "zxcvbnm,./ mnbvcxz",
  "the quick brown fox jumps over the lazy dog",
];

const durations = [
  { label: "2 minutes", seconds: 120 },
  { label: "5 minutes", seconds: 300 },
  { label: "10 minutes", seconds: 600 },
  { label: "No timer", seconds: 0 },
];

export function FingerPractice() {
  const [running, setRunning] = createSignal(false);
  const [duration, setDuration] = createSignal(120);
  const [elapsed, setElapsed] = createSignal(0);
  const [position, setPosition] = createSignal(0);
  const [drillIndex, setDrillIndex] = createSignal(0);
  const [correctKeys, setCorrectKeys] = createSignal(0);
  const [mistakes, setMistakes] = createSignal(0);
  let practiceArea: HTMLDivElement | undefined;
  let interval: ReturnType<typeof setInterval> | undefined;

  const drill = () => drills[drillIndex() % drills.length] ?? "";
  const target = () => (running() ? drill()[position()] : undefined);
  const fingerInfo = () => {
    const key = target();
    return key === undefined ? undefined : getFingerInfo(key.toLowerCase());
  };
  const timeLabel = () => {
    const seconds =
      duration() === 0 ? elapsed() : Math.max(0, duration() - elapsed());
    return `${Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;
  };

  const stop = () => {
    setRunning(false);
    if (interval !== undefined) {
      clearInterval(interval);
      interval = undefined;
    }
  };

  const start = () => {
    stop();
    setElapsed(0);
    setPosition(0);
    setDrillIndex(0);
    setCorrectKeys(0);
    setMistakes(0);
    setRunning(true);
    requestAnimationFrame(() => practiceArea?.focus());
    interval = setInterval(() => {
      setElapsed((seconds) => seconds + 1);
      if (duration() > 0 && elapsed() + 1 >= duration()) stop();
    }, 1000);
  };

  onCleanup(stop);

  const onKeyDown: JSX.EventHandler<HTMLDivElement, KeyboardEvent> = (
    event,
  ) => {
    event.preventDefault();
    event.stopPropagation();
    if (!running() || event.repeat || event.key.length !== 1) return;

    if (event.key.toLowerCase() === target()) {
      setCorrectKeys((count) => count + 1);
      if (position() + 1 >= drill().length) {
        setDrillIndex((index) => index + 1);
        setPosition(0);
      } else {
        setPosition((current) => current + 1);
      }
    } else {
      setMistakes((count) => count + 1);
    }
  };

  const finger = () => fingerInfo()?.finger;
  const hand = () => fingerInfo()?.hand;
  const keyLabel = () => (target() === " " ? "Space" : target()?.toUpperCase());

  return (
    <div class="grid w-full max-w-xl gap-4 rounded bg-sub-alt p-5 text-sm">
      <div class="flex flex-wrap items-center justify-center gap-3">
        <label class="text-sub">
          session length{" "}
          <select
            class="rounded bg-bg px-2 py-1 text-text"
            value={duration()}
            disabled={running()}
            onChange={(event) => setDuration(Number(event.currentTarget.value))}
          >
            <For each={durations}>
              {(option) => (
                <option value={option.seconds}>{option.label}</option>
              )}
            </For>
          </select>
        </label>
        <Button
          variant="button"
          text={running() ? "End session" : "Start practice"}
          onClick={running() ? stop : start}
        />
      </div>
      <Show when={running() || correctKeys() > 0}>
        <div class="text-center text-sub">
          {running() ? `Time ${timeLabel()}` : "Session complete"} ·{" "}
          {correctKeys()} correct · {mistakes()} mistakes
        </div>
      </Show>
      <Show when={running()}>
        <div
          ref={(element) => (practiceArea = element)}
          tabIndex={0}
          onKeyDown={onKeyDown}
          class="grid cursor-text gap-2 rounded border border-sub p-5 text-center outline-none focus:border-main"
          aria-label="Finger practice. Type the highlighted character."
        >
          <div class="text-sub">Type this character:</div>
          <div class="text-5xl text-main">{keyLabel() ?? " "}</div>
          <div class="text-sub">Drill {drillIndex() + 1}</div>
        </div>
      </Show>
      <div class="text-center text-text">
        <Show
          when={keyLabel() !== undefined}
          fallback={<>Rest fingers on A S D F and J K L ;, then start</>}
        >
          <>
            Press <strong class="text-main">{keyLabel()}</strong> with your{" "}
            <strong class="text-main">
              {finger() === "thumb" ? "thumb" : `${finger()} finger`}
            </strong>
            <Show when={hand() !== undefined && hand() !== "both"}>
              {` (${hand()} hand)`}
            </Show>
          </>
        </Show>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <HandGuide side="left" activeFinger={finger()} active={hand()} />
        <HandGuide side="right" activeFinger={finger()} active={hand()} />
      </div>
      <div class="text-center text-sub">
        Home row: A S D F · J K L ; · use either thumb for Space
      </div>
    </div>
  );
}
