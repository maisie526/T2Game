import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from './supabase'

/**
 * 실시간 방 (Supabase Realtime: Presence + Broadcast)
 * - 가장 먼저 들어온 사람이 호스트가 되어 게임 상태(state)를 관리하고 브로드캐스트합니다.
 * - 호스트가 나가면 다음 사람이 마지막 상태를 이어받습니다.
 */
export function useRoom(game, code, me, initialState) {
  const [players, setPlayers] = useState([])
  const [state, setStateLocal] = useState(initialState)
  const [connected, setConnected] = useState(false)
  const channelRef = useRef(null)
  const handlersRef = useRef({})
  const stateRef = useRef(initialState)
  const joinedAt = useRef(Date.now())

  const hostId = players[0]?.id
  const isHost = !!me && hostId === me.id
  const isHostRef = useRef(false)
  isHostRef.current = isHost

  useEffect(() => {
    if (!me || !code) return
    const channel = supabase.channel(`${game}:${code}`, {
      config: { broadcast: { self: true }, presence: { key: me.id } },
    })
    channelRef.current = channel

    const syncPlayers = () => {
      const ps = Object.values(channel.presenceState())
        .map((arr) => arr[0])
        .filter(Boolean)
        .sort((a, b) => a.joinedAt - b.joinedAt || a.id.localeCompare(b.id))
      setPlayers(ps)
    }

    channel
      .on('presence', { event: 'sync' }, syncPlayers)
      .on('presence', { event: 'join' }, () => {
        // 새로 들어온 사람에게 현재 상태 공유
        if (isHostRef.current) {
          setTimeout(() => channel.send({ type: 'broadcast', event: 'msg', payload: { type: 'state', data: stateRef.current } }), 300)
        }
      })
      .on('broadcast', { event: 'msg' }, ({ payload }) => {
        if (payload.type === 'state') {
          stateRef.current = payload.data
          setStateLocal(payload.data)
        } else {
          handlersRef.current[payload.type]?.(payload.data, payload.from)
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          setConnected(true)
          await channel.track({ id: me.id, nickname: me.nickname, color: me.color, joinedAt: joinedAt.current })
        }
      })

    return () => {
      supabase.removeChannel(channel)
      channelRef.current = null
      setConnected(false)
    }
  }, [game, code, me])

  const send = useCallback((type, data) => {
    channelRef.current?.send({ type: 'broadcast', event: 'msg', payload: { type, data, from: me?.id } })
  }, [me])

  /** 호스트만 호출: 상태 변경 후 모두에게 전파 */
  const setState = useCallback((updater) => {
    const next = typeof updater === 'function' ? updater(stateRef.current) : updater
    stateRef.current = next
    setStateLocal(next)
    channelRef.current?.send({ type: 'broadcast', event: 'msg', payload: { type: 'state', data: next } })
  }, [])

  const on = useCallback((type, handler) => {
    handlersRef.current[type] = handler
  }, [])

  return useMemo(
    () => ({ players, state, setState, stateRef, send, on, isHost, hostId, connected }),
    [players, state, setState, send, on, isHost, hostId, connected],
  )
}
