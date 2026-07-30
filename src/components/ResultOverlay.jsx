import { useMemo } from 'react'
import { X, Sparkles } from 'lucide-react'

const effects = {
  wheel: 'result-rays',
  ball: 'result-bubbles',
  slot: 'result-confetti',
  card: 'result-rings',
  firework: 'result-firework',
}

export default function ResultOverlay({ prize, module, onClose }) {
  const sparkles = useMemo(() => Array.from({ length: 30 }, (_, index) => index), [prize?.id])
  if (!prize) return null
  return (
    <div className={`result-overlay ${effects[module.id] ?? 'result-confetti'}`} style={{ '--accent': module.accent, '--accent-2': module.accent2 }}>
      <button className="result-close" onClick={onClose} aria-label="关闭结果"><X size={20} /></button>
      <div className="result-orb" aria-hidden="true" />
      <div className="result-effect" aria-hidden="true">
        {sparkles.map((index) => <i key={index} style={{ '--i': index }} />)}
      </div>
      <div className="result-content">
        <div className="result-kicker"><Sparkles size={15} /> LUCKY MOMENT <Sparkles size={15} /></div>
        <div className="result-icon" style={{ '--prize-color': prize.color }}><span>{prize.icon}</span></div>
        <p>恭喜获得</p>
        <h2>{prize.name}</h2>
        <span>{prize.detail}</span>
        <button onClick={onClose}>收下好运</button>
      </div>
    </div>
  )
}
