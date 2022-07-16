import * as vscode from 'vscode';
import * as CONFIG from './constant';
import Finder from './finderInline';
import { Target, Word } from './interface';
import Input from './decoration/input';

class Search {
  private textDoc?: vscode.TextDocument;

  constructor() {
    this.textDoc = vscode.window.activeTextEditor?.document;
  }


  private createDecoration(text?: string) {
    const input = new Input();
    input.setState({ value: text });
    input.setStyle({ ['min-width']: 'auto' });
    return input.createType()[0];
  }


  private generateTargets(count: number) {

    function mixin(keys: string[], entrys: string[]) {
      const reuslt: string[] = [];
      keys.forEach(i => {
        entrys.forEach(j => {
          reuslt.push(j + i);
        })
      })
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
        const entrys = keys.splice(keys.length - 1 - CONFIG.PICKENTRYSCOUNT, CONFIG.PICKENTRYSCOUNT);
        const nextLevel = mixin(keys, entrys);
        return keys.concat(nextLevel);
      } else {
        const currentLevelKeys = keys.filter(i => i.length === currentLevel);
        const lastEntrys = Array.from(new Set(currentLevelKeys.map(i => i.slice(0, i.length - 1))));
        const lastKeys = Array.from(new Set(currentLevelKeys.map(i => i[i.length - 1])));
        const currentEntrys = lastKeys.splice(lastKeys.length - 1 - CONFIG.PICKENTRYSCOUNT, CONFIG.PICKENTRYSCOUNT);
        const entrys = mixin(currentEntrys, lastEntrys)
        const nextLevel = mixin(lastKeys, entrys);
        const newKeys = keys.filter(i => {
          if (i.length === currentLevel) {
            return !currentEntrys.includes(i[i.length - 1])
          } else {
            return true;
          }
        })
        return newKeys.concat(nextLevel);
      }
    }

    let list: string[] = CONFIG.KEYS;
    while (list.length < count) {
      list = addNextLevel(list);
    }
    return Array.from(new Set(list));
  }

  /**
   * 找出页面中所有的单词及其位置
   */
  public findAllWordsInDoc() {
    const cursor = vscode.window.activeTextEditor?.selection.active.line || 0;
    const finder = new Finder();
    let docWordList: Word[] = [];

    // 行数要在本文档的行数之内
    const line = [
      Math.max(cursor - CONFIG.PARSE_LINE_COUNT, 0),
      Math.min(cursor + CONFIG.PARSE_LINE_COUNT, this.textDoc?.lineCount!),
    ];

    for (let i = line[0]; i < line[1]; i++) {
      const wordList = finder.getWordListAtLine(i);
      docWordList = docWordList.concat(wordList);
    }

    return docWordList;
  }

  public wordToTarget(wordList: Word[]): Target[] {
    const keysList = this.generateTargets(wordList.length);
    return wordList.map((i, index) => {
      const decoration = this.createDecoration(keysList[index])
      return {
        ...i,
        decoration,
        dispose: decoration.dispose,
        key: keysList[index],
      }
    })
  }

  public findAllTargets() {
    const allWords = this.findAllWordsInDoc();
    return this.wordToTarget(allWords);
  }


  public showTargets(targets: Target[]) {
    targets.forEach(target => {
      vscode.window.activeTextEditor?.setDecorations(
        target.decoration,
        [target.range],
      )
    })
  }

  public disposeTargets(targets: Target[]) {
    targets?.forEach(target => {
      target.dispose();
    })
  }

}

export default Search;