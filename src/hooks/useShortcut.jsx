import {
  useCallback,
  useRef,
  useLayoutEffect,
  useEffect,
  useState,
} from "react";

export const useShortcut = (
  shortcuts = {},
  options = { disableTextInputs: true }
) => {
  const shortcutsRef = useRef(shortcuts);
  const [keyCombo, setKeyCombo] = useState([]);

  useLayoutEffect(() => {
    shortcutsRef.current = shortcuts;
  }, [shortcuts]);

  const handleKeyDown = useCallback(
    (event) => {
      const isTextInput =
        event.target instanceof HTMLTextAreaElement ||
        (event.target instanceof HTMLInputElement &&
          (!event.target.type || event.target.type === "text")) ||
        event.target.isContentEditable;

      if (event.repeat) return;

      if (options.disableTextInputs && isTextInput) {
        return event.stopPropagation();
      }

      const modifierMap = {
        Control: event.ctrlKey,
        Alt: event.altKey,
        Command: event.metaKey,
        Shift: event.shiftKey,
      };

      for (const [shortcut, callback] of Object.entries(shortcutsRef.current)) {
        const keyArray = shortcut.split("+");

        const finalKey = keyArray[keyArray.length - 1].toLowerCase();
        const isModifierCombo = Object.keys(modifierMap).includes(keyArray[0]);

        const pressedKey = event?.key?.toLowerCase();

        if (isModifierCombo) {
          const modifiers = keyArray.slice(0, -1);
          if (modifiers.every((mod) => modifierMap[mod]) && finalKey === pressedKey) {
            callback(event);
            return;
          }
        } else {
          if (keyArray[keyCombo.length] === event.key) {
            if (
              keyArray[keyArray.length - 1] === event.key &&
              keyCombo.length === keyArray.length - 1
            ) {
              callback(event);
              return setKeyCombo([]);
            }
            return setKeyCombo((prev) => [...prev, event.key]);
          }
          if (keyCombo.length > 0) {
            return setKeyCombo([]);
          }
        }

        // Handle single key
        if (shortcut.toLowerCase() === event.key.toLowerCase()) {
          callback(event);
          return;
        }
      }
    },
    [keyCombo.length]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
};
