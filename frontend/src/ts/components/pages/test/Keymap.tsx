import { LayoutObject } from "@monkeytype/schemas/layouts";
import { createEffect, createMemo, createSignal, For, Show } from "solid-js";

import { getConfig } from "../../../config/store";
import { showCommandLineForConfig } from "../../../states/core";
import { getModifierState, isCapsLockOn } from "../../../states/modifiers";
import {
  FlashEntry,
  getKeymapFlashState,
  getKeymapHighlightKey,
  getKeymapLayout,
  keymapLayoutObject,
  setKeymapFlashState,
  wordsHaveNumbers,
} from "../../../states/test";
import { getTheme } from "../../../states/theme";
import { cn } from "../../../utils/cn";
import { applyReducedMotion, isMacLike } from "../../../utils/misc";
import { Anime } from "../../common/anime";
import { Button } from "../../common/Button";
import { convertLayoutToKeymap } from "./keymapConverter";
import { KeyboardDefinition, KeyDefinition } from "./keymapLayouts";

export function Keymap() {
  return (
    <Show when={getConfig.keymapMode !== "off" && keymapLayoutObject()}>
      <Keyboard
        displayName={getKeymapLayout().layoutNameDisplayString}
        layoutData={keymapLayoutObject() as LayoutObject}
      />
    </Show>
  );
}

function Keyboard(props: { displayName: string; layoutData: LayoutObject }) {
  const layer = createMemo(() => {
    const { alt, shift } = getModifierState();
    switch (getConfig.keymapLegendStyle) {
      case "blank":
        return -1;
      case "lowercase":
        return 0;
      case "uppercase":
        return 1;
      case "dynamic": {
        if (shift && alt) {
          return 3;
        } else if (alt) {
          return 2;
        } else if (shift || isCapsLockOn()) {
          return 1;
        }
        return 0;
      }
      default:
        return 0;
    }
  });

  const showFirstRow = createMemo(
    () =>
      (wordsHaveNumbers() && getConfig.keymapMode === "next") ||
      getConfig.keymapKeys === "full" ||
      getConfig.keymapKeys === "minimal_numrow" ||
      (getConfig.keymapKeys === "minimal" && props.layoutData.keymapShowTopRow),
  );

  const keyboardDef = createMemo(() =>
    convertLayoutToKeymap(props.layoutData, {
      keymapStyle: getConfig.keymapStyle,
      showAllKeys:
        getConfig.keymapKeys === "full" ||
        props.layoutData.matrixShowRightColumn === true,
    }),
  );

  return (
    <div
      data-ui-element="keymap"
      class="flex w-full flex-col items-center py-8 text-sm text-sub"
    >
      <Show when={keyboardDef()} fallback={<div>Loading...</div>}>
        <KeyboardDefinitionRenderer
          keyboardDef={keyboardDef()}
          layer={layer()}
          showFirstRow={showFirstRow()}
          flashState={getKeymapFlashState}
        />
        <FingerGuide />
      </Show>
    </div>
  );
}

function FingerGuide() {
  const nextKey = () => getKeymapHighlightKey()?.toLowerCase();
  const nextFingerInfo = () => {
    const key = nextKey();
    return key !== undefined && key !== "" ? getFingerInfo(key) : undefined;
  };
  const keyLabel = () => {
    const key = nextKey();
    if (key === undefined || key === "") return undefined;
    if (key === " ") return "Space";
    return key.length === 1 ? key.toUpperCase() : key;
  };
  const fingerName = () => nextFingerInfo()?.finger;
  const activeHand = () => nextFingerInfo()?.hand;

  return (
    <div class="mt-4 grid w-full max-w-xl gap-3 rounded bg-sub-alt p-4 text-xs">
      <div class="text-center text-text">
        <Show
          when={keyLabel() !== undefined}
          fallback={<>Rest fingers on A S D F and J K L ;, then start typing</>}
        >
          <>
            Press <strong class="text-main">{keyLabel()}</strong> with your{" "}
            <Show
              when={nextFingerInfo()}
              fallback={<strong class="text-main">assigned finger</strong>}
            >
              <strong class="text-main">
                {fingerName() === "thumb" ? "thumb" : `${fingerName()} finger`}
              </strong>
            </Show>
            <Show when={activeHand() !== undefined && activeHand() !== "both"}>
              {` (${activeHand()} hand)`}
            </Show>
          </>
        </Show>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <HandGuide
          side="left"
          activeFinger={fingerName()}
          active={activeHand()}
        />
        <HandGuide
          side="right"
          activeFinger={fingerName()}
          active={activeHand()}
        />
      </div>
      <div class="text-center text-sub">
        Home row: A S D F · J K L ; · use either thumb for Space
      </div>
    </div>
  );
}

type Finger = "pinky" | "ring" | "middle" | "index" | "thumb";
type HandSide = "left" | "right";

type FingerInfo = { finger: Finger; hand: HandSide | "both" };

function getFingerInfo(key: string): FingerInfo | undefined {
  if (key === " ") return { finger: "thumb", hand: "both" };

  const mappings: [Finger, HandSide, string][] = [
    ["pinky", "left", "1qaz`"],
    ["ring", "left", "2wsx"],
    ["middle", "left", "3edc"],
    ["index", "left", "45rtfgvb"],
    ["index", "right", "67yuhjnm"],
    ["middle", "right", "8ik,"],
    ["ring", "right", "9ol."],
    ["pinky", "right", "0p-=[]\\;'/"],
  ];
  const directMatch = mappings.find(([, , keys]) => keys.includes(key));
  if (directMatch) {
    return { finger: directMatch[0], hand: directMatch[1] };
  }

  const shiftedKeys: Record<string, FingerInfo> = {
    "!": { finger: "pinky", hand: "left" },
    "@": { finger: "ring", hand: "left" },
    "#": { finger: "middle", hand: "left" },
    $: { finger: "index", hand: "left" },
    "%": { finger: "index", hand: "left" },
    "^": { finger: "index", hand: "right" },
    "&": { finger: "index", hand: "right" },
    "*": { finger: "middle", hand: "right" },
    "(": { finger: "ring", hand: "right" },
    ")": { finger: "pinky", hand: "right" },
    _: { finger: "pinky", hand: "right" },
    "+": { finger: "pinky", hand: "right" },
    "{": { finger: "pinky", hand: "right" },
    "}": { finger: "pinky", hand: "right" },
    "|": { finger: "pinky", hand: "right" },
    ":": { finger: "pinky", hand: "right" },
    '"': { finger: "pinky", hand: "right" },
    "<": { finger: "middle", hand: "right" },
    ">": { finger: "ring", hand: "right" },
    "?": { finger: "pinky", hand: "right" },
    "~": { finger: "pinky", hand: "left" },
  };
  return shiftedKeys[key];
}

function HandGuide(props: {
  side: HandSide;
  activeFinger: Finger | undefined;
  active: HandSide | "both" | undefined;
}) {
  const fingers: { name: Finger; height: string }[] = [
    { name: "pinky", height: "h-7" },
    { name: "ring", height: "h-9" },
    { name: "middle", height: "h-11" },
    { name: "index", height: "h-9" },
    { name: "thumb", height: "h-6" },
  ];
  return (
    <div class="grid justify-items-center gap-2">
      <div class="text-sub">{props.side} hand</div>
      <div class="flex h-14 items-end gap-1">
        <For each={props.side === "left" ? fingers : [...fingers].reverse()}>
          {(finger) => {
            const isActive =
              (props.active === props.side || props.active === "both") &&
              props.activeFinger === finger.name;
            return (
              <div
                class={cn(
                  "w-5 rounded-full border border-sub",
                  finger.height,
                  finger.name === "thumb" && "rotate-[-35deg]",
                  isActive ? "border-main bg-main" : "bg-bg",
                )}
                aria-label={`${props.side} ${finger.name} finger${isActive ? ", use this finger" : ""}`}
              ></div>
            );
          }}
        </For>
      </div>
      <div class="text-center text-sub">
        {props.side === "left" ? "A S D F" : "J K L ;"}
      </div>
    </div>
  );
}

function KeyboardDefinitionRenderer(props: {
  keyboardDef: KeyboardDefinition;
  layer: number;
  showFirstRow: boolean;
  flashState: Record<string, FlashEntry | undefined>;
}) {
  return (
    <div
      class="w-fit xxs:zoom-(--kb-zoom-xxs) xs:zoom-(--kb-zoom-xs) sm:zoom-(--kb-zoom-sm) md:zoom-(--kb-zoom-md) lg:zoom-(--kb-zoom-lg) xl:zoom-(--kb-zoom-xl) 2xl:zoom-(--kb-zoom-2xl)"
      style={{
        "--kb-zoom-xxs": Math.min(getConfig.keymapSize, 0.5),
        "--kb-zoom-xs": Math.min(getConfig.keymapSize, 0.7),
        "--kb-zoom-sm": Math.min(getConfig.keymapSize, 1),
        "--kb-zoom-md": Math.min(getConfig.keymapSize, 1.3),
        "--kb-zoom-lg": Math.min(getConfig.keymapSize, 1.7),
        "--kb-zoom-xl": Math.min(getConfig.keymapSize, 2.2),
        "--kb-zoom-2xl": Math.min(getConfig.keymapSize, 2.9),
      }}
    >
      <For each={props.keyboardDef}>
        {(keys, rowNum) => (
          <Show when={rowNum() !== 0 || props.showFirstRow}>
            <div class="flex h-8 flex-row">
              <For each={keys}>
                {(key) => {
                  const label = () => {
                    const layer =
                      rowNum() === 0 && isMacLike() && isCapsLockOn()
                        ? props.layer - 1
                        : props.layer;
                    return key.legends[layer] ?? "";
                  };
                  const flashEntry = () =>
                    key.legends
                      .map((legend) => props.flashState[legend])
                      .find((it) => it !== undefined);
                  return (
                    <Key {...key} label={label()} flashEntry={flashEntry} />
                  );
                }}
              </For>
            </div>
          </Show>
        )}
      </For>
    </div>
  );
}

function Key(
  props: {
    label: string;
    flashEntry: () => FlashEntry | undefined;
  } & KeyDefinition,
) {
  const isSteno = () =>
    getConfig.keymapStyle === "steno" ||
    getConfig.keymapStyle === "steno_matrix";

  // Steno keys never flash.
  const flashInfo = createMemo(() => {
    if (isSteno() || getConfig.keymapMode !== "react") {
      return { tick: 0, correct: true };
    }

    const entry = props.flashEntry();
    return { tick: entry?.tick ?? 0, correct: entry?.correct ?? true };
  });

  const isNext = createMemo(
    () =>
      getConfig.keymapMode === "next" &&
      !isSteno() &&
      props.legends?.some((legend) => legend === getKeymapHighlightKey()),
  );

  const fadeDuration = applyReducedMotion(250);

  const keyMatchesHighlight = createMemo(() =>
    props.legends?.some((legend) => legend === getKeymapHighlightKey()),
  );

  // Fade when leaving "next" mode
  const [isFading, setIsFading] = createSignal(false);
  let prevKeymapMode = getConfig.keymapMode;
  let prevKeyWasHighlighted = false;
  createEffect(() => {
    const mode = getConfig.keymapMode;
    const isStenoMode = isSteno();
    const keyWasHighlighted = keyMatchesHighlight() && !isStenoMode;

    if (prevKeymapMode === "next" && mode !== "next" && prevKeyWasHighlighted) {
      setIsFading(true);
    }
    prevKeymapMode = mode;
    prevKeyWasHighlighted = keyWasHighlighted;
  });

  const baseKeyBgColor = () => {
    if (isFading()) {
      return getTheme().main;
    }
    return isNext() ? getTheme().main : getTheme().subAlt;
  };

  const baseKeyColor = () => {
    if (isFading()) {
      return getTheme().bg;
    }
    return isNext() ? getTheme().bg : getTheme().sub;
  };

  const animKeyBgColor = createMemo(() => {
    if (isFading()) {
      return [getTheme().main, getTheme().subAlt];
    }
    if (flashInfo().tick === 0) {
      return [isNext() ? getTheme().main : getTheme().subAlt];
    }
    return [
      flashInfo().correct ? getTheme().main : getTheme().error,
      isNext() ? getTheme().main : getTheme().subAlt,
    ];
  });

  const animKeyColor = createMemo(() => {
    if (isFading()) {
      return [getTheme().bg, getTheme().sub];
    }
    if (flashInfo().tick === 0) {
      return [isNext() ? getTheme().bg : getTheme().sub];
    }
    return [getTheme().bg, isNext() ? getTheme().bg : getTheme().sub];
  });

  const animDuration = createMemo(() => {
    if (isFading()) return fadeDuration;
    if (flashInfo().tick === 0) return 0;
    return fadeDuration;
  });

  return (
    <Anime
      class={cn(
        "relative flex justify-center rounded border-2 border-bg bg-sub-alt",
        (props.label ?? "").length >= 2 && "text-em-xs",
        {
          "items-center": props.align !== "top",
          "items-start pt-1.5": props.align === "top",
        },
      )}
      style={{
        "--keybgcolor": baseKeyBgColor(),
        "--keycolor": baseKeyColor(),
        height: `${(props.height ?? 1) * 2}rem`,
        width: `${(props.width ?? 1) * 2}rem`,
        "margin-left": `${(props.x ?? 0) * 2}rem`,
        "margin-top": `${(props.y ?? 0) * 2}rem`,
        transform:
          props.rotation !== undefined ? `rotate(${props.rotation}deg)` : "",
        "background-color": "var(--keybgcolor)",
        color: "var(--keycolor)",
      }}
      animation={{
        "--keybgcolor": animKeyBgColor(),
        "--keycolor": animKeyColor(),
        duration: animDuration(),
        onComplete: () => {
          props.legends.forEach((l) => setKeymapFlashState(l, undefined));
          if (isFading()) {
            setIsFading(false);
          }
        },
      }}
    >
      <Show
        when={props.isLayoutIndicator}
        fallback={
          <>
            {props.label}
            <Show when={props.isHoming}>
              <div
                class={cn(
                  "bg-em-xs absolute bottom-0.75 left-auto h-0.5 w-2 rounded bg-bg",
                )}
              ></div>
            </Show>
          </>
        }
      >
        <Button
          variant="text"
          class="text-[0.5em] [--themable-button-bg:transparent] [--themable-button-text:var(--keycolor)]"
          text={getKeymapLayout().layoutNameDisplayString}
          onClick={() => showCommandLineForConfig("keymapLayout")}
          tabIndex={-1}
        />
      </Show>
    </Anime>
  );
}
