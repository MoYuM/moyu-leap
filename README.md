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

使用快捷键`cmd+,`选中单词

选中光标所在位置的单词，如果没有，则选中光标左边最近的一个单词

> 注意：这会替换掉 `cmd+,` 原本的功能，即打开 vscode 的设置面板

## TODO

- 解析出一段文本中的 key value 的值（为了更快速的复制接口文档）
- 根据解析出的 key 和 value ，自动生成 interface
- 选中单词在 window 下无效
- 选中单词的功能，可以参考 smart click 做拓展
