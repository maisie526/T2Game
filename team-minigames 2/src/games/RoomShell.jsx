import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Avatar } from '../App'

export function RoomHeader({ title, code, room }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch { /* 클립보드 권한 없음 */ }
  }
  return (
    <div className="row between wrap room-header">
      <div className="row">
        <Link to="/" className="btn ghost sm">← 홈</Link>
        <h2>{title}</h2>
      </div>
      <div className="row">
        <span className={'dot ' + (room.connected ? 'on' : '')} />
        <span className="code-badge">방 코드 {code}</span>
        <button className="btn sm" onClick={copy}>{copied ? '복사됨 ✓' : '초대 링크 복사'}</button>
      </div>
    </div>
  )
}

export function PlayerList({ room, scores = {}, highlight = {}, meId }) {
  const sorted = [...room.players].sort((a, b) => (scores[b.id] || 0) - (scores[a.id] || 0))
  return (
    <ul className="players">
      {sorted.map((p) => (
        <li key={p.id} className={(p.id === meId ? 'me ' : '') + (highlight[p.id] ? 'hl' : '')}>
          <Avatar p={p} size={28} />
          <span className="grow ellipsis">
            {p.nickname}
            {p.id === room.hostId && <span className="host-tag">방장</span>}
          </span>
          {highlight[p.id] && <span className="small">{highlight[p.id]}</span>}
          <b>{scores[p.id] || 0}</b>
        </li>
      ))}
    </ul>
  )
}

export function Lobby({ room, onStart, minPlayers = 1, hint }) {
  return (
    <div className="card stack center-text">
      <div className="big-emoji">👋</div>
      <h3>팀원을 기다리는 중 ({room.players.length}명)</h3>
      <p className="muted small">초대 링크를 복사해서 공유하세요. {hint}</p>
      {room.isHost ? (
        <button className="btn primary lg" disabled={room.players.length < minPlayers} onClick={onStart}>
          {room.players.length < minPlayers ? `최소 ${minPlayers}명 필요` : '게임 시작'}
        </button>
      ) : (
        <p className="muted">방장이 시작하면 바로 시작돼요.</p>
      )}
    </div>
  )
}

export function Countdown({ endsAt }) {
  const left = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000))
  return <span className={'countdown' + (left <= 5 ? ' urgent' : '')}>{left}</span>
}
