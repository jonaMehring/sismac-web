'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Notification } from '@/lib/types'

export function useNotifications(userId: string | undefined) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const supabase = createClient()

  const loadNotifications = useCallback(async () => {
    if (!userId) return
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('usuario_id', userId)
      .order('created_at', { ascending: false })
      .limit(30)

    if (data) {
      const notifs = data as unknown as Notification[]
      setNotifications(notifs)
      setUnreadCount(notifs.filter(n => !n.leida).length)
    }
  }, [userId])

  useEffect(() => {
    if (!userId) return

    loadNotifications()

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `usuario_id=eq.${userId}`,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      }, (payload: any) => {
        const newNotif = payload.new as Notification
        setNotifications(prev => [newNotif, ...prev])
        setUnreadCount(prev => prev + 1)
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId])

  const markRead = async (id: string) => {
    await supabase
      .from('notifications')
      .update({ leida: true, leida_en: new Date().toISOString() })
      .eq('id', id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, leida: true } : n))
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const markAllRead = async () => {
    if (!userId) return
    await supabase
      .from('notifications')
      .update({ leida: true, leida_en: new Date().toISOString() })
      .eq('usuario_id', userId)
      .eq('leida', false)
    setNotifications(prev => prev.map(n => ({ ...n, leida: true })))
    setUnreadCount(0)
  }

  return { notifications, unreadCount, markRead, markAllRead, reload: loadNotifications }
}
