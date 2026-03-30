'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

interface MessageUser {
  id: string
  username: string
  name?: string | null
  avatar?: string | null
}

interface Message {
  id: string
  senderId: string
  receiverId: string
  text: string
  read: boolean
  createdAt: string
  sender: MessageUser
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}

export default function MessageThreadPage() {
  const { userId } = useParams() as { userId: string }
  const { data: session } = useSession()
  const currentUserId = (session?.user as any)?.id as string | undefined

  const [messages, setMessages] = useState<Message[]>([])
  const [otherUser, setOtherUser] = useState<MessageUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchMessages = useCallback(async (isInitial = false) => {
    try {
      const res = await fetch(`/api/messages/${userId}`)
      const data = await res.json()
      if (data.messages) {
        setMessages(data.messages)
        if (isInitial && data.otherUser) setOtherUser(data.otherUser)
        if (isInitial) setLoading(false)
      }
    } catch {
      if (isInitial) setLoading(false)
    }
  }, [userId])

  // Initial load
  useEffect(() => {
    fetchMessages(true)
  }, [fetchMessages])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Poll every 5 seconds
  useEffect(() => {
    pollingRef.current = setInterval(() => fetchMessages(false), 5000)
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [fetchMessages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim() || sending) return
    setSending(true)
    try {
      const res = await fetch(`/api/messages/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      if (res.ok) {
        setText('')
        await fetchMessages(false)
      }
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto flex items-center justify-center py-16">
        <div className="text-gray-400">Loading...</div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-120px)]">
      {/* Header */}
      <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-800">
        <Link
          href="/dashboard/messages"
          className="text-gray-400 hover:text-white transition-colors"
        >
          ← Back
        </Link>
        {otherUser && (
          <>
            <div className="flex-shrink-0">
              {otherUser.avatar ? (
                <img src={otherUser.avatar} alt="" className="w-9 h-9 rounded-full object-cover" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-red-600 flex items-center justify-center text-white font-bold">
                  {otherUser.username[0].toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <Link
                href={`/${otherUser.username}`}
                className="font-semibold hover:text-red-400 transition-colors"
              >
                @{otherUser.username}
              </Link>
              {otherUser.name && (
                <div className="text-xs text-gray-500">{otherUser.name}</div>
              )}
            </div>
            <Link
              href={`/${otherUser.username}`}
              className="text-xs text-red-400 hover:text-red-300 transition-colors flex-shrink-0"
            >
              View Profile →
            </Link>
          </>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 text-sm py-8">
            No messages yet. Say hello! 👋
          </div>
        ) : (
          messages.map(msg => {
            const isSent = msg.senderId === currentUserId
            return (
              <div
                key={msg.id}
                className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[75%] ${isSent ? 'items-end' : 'items-start'} flex flex-col`}>
                  <div
                    className={`px-4 py-2.5 rounded-2xl text-sm break-words ${
                      isSent
                        ? 'bg-red-600/20 border border-red-800 text-white rounded-br-sm'
                        : 'bg-gray-800 text-gray-100 rounded-bl-sm'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-xs text-gray-600 mt-1 px-1">
                    {timeAgo(msg.createdAt)}
                  </span>
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="flex gap-3 mt-4 pt-4 border-t border-gray-800">
        <input
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          maxLength={1000}
          placeholder="Type a message..."
          className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-red-600 text-sm"
        />
        <button
          type="submit"
          disabled={sending || !text.trim()}
          className="bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
        >
          {sending ? '...' : 'Send'}
        </button>
      </form>
    </div>
  )
}
