import { useEffect, useState, useRef } from 'react'
import { useInView } from 'framer-motion'

interface CountUpProps {
  end: number
  duration?: number
  suffix?: string
  className?: string
}

export default function CountUp({ end, duration = 2000, suffix = "", className = "" }: CountUpProps) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (isInView) {
      let startTime: number
      let animationFrame: number

      const step = (timestamp: number) => {
        if (!startTime) startTime = timestamp
        const progress = Math.min((timestamp - startTime) / duration, 1)
        
        // Easing function: easeOutExpo
        const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
        
        setCount(Math.floor(ease * end))

        if (progress < 1) {
          animationFrame = window.requestAnimationFrame(step)
        }
      }

      animationFrame = window.requestAnimationFrame(step)

      return () => window.cancelAnimationFrame(animationFrame)
    }
  }, [end, duration, isInView])

  return (
    <span ref={ref} className={className}>
      {count}{suffix}
    </span>
  )
}
