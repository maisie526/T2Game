import { useState } from 'react'
import { supabase } from '../lib/supabase'

/** 이름만 입력하고 입장. 같은 이름으로 다시 들어오면 기존 기록이 이어집니다. */
export default function Login({ onEnter }) {
  const [name, setName] = useState('')
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  const enter = async (e) => {
    e.preventDefault()
    const nickname = name.trim().slice(0, 16)
    if (!nickname) return
    setBusy(true); setMsg('')
    let { data, error } = await supabase.from('profiles').select('*').eq('nickname', nickname).maybeSingle()
    if (!data && !error) {
      const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#3b82f6', '#6366f1', '#a855f7', '#ec4899']
      const color = colors[Math.floor(Math.random() * colors.length)]
      ;({ data, error } = await supabase.from('profiles').insert({ nickname, color }).select().single())
    }
    setBusy(false)
    if (error || !data) return setMsg('입장하지 못했어요. 잠시 후 다시 시도해 주세요.')
    onEnter(data)
  }

  return (
    <div className="login">
      <div className="card login-card">
        <div className="login-emoji">🎮</div>
        <h1>팀 미니게임</h1>
        <p className="muted">반응속도 · 실시간 퀴즈 · 그림 맞추기</p>
        <form onSubmit={enter} className="stack">
          <input className="input" placeholder="이름을 입력하세요" value={name} onChange={(e) => setName(e.target.value)} maxLength={16} autoFocus />
          <button className="btn primary" disabled={busy || !name.trim()}>{busy ? '입장 중…' : '입장하기'}</button>
        </form>
        <p className="muted small">같은 이름으로 들어오면 내 기록이 이어져요.</p>
        {msg && <p className="msg">{msg}</p>}
      </div>
    </div>
  )
}
