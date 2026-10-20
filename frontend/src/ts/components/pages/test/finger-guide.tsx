import { For } from "solid-js";

import { cn } from "../../../utils/cn";

export type Finger = "pinky" | "ring" | "middle" | "index" | "thumb";
export type HandSide = "left" | "right";
export type FingerInfo = { finger: Finger; hand: HandSide | "both" };

export function getFingerInfo(key: string): FingerInfo | undefined {
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

export function HandGuide(props: {
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
