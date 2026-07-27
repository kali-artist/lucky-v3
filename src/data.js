import { useCallback, useEffect, useMemo, useState } from 'react'

export const MODULES = [
  { id: 'wheel', name: '幸运转盘', short: '转盘', subtitle: '让好运随光而转', accent: '#8b7cff', accent2: '#4bd7ff' },
  { id: 'ball', name: '星球抽签', short: '抽签', subtitle: '从星河中摘取幸运', accent: '#45dbca', accent2: '#65a9ff' },
  { id: 'slot', name: '幸运时刻', short: '老虎机', subtitle: '定格此刻的惊喜', accent: '#ff70a9', accent2: '#ffb766' },
  { id: 'card', name: '翻开惊喜', short: '翻牌', subtitle: '答案就在下一张', accent: '#ffb85c', accent2: '#ff718e' },
  { id: 'firework', name: '粒子爆炸', short: '爆炸', subtitle: '让烟火点燃好运', accent: '#ff5d6c', accent2: '#ffd56b' },
]

const DEFAULT_PRIZES = [
  { id: 'p1', name: '特等奖', detail: '年度惊喜大奖', icon: '✦', weight: 8, enabled: true, color: '#ffca62' },
  { id: 'p2', name: '一等奖', detail: '高端智能礼盒', icon: '♕', weight: 18, enabled: true, color: '#ff7cae' },
  { id: 'p3', name: '二等奖', detail: '品质生活礼包', icon: '◆', weight: 30, enabled: true, color: '#8b80ff' },
  { id: 'p4', name: '三等奖', detail: '幸运周边礼盒', icon: '●', weight: 46, enabled: true, color: '#53d8d0' },
  { id: 'p5', name: '惊喜奖', detail: '随机加倍快乐', icon: '★', weight: 58, enabled: true, color: '#66a8ff' },
  { id: 'p6', name: '幸运奖', detail: '好运能量补给', icon: '✿', weight: 72, enabled: true, color: '#a7e36d' },
]

const initialData = () => {
  const defaults = Object.fromEntries(MODULES.map((module) => [module.id, {
    title: module.name,
    prizes: DEFAULT_PRIZES.map((prize) => ({ ...prize, id: `${module.id}-${prize.id}` })),
  }]))
  try {
    const saved = localStorage.getItem('lucky-v3-data')
    if (!saved) return defaults
    const parsed = JSON.parse(saved)
    // Migrate older snapshots missing the firework module
    const merged = { ...defaults }
    for (const id of Object.keys(defaults)) {
      if (parsed?.[id]) merged[id] = parsed[id]
    }
    return merged
  } catch {
    return defaults
  }
}

export function useLotteryData() {
  const [data, setData] = useState(initialData)

  useEffect(() => {
    try {
      localStorage.setItem('lucky-v3-data', JSON.stringify(data))
    } catch {
      // localStorage may be unavailable (private mode / quota); silently skip
    }
  }, [data])

  const updateModule = useCallback((moduleId, next) => {
    setData((current) => ({
      ...current,
      [moduleId]: typeof next === 'function' ? next(current[moduleId]) : next,
    }))
  }, [])

  const resetAllData = useCallback(() => {
    const defaults = Object.fromEntries(MODULES.map((module) => [module.id, {
      title: module.name,
      prizes: DEFAULT_PRIZES.map((prize) => ({ ...prize, id: `${module.id}-${prize.id}` })),
    }]))
    setData(defaults)
    try { localStorage.removeItem('lucky-v3-data') } catch {}
  }, [])

  return { data, updateModule, resetAllData }
}

export function pickWeighted(prizes) {
  const active = prizes.filter((prize) => prize.enabled && Number(prize.weight) > 0)
  if (!active.length) return null
  const total = active.reduce((sum, prize) => sum + Number(prize.weight), 0)
  let cursor = Math.random() * total
  for (const prize of active) {
    cursor -= Number(prize.weight)
    if (cursor <= 0) return prize
  }
  return active.at(-1)
}

export function useProbabilities(prizes) {
  return useMemo(() => {
    const total = prizes.filter((prize) => prize.enabled).reduce((sum, prize) => sum + Number(prize.weight || 0), 0)
    return Object.fromEntries(prizes.map((prize) => [prize.id, prize.enabled && total ? Number(prize.weight || 0) / total * 100 : 0]))
  }, [prizes])
}
