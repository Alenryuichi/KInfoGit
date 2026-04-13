import { useEffect, useState } from 'react'
import { EyeIcon } from '@heroicons/react/24/outline'

/**
 * 不蒜子 (busuanzi) 页面浏览量计数器
 * 动态加载外部脚本，显示当前页面的 PV
 *
 * 注意：在 [slug].tsx 中使用时需要加 key={post.slug}
 * 以确保 SPA 路由切换时重新挂载
 */
export function BusuanziCounter() {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    // 移除之前的脚本（路由切换场景）
    const existingScript = document.getElementById('busuanzi-script')
    if (existingScript) {
      existingScript.remove()
    }

    const script = document.createElement('script')
    script.id = 'busuanzi-script'
    script.src = '//busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js'
    script.async = true

    script.onload = () => {
      // 轮询等待 busuanzi 填充 DOM，比固定 setTimeout 更可靠
      const check = setInterval(() => {
        const el = document.getElementById('busuanzi_value_page_pv')
        if (el && el.textContent && el.textContent !== '--') {
          setLoaded(true)
          clearInterval(check)
        }
      }, 100)
      // 超时兜底：2 秒后不管有没有数据都显示
      setTimeout(() => {
        clearInterval(check)
        setLoaded(true)
      }, 2000)
    }

    script.onerror = () => {
      // 脚本加载失败，静默降级：隐藏计数器
      setLoaded(false)
    }

    document.head.appendChild(script)

    return () => {
      const s = document.getElementById('busuanzi-script')
      if (s) s.remove()
    }
  }, [])

  return (
    <span
      className="inline-flex items-center gap-1 transition-opacity duration-300"
      style={{ opacity: loaded ? 1 : 0.5 }}
      title="阅读量"
    >
      <EyeIcon className="w-3.5 h-3.5" />
      <span id="busuanzi_value_page_pv">--</span>
    </span>
  )
}
