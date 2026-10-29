import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { saveScore } from '../lib/supabase'

const ROUNDS = 5

export default function Reaction({ me }) {
  const [phase, setPhase] = useState('idle') // idle | wait | go | early | result | done
  const [times, setTimes] = useState([])
  const [last, setLast] = useState(null)
  const [saved, setSaved] = useState(false)
  const timer = useRef(null)
  const goAt = useRef(0)

  useEffect(() => () => clearTimeout(timer.current), [])

  const startWait = () => {
    setPhase('wait')
    timer.current = setTimeout(() => {
      goAt.current = performance.now()
      setPhase('go')
    }, 1500 + Math.random() * 2500)
  }

  const handle = () => {
    if (phase === 'idle' || phase === 'result' || phase === 'early') return startWait()
    if (phase === 'wait') {
      clearTimeout(timer.current)
      return setPhase('early')
    }
    if (phase === 'go') {
      const ms = Math.round(performance.now() - goAt.current)
      const next = [...times, ms]
      setLast(ms)
      setTimes(next)
      if (next.length >= ROUNDS) {
        setPhase('done')
        const avg = Math.round(next.reduce((a, b) => a + b, 0) / next.length)
        saveScore(me.id, 'reaction', avg, { times: next }).then(setSaved)
      } else setPhase('result')
    }
  }

  const reset = () => { setTimes([]); setLast(null); setSaved(false); setPhase('idle') }
  const avg = times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : null

  const view = {
    idle: { cls: 'idle', title: '⚡ 반응속도 대결', sub: `화면이 초록색으로 바뀌면 최대한 빨리 클릭하세요. 총 ${ROUNDS}번!`, cta: '클릭해서 시작' },
    wait: { cls: 'wait', title: '기다리세요…', sub: '초록색이 되면 클릭!' },
    go: { cls: 'go', title: '지금 클릭!', sub: '' },
    early: { cls: 'early', title: '너무 빨라요 😅', sub: '이번 시도는 무효예요. 클릭해서 다시' },
    result: { cls: 'idle', title: `${last}ms`, sub: `${times.length}/${ROUNDS} 완료 · 클릭해서 다음` },
  }[phase]

  if (phase === 'done') {
    return (
      <div className="narrow stack lg center-text">
        <div className="big-emoji">🏁</div>
        <h2>평균 {avg}ms</h2>
        <p className="muted">{rating(avg)}</p>
        <div className="times">{times.map((t, i) => <span key={i} className="pill">{t}ms</span>)}</div>
        <p className="muted small">{saved ? '랭킹에 기록됐어요 ✅' : '기록 저장 중…'}</p>
        <div className="row center">
          <button className="btn primary" onClick={reset}>다시 하기</button>
          <Link className="btn" to="/">랭킹 보기</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="reaction-wrap">
      <button className={'reaction ' + view.cls} onMouseDown={handle} onTouchStart={(e) => { e.preventDefault(); handle() }}>
        <div className="reaction-title">{view.title}</div>
        {view.sub && <div className="reaction-sub">{view.sub}</div>}
        {view.cta && <div className="pill light">{view.cta}</div>}
      </button>
      <div className="row center muted small">
        {times.map((t, i) => <span key={i} className="pill">{t}ms</span>)}
        {avg && <span>평균 {avg}ms</span>}
      </div>
    </div>
  )
}

function rating(ms) {
  if (ms < 220) return '🔥 프로게이머급!'
  if (ms < 270) return '👍 아주 빨라요'
  if (ms < 330) return '🙂 평균 이상'
  return '☕ 커피 한 잔 하고 다시?'
}
