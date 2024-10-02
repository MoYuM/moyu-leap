import * as vsc from "vscode";
import * as CONFIG from "./constant";

const validateRange = vsc.window.activeTextEditor?.document.validateRange;
const getText = vsc.window.activeTextEditor?.document.getText;

type Finder = {
  findLetterPositionInline: (
    letter: string,
    lineCount: number
  ) => vsc.Position[] | [];
  findLetterBetweenLines: (
    letter: string,
    startLine: number,
    endLine: number
  ) => vsc.Position[] | [];
  generateTargets: (count: number) => string[];
};

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

const finder: Finder = {
  findLetterPositionInline: (letter, lineCount) => {
    const line = vsc.window.activeTextEditor?.document.lineAt(lineCount);

    if (line?.isEmptyOrWhitespace) {
      return [];
    }
    if (!line) {
      return [];
    }

    const positions: vsc.Position[] = [];
    const reg = new RegExp(letter, "g");
    const regResult = line?.text.matchAll(reg) || [];

    for (const i of regResult) {
      if (i.index !== undefined) {
        positions.push(new vsc.Position(line.lineNumber, i.index));
      }
    }

    return positions;
  },

  findLetterBetweenLines: (letter, startLine, endLine) => {
    let positions: vsc.Position[] = [];

    for (let i = startLine; i < endLine; i++) {
      positions = positions.concat(finder.findLetterPositionInline(letter, i));
    }

    return positions;
  },

  generateTargets: (count: number) => {
    function mixin(keys: string[], entrys: string[]) {
      const reuslt: string[] = [];
      keys.forEach((i) => {
        entrys.forEach((j) => {
          reuslt.push(j + i);
        });
      });
      return reuslt;
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
     * 3. entrys of each level must not exist in its pervious level's keys
     */
    function addNextLevel(list: string[]) {
      const keys = [...list];
      const currentLevel = keys[keys.length - 1].length;
      if (currentLevel === 1) {
        const entrys = keys.splice(
          keys.length - 1 - CONFIG.PICKENTRYSCOUNT,
          CONFIG.PICKENTRYSCOUNT
        );
        const nextLevel = mixin(keys, entrys);
        return keys.concat(nextLevel);
      } else {
        const currentLevelKeys = keys.filter((i) => i.length === currentLevel);
        const lastEntrys = Array.from(
          new Set(currentLevelKeys.map((i) => i.slice(0, i.length - 1)))
        );
        const lastKeys = Array.from(
          new Set(currentLevelKeys.map((i) => i[i.length - 1]))
        );
        const currentEntrys = lastKeys.splice(
          lastKeys.length - 1 - CONFIG.PICKENTRYSCOUNT,
          CONFIG.PICKENTRYSCOUNT
        );
        const entrys = mixin(currentEntrys, lastEntrys);
        const nextLevel = mixin(lastKeys, entrys);
        const newKeys = keys.filter((i) => {
          if (i.length === currentLevel) {
            return !currentEntrys.includes(i[i.length - 1]);
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
  },
};

export default finder;
