import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { makeRoomCode } from '../lib/supabase'

export default function RoomEntry({ game, title, emoji }) {
  const nav = useNavigate()
  const [code, setCode] = useState('')

  return (
    <div className="narrow stack lg">
      <div className="center-text">
        <div className="big-emoji">{emoji}</div>
        <h2>{title}</h2>
        <p className="muted">방을 만들고 링크나 코드를 팀원에게 공유하세요.</p>
      </div>
      <button className="btn primary lg" onClick={() => nav(`/${game}/${makeRoomCode()}`)}>새 방 만들기</button>
      <div className="divider"><span>또는</span></div>
      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault()
          const c = code.trim().toUpperCase()
          if (c) nav(`/${game}/${c}`)
        }}
      >
        <input className="input code grow" placeholder="방 코드 (예: K7QM)" value={code} onChange={(e) => setCode(e.target.value)} maxLength={6} />
        <button className="btn">입장</button>
      </form>
    </div>
  )
}
