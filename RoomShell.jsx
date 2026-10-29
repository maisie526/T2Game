import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Avatar } from '../App'

export function RoomHeader({ title, code, room }) {
  const [copied, setCopied] = useState(false)
  const [showLink, setShowLink] = useState(false)
  const link = window.location.href

  const copy = async () => {
    let ok = false
    // 1) 최신 클립보드 API (https + 권한 필요)
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(link)
        ok = true
      }
    } catch { /* 다음 방법 시도 */ }
    // 2) 예전 방식 (임시 입력창 선택 후 복사)
    if (!ok) {
      try {
        const ta = document.createElement('textarea')
        ta.value = link
        ta.setAttribute('readonly', '')
        ta.style.position = 'fixed'
        ta.style.opacity = '0'
        document.body.appendChild(ta)
        ta.select()
        ta.setSelectionRange(0, link.length)
        ok = document.execCommand('copy')
        document.body.removeChild(ta)
      } catch { /* 실패 */ }
    }
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } else {
      // 3) 둘 다 막혀 있으면 링크를 직접 보여줘서 손으로 복사
      setShowLink(true)
    }
  }

  return (
    <>
    {showLink && (
      <div className="card row wrap link-box">
        <span className="small muted">자동 복사가 막혀 있어요. 아래 링크를 길게 누르거나 드래그해서 복사하세요.</span>
        <input className="input grow" readOnly value={link} onFocus={(e) => e.target.select()} autoFocus />
        <button className="btn sm" onClick={() => setShowLink(false)}>닫기</button>
      </div>
    )}
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
    </>
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
