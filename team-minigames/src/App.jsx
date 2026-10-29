import { useEffect, useState } from 'react'
import { Link, Navigate, Route, Routes } from 'react-router-dom'
import { supabase } from './lib/supabase'
import Login from './pages/Login'
import Home from './pages/Home'
import RoomEntry from './pages/RoomEntry'
import Reaction from './games/Reaction'
import Quiz from './games/Quiz'
import Drawing from './games/Drawing'

export default function App() {
  const [session, setSession] = useState(undefined)
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session) { setProfile(null); return }
    const uid = session.user.id
    ;(async () => {
      let { data } = await supabase.from('profiles').select('*').eq('id', uid).maybeSingle()
      if (!data) {
        const nickname = session.user.user_metadata?.full_name || session.user.email.split('@')[0]
        const res = await supabase.from('profiles').insert({ id: uid, nickname }).select().single()
        data = res.data
      }
      setProfile(data)
    })()
  }, [session])

  if (session === undefined) return <div className="center muted">불러오는 중…</div>
  if (!session) return <Login />
  if (!profile) return <div className="center muted">프로필 준비 중…</div>

  return (
    <div className="app">
      <Header profile={profile} onProfile={setProfile} />
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

function Header({ profile, onProfile }) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(profile.nickname)

  const save = async () => {
    const nickname = name.trim().slice(0, 16)
    if (!nickname) return
    const { data } = await supabase.from('profiles').update({ nickname }).eq('id', profile.id).select().single()
    if (data) onProfile(data)
    setEditing(false)
  }

  return (
    <header className="header">
      <Link to="/" className="brand">🎮 팀 미니게임</Link>
      <div className="header-right">
        {editing ? (
          <form className="row" onSubmit={(e) => { e.preventDefault(); save() }}>
            <input className="input sm" value={name} onChange={(e) => setName(e.target.value)} autoFocus maxLength={16} />
            <button className="btn sm">저장</button>
          </form>
        ) : (
          <button className="chip" onClick={() => setEditing(true)} title="닉네임 변경">
            <Avatar p={profile} size={24} /> {profile.nickname}
          </button>
        )}
        <button className="btn ghost sm" onClick={() => supabase.auth.signOut()}>로그아웃</button>
      </div>
    </header>
  )
}

export function Avatar({ p, size = 32 }) {
  return (
    <span className="avatar" style={{ background: p?.color || '#999', width: size, height: size, fontSize: size * 0.45 }}>
      {(p?.nickname || '?').slice(0, 1).toUpperCase()}
    </span>
  )
}
