import { useMemo, useState } from 'react'
import { Gift, Rocket, Sparkles } from 'lucide-react'
import { pickWeighted } from '../data'

const wait = (duration) => new Promise((resolve) => setTimeout(resolve, duration))

export function Wheel({ prizes, onResult }) {
  const active = prizes.filter((prize) => prize.enabled)
  const [spinning, setSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const gradient = useMemo(() => {
    if (!active.length) return '#202437'
    const size = 360 / active.length
    return `conic-gradient(${active.map((prize, index) => `${prize.color} ${index * size}deg ${(index + 1) * size}deg`).join(',')})`
  }, [active])

  const spin = async () => {
    if (spinning || !active.length) return
    const winner = pickWeighted(prizes)
    const winnerIndex = active.findIndex((prize) => prize.id === winner.id)
    const slice = 360 / active.length
    const current = rotation % 360
    const target = 360 - (winnerIndex * slice + slice / 2)
    setSpinning(true)
    setRotation(rotation + 1440 + ((target - current + 360) % 360))
    await wait(4200)
    setSpinning(false)
    onResult(winner)
  }

  return (
    <div className="module-stage wheel-stage">
      <div className="stage-copy"><span>FORTUNE WHEEL</span><h1>转动你的幸运</h1><p>每一次旋转，都让期待有了形状</p></div>
      <div className={`wheel-wrap ${spinning ? 'is-spinning' : ''}`}>
        <div className="wheel-halo" />
        <div className="wheel-pointer"><span /></div>
        <div className="wheel" style={{ background: gradient, transform: `rotate(${rotation}deg)` }}>
          <div className="wheel-glass" />
          {active.map((prize, index) => {
            const angle = index * (360 / active.length) + (180 / active.length)
            return (
              <div className="wheel-label" key={prize.id} style={{ transform: `rotate(${angle}deg)` }}>
                <span style={{ transform: 'rotate(90deg)' }}>{prize.icon}<b>{prize.name}</b></span>
              </div>
            )
          })}
          <div className="wheel-center"><Sparkles size={24} /></div>
        </div>
      </div>
      <DrawButton disabled={spinning || !active.length} active={spinning} onClick={spin} label={spinning ? '好运旋转中' : '转动好运'} />
    </div>
  )
}

export function Ball({ prizes, onResult }) {
  const active = prizes.filter((prize) => prize.enabled)
  const [drawing, setDrawing] = useState(false)
  const balls = Array.from({ length: 16 }, (_, index) => active[index % Math.max(active.length, 1)])
  const draw = async () => {
    if (drawing || !active.length) return
    setDrawing(true)
    await wait(2600)
    setDrawing(false)
    onResult(pickWeighted(prizes))
  }
  return (
    <div className="module-stage ball-stage">
      <div className="stage-copy"><span>GALAXY DRAW</span><h1>摘一颗幸运星球</h1><p>万千闪烁中，总有一颗为你而来</p></div>
      <div className={`ball-machine ${drawing ? 'is-drawing' : ''}`}>
        <div className="machine-shine" />
        <div className="ball-chamber">
          {balls.map((prize, index) => (
            <i key={index} style={{
              '--i': index,
              '--ball-x': `${18 + (index * 47) % 174}px`,
              '--ball-y': `${20 + (index * 31) % 100}px`,
              '--ball-color': prize?.color || '#ffffff',
            }}>{index + 1}</i>
          ))}
          <div className="chamber-reflection" />
        </div>
        <div className="machine-neck" />
        <div className="machine-base"><span>LUCKY</span><small>STAR COLLECTOR</small></div>
      </div>
      <DrawButton disabled={drawing || !active.length} active={drawing} onClick={draw} label={drawing ? '星球寻找中' : '抽取星球'} />
    </div>
  )
}

export function Slot({ prizes, onResult }) {
  const active = prizes.filter((prize) => prize.enabled)
  const [rolling, setRolling] = useState(false)
  const [winner, setWinner] = useState(null)
  const roll = async () => {
    if (rolling || !active.length) return
    const next = pickWeighted(prizes)
    setWinner(null)
    setRolling(true)
    await wait(3000)
    setWinner(next)
    setRolling(false)
    await wait(600)
    onResult(next)
  }
  return (
    <div className="module-stage slot-stage">
      <div className="stage-copy"><span>LUCKY MOMENT</span><h1>定格幸运时刻</h1><p>让滚动的光影，停在惊喜这一秒</p></div>
      <div className={`slot-machine ${rolling ? 'is-rolling' : ''} ${winner ? 'is-win' : ''}`}>
        <div className="slot-top"><Sparkles size={16} /> LUCKY <Sparkles size={16} /></div>
        <div className="reels">
          {[0, 1, 2].map((reel) => (
            <div className="reel" key={reel}>
              <div className="reel-strip" style={{ '--delay': `${reel * 90}ms` }}>
                {(winner ? [winner, winner, winner] : [...active, ...active]).slice(0, 8).map((prize, index) => (
                  <span key={`${reel}-${index}`} style={{ color: prize.color }}>{prize.icon}</span>
                ))}
              </div>
            </div>
          ))}
          <div className="reel-line" />
        </div>
        <div className="slot-lights">{Array.from({ length: 9 }, (_, index) => <i key={index} />)}</div>
        <div className="slot-foot">MAKE A WISH · TAKE A CHANCE</div>
      </div>
      <DrawButton disabled={rolling || !active.length} active={rolling} onClick={roll} label={rolling ? '幸运滚动中' : '开始滚动'} />
    </div>
  )
}

export function Card({ prizes, onResult }) {
  const active = prizes.filter((prize) => prize.enabled)
  const [selected, setSelected] = useState(null)
  const [locked, setLocked] = useState(false)
  const cards = Array.from({ length: 8 }, (_, index) => ({ index, prize: active[index % Math.max(active.length, 1)] }))
  const choose = async (index) => {
    if (locked || !active.length) return
    const winner = pickWeighted(prizes)
    setSelected({ index, winner })
    setLocked(true)
    await wait(1900)
    onResult(winner)
  }
  const reset = () => { setSelected(null); setLocked(false) }
  return (
    <div className="module-stage card-stage">
      <div className="stage-copy"><span>MYSTERY CARDS</span><h1>翻开属于你的惊喜</h1><p>跟随直觉，答案就在下一张</p></div>
      <div className="card-grid">
        {cards.map(({ index, prize }) => (
          <button
            key={index}
            className={`flip-card ${selected?.index === index ? 'is-flipped' : ''} ${locked && selected?.index !== index ? 'is-dim' : ''}`}
            onClick={() => choose(index)}
          >
            <span className="flip-inner">
              <span className="card-front"><i>✦</i><b>LUCKY</b><small>{String(index + 1).padStart(2, '0')}</small></span>
              <span className="card-back" style={{ '--prize-color': selected?.winner?.color || prize?.color }}>
                <i>{selected?.winner?.icon || prize?.icon}</i>
                <b>{selected?.winner?.name || prize?.name}</b>
              </span>
            </span>
          </button>
        ))}
      </div>
      <p className="card-tip">
        {locked ? <button onClick={reset}>重新选牌</button> : '选择一张卡牌 · 揭晓今日好运'}
      </p>
    </div>
  )
}

export function Firework({ prizes, onResult }) {
  const active = prizes.filter((prize) => prize.enabled)
  const [phase, setPhase] = useState('idle') // idle | launching | bursting | revealed
  const [winner, setWinner] = useState(null)
  const [burstSeed, setBurstSeed] = useState(0)

  const launch = async () => {
    if (phase !== 'idle' || !active.length) return
    const next = pickWeighted(prizes)
    setWinner(next)
    setBurstSeed((seed) => seed + 1)
    setPhase('launching')
    await wait(1100)
    setPhase('bursting')
    await wait(1700)
    setPhase('revealed')
    await wait(900)
    onResult(next)
    setPhase('idle')
  }

  const burstSpans = useMemo(() => Array.from({ length: 32 }, (_, index) => index), [burstSeed])
  const sparkSpans = useMemo(() => Array.from({ length: 18 }, (_, index) => index), [burstSeed])

  return (
    <div className={`module-stage firework-stage ${phase !== 'idle' ? `phase-${phase}` : ''}`}>
      <div className="stage-copy">
        <span>PARTICLE BURST</span>
        <h1>点燃属于你的烟火</h1>
        <p>每一次爆裂，都是一次新的可能</p>
      </div>
      <div className="firework-scene">
        <div className="fw-sky" aria-hidden="true">
          {Array.from({ length: 30 }, (_, index) => (
            <i key={`star-${index}`} className="fw-star" style={{ '--i': index }} />
          ))}
        </div>
        {(phase === 'bursting' || phase === 'revealed') && (
          <div className="fw-burst" key={burstSeed} style={{ '--prize-color': winner?.color || '#ffd56b' }}>
            {burstSpans.map((index) => <i key={`b-${index}`} style={{ '--i': index }} />)}
            {sparkSpans.map((index) => <b key={`s-${index}`} style={{ '--i': index }} />)}
            <div className="fw-burst-core" />
          </div>
        )}
        {phase === 'revealed' && winner && (
          <div className="fw-reveal">
            <i style={{ color: winner.color }}>{winner.icon}</i>
            <b>{winner.name}</b>
            <small>{winner.detail}</small>
          </div>
        )}
        <div className={`fw-rocket ${phase}`}>
          <span className="fw-rocket-body"><Rocket size={22} /></span>
          <span className="fw-rocket-flame" />
        </div>
        <div className="fw-ground" />
      </div>
      <DrawButton
        disabled={phase !== 'idle' || !active.length}
        active={phase !== 'idle'}
        onClick={launch}
        label={
          phase === 'idle' ? '发射烟火' :
          phase === 'launching' ? '升空中…' :
          phase === 'bursting' ? '正在爆裂' :
          '揭晓中'
        }
      />
    </div>
  )
}

function DrawButton({ label, active, ...props }) {
  return (
    <button className={`draw-button ${active ? 'is-active' : ''}`} {...props}>
      <Gift size={18} />
      <span>{label}</span>
      <i />
    </button>
  )
}
