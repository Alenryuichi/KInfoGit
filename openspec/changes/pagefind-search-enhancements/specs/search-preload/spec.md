## ADDED Requirements

### Requirement: Hover preload Pagefind
系统 SHALL 在用户 hover 或 focus 搜索按钮时开始加载 Pagefind WASM 和索引，而非等到 modal 打开后。

#### Scenario: Mouse hover triggers preload
- **WHEN** 用户鼠标移入搜索按钮
- **THEN** Pagefind JS 和 WASM 开始后台加载

#### Scenario: Keyboard focus triggers preload
- **WHEN** 搜索按钮获得键盘焦点
- **THEN** Pagefind JS 和 WASM 开始后台加载

#### Scenario: Search after preload is instant
- **WHEN** 用户 hover 后打开搜索 modal 输入查询
- **THEN** 首次搜索无加载延迟，结果即时返回

#### Scenario: Preload only once
- **WHEN** 用户多次 hover 搜索按钮
- **THEN** Pagefind 只加载一次，后续 hover 无重复请求
