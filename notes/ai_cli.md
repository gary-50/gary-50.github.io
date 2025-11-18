# AI CLI 工具使用指南

## Claude Code

1. 安装
2. 配置 cc switch
3. 配置 claude skills（利用 plugins 安装商店）
   /plugin marketplace add anthropics/skills
   然后在这个marketplace里面下载相应的东西
4. 可以在 vscode 中使用

---

## Codex

### 1. 安装

### 2. 配置

配置 cc switch，方便切换（如果是账号登录，单独配置 auth.json）

### 3. 常见问题

#### 问题 1: 命令包裹问题

这其实是两者共性的问题，你可以看到一堆命令是用 `pwsh -nologo` 这种方式转义执行的，效率非常低，这也是 codex 执行慢的一部分原因。

**解决方案：** 通过 `AGENTS.md` 中强制让其直接执行命令，把这行加到 `AGENTS.md` 可以解决这个问题：

```text
Hard Requirement: call binaries directly in functions.shell, always set workdir, and avoid shell wrappers such as `bash -lc`, `sh -lc`, `zsh -lc`, `cmd /c`, `pwsh.exe -NoLogo -NoProfile -Command`, and `powershell.exe -NoLogo -NoProfile -Command`.
```

#### 问题2：使用 Python 编辑文件的问题

这是 codex 模型的特有问题，有大佬分析出来，codex 模型不会调用系统工具 `apply_patch`。

**解决方案：** 把下面这段放到 `AGENTS.md` 中可以使用系统的编辑工具：

````text
- Text Editing Priority: Use the `apply_patch` tool for all routine text edits; fall back to `sed` for single-line substitutions only if `apply_patch` is unavailable, and avoid `python` editing scripts unless both options fail.
- `apply_patch` Usage: Invoke `apply_patch` with the patch payload as the second element in the command array (no shell-style flags). Provide `workdir` and, when helpful, a short `justification` alongside the command.

- Example invocation:

```bash
{"command":["apply_patch","*** Begin Patch\n*** Update File: path/to/file\n@@\n- old\n+ new\n*** End Patch\n"],"workdir":"<workdir>","justification":"Brief reason for the change"}
```

````

#### 问题3 : 终端的中文乱码

**方案一（最简单）**

添加提示词：

```text
**对话开始前，判断当前系统环境，如果是 `windows` 系统，则先执行如下指令，再进行其他操作：**

[Console]::InputEncoding  = [Text.UTF8Encoding]::new($false)
[Console]::OutputEncoding = [Text.UTF8Encoding]::new($false)
chcp 65001 > $null
```

**方案二**

直接使用 Git Bash

**在 Git Bash 中使用 Codex 的注意事项：**

Git Bash 使用的是 mintty 终端模拟器，运行 Windows 控制台程序（如 node/codex）时会有输入问题，需要使用 `winpty` 作为中间层。

**如果直接安装了 codex：**

```bash
# 找到 codex.cmd 的实际路径
which codex

# 使用 winpty 运行（假设安装在 nodejs 目录下）
winpty "/c/Program Files/nodejs/codex.cmd"

# 或者设置 alias 简化使用
echo "alias codex='winpty \"/c/Program Files/nodejs/codex.cmd\"'" >> ~/.bashrc
source ~/.bashrc
```

**如果使用 npx 运行：**

如果平时在 PowerShell 里使用：

```bash
npx openai-codex
```

那在 Git Bash 里需要这样：

```bash
winpty npx openai-codex
```

设置 alias 简化使用：

```bash
echo "alias codex='winpty npx openai-codex'" >> ~/.bashrc
source ~/.bashrc
```

---

#### 问题 4: Codex 在终端/插件需要一直手动确认

**在终端：**
在 `/approve` 选择 `full access`

#### 问题 5: Codex 在vscode中显示乱码

建议在vscode中命令行中使用

---

## 总体评价

**Claude Code**
- 速度比 codex 快很多
- 拥有丰富的 skills
- 可以接入 Kimi、Minimax、GLM 等

**Codex**
- 速度较慢（尤其是在 Windows 环境下，更推荐在 WSL2 环境下使用）
- 智商高，理解能力强，改bug能力更强