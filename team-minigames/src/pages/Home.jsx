import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Avatar } from '../App'

const GAMES = [
  { id: 'reaction', to: '/reaction', emoji: '⚡', title: '반응속도 대결', desc: '초록색이 되면 바로 클릭! 5번 평균으로 랭킹 경쟁', tag: '혼자 플레이', color: '#f59e0b' },
  { id: 'quiz', to: '/quiz', emoji: '🧠', title: '실시간 퀴즈', desc: '같은 방에서 동시에 문제 풀기. 빠르고 정확할수록 고득점', tag: '방 만들기', color: '#6366f1' },
  { id: 'drawing', to: '/draw', emoji: '🎨', title: '그림 맞추기', desc: '한 명이 그리고 나머지가 실시간으로 맞추기', tag: '방 만들기', color: '#ec4899' },
]

const BOARD_LABEL = {
  reaction: { title: '⚡ 반응속도 (최고 기록)', unit: 'ms' },
  quiz: { title: '🧠 퀴즈 (누적 점수)', unit: '점' },
  drawing: { title: '🎨 그림 맞추기 (누적 점수)', unit: '점' },
}

export default function Home({ me }) {
  const [tab, setTab] = useState('reaction')
  const [rows, setRows] = useState(null)

  useEffect(() => {
    setRows(null)
    supabase
      .from('leaderboard')
      .select('*')
      .eq('game', tab)
      .order('best', { ascending: tab === 'reaction' })
      .limit(20)
      .then(({ data }) => setRows(data || []))
  }, [tab])

  return (
    <div className="stack lg">
      <section>
        <h2 className="section-title">어떤 게임 할까요, {me.nickname}님?</h2>
        <div className="game-grid">
          {GAMES.map((g) => (
            <Link key={g.id} to={g.to} className="game-card" style={{ '--accent': g.color }}>
              <div className="game-emoji">{g.emoji}</div>
              <div className="game-title">{g.title}</div>
              <div className="muted small">{g.desc}</div>
              <span className="pill">{g.tag}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="card">
        <div className="row between wrap">
          <h3>🏆 랭킹</h3>
          <div className="tabs">
            {Object.keys(BOARD_LABEL).map((k) => (
              <button key={k} className={'tab' + (tab === k ? ' active' : '')} onClick={() => setTab(k)}>
                {BOARD_LABEL[k].title.split(' (')[0]}
              </button>
            ))}
          </div>
        </div>
        <p className="muted small">{BOARD_LABEL[tab].title}</p>
        {rows === null ? (
          <p className="muted">불러오는 중…</p>
        ) : rows.length === 0 ? (
          <p className="muted">아직 기록이 없어요. 첫 기록을 세워보세요!</p>
        ) : (
          <ol className="board">
            {rows.map((r, i) => (
              <li key={r.user_id} className={r.user_id === me.id ? 'me' : ''}>
                <span className="rank">{['🥇', '🥈', '🥉'][i] || i + 1}</span>
                <Avatar p={r} size={28} />
                <span className="grow">{r.nickname}</span>
                <span className="muted small">{r.plays}판</span>
                <b>{Number(r.best).toLocaleString()}{BOARD_LABEL[tab].unit}</b>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  )
}
