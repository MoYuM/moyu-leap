import * as vscode from 'vscode';

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
      top: '-24px',
      height: '20px',
      display: `inline-block`,
      padding: '0 4px',
      ['border-radius']: '2px',
      ['line-height']: '20px',
      ['background-color']: 'red',
      ['min-width']: '40px',
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

  public showStatusBar() {
    if (!this.cursorPosition) return;

    vscode.window.activeTextEditor?.setDecorations(
      this.createDecoration(),
      [
        new vscode.Range(
          this.cursorPosition,
          this.cursorPosition,
        )
      ]
    )
  }

  public updateStatusBar(text: string) {
    this.createDecoration(text);
  }


  public doSearch() {

  }


}

export default Search;