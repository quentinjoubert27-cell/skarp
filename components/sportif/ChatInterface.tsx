'use client'

import { useState, useRef, useEffect } from 'react'
import { useMessages } from '@/lib/hooks/useMessages'
import Button from '@/components/ui/Button'

interface Props {
  relationshipId: string
  currentUserId: string
}

export default function ChatInterface({ relationshipId, currentUserId }: Props) {
  const { messages, sendMessage } = useMessages(relationshipId)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return
    setSending(true)
    await sendMessage(currentUserId, text.trim())
    setText('')
    setSending(false)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-220px)] border border-white/8">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-white/25 py-12 text-sm">Aucun message — commencez la conversation</div>
        )}
        {messages.map(m => {
          const isMine = m.sender_id === currentUserId
          return (
            <div key={m.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs md:max-w-md px-4 py-2.5 text-sm leading-relaxed ${
                isMine ? 'bg-lime text-carbon' : 'bg-cards text-white border border-white/6'
              }`}>
                {m.contenu}
                <div className={`text-[10px] mt-1 ${isMine ? 'text-carbon/50' : 'text-white/25'}`}>
                  {new Date(m.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="border-t border-white/8 p-4 flex gap-3">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Votre message…"
          className="flex-1 bg-cards border border-white/8 text-white text-sm px-4 py-2.5 outline-none focus:border-lime/30 placeholder:text-white/25"
        />
        <Button type="submit" loading={sending} disabled={!text.trim()} variant="lime">
          Envoyer
        </Button>
      </form>
    </div>
  )
}
