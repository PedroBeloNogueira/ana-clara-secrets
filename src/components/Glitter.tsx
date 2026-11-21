import { BRAND_NAME } from '../data/brand'
import { useEffect, useRef } from 'react'

const colors = ['#ee75a9', '#ffc1db', '#fff2f8', '#da6299']

export default function Glitter() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const motion = matchMedia('(prefers-reduced-motion: reduce)')
    const start = performance.now()
    let frame = 0, width = 0, height = 0, last = 0, slow = 0, quality = 1
    const rain = Array.from({length: 180}, () => ({
      x: Math.random(), y: Math.random(), depth: .2 + .8 * Math.random(), phase: Math.random()*6.28,
    }))
    const sparks = Array.from({length: 168}, (_, i) => ({
      angle: i * Math.PI * (3 - Math.sqrt(5)), reach: .2 + .8 * Math.random(),
      delay: Math.random() * .15, size: 1 + Math.random()*2,
    }))
    function resize() {
      if (!canvas || !ctx) return
      width = innerWidth
      height = innerHeight
      const ratio = Math.min(devicePixelRatio, 1.5)
      canvas.width = Math.round(width * ratio)
      canvas.height = Math.round(height * ratio)
      ctx.setTransform(ratio,0,0,ratio,0,0)
    }
    function crystal(x:number, y:number, r:number, color:string, opacity:number) {
      if (!ctx) return
      ctx.fillStyle = color
      ctx.globalAlpha = opacity
      ctx.beginPath()
      ctx.moveTo(x,y-r*1.5)
      ctx.lineTo(x+r,y)
      ctx.lineTo(x,y+r*1.5)
      ctx.lineTo(x-r,y)
      ctx.fill()
    }
    function draw(now:number) {
      if (!ctx) return
      const time = (now-start)/1000
      slow = last && now-last > 48 ? slow+1 : Math.max(0,slow-1)
      if (slow >= 8) { quality = Math.max(.45,quality*.8); slow = 0 }
      last = now
      ctx.clearRect(0,0,width,height)
      const intro = Math.max(0,Math.min(1,(3.8-time)/1.1))
      const count = Math.ceil((width < 680 ? 86 : 180) * quality * (.48+.52*intro))
      for (let i=0; i<count; i++) {
        const p = rain[i]
        const y = (p.y*height + time*(30+p.depth*90)) % (height+6) - 3
        const x = p.x*width + Math.sin(time*.45+p.phase)*9
        crystal(x,y,.6+p.depth*1.6,colors[i%4],(.2+.64*p.depth)*(.55+.45*intro))
      }
      if (time >= .8 && time < 2.7) {
        const spread = Math.min(width*.55,height*.52,440)
        const count = Math.round(sparks.length*quality*(width < 680 ? .8 : 1))
        for (let i=0; i<count; i++) {
          const s = sparks[i]
          const age = (time-.8-s.delay)/1.7
          if (age<=0 || age>=1) continue
          const distance = spread*s.reach*(1-(1-age)**3)
          const x = width/2 + Math.cos(s.angle)*distance
          const y = height/2 + Math.sin(s.angle)*distance*.82 + age*age*14
          const opacity = Math.min(1,age*13)*(1-age)
          crystal(x,y,s.size*2.3,colors[i%4],opacity*.14)
          crystal(x,y,s.size,colors[i%4],opacity)
        }
      }
      frame = requestAnimationFrame(draw)
    }
    function sync() {
      cancelAnimationFrame(frame)
      last = 0
      if (!motion.matches && !document.hidden) frame = requestAnimationFrame(draw)
    }
    resize()
    sync()
    window.addEventListener('resize', resize)
    motion.addEventListener('change',sync)
    document.addEventListener('visibilitychange',sync)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize',resize)
      motion.removeEventListener('change',sync)
      document.removeEventListener('visibilitychange',sync)
    }
  }, [])
  return <>
    <canvas className="glitter" ref={ref} aria-hidden="true"/>
    <div className="opening-signature" aria-hidden="true">
      <div className="opening-name">{BRAND_NAME.slice(0, BRAND_NAME.lastIndexOf(' '))}<span>{BRAND_NAME.split(' ').pop()}</span></div>
    </div>
  </>
}