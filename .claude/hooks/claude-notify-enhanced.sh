#!/bin/bash

# Claude Code 增强通知脚本
# 支持多种通知方式：macOS 原生通知、终端铃声、语音播报、弹窗、音效

# 配置
LOG_FILE="$HOME/.claude-activity.log"
PROJECT_NAME="Betaline"
ENABLE_SOUND=true
ENABLE_VOICE=false
ENABLE_POPUP=true
ENABLE_TERMINAL_BELL=true
ENABLE_SYSTEM_NOTIFICATION=true

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 获取当前时间
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# JSON 解析功能
parse_json_input() {
    if command -v jq &> /dev/null; then
        # 读取 stdin 的 JSON 数据
        if [ -t 0 ]; then
            # 没有 stdin 输入，使用空 JSON
            echo "{}"
        else
            # 从 stdin 读取 JSON 数据
            cat
        fi
    else
        # 没有 jq，返回空 JSON
        echo "{}"
    fi
}

# 解析 Hook Input JSON
HOOK_JSON=$(parse_json_input)
if command -v jq &> /dev/null && [ "$HOOK_JSON" != "{}" ]; then
    # 从 JSON 中提取基本信息
    SESSION_ID=$(echo "$HOOK_JSON" | jq -r '.session_id // ""')
    TRANSCRIPT_PATH=$(echo "$HOOK_JSON" | jq -r '.transcript_path // ""')
    HOOK_CWD=$(echo "$HOOK_JSON" | jq -r '.cwd // ""')
    HOOK_EVENT_NAME=$(echo "$HOOK_JSON" | jq -r '.hook_event_name // ""')
    
    # 从 JSON 中提取工具相关信息
    JSON_TOOL_NAME=$(echo "$HOOK_JSON" | jq -r '.tool_name // ""')
    JSON_MESSAGE=$(echo "$HOOK_JSON" | jq -r '.message // ""')
    JSON_PROMPT=$(echo "$HOOK_JSON" | jq -r '.prompt // ""')
    TOOL_SUCCESS=$(echo "$HOOK_JSON" | jq -r '.tool_response.success // ""')
    STOP_HOOK_ACTIVE=$(echo "$HOOK_JSON" | jq -r '.stop_hook_active // ""')
    
    # 记录 JSON 输入到日志
    echo "[$TIMESTAMP] Hook JSON Input: $HOOK_JSON" >> "$LOG_FILE"
else
    # 回退到空值
    SESSION_ID=""
    TRANSCRIPT_PATH=""
    HOOK_CWD=""
    HOOK_EVENT_NAME=""
    JSON_TOOL_NAME=""
    JSON_MESSAGE=""
    JSON_PROMPT=""
    TOOL_SUCCESS=""
    STOP_HOOK_ACTIVE=""
fi

# 音效函数
play_sound() {
    local sound_type="$1"
    if [ "$ENABLE_SOUND" = true ]; then
        case "$sound_type" in
            "user-prompt")
                # 播放系统音效
                afplay /System/Library/Sounds/Glass.aiff &
                ;;
            "tool-use")
                afplay /System/Library/Sounds/Pop.aiff &
                ;;
            "session-start")
                afplay /System/Library/Sounds/Hero.aiff &
                ;;
            "session-end")
                afplay /System/Library/Sounds/Submarine.aiff &
                ;;
            *)
                afplay /System/Library/Sounds/Ping.aiff &
                ;;
        esac
    fi
}

# 终端铃声函数
terminal_bell() {
    if [ "$ENABLE_TERMINAL_BELL" = true ]; then
        printf '\a'  # 终端铃声
    fi
}

# 语音播报函数
speak_message() {
    local message="$1"
    if [ "$ENABLE_VOICE" = true ]; then
        say "$message" &
    fi
}

# 弹窗通知函数
show_popup() {
    local title="$1"
    local message="$2"
    if [ "$ENABLE_POPUP" = true ]; then
        osascript -e "display dialog \"$message\" with title \"$title\" buttons {\"确定\"} default button 1 with icon note" &
    fi
}

# macOS 系统通知函数
show_system_notification() {
    local title="$1"
    local message="$2"
    local sound="$3"
    if [ "$ENABLE_SYSTEM_NOTIFICATION" = true ]; then
        if command -v terminal-notifier &> /dev/null; then
            terminal-notifier -title "$title" -message "$message" -sound "$sound" 2>/dev/null
        else
            echo -e "${YELLOW}💡 提示: 安装 terminal-notifier 获得系统通知${NC}"
            echo -e "${YELLOW}   命令: brew install terminal-notifier${NC}"
        fi
    fi
}

# 智能获取 Hook 事件名称（优先使用 JSON，回退到命令行参数）
EFFECTIVE_HOOK_EVENT="${HOOK_EVENT_NAME:-$1}"

# 根据 hook 类型处理不同通知
case "$EFFECTIVE_HOOK_EVENT" in
    "notification"|"Notification")
        TITLE="🔔 Claude Code - 通知"
        if [ -n "$JSON_MESSAGE" ]; then
            MESSAGE="通知: $JSON_MESSAGE"
        else
            MESSAGE="Claude 发送了通知 (等待用户输入)"
        fi
        if [ -n "$SESSION_ID" ]; then
            MESSAGE="$MESSAGE [会话: ${SESSION_ID:0:8}...]"
        fi
        SOUND="Glass"
        VOICE_MESSAGE="Claude 正在等待用户输入"
        ;;
    "pre-tool-use"|"PreToolUse")
        # 优先使用 JSON 中的 tool_name，回退到命令行参数
        TOOL_NAME="${JSON_TOOL_NAME:-${2:-未知工具}}"
        TITLE="⚡ Claude Code - 工具准备"
        MESSAGE="准备使用工具: $TOOL_NAME"
        if [ -n "$HOOK_CWD" ]; then
            MESSAGE="$MESSAGE [目录: $(basename "$HOOK_CWD")]"
        fi
        SOUND="Tink"
        VOICE_MESSAGE="准备使用工具 $TOOL_NAME"
        ;;
    "post-tool-use"|"PostToolUse")
        # 优先使用 JSON 中的 tool_name，回退到命令行参数
        TOOL_NAME="${JSON_TOOL_NAME:-${2:-未知工具}}"
        TITLE="✅ Claude Code - 工具完成"
        MESSAGE="工具执行完成: $TOOL_NAME"
        if [ "$TOOL_SUCCESS" = "true" ]; then
            MESSAGE="$MESSAGE ✓"
        elif [ "$TOOL_SUCCESS" = "false" ]; then
            MESSAGE="$MESSAGE ❌"
        fi
        if [ -n "$HOOK_CWD" ]; then
            MESSAGE="$MESSAGE [目录: $(basename "$HOOK_CWD")]"
        fi
        SOUND="Pop"
        VOICE_MESSAGE="工具 $TOOL_NAME 执行完成"
        ;;
    "stop"|"Stop")
        TITLE="🛑 Claude Code - 响应结束"
        MESSAGE="Claude 已完成响应"
        if [ -n "$SESSION_ID" ]; then
            MESSAGE="$MESSAGE [会话: ${SESSION_ID:0:8}...]"
        fi
        SOUND="Submarine"
        VOICE_MESSAGE="Claude 响应结束"
        ;;
    "subagent-stop"|"SubagentStop")
        TITLE="🤖 Claude Code - 子任务完成"
        MESSAGE="子代理任务已完成"
        if [ -n "$SESSION_ID" ]; then
            MESSAGE="$MESSAGE [会话: ${SESSION_ID:0:8}...]"
        fi
        SOUND="Hero"
        VOICE_MESSAGE="子代理任务完成"
        ;;
    "user-prompt"|"UserPromptSubmit")
        TITLE="🤔 Claude Code - 用户提示"
        if [ -n "$JSON_PROMPT" ] && [ ${#JSON_PROMPT} -le 50 ]; then
            MESSAGE="用户提示: $JSON_PROMPT"
        elif [ -n "$JSON_PROMPT" ]; then
            MESSAGE="用户提示: ${JSON_PROMPT:0:47}..."
        else
            MESSAGE="用户在 $PROJECT_NAME 项目中提交了新的提示"
        fi
        if [ -n "$HOOK_CWD" ]; then
            MESSAGE="$MESSAGE [目录: $(basename "$HOOK_CWD")]"
        fi
        SOUND="Glass"
        VOICE_MESSAGE="用户提交了新的提示"
        ;;
    "tool-use")
        TOOL_NAME="${2:-未知工具}"
        TITLE="🔧 Claude Code - 工具使用"
        MESSAGE="正在使用工具: $TOOL_NAME"
        if [ -n "$HOOK_CWD" ]; then
            MESSAGE="$MESSAGE [目录: $(basename "$HOOK_CWD")]"
        fi
        SOUND="Pop"
        VOICE_MESSAGE="正在使用工具 $TOOL_NAME"
        ;;
    *)
        TITLE="🤖 Claude Code"
        MESSAGE="Claude Code 活动通知"
        SOUND="Ping"
        VOICE_MESSAGE="Claude 活动通知"
        ;;
esac

# === 发送所有类型的通知 ===

# 1. 终端铃声
terminal_bell

# 2. 播放音效
play_sound "$1"

# 3. macOS 系统通知
show_system_notification "$TITLE" "$MESSAGE" "$SOUND"

# 4. 语音播报
speak_message "$VOICE_MESSAGE"

# 5. 弹窗通知（仅在重要事件时）
if [ "$1" = "session-start" ] || [ "$1" = "session-end" ]; then
    show_popup "$TITLE" "$MESSAGE"
fi

# 6. 视觉效果 - 彩色控制台输出
echo ""
echo -e "${PURPLE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║${NC} ${CYAN}🔔 CLAUDE CODE 通知${NC}                                           ${PURPLE}║${NC}"
echo -e "${PURPLE}╠════════════════════════════════════════════════════════════════╣${NC}"
echo -e "${PURPLE}║${NC} ${GREEN}时间:${NC} $TIMESTAMP                                    ${PURPLE}║${NC}"
echo -e "${PURPLE}║${NC} ${BLUE}标题:${NC} $TITLE                                            ${PURPLE}║${NC}"
echo -e "${PURPLE}║${NC} ${YELLOW}内容:${NC} $MESSAGE                                         ${PURPLE}║${NC}"
echo -e "${PURPLE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# 7. 记录到日志文件
echo "[$TIMESTAMP] $TITLE: $MESSAGE" >> "$LOG_FILE"

# 8. 显示增强的调试信息
if [[ "$EFFECTIVE_HOOK_EVENT" == *"ToolUse"* ]] || [[ "$1" == *"tool"* ]]; then
    echo -e "${YELLOW}  🔧 工具详情:${NC}"
    echo -e "${YELLOW}     Hook事件: ${EFFECTIVE_HOOK_EVENT}${NC}"
    echo -e "${YELLOW}     命令行工具参数: ${2:-未提供}${NC}"
    echo -e "${YELLOW}     JSON工具名: ${JSON_TOOL_NAME:-未提供}${NC}"
    echo -e "${YELLOW}     最终工具名: ${TOOL_NAME:-未设置}${NC}"
    if [ -n "$TOOL_SUCCESS" ]; then
        echo -e "${YELLOW}     工具执行结果: $TOOL_SUCCESS${NC}"
    fi
    echo "[$TIMESTAMP]   Enhanced Tool Debug - Event: $EFFECTIVE_HOOK_EVENT, CLI: ${2:-empty}, JSON: ${JSON_TOOL_NAME:-empty}, Final: ${TOOL_NAME:-empty}, Success: ${TOOL_SUCCESS:-unknown}" >> "$LOG_FILE"
fi

# 9. 显示会话信息
if [ -n "$SESSION_ID" ] || [ -n "$HOOK_CWD" ]; then
    echo -e "${BLUE}  📊 会话信息:${NC}"
    if [ -n "$SESSION_ID" ]; then
        echo -e "${CYAN}     会话ID: ${SESSION_ID}${NC}"
    fi
    if [ -n "$HOOK_CWD" ]; then
        echo -e "${CYAN}     工作目录: ${HOOK_CWD}${NC}"
    fi
    if [ -n "$TRANSCRIPT_PATH" ]; then
        echo -e "${CYAN}     对话记录: $(basename "$TRANSCRIPT_PATH")${NC}"
    fi
fi

# 10. 显示项目状态
if [ "$EFFECTIVE_HOOK_EVENT" = "UserPromptSubmit" ] || [ "$1" = "user-prompt" ]; then
    echo -e "${BLUE}  📊 项目状态:${NC}"
    if command -v git &> /dev/null; then
        BRANCH=$(git branch --show-current 2>/dev/null || echo "未知")
        STATUS=$(git status --porcelain 2>/dev/null | wc -l | xargs)
        echo -e "${YELLOW}     🌿 分支: $BRANCH${NC}"
        if [ "$STATUS" -gt 0 ]; then
            echo -e "${RED}     📝 未提交文件: $STATUS 个${NC}"
        else
            echo -e "${GREEN}     ✅ 工作目录干净${NC}"
        fi
    fi
    
    # 显示 submodule 状态
    if git submodule status &>/dev/null; then
        echo -e "${CYAN}     📦 Submodule 状态:${NC}"
        git submodule status | head -2 | while read line; do
            echo -e "${CYAN}       $line${NC}"
        done
    fi
fi

# 11. 额外的视觉提示
case "$EFFECTIVE_HOOK_EVENT" in
    "UserPromptSubmit"|"user-prompt")
        echo -e "${GREEN}💭 等待 Claude 响应...${NC}"
        ;;
    "PreToolUse"|"tool-use")
        echo -e "${BLUE}⚙️  工具执行中...${NC}"
        ;;
    "PostToolUse")
        if [ "$TOOL_SUCCESS" = "true" ]; then
            echo -e "${GREEN}✅ 工具执行成功${NC}"
        elif [ "$TOOL_SUCCESS" = "false" ]; then
            echo -e "${RED}❌ 工具执行失败${NC}"
        else
            echo -e "${YELLOW}⚙️  工具执行完成${NC}"
        fi
        ;;
esac

echo ""

exit 0