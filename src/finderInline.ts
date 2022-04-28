import * as vscode from 'vscode';

type Word = {
  word: string,
  start: number,
  end: number,
}

export default class Finder {
  private cursorPosition?: vscode.Position;
  private textDoc?: vscode.TextDocument;
  private editor?: vscode.TextEditor;

  constructor() {
    this.cursorPosition = vscode.window.activeTextEditor?.selection.active;
    this.textDoc = vscode.window.activeTextEditor?.document;
    this.editor = vscode.window.activeTextEditor;
  }

  public selectRange(range?: vscode.Range) {
    if (range && this.editor) {
      const selection = new vscode.Selection(range.start, range.end);
      this.editor.selection = selection;
    }
  }

  private parseLine(line?: vscode.TextLine) {
    if (!line || line.isEmptyOrWhitespace) return []

    const str = line.text;
    const wordList: Array<Word> = [];
    const reg = /\W/g;
    let lastChaIndex = 0;

    [...str.matchAll(reg)].forEach((cha, index) => {

      // 第一个就是 \W 的情况
      if (index === 0 && cha.index === 0) {
        lastChaIndex = cha.index;
        return;
      }

      // 第一个就是单词的情况
      if (index === 0 && cha.index !== 0) {
        wordList.push({
          word: str.slice(0, cha.index),
          start: 0,
          end: cha.index as number,
        })
        lastChaIndex = cha.index as number;
        return;
      }

      // 除了第一个以外的情况
      if ((lastChaIndex + 1) !== cha.index) {
        wordList.push({
          word: str.slice(lastChaIndex + 1, cha.index),
          start: lastChaIndex + 1,
          end: cha.index as number,
        })
        lastChaIndex = cha.index as number;
        return;
      }

      lastChaIndex = cha.index as number;
    })

    return wordList;
  }

  private getWordList(sortBy: 'nearest' | 'normal' = 'normal') {
    if (!this.cursorPosition) return;

    const wordList = this.parseLine(this.textDoc?.lineAt(this.cursorPosition.line));
    const cur = this.cursorPosition.character || 0; // 这里可以给 0 作为默认值么？

    function cursorIsInWord(word: Word) {
      return word.start <= cur && word.end >= cur;
    }

    if (sortBy === 'normal') {
      return wordList;
    } else {
      return wordList.sort((a, b) => {
        // 先看有没有在单词内部的情况
        if (cursorIsInWord(a) || cursorIsInWord(b)) {
          return Number(cursorIsInWord(b)) - Number(cursorIsInWord(a))
        } else {
          // 没有的话，按最近的排序
          return Math.min(Math.abs(a.start - cur), Math.abs(a.end - cur)) - Math.min(Math.abs(b.start - cur), Math.abs(b.end - cur))
        }
      })
    }
  }


  private select(range?: vscode.Range) {
    if (range && this.editor) {
      const selection = new vscode.Selection(range.start, range.end);
      this.editor.selection = selection
    }
  }

  private getRange(word?: Word) {
    if (!this.cursorPosition) return
    if (word) {
      return new vscode.Range(
        new vscode.Position(this.cursorPosition.line, word.start),
        new vscode.Position(this.cursorPosition.line, word.end)
      );
    }
  }

  /**
   * 选择最近的一个单词
   */
  public selectNearestWord() {
    const wordListSort = this.getWordList('nearest');
    const mostCloseWord = wordListSort?.[0];
    const wordRange = this.getRange(mostCloseWord);
    this.select(wordRange);
  }

  /**
   * 选择下一个单词
   */
  public selectNextWord() {
    const wordList = this.getWordList();
    const nextWord = wordList?.find(w => w.start >= (this.cursorPosition?.character || 0));
    const wordRange = this.getRange(nextWord);
    this.select(wordRange);
  }

  /**
   * 选择上一个单词
   */
  public selectPrevWord() {
    const wordList = this.getWordList();
    const prevWord = wordList?.reverse()?.find(w => w.end < (this.cursorPosition?.character || 0));
    const wordRange = this.getRange(prevWord);
    this.select(wordRange);
  }
}
