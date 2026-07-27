import { useMemo, useState } from 'react'
import { BarChart3, Check, ChevronDown, CircleDot, Disc3, Download, FileUp, Flame, Gift, Layers3, LayoutDashboard, Menu, Pencil, Plus, Search, Settings, Sparkles, Trash2, X } from 'lucide-react'
import { useProbabilities } from '../data'

const moduleIcons = { wheel: Disc3, ball: CircleDot, slot: Layers3, card: Sparkles, firework: Flame }

const ICON_OPTIONS = ['✦', '◆', '●', '★', '✿', '♕', '♛', '❤', '◇', '◯']
const COLOR_OPTIONS = ['#ffca62', '#ff7cae', '#8b80ff', '#53d8d0', '#66a8ff', '#a7e36d', '#ff5d6c', '#ffd56b']

export default function Admin({ modules, data, updateModule }) {
  const [activeId, setActiveId] = useState('wheel')
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const current = data[activeId]
  const activeModule = modules.find((module) => module.id === activeId)
  const probabilities = useProbabilities(current.prizes)
  const activeCount = current.prizes.filter((prize) => prize.enabled).length
  const totalWeight = current.prizes.filter((prize) => prize.enabled).reduce((sum, prize) => sum + Number(prize.weight || 0), 0)
  const filtered = current.prizes.filter((prize) => prize.name.toLowerCase().includes(search.toLowerCase()))

  const patchPrize = (prizeId, patch) => updateModule(activeId, (module) => ({
    ...module,
    prizes: module.prizes.map((prize) => prize.id === prizeId ? { ...prize, ...patch } : prize),
  }))

  const deletePrize = (prizeId) => updateModule(activeId, (module) => ({ ...module, prizes: module.prizes.filter((prize) => prize.id !== prizeId) }))

  const savePrize = (values) => {
    updateModule(activeId, (module) => ({
      ...module,
      prizes: values.id
        ? module.prizes.map((prize) => prize.id === values.id ? values : prize)
        : [...module.prizes, { ...values, id: `${activeId}-${Date.now()}` }],
    }))
    setModal(null)
  }

  const importPrizes = (text) => {
    const rows = text.split('\n').map((row) => row.trim()).filter(Boolean).map((row, index) => {
      const [name, weight = '10', detail = '幸运奖品'] = row.split(/[,，\t]/).map((item) => item.trim())
      return {
        id: `${activeId}-${Date.now()}-${index}`,
        name: name || `奖品${index + 1}`,
        detail,
        weight: Math.min(100, Math.max(1, Number(weight) || 10)),
        enabled: true,
        icon: ICON_OPTIONS[index % ICON_OPTIONS.length],
        color: COLOR_OPTIONS[index % COLOR_OPTIONS.length],
      }
    })
    if (rows.length) updateModule(activeId, (module) => ({ ...module, prizes: [...module.prizes, ...rows] }))
    setModal(null)
  }

  const exportConfig = () => {
    const blob = new Blob([JSON.stringify({ moduleId: activeId, title: current.title, prizes: current.prizes }, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `lucky-${activeId}-prizes.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const seedEnabled = (enable) => updateModule(activeId, (module) => ({ ...module, prizes: module.prizes.map((prize) => ({ ...prize, enabled: enable })) }))
  const normalizeWeights = () => updateModule(activeId, (module) => {
    const totalTarget = 100
    const enabled = module.prizes.filter((prize) => prize.enabled)
    const total = enabled.reduce((sum, prize) => sum + Number(prize.weight || 0), 0)
    if (!total) return module
    const setIds = new Set(enabled.map((p) => p.id))
    let distributed = 0
    const next = module.prizes.map((prize, index, arr) => {
      if (!setIds.has(prize.id)) return prize
      const isLast = index === arr.findLastIndex((p) => setIds.has(p.id))
      const ratio = Number(prize.weight) / total
      const value = isLast ? totalTarget - distributed : Math.round(ratio * totalTarget)
      distributed += value
      return { ...prize, weight: Math.max(1, value) }
    })
    return { ...module, prizes: next }
  })

  const switchModule = (moduleId) => { setActiveId(moduleId); setSidebarOpen(false); setSearch('') }

  return (
    <div className="admin-shell">
      <aside className={`admin-sidebar ${sidebarOpen ? 'is-open' : ''}`}>
        <div className="admin-brand">
          <span><Sparkles size={19} /></span>
          <div><b>Lucky</b><small>抽奖管理平台</small></div>
          <button onClick={() => setSidebarOpen(false)} aria-label="关闭"><X size={19} /></button>
        </div>
        <nav>
          <p>工作台</p>
          <button className="active-static"><LayoutDashboard size={18} />概览</button>
          <p>抽奖管理</p>
          {modules.map((module) => {
            const Icon = moduleIcons[module.id]
            return (
              <button
                className={activeId === module.id ? 'active' : ''}
                onClick={() => switchModule(module.id)}
                key={module.id}
              >
                <Icon size={18} />{module.short}管理<span>{data[module.id].prizes.length}</span>
              </button>
            )
          })}
          <p>系统</p>
          <button><BarChart3 size={18} />数据统计</button>
          <button><Settings size={18} />系统设置</button>
        </nav>
        <div className="sidebar-help">
          <span><Gift size={20} /></span>
          <b>需要帮助？</b>
          <p>查看使用指南与常见问题</p>
          <button>查看指南</button>
        </div>
        <div className="admin-user"><i>LM</i><div><b>Lucky Manager</b><small>超级管理员</small></div><ChevronDown size={16} /></div>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <button className="menu-button" onClick={() => setSidebarOpen(true)}><Menu size={20} /></button>
          <div>
            <h1>{activeModule.short}管理</h1>
            <p>管理活动名称、奖池内容与中奖概率</p>
          </div>
          <a href="/" target="_blank" rel="noreferrer">预览抽奖页 <span>↗</span></a>
        </header>

        <section className="admin-content">
          <div className="activity-card">
            <div className="activity-icon" style={{ '--module-color': activeModule.accent }}>{ReactIcon(moduleIcons[activeId])}</div>
            <div className="activity-info">
              <span>当前活动名称</span>
              <input
                value={current.title}
                onChange={(event) => updateModule(activeId, { ...current, title: event.target.value })}
              />
              <p><i /> 活动配置已实时同步至抽奖页面</p>
            </div>
            <div className="activity-status">
              <span>运行状态</span>
              <b><i /> 正常运行</b>
            </div>
          </div>

          <div className="stat-grid">
            <StatCard label="奖品总数" value={current.prizes.length} suffix="个" icon={<Gift />} tone="violet" note="奖池中的全部奖品" />
            <StatCard
              label="已启用奖品"
              value={activeCount}
              suffix="个"
              icon={<Check />}
              tone="mint"
              note={`占全部奖品 ${current.prizes.length ? Math.round(activeCount / current.prizes.length * 100) : 0}%`}
            />
            <StatCard label="当前总权重" value={totalWeight} suffix="" icon={<BarChart3 />} tone="amber" note="实际概率自动归一化" />
          </div>

          <div className="quick-actions">
            <button onClick={() => seedEnabled(true)} disabled={!current.prizes.length || activeCount === current.prizes.length}><Check size={15} />全部启用</button>
            <button onClick={() => seedEnabled(false)} disabled={!current.prizes.length || activeCount === 0}><X size={15} />全部停用</button>
            <button onClick={normalizeWeights} disabled={!activeCount}>权重归一</button>
          </div>

          <div className="prize-panel">
            <div className="panel-head">
              <div>
                <h2>奖池配置</h2>
                <p>权重越高，中奖概率越大；实际概率按启用奖品权重总和自动计算</p>
              </div>
              <div className="panel-actions">
                <button className="secondary" onClick={() => setModal({ type: 'import' })}><FileUp size={16} />批量导入</button>
                <button className="secondary" onClick={exportConfig} disabled={!current.prizes.length}><Download size={15} />导出配置</button>
                <button className="primary" onClick={() => setModal({ type: 'edit' })}><Plus size={17} />添加奖品</button>
              </div>
            </div>

            <div className="table-tools">
              <label>
                <Search size={17} />
                <input placeholder="搜索奖品名称" value={search} onChange={(event) => setSearch(event.target.value)} />
              </label>
              <div>
                <span>共 {current.prizes.length} 个奖品 · {filtered.length} 个匹配</span>
                <button onClick={() => setModal({ type: 'clear' })} disabled={!current.prizes.length}><Trash2 size={15} />清空奖池</button>
              </div>
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>奖品信息</th>
                    <th>权重设置</th>
                    <th>实际概率</th>
                    <th>状态</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((prize) => (
                    <tr key={prize.id} className={prize.enabled ? '' : 'is-disabled'}>
                      <td>
                        <div className="prize-name">
                          <i style={{ '--prize-color': prize.color }}>{prize.icon}</i>
                          <div><b>{prize.name}</b><span>{prize.detail}</span></div>
                        </div>
                      </td>
                      <td>
                        <div className="weight-control">
                          <input
                            type="number"
                            min="1"
                            max="100"
                            value={prize.weight}
                            onChange={(event) => patchPrize(prize.id, { weight: Math.min(100, Math.max(1, Number(event.target.value) || 1)) })}
                          />
                          <span>%</span>
                          <div><i style={{ width: `${prize.weight}%` }} /></div>
                        </div>
                      </td>
                      <td>
                        <div className="probability">
                          <b>{probabilities[prize.id].toFixed(2)}%</b>
                          <span>约 1 / {probabilities[prize.id] ? Math.round(100 / probabilities[prize.id]) : '∞'}</span>
                        </div>
                      </td>
                      <td>
                        <button
                          className={`switch ${prize.enabled ? 'on' : ''}`}
                          onClick={() => patchPrize(prize.id, { enabled: !prize.enabled })}
                          aria-label={prize.enabled ? '停用奖品' : '启用奖品'}
                        ><i /></button>
                        <span className="status-label">{prize.enabled ? '已启用' : '已停用'}</span>
                      </td>
                      <td>
                        <div className="row-actions">
                          <button onClick={() => setModal({ type: 'edit', prize })} title="编辑"><Pencil size={16} /></button>
                          <button className="danger" onClick={() => deletePrize(prize.id)} title="删除"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!filtered.length && (
                <div className="empty-state">
                  <Gift size={28} />
                  <b>暂无匹配奖品</b>
                  <p>试试更换关键词、添加新奖品或批量导入</p>
                </div>
              )}
            </div>
            <div className="panel-foot">
              <span><i /> 概率已根据当前启用奖品实时计算 · localStorage 持久化</span>
              <button onClick={exportConfig} disabled={!current.prizes.length}><Download size={15} />导出配置</button>
            </div>
          </div>
        </section>
      </main>

      {modal?.type === 'edit' && <PrizeModal prize={modal.prize} onClose={() => setModal(null)} onSave={savePrize} />}
      {modal?.type === 'import' && <ImportModal onClose={() => setModal(null)} onImport={importPrizes} />}
      {modal?.type === 'clear' && (
        <ConfirmModal
          onClose={() => setModal(null)}
          onConfirm={() => { updateModule(activeId, { ...current, prizes: [] }); setModal(null) }}
        />
      )}
    </div>
  )
}

function ReactIcon(Icon) { return <Icon size={24} /> }

function StatCard({ label, value, suffix, icon, tone, note }) {
  return (
    <div className={`stat-card ${tone}`}>
      <div className="stat-icon">{icon}</div>
      <div><span>{label}</span><b>{value}<small>{suffix}</small></b><p>{note}</p></div>
      <i className="stat-spark" />
    </div>
  )
}

function PrizeModal({ prize, onClose, onSave }) {
  const [values, setValues] = useState(
    prize || { name: '', detail: '', weight: 10, enabled: true, icon: '✦', color: '#8b80ff' },
  )
  const canSave = values.name.trim() && Number(values.weight) > 0
  return (
    <Modal title={prize ? '编辑奖品' : '添加奖品'} subtitle="配置奖品信息与抽中权重" onClose={onClose}>
      <div className="form-grid">
        <label className="wide">
          <span>奖品名称</span>
          <input autoFocus placeholder="例如：一等奖" value={values.name} onChange={(event) => setValues({ ...values, name: event.target.value })} />
        </label>
        <label className="wide">
          <span>奖品说明</span>
          <input placeholder="一句话描述奖品" value={values.detail} onChange={(event) => setValues({ ...values, detail: event.target.value })} />
        </label>
        <label>
          <span>权重（1-100）</span>
          <input type="number" min="1" max="100" value={values.weight} onChange={(event) => setValues({ ...values, weight: Math.min(100, Math.max(1, Number(event.target.value) || 1)) })} />
        </label>
        <label>
          <span>奖品符号</span>
          <input maxLength="2" value={values.icon} onChange={(event) => setValues({ ...values, icon: event.target.value })} />
        </label>
        <div className="icon-swatches">
          {ICON_OPTIONS.map((icon) => (
            <button key={icon} className={values.icon === icon ? 'on' : ''} onClick={() => setValues({ ...values, icon })}>{icon}</button>
          ))}
        </div>
        <label>
          <span>主题颜色</span>
          <input type="color" value={values.color} onChange={(event) => setValues({ ...values, color: event.target.value })} />
        </label>
        <div className="color-swatches">
          {COLOR_OPTIONS.map((color) => (
            <button key={color} className={values.color === color ? 'on' : ''} style={{ background: color }} onClick={() => setValues({ ...values, color })} />
          ))}
        </div>
        <label className="enabled-check">
          <span>初始状态</span>
          <button className={`switch ${values.enabled ? 'on' : ''}`} onClick={() => setValues({ ...values, enabled: !values.enabled })}><i /></button>
          {values.enabled ? '启用' : '停用'}
        </label>
      </div>
      <div className="modal-actions">
        <button onClick={onClose}>取消</button>
        <button className="primary" disabled={!canSave} onClick={() => onSave({ ...values, name: values.name.trim(), detail: values.detail.trim() })}>{prize ? '保存修改' : '添加奖品'}</button>
      </div>
    </Modal>
  )
}

function ImportModal({ onClose, onImport }) {
  const [text, setText] = useState('')
  const count = useMemo(() => text.split('\n').filter((row) => row.trim()).length, [text])
  return (
    <Modal title="批量导入奖品" subtitle="每行一个奖品，支持逗号或 Tab 分隔" onClose={onClose}>
      <div className="import-example">
        <b>格式示例</b>
        <code>一等奖, 20, 高端智能礼盒<br />二等奖, 40, 品质生活礼包</code>
      </div>
      <label className="import-area">
        <textarea autoFocus placeholder="奖品名称, 权重, 奖品说明" value={text} onChange={(event) => setText(event.target.value)} />
        <span>已识别 {count} 条</span>
      </label>
      <div className="modal-actions">
        <button onClick={onClose}>取消</button>
        <button className="primary" disabled={!count} onClick={() => onImport(text)}>确认导入</button>
      </div>
    </Modal>
  )
}

function ConfirmModal({ onClose, onConfirm }) {
  return (
    <Modal title="清空当前奖池？" subtitle="此操作无法撤销，请谨慎操作" onClose={onClose}>
      <div className="confirm-body">
        <span><Trash2 size={24} /></span>
        <p>清空后当前模块将无法进行抽奖，你可以稍后重新添加或批量导入奖品。</p>
      </div>
      <div className="modal-actions">
        <button onClick={onClose}>取消</button>
        <button className="delete-confirm" onClick={onConfirm}>确认清空</button>
      </div>
    </Modal>
  )
}

function Modal({ title, subtitle, onClose, children }) {
  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="admin-modal">
        <div className="modal-head">
          <div><h3>{title}</h3><p>{subtitle}</p></div>
          <button onClick={onClose} aria-label="关闭"><X size={19} /></button>
        </div>
        {children}
      </div>
    </div>
  )
}
