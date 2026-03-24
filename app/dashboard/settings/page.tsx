'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

export default function SettingsPage() {
  const { data: session, update } = useSession()
  const [form, setForm] = useState({ name: '', username: '', bio: '', avatar: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (session?.user) {
      const user = session.user as any
      setForm({
        name: user.name || '',
        username: user.username || '',
        bio: user.bio || '',
        avatar: user.image || '',
      })
    }
  }, [session])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSuccess(false)
    setError('')

    const res = await fetch('/api/users/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })

    if (res.ok) {
      setSuccess(true)
      await update()
    } else {
      const data = await res.json()
      setError(data.error || 'Failed to save')
    }

    setLoading(false)
  }

  const inputClass = "w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-600"

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold mb-8">Settings</h1>

      {success && (
        <div className="bg-green-900/30 border border-green-800 text-green-400 px-4 py-3 rounded-xl text-sm mb-6">
          Settings saved!
        </div>
      )}
      {error && (
        <div className="bg-red-900/30 border border-red-800 text-red-400 px-4 py-3 rounded-xl text-sm mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
          <h2 className="font-bold">Profile</h2>

          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className={inputClass}
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Username</label>
            <input
              type="text"
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
              className={inputClass}
              placeholder="your_username"
            />
            <p className="text-xs text-gray-500 mt-1">carmodlist.com/{form.username}</p>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Bio</label>
            <textarea
              value={form.bio}
              onChange={e => setForm({ ...form, bio: e.target.value })}
              className={`${inputClass} resize-none`}
              rows={3}
              placeholder="Tell the community about yourself..."
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Avatar URL</label>
            <input
              type="url"
              value={form.avatar}
              onChange={e => setForm({ ...form, avatar: e.target.value })}
              className={inputClass}
              placeholder="https://..."
            />
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="font-bold mb-4">Plan</h2>
          <div className="flex items-center gap-3">
            <span className="bg-gray-700 text-gray-300 px-3 py-1 rounded-lg text-sm font-medium">Free</span>
            <span className="text-gray-400 text-sm">Unlimited builds, all features included</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white px-8 py-3 rounded-xl font-bold transition-colors"
        >
          {loading ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  )
}
