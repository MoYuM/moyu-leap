import * as vsc from "vscode";
import * as CONFIG from "./constant";

const validateRange = vsc.window.activeTextEditor?.document.validateRange;
const getText = vsc.window.activeTextEditor?.document.getText;

/**
 * Find the position of the text in the range
 * @param text string
 * @param range Range
 * @returns Position[]
 */
export const findInRange = (text: string, range?: vsc.Range) => {
  if (!text || !range || !validateRange?.(range)) {
    return [];
  }

  const reg = new RegExp(text, "g");
  const textInRang = getText?.(range);
  const positions: vsc.Position[] = [];

  textInRang?.split("\n").forEach((line, lineIndex) => {
    const result = line?.matchAll(reg) || [];

    for (const i of result) {
      if (i.index !== undefined) {
        positions.push(
          range.start.translate(lineIndex).with({ character: i.index })
        );
      }
    }
  });

  return positions;
};

export const generateTargets = (count: number) => {
  function mixin(keys: string[], entries: string[]) {
    const result: string[] = [];
    keys.forEach((i) => {
      entries.forEach((j) => {
        result.push(j + i);
      });
    });
    return result;
  }

  /**
   * level1    level2    level3
   *  _|_   _____|_____   _|_
   * |   | |           | |   |
   * a b c d d d e e e d d e e ==> entry: d e
   *       a b c a b c c c c c ==> entry: dc ec
   *           ^     ^ a b a b
   *           |_____|
   *              |
   *          need delete
   *
   * 1. we call key's length *level*
   * 2. the letters that except last one of a key called *entry*
   * 3. entries of each level must not exist in its pervious level's keys
   */
  function addNextLevel(list: string[]) {
    const keys = [...list];
    const currentLevel = keys[keys.length - 1].length;
    if (currentLevel === 1) {
      const entries = keys.splice(
        keys.length - 1 - CONFIG.PICK_ENTRIES_COUNT,
        CONFIG.PICK_ENTRIES_COUNT
      );
      const nextLevel = mixin(keys, entries);
      return keys.concat(nextLevel);
    } else {
      const currentLevelKeys = keys.filter((i) => i.length === currentLevel);
      const lastEntries = Array.from(
        new Set(currentLevelKeys.map((i) => i.slice(0, i.length - 1)))
      );
      const lastKeys = Array.from(
        new Set(currentLevelKeys.map((i) => i[i.length - 1]))
      );
      const currentEntries = lastKeys.splice(
        lastKeys.length - 1 - CONFIG.PICK_ENTRIES_COUNT,
        CONFIG.PICK_ENTRIES_COUNT
      );
      const entries = mixin(currentEntries, lastEntries);
      const nextLevel = mixin(lastKeys, entries);
      const newKeys = keys.filter((i) => {
        if (i.length === currentLevel) {
          return !currentEntries.includes(i[i.length - 1]);
        } else {
          return true;
        }
      });
      return newKeys.concat(nextLevel);
    }
  }

  let list: string[] = CONFIG.KEYS;
  while (list.length < count) {
    list = addNextLevel(list);
  }
  return Array.from(new Set(list.slice(0, count)));
};
