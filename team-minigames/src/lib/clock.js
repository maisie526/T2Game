import { useEffect, useRef, useState } from 'react'

/** 일정 간격으로 리렌더 (카운트다운 표시용) */
export function useNow(ms = 250) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), ms)
    return () => clearInterval(t)
  }, [ms])
  return now
}

/**
 * 기기마다 시계가 다를 수 있어서, 상태(key)가 바뀐 "로컬 수신 시각" + duration 으로 마감 시각을 계산
 */
export function useLocalDeadline(key, durationMs) {
  const ref = useRef({ key: null, at: 0 })
  if (ref.current.key !== key) ref.current = { key, at: Date.now() }
  return ref.current.at + (durationMs || 0)
}
