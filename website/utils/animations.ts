import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger'

// 注册ScrollTrigger插件
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

// Hero区域入场动画
export const animateHeroEntrance = () => {
  const tl = gsap.timeline()
  
  // 设置初始状态
  gsap.set('.hero-badge', { opacity: 0, y: 30 })
  gsap.set('.hero-title', { opacity: 0, y: 50 })
  gsap.set('.hero-subtitle', { opacity: 0, y: 30 })
  gsap.set('.hero-description', { opacity: 0, y: 30 })
  gsap.set('.hero-buttons', { opacity: 0, y: 30 })
  gsap.set('.hero-social', { opacity: 0, scale: 0.8 })
  gsap.set('.hero-scroll', { opacity: 0, y: 20 })
  
  // 依次动画
  tl.to('.hero-badge', { 
    opacity: 1, 
    y: 0, 
    duration: 0.8, 
    ease: 'power2.out' 
  })
  .to('.hero-title', { 
    opacity: 1, 
    y: 0, 
    duration: 1, 
    ease: 'power2.out' 
  }, '-=0.4')
  .to('.hero-subtitle', { 
    opacity: 1, 
    y: 0, 
    duration: 0.8, 
    ease: 'power2.out' 
  }, '-=0.6')
  .to('.hero-description', { 
    opacity: 1, 
    y: 0, 
    duration: 0.8, 
    ease: 'power2.out' 
  }, '-=0.4')
  .to('.hero-buttons', { 
    opacity: 1, 
    y: 0, 
    duration: 0.8, 
    ease: 'power2.out' 
  }, '-=0.4')
  .to('.hero-social', { 
    opacity: 1, 
    scale: 1, 
    duration: 0.6, 
    ease: 'back.out(1.7)' 
  }, '-=0.2')
  .to('.hero-scroll', { 
    opacity: 1, 
    y: 0, 
    duration: 0.6, 
    ease: 'power2.out' 
  }, '-=0.2')
  
  return tl
}

// Section滚动触发动画
export const animateOnScroll = (selector: string, delay: number = 0) => {
  gsap.fromTo(selector, 
    { 
      opacity: 0, 
      y: 60 
    },
    {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: 'power2.out',
      delay,
      scrollTrigger: {
        trigger: selector,
        start: 'top 80%',
        end: 'bottom 20%',
        toggleActions: 'play none none reverse'
      }
    }
  )
}

// 技能标签动画
export const animateSkillTags = () => {
  gsap.fromTo('.skill-tag',
    {
      opacity: 0,
      scale: 0.8,
      y: 20
    },
    {
      opacity: 1,
      scale: 1,
      y: 0,
      duration: 0.6,
      ease: 'back.out(1.7)',
      stagger: 0.1,
      scrollTrigger: {
        trigger: '.skills-container',
        start: 'top 70%',
        toggleActions: 'play none none reverse'
      }
    }
  )
}

// 项目卡片动画
export const animateProjectCards = () => {
  gsap.fromTo('.project-card',
    {
      opacity: 0,
      y: 50,
      scale: 0.95
    },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.8,
      ease: 'power2.out',
      stagger: 0.2,
      scrollTrigger: {
        trigger: '.projects-container',
        start: 'top 70%',
        toggleActions: 'play none none reverse'
      }
    }
  )
}

// 经验时间轴动画
export const animateTimeline = () => {
  gsap.fromTo('.timeline-item',
    {
      opacity: 0,
      x: -50
    },
    {
      opacity: 1,
      x: 0,
      duration: 0.8,
      ease: 'power2.out',
      stagger: 0.3,
      scrollTrigger: {
        trigger: '.timeline-container',
        start: 'top 70%',
        toggleActions: 'play none none reverse'
      }
    }
  )
}

// 按钮悬浮动画
export const addButtonHoverEffects = () => {
  const buttons = document.querySelectorAll('.animated-button')
  
  buttons.forEach(button => {
    button.addEventListener('mouseenter', () => {
      gsap.to(button, {
        scale: 1.05,
        duration: 0.3,
        ease: 'power2.out'
      })
    })
    
    button.addEventListener('mouseleave', () => {
      gsap.to(button, {
        scale: 1,
        duration: 0.3,
        ease: 'power2.out'
      })
    })
  })
}

// 弹窗动画
export const animateModalOpen = (modalElement: HTMLElement, backdropElement: HTMLElement, onComplete?: () => void) => {
  const tl = gsap.timeline({
    onComplete
  })

  // 设置初始状态 - 使用transform而不是百分比，避免溢出
  gsap.set(modalElement, {
    y: window.innerHeight, // 使用具体像素值而不是百分比
    opacity: 0,
    visibility: 'visible'
  })
  gsap.set(backdropElement, {
    opacity: 0,
    visibility: 'visible'
  })

  // 动画序列
  tl.to(backdropElement, {
    opacity: 1,
    duration: 0.3,
    ease: 'power2.out'
  })
  .to(modalElement, {
    y: 0,
    opacity: 1,
    duration: 0.6,
    ease: 'power3.out'
  }, '-=0.1')

  return tl
}

export const animateModalClose = (modalElement: HTMLElement, backdropElement: HTMLElement, onComplete?: () => void) => {
  const tl = gsap.timeline({
    onComplete: () => {
      // 动画完成后隐藏元素，防止影响页面布局
      gsap.set([modalElement, backdropElement], { visibility: 'hidden' })
      if (onComplete) onComplete()
    }
  })

  tl.to(modalElement, {
    y: window.innerHeight, // 使用具体像素值
    opacity: 0,
    duration: 0.4,
    ease: 'power2.in'
  })
  .to(backdropElement, {
    opacity: 0,
    duration: 0.2,
    ease: 'power2.out'
  }, '-=0.2')

  return tl
}

// 弹窗内容动画
export const animateModalContent = () => {
  const tl = gsap.timeline()

  // 设置初始状态
  gsap.set('.modal-header', { opacity: 0, y: 15 })
  gsap.set('.modal-tabs', { opacity: 0, y: 15 })
  gsap.set('.modal-content', { opacity: 0, y: 20 })

  // 快速连贯的动画序列
  tl.to('.modal-header', {
    opacity: 1,
    y: 0,
    duration: 0.3,
    ease: 'power2.out'
    // 无初始延迟，立即开始
  })
  .to('.modal-tabs', {
    opacity: 1,
    y: 0,
    duration: 0.3,
    ease: 'power2.out'
  }, '-=0.2') // 更多重叠，更连贯
  .to('.modal-content', {
    opacity: 1,
    y: 0,
    duration: 0.3,
    ease: 'power2.out'
  }, '-=0.15') // 更多重叠，更连贯

  return tl
}

// 拖拽关闭动画
export const animateDragClose = (modalElement: HTMLElement, backdropElement: HTMLElement, onComplete?: () => void) => {
  const tl = gsap.timeline({
    onComplete: () => {
      // 动画完成后隐藏元素
      gsap.set([modalElement, backdropElement], { visibility: 'hidden' })
      if (onComplete) onComplete()
    }
  })

  tl.to(modalElement, {
    y: window.innerHeight, // 使用具体像素值
    opacity: 0,
    duration: 0.3,
    ease: 'power2.in'
  })
  .to(backdropElement, {
    opacity: 0,
    duration: 0.2,
    ease: 'power2.out'
  }, '-=0.1')

  return tl
}

// 清理ScrollTrigger
export const cleanupScrollTriggers = () => {
  ScrollTrigger.getAll().forEach(trigger => trigger.kill())
}
