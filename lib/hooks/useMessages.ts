'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Message } from '@/types/database.types'

export function useMessages(relationshipId: string) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  // Chargement initial
  useEffect(() => {
    if (!relationshipId) return

    const load = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('relationship_id', relationshipId)
        .order('created_at', { ascending: true })
      setMessages(data || [])
      setLoading(false)
    }
    load()

    // Subscription Realtime
    const channel = supabase
      .channel(`messages-${relationshipId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `relationship_id=eq.${relationshipId}`,
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as Message])
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [relationshipId])

  const sendMessage = useCallback(async (senderId: string, contenu: string) => {
    if (!contenu.trim()) return
    await supabase.from('messages').insert({
      relationship_id: relationshipId,
      sender_id: senderId,
      contenu: contenu.trim(),
    })
  }, [relationshipId])

  const markAsRead = useCallback(async (senderId: string) => {
    await supabase
      .from('messages')
      .update({ lu: true })
      .eq('relationship_id', relationshipId)
      .neq('sender_id', senderId)
      .eq('lu', false)
  }, [relationshipId])

  return { messages, loading, sendMessage, markAsRead }
}
