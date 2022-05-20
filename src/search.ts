import * as vscode from 'vscode';
import Finder from './finderInline';
import { Target, Word, KeyTree } from './interface';
import * as CONFIG from './constant';

class Search {
  private textDoc?: vscode.TextDocument;

  constructor() {
    this.textDoc = vscode.window.activeTextEditor?.document;
  }

  private objectToCssString(settings: any): string {
    let value = '';
    const cssString = Object.keys(settings).map(setting => {
      value = settings[setting];
      if (typeof value === 'string' || typeof value === 'number') {
        return `${setting}: ${value};`
      }
    }).join(' ');

    return cssString;
  }

  private createDecoration(text?: string) {
    const defaultCss = {
      position: 'absolute',
      top: 0,
      height: '20px',
      display: `inline-block`,
      padding: '0 4px',
      color: CONFIG.COLOR,
      ['background-color']: CONFIG.BACKGROUNDCOLOR,
      ['border-radius']: '2px',
      ['line-height']: '20px',
      ['z-index']: 1,
      ['pointer-events']: 'none',
    };

    const css = this.objectToCssString(defaultCss);

    return vscode.window.createTextEditorDecorationType({
      before: {
        contentText: text,
        textDecoration: `none; ${css}`
      },
    })
  }

  private generateTargets(count: number) {
    let canNotShow = [];

    function mixin(list: string[]) {
      const result: string[] = [];
      list.forEach(i => {
        list.forEach(j => {
          result.push(i + j);
          result.push(j + i);
        })
      })
      return Array.from(new Set(result));
    }


    function nextLevel(list: string[]) {
      let _list = [...list];
      let entrys: string[] = [];
      const nextLevel: string[] = [];
      const level = _list[_list.length - 1].length;
      const canNotShow = _list.filter(i => i.length === level);
      console.log('%ccanNotShow', 'background-color: darkorange', canNotShow);
      if (canNotShow.length === _list.length) {
        entrys = _list.splice(0, 3);
      } else {
        const thisLevelKeys = canNotShow.map(i => i[level - 1]);

        entrys = mixin(_list).filter(i => !canNotShow.includes(i));
      }

      entrys.forEach(i => {
        CONFIG.KEYS.forEach(j => {
          nextLevel.push(i + j);
        })
      })

      return _list.concat(nextLevel);
    }

    let list: string[] = CONFIG.KEYS;
    while (list.length < count) {
      list = nextLevel(list);
    }
    return Array.from(new Set(list));
  }

  /**
   * 找出页面中所有的单词及其位置
   */
  public findAllWordsInDoc() {
    const finder = new Finder();
    let docWordList: Word[] = [];
    for (let i = 0; i < (this.textDoc?.lineCount || 0); i++) {
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