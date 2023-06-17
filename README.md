
### 改用 neovim 了，不再维护
我的 neovim 配置：https://github.com/MoYuM/nvim

# Moyu-Template

以 vscode 插件的形式提供更多快捷指令，尽量减少使用鼠标的次数。

## 使用方法

moyu-template 提供了以下的几个 Commands 和 Keybindings。对于 Commands 可以使用 `shift+cmd+p` 唤起 vscode 控制谈，输入对应命令就可以了。对于 Keybindings 建议在键盘快捷方式中搜索 `moyu` 就能找到所有命令了，然后根据自己喜好更改即可。


## Keybindings

| 命令                      | 功能                                   | 默认按键              |
| ------------------------- | -------------------------------------- | --------------------- |
| moyu.move up              | 向上移动光标 5 行                      | `alt` + `k`           |
| moyu.move down            | 向下移动光标 5 行                      | `alt` + `j`           |
| moyu.select neareast word | 在当前行中，选中距离光标最近的一个单词 | `cmd` + `e` |
| moyu.search mode          | 开启 [search mode](#search-mode)       | `cmd` + `m` |
| moyu.snippet mode         | 开启 [snippet](#snippet-mode)          | `cmd` + `k`           |

### Search Mode

灵感来自 [vim-easymotion](https://github.com/easymotion/vim-easymotion)，可快速定位光标到任意位置
![search-mode.gif](https://s2.loli.net/2022/07/24/v4ct5pBdTw2Dyeq.gif)

### Snippet Mode

将光标移动到你想生成代码片段的单词上，然后按 `cmd+k`（默认），开启 snippet mode。然后输入模板名称，比如 `log`，按回车确定，就能生成一个代码片段了。
![snippet-mode.gif](https://s2.loli.net/2022/07/24/WlpHguaiIBqXLtK.gif)

### TODO

- [x] log
- [x] 快速移动光标
- [x] snippet mode 支持自动填充
- [ ] 所有功能配置化
