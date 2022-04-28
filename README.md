# Moyu-Template

对工作中常用功能，使用 vscode 插件的方式快速实现

## 功能

### 1. 新建文件/文件夹

使用 vscode 控制台 `shift+cmd+P`，输入对应命令

| 命令                    | 功能                                                      |
| ----------------------- | --------------------------------------------------------- |
| new component           | 在当前目录下新建`./components/${componentName}/index.tsx` |
| new component in global | 新建`@/components/#{componentName}/index.tsx`             |
| new page                | 新建`@/pages/${pagename}/index.tsx`                       |
| new file                | 新建一个文件在当前文件夹                                  |

### 2. 选中单词

| 命令                      | 功能                                   | 默认按键  |
| ------------------------- | -------------------------------------- | --------- |
| moyu.select neareast word | 在当前行中，选中距离光标最近的一个单词 | `cmd`+`/` |
| moyu.select next word     | 在当前行中，选中下一个单词             | `cmd`+`.` |
| moyu.select pervious word | 在当前行中，选中上一个单词             | `cmd`+`,` |
