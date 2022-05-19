import * as vscode from 'vscode';
import Finder from './finderInline';
import { Word } from './interface';
import * as CONFIG from './constant';

class Search {
  private cursorPosition?: vscode.Position;
  private textDoc?: vscode.TextDocument;

  constructor() {
    this.cursorPosition = vscode.window.activeTextEditor?.selection.active;
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
    const needKeys = Math.sqrt(count)
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


  public showStatusBar() {
    if (!this.cursorPosition) return;
    const allWords = this.findAllWordsInDoc();

    vscode.window.activeTextEditor?.setDecorations(
      this.createDecoration('a'),
      allWords.map(i => i.range),
    )
  }

  public updateStatusBar(text: string) {
    this.createDecoration(text);
  }


  public doSearch() {

  }


}

export default Search;