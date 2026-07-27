import { useEffect, useState } from 'react'
import { CircleDot, Disc3, Flame, Layers3, Rocket, Sparkles, Volume2, VolumeX } from 'lucide-react'
import Ambient from './Ambient'
import ResultOverlay from './ResultOverlay'
import { Ball, Card, Firework, Slot, Wheel } from './LotteryModules'

const icons = { wheel: Disc3, ball: CircleDot, slot: Layers3, card: Sparkles, firework: Flame }
const components = { wheel: Wheel, ball: Ball, slot: Slot, card: Card, firework: Firework }

export default function LotteryApp({ modules, data }) {
  const [activeId, setActiveId] = useState('wheel')
  const [result, setResult] = useState(null)
  const [sound, setSound] = useState(true)
  const [time, setTime] = useState(new Date())
  const active = modules.find((module) => module.id === activeId)
  const ModuleComponent = components[activeId]

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const switchModule = (moduleId) => {
    if (moduleId === activeId) return
    setResult(null)
    setActiveId(moduleId)
  }

  const drawIcon = activeId === 'firework' ? Rocket : Sparkles

  return (
    <main className={`lottery-app theme-${activeId}`} style={{ '--accent': active.accent, '--accent-2': active.accent2 }}>
      <Ambient accent={active.accent} accent2={active.accent2} intense={Boolean(result)} variant={activeId} />
      <header className="site-header">
        <div className="brand"><span><Sparkles size={19} /></span><div><b>LUCKY</b><small>好运正在发生</small></div></div>
        <div className="event-name"><i /> {data[activeId].title}</div>
        <div className="header-meta"><span>{time.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</span><button onClick={() => setSound(!sound)} aria-label="切换声音">{sound ? <Volume2 size={18} /> : <VolumeX size={18} />}</button></div>
      </header>

      <section className="lottery-content" key={activeId}>
        <ModuleComponent prizes={data[activeId].prizes} onResult={setResult} />
      </section>

      <nav className="module-nav">
        <div className="nav-track" style={{ '--active-index': modules.findIndex((module) => module.id === activeId) }} />
        {modules.map((module, index) => {
          const Icon = icons[module.id]
          return (
            <button
              key={module.id}
              className={activeId === module.id ? 'active' : ''}
              style={{ '--nav-index': index }}
              onClick={() => switchModule(module.id)}
            >
              <Icon size={20} />
              <span>{module.short}</span>
              <small>{module.subtitle}</small>
            </button>
          )
        })}
      </nav>

      <div className="corner-label left">LUCKY DRAW · 2026</div>
      <div className="corner-label right">MAY LUCK BE WITH YOU</div>
      <ResultOverlay prize={result} module={active} onClose={() => setResult(null)} />
    </main>
  )
}
