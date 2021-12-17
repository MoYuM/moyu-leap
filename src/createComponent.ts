import * as vscode from 'vscode';
import { lastPathTo } from './utils';

const getComponentTemplate = (name: string) =>
  `import React from 'react';
    
const ${name}: React.FC = () => {
  return (
    <></>
  )
}

export default ${name};`

type CreateComponent = (
  currentUri: vscode.Uri,
  componentName?: string,
  type?: 'globalComponent' | 'currentPageComponent' | 'page'
) => Promise<void>

const createComponent: CreateComponent = async (
  currentUri,
  componentName = 'MyComponent',
  type,
) => {
  const rootPath = vscode.workspace.workspaceFolders?.[0].uri
  let newComponentsFolderPath

  if (type === 'currentPageComponent') {
    newComponentsFolderPath = lastPathTo(currentUri, 'components');
  } else if (type === 'globalComponent') {
    newComponentsFolderPath = vscode.Uri.joinPath(rootPath as vscode.Uri, '/src/components');
  } else {
    newComponentsFolderPath = vscode.Uri.joinPath(rootPath as vscode.Uri, '/src/pages');
  }

  await vscode.workspace.fs.createDirectory(newComponentsFolderPath);

  const newComponentPath = vscode.Uri.joinPath(newComponentsFolderPath, `/${componentName}`);
  await vscode.workspace.fs.createDirectory(newComponentPath);

  const newIndexPath = vscode.Uri.joinPath(newComponentPath, '/index.tsx');
  const edit = new vscode.WorkspaceEdit()
  edit.createFile(newIndexPath);

  const template = getComponentTemplate(componentName);
  edit.insert(newIndexPath, new vscode.Position(0, 0), template)
  await vscode.workspace.applyEdit(edit);

  await vscode.window.showTextDocument(newIndexPath, { preview: false })

}

export default createComponent