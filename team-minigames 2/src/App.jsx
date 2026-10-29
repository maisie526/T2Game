import { useEffect, useState } from 'react'
import { Link, Navigate, Route, Routes } from 'react-router-dom'
import { supabase } from './lib/supabase'
import Login from './pages/Login'
import Home from './pages/Home'
import RoomEntry from './pages/RoomEntry'
import Reaction from './games/Reaction'
import Quiz from './games/Quiz'
import Drawing from './games/Drawing'

const KEY = 'team-minigames-profile-id'
const store = {
  get: () => { try { return localStorage.getItem(KEY) } catch { return null } },
  set: (v) => { try { localStorage.setItem(KEY, v) } catch { /* 저장 불가 */ } },
  clear: () => { try { localStorage.removeItem(KEY) } catch { /* 저장 불가 */ } },
}

export default function App() {
  const [profile, setProfile] = useState(undefined)

  // 이 기기에서 전에 입장한 이름이 있으면 자동 입장
  useEffect(() => {
    const id = store.get()
    if (!id) return setProfile(null)
    supabase.from('profiles').select('*').eq('id', id).maybeSingle()
      .then(({ data }) => setProfile(data || null))
  }, [])

  const enter = (p) => { store.set(p.id); setProfile(p) }
  const leave = () => { store.clear(); setProfile(null) }

  if (profile === undefined) return <div className="center muted">불러오는 중…</div>
  if (!profile) return <Login onEnter={enter} />

  return (
    <div className="app">
      <header className="header">
        <Link to="/" className="brand">🎮 팀 미니게임</Link>
        <div className="header-right">
          <span className="chip"><Avatar p={profile} size={24} /> {profile.nickname}</span>
          <button className="btn ghost sm" onClick={leave}>나가기</button>
        </div>
      </header>
      <main className="main">
        <Routes>
          <Route path="/" element={<Home me={profile} />} />
          <Route path="/reaction" element={<Reaction me={profile} />} />
          <Route path="/quiz" element={<RoomEntry game="quiz" title="실시간 퀴즈" emoji="🧠" />} />
          <Route path="/quiz/:code" element={<Quiz me={profile} />} />
          <Route path="/draw" element={<RoomEntry game="draw" title="그림 맞추기" emoji="🎨" />} />
          <Route path="/draw/:code" element={<Drawing me={profile} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  )
}

export function Avatar({ p, size = 32 }) {
  return (
    <span className="avatar" style={{ background: p?.color || '#999', width: size, height: size, fontSize: size * 0.45 }}>
      {(p?.nickname || '?').slice(0, 1).toUpperCase()}
    </span>
  )
}
