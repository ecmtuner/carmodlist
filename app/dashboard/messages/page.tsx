'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface ConversationUser {
  id: string
  username: string
  name?: string | null
  avatar?: string | null
}

interface Conversation {
  user: ConversationUser
  lastMessage: {
    text: string
    createdAt: string
    senderId: string
  }
  unreadCount: number
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

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/messages')
      .then(r => r.json())
      .then(data => {
        setConversations(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-black">💬 Messages</h1>
      </div>

      {loading ? (
        <div className="text-gray-400 text-center py-16">Loading...</div>
      ) : conversations.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center">
          <div className="text-5xl mb-4">💬</div>
          <h2 className="text-lg font-bold mb-2">No messages yet</h2>
          <p className="text-gray-500 text-sm mb-6">
            Start a conversation by messaging someone on their build page.
          </p>
          <Link
            href="/discover"
            className="inline-block bg-red-600 hover:bg-red-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
          >
            Discover Builds →
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map(conv => (
            <Link
              key={conv.user.id}
              href={`/dashboard/messages/${conv.user.id}`}
              className="flex items-center gap-4 bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-2xl px-5 py-4 transition-colors group"
            >
              {/* Avatar */}
              <div className="flex-shrink-0">
                {conv.user.avatar ? (
                  <img
                    src={conv.user.avatar}
                    alt=""
                    className="w-11 h-11 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-lg">
                    {conv.user.username[0].toUpperCase()}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-sm truncate">@{conv.user.username}</span>
                  <span className="text-xs text-gray-500 flex-shrink-0">
                    {timeAgo(conv.lastMessage.createdAt)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 mt-0.5">
                  <p className="text-sm text-gray-400 truncate">{conv.lastMessage.text}</p>
                  {conv.unreadCount > 0 && (
                    <span className="flex-shrink-0 bg-red-600 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
