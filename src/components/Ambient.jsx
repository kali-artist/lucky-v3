import { useEffect, useRef } from 'react'

const VARIANT_PRESETS = {
  wheel: { countDivisor: 14, maxCount: 90, vy: [-0.24, -0.06], vx: 0.18, blur: 6, intensityBlur: 14 },
  ball: { countDivisor: 12, maxCount: 110, vy: [-0.18, -0.04], vx: 0.22, blur: 8, intensityBlur: 18 },
  slot: { countDivisor: 16, maxCount: 70, vy: [-0.32, -0.10], vx: 0.12, blur: 5, intensityBlur: 12 },
  card: { countDivisor: 13, maxCount: 95, vy: [-0.28, -0.08], vx: 0.20, blur: 7, intensityBlur: 16 },
  firework: { countDivisor: 11, maxCount: 130, vy: [-0.5, -0.18], vx: 0.26, blur: 9, intensityBlur: 22 },
}

export default function Ambient({ accent, accent2, intense = false, variant = 'wheel' }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    let frame
    let width = 0
    let height = 0
    let particles = []
    const preset = VARIANT_PRESETS[variant] ?? VARIANT_PRESETS.wheel
    const dpr = window.devicePixelRatio || 1

    const resize = () => {
      width = canvas.width = window.innerWidth * dpr
      height = canvas.height = window.innerHeight * dpr
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
      const count = Math.min(preset.maxCount, Math.floor(window.innerWidth / preset.countDivisor))
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        radius: Math.random() * 1.7 + 0.3,
        vx: (Math.random() - 0.5) * preset.vx,
        vy: preset.vy[0] + Math.random() * (preset.vy[1] - preset.vy[0]),
        alpha: Math.random() * 0.45 + 0.08,
        hue: Math.random() < 0.55 ? accent : accent2,
      }))
    }

    const draw = () => {
      context.clearRect(0, 0, width, height)
      particles.forEach((particle) => {
        particle.x += particle.vx
        particle.y += particle.vy
        if (particle.y < -10) particle.y = window.innerHeight + 10
        if (particle.x < -10) particle.x = window.innerWidth + 10
        if (particle.x > window.innerWidth + 10) particle.x = -10
        context.beginPath()
        context.fillStyle = `${particle.hue}${Math.round(particle.alpha * 255).toString(16).padStart(2, '0')}`
        context.shadowColor = particle.hue === accent ? accent2 : accent
        context.shadowBlur = intense ? preset.intensityBlur : preset.blur
        context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
        context.fill()
      })
      frame = requestAnimationFrame(draw)
    }

    resize()
    window.addEventListener('resize', resize)
    draw()
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
    }
  }, [accent, accent2, intense, variant])

  return (
    <div className={`ambient variant-${variant}`} style={{ '--accent': accent, '--accent-2': accent2 }}>
      <canvas ref={canvasRef} />
      <div className="aurora aurora-one" />
      <div className="aurora aurora-two" />
      <div className="star-field" />
      <div className="grid-overlay" />
      <div className="noise" />
    </div>
  )
}
