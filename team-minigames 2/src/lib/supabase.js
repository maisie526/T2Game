import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  // publishable 키는 공개용이라 코드에 넣어도 안전해요 (데이터 보호는 RLS가 담당)
  import.meta.env.VITE_SUPABASE_URL || 'https://cxysgaemxdenpxrvktks.supabase.co',
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_5srsUNzTNDOXMbuat85vfQ_UQo5kmSj',
)

export async function saveScore(userId, game, score, meta = {}) {
  const { error } = await supabase.from('game_scores').insert({ user_id: userId, game, score, meta })
  if (error) console.error('점수 저장 실패', error)
  return !error
}

export function makeRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
