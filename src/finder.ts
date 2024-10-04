import * as vsc from "vscode";

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
        if (lineIndex === 0) {
          // First line
          // just relative to the cursor position
          positions.push(range.start.translate({ characterDelta: i.index }));
        } else {
          // Other lines
          // The line number is relative to the cursor
          // The character number is absolute
          positions.push(
            range.start.translate(lineIndex).with({ character: i.index })
          );
        }
      }
    }
  });

  return positions;
};
