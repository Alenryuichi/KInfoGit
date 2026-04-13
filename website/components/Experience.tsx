import { useEffect } from 'react'
import { animateOnScroll } from '@/utils/animations'

export function Experience() {
  const isTencentActive = new Date() < new Date('2026-06-01')

  useEffect(() => {
    animateOnScroll('.experience-header')
    animateOnScroll('.timeline-log')
  }, [])

  return (
    <section id="experience" className="py-20 text-white relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto w-full">
          
          {/* Terminal Header */}
          <div className="experience-header mb-12 font-mono text-sm border-b border-white/10 pb-6">
            <span className="text-emerald-400">kylin@macbook</span>
            <span className="text-white/40">:</span>
            <span className="text-blue-400">~/experience</span>
            <span className="text-white/40 ml-1">$</span>
            <span className="text-white/90 ml-2">git log --graph --all</span>
            <span className="inline-block w-2 h-4 bg-white/60 align-middle ml-1 -mt-0.5 animate-[blink_1s_step-end_infinite]"></span>
          </div>

          <div className="space-y-16">
            
            {/* Log Entry 1: Tencent (Main Branch) */}
            <div className="timeline-log font-mono group">
              <div className="flex flex-wrap items-center text-xs mb-2">
                <span className="text-purple-400 font-semibold mr-2">{isTencentActive ? '* branch' : '* commit'}</span>
                <span className="bg-purple-500/10 text-purple-300 border border-purple-500/20 px-1.5 py-0.5 rounded text-[0.65rem]">main</span>
                {isTencentActive && (
                  <span className="text-emerald-400 ml-2 select-none">(active)</span>
                )}
                <span className="text-white/20 mx-3">|</span>
                <span className="text-white/40">{isTencentActive ? 'Since: 2022.07' : 'Date: 2022.07 — 2026.05'}</span>
              </div>

              <div className="ml-[0.25rem] mt-4">
                
                <div className="relative pl-8 pb-8 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-px before:bg-purple-500/30 after:absolute after:left-0 after:top-4 after:w-6 after:h-px after:bg-purple-500/30 group-hover:before:bg-white/60 group-hover:after:bg-white/60 transition-all duration-300">
                  <div className="opacity-80 transition-opacity duration-200 group-hover:opacity-100 font-sans pt-1">
                    <h3 className="text-lg font-medium text-white/90 tracking-tight">全栈开发工程师 / AI Agent 架构师</h3>
                    <p className="text-sm text-white/40 mt-1">腾讯企业微信 · Tencent WeCom</p>
                  </div>
                </div>

                <div className="relative pl-8 before:absolute before:left-0 before:top-0 before:h-4 before:w-px before:bg-purple-500/30 after:absolute after:left-0 after:top-4 after:w-6 after:h-px after:bg-purple-500/30 group-hover:before:bg-white/60 group-hover:after:bg-white/60 transition-all duration-300">
                  <div className="opacity-80 transition-opacity duration-200 group-hover:opacity-100 pt-1">
                    <div className="text-[0.65rem] text-white/30 uppercase tracking-widest mb-3">Execution Log</div>
                    <div className="text-sm text-white/60 font-light flex leading-relaxed font-sans">
                      <span className="font-mono text-emerald-500/50 mr-3 mt-0.5 select-none">-&gt;</span>
                      <span>
                        <span className="font-mono text-[0.65rem] text-emerald-400/80 mr-2 font-medium tracking-tight">[System_Arch]</span>
                        在百亿级数据的黑灰产对抗中，从零手搓了企业微信 AI Agent 审核网络，把复杂场景的拦截率硬拔到 90%+。受够了黑盒式的风控运营，干脆造了个轮子，打通了从「特征监控、策略分析到问题定位」的全生命周期平台，顺道把前后端一锅端，把自己逼成了全栈开发。
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Log Entry 2: Indie Developer (Parallel Branch) */}
            <div className="timeline-log font-mono group">
              <div className="flex flex-wrap items-center text-xs mb-2">
                <span className="text-blue-400 font-semibold mr-2">| * branch</span>
                <span className="bg-blue-500/10 text-blue-300 border border-blue-500/20 px-1.5 py-0.5 rounded text-[0.65rem]">indie-dev</span>
                <span className="text-emerald-400 ml-2 select-none">(active/parallel)</span>
                <span className="text-white/20 mx-3">|</span>
                <span className="text-white/40">Since: 2025.06</span>
              </div>

              <div className="ml-[0.85rem] mt-4 border-l border-purple-500/20 pl-4 relative">
                
                <div className="relative pl-8 pb-8 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-px before:bg-blue-500/30 after:absolute after:left-0 after:top-4 after:w-6 after:h-px after:bg-blue-500/30 group-hover:before:bg-white/60 group-hover:after:bg-white/60 transition-all duration-300">
                  <div className="opacity-80 transition-opacity duration-200 group-hover:opacity-100 font-sans pt-1">
                    <h3 className="text-lg font-medium text-white/90 tracking-tight">全栈 iOS 开发 / 独立开发者</h3>
                    <p className="text-sm text-white/40 mt-1">Independent Developer</p>
                  </div>
                </div>

                <div className="relative pl-8 before:absolute before:left-0 before:top-0 before:h-4 before:w-px before:bg-blue-500/30 after:absolute after:left-0 after:top-4 after:w-6 after:h-px after:bg-blue-500/30 group-hover:before:bg-white/60 group-hover:after:bg-white/60 transition-all duration-300">
                  <div className="opacity-80 transition-opacity duration-200 group-hover:opacity-100 pt-1">
                    <div className="text-[0.65rem] text-white/30 uppercase tracking-widest mb-3">Execution Log</div>
                    <div className="text-sm text-white/60 font-light flex leading-relaxed font-sans">
                      <span className="font-mono text-emerald-500/50 mr-3 mt-0.5 select-none">-&gt;</span>
                      <span>
                        <span className="font-mono text-[0.65rem] text-emerald-400/80 mr-2 font-medium tracking-tight">[Indie_Hacker]</span>
                        上线了国内首款攀岩 AI 应用「磕线」，集齐了 AI 高光生成、训练数据分析与日常攀爬记录。为了不让高昂的云端 GPU 烧空钱包，硬生生把庞大的视觉推理流塞进手机端侧，靠压榨 CoreML 算力换取了极其流畅的实时体验。
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Log Entry 3: Education (Past Commit) */}
            <div className="timeline-log font-mono group">
              <div className="flex flex-wrap items-center text-xs mb-2">
                <span className="text-white/60 font-semibold mr-2">* commit</span>
                <span className="text-white/40 text-[0.65rem] mr-2">8c2d4f1</span>
                <span className="text-white/20 mx-3">|</span>
                <span className="text-white/40">Date: 2019.09 — 2022.06</span>
              </div>

              <div className="ml-[0.25rem] mt-4">
                
                <div className="relative pl-8 pb-8 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-px before:bg-white/15 after:absolute after:left-0 after:top-4 after:w-6 after:h-px after:bg-white/15 group-hover:before:bg-white/60 group-hover:after:bg-white/60 transition-all duration-300">
                  <div className="opacity-80 transition-opacity duration-200 group-hover:opacity-100 font-sans pt-1">
                    <h3 className="text-lg font-medium text-white/90 tracking-tight">计算机科学与技术 · 硕士</h3>
                    <p className="text-sm text-white/40 mt-1">华南理工大学 · South China University of Technology</p>
                  </div>
                </div>

                <div className="relative pl-8 before:absolute before:left-0 before:top-0 before:h-4 before:w-px before:bg-white/15 after:absolute after:left-0 after:top-4 after:w-6 after:h-px after:bg-white/15 group-hover:before:bg-white/60 group-hover:after:bg-white/60 transition-all duration-300">
                  <div className="opacity-80 transition-opacity duration-200 group-hover:opacity-100 pt-1">
                    <div className="text-[0.65rem] text-white/30 uppercase tracking-widest mb-3">Execution Log</div>
                    <div className="text-sm text-white/60 font-light flex leading-relaxed font-sans">
                      <span className="font-mono text-emerald-500/50 mr-3 mt-0.5 select-none">-&gt;</span>
                      <span>
                        <span className="font-mono text-[0.65rem] text-emerald-400/80 mr-2 font-medium tracking-tight">[Research]</span>
                        顶着技术思维严重脱节还要强行微操的导师高压，硬抗下了无人机视觉导航与数字孪生底座的重任。在无数个和深度神经网络玩“极限压缩”的深夜里，硬是把这套让无人机在虚拟世界里自主认路的系统跑通了，顺便发了一篇 CCF。
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Terminal End Marker */}
            <div className="mt-16 font-mono text-xs text-white/20 text-center select-none">
                ~ [END OF LOG] ~
            </div>

          </div>

        </div>
      </div>
    </section>
  )
}
