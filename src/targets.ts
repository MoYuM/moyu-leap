import { Target } from "./interface";
import { KEYS, PICK_ENTRIES_COUNT } from "./constant";
import { Position } from "vscode";

export class TargetsController {
  private targets: Target[] = [];
  private index: number = 0;
  private searchText: string = "";

  constructor() {}

  generate(positions: Position[]) {
    this.targets = this.generateTargets(positions.length).map((i, index) => ({
      value: i,
      position: positions[index],
    }));
  }

  move(num: number) {
    const newIndex = (this.index + num) % this.targets.length;
    if (newIndex === 0 && num < 0) {
      this.index = this.targets.length - 1;
    } else {
      this.index = newIndex;
    }
  }

  /**
   * Return the targets that used to display in the label
   */
  getLabelTargets() {
    return this.targets.slice(this.index + 1, this.targets.length);
  }

  cursorPosition() {
    return this.targets[this.index].position;
  }

  getIndex() {
    return this.index;
  }

  getTargets() {
    return this.targets;
  }

  search(text: string) {
    this.searchText += text;
    return this.getLabelTargets().filter(
      (i) => i.value.slice(0, this.searchText.length) === this.searchText
    );
  }

  clear() {
    console.log("clear targets");
    this.targets = [];
    this.index = 0;
    this.searchText = "";
  }

  generateTargets = (count: number) => {
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
          keys.length - 1 - PICK_ENTRIES_COUNT,
          PICK_ENTRIES_COUNT
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
          lastKeys.length - 1 - PICK_ENTRIES_COUNT,
          PICK_ENTRIES_COUNT
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

    let list: string[] = KEYS;
    while (list.length < count) {
      list = addNextLevel(list);
    }
    return Array.from(new Set(list.slice(0, count)));
  };
}
