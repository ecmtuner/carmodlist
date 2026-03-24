'use client'

import { useEffect, useState, useRef } from 'react'
import { useSession } from 'next-auth/react'

export default function SettingsPage() {
  const { data: session, update } = useSession()
  const [form, setForm] = useState({ name: '', username: '', bio: '', avatar: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [avatarUploading, setAvatarUploading] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement>(null)

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

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { alert('Image must be under 5MB'); return }
    setAvatarUploading(true)
    const data = new FormData()
    data.append('file', file)
    const res = await fetch('/api/upload/avatar', { method: 'POST', body: data })
    const json = await res.json()
    if (json.url) setForm(f => ({ ...f, avatar: json.url }))
    else alert(json.error || 'Upload failed')
    setAvatarUploading(false)
  }

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
            <label className="block text-sm text-gray-400 mb-1.5">Avatar</label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gray-700 border border-gray-600 overflow-hidden flex-shrink-0 flex items-center justify-center">
                {form.avatar
                  ? <img src={form.avatar} alt="avatar" className="w-full h-full object-cover" />
                  : <span className="text-2xl text-gray-400">{form.name?.[0]?.toUpperCase() || '?'}</span>
                }
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={avatarUploading}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white text-sm rounded-xl font-medium transition-colors"
                >
                  {avatarUploading ? 'Uploading...' : form.avatar ? 'Change Photo' : 'Upload Photo'}
                </button>
                {form.avatar && (
                  <button type="button" onClick={() => setForm(f => ({ ...f, avatar: '' }))} className="ml-2 text-xs text-red-400 hover:text-red-300">Remove</button>
                )}
                <p className="text-xs text-gray-500 mt-1">PNG, JPG · Max 5MB</p>
                <input ref={avatarInputRef} type="file" accept="image/png,image/jpeg,image/jpg,image/webp" onChange={handleAvatarUpload} className="hidden" />
              </div>
            </div>
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
