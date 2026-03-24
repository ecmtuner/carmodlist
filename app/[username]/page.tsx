'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

interface Profile {
  id: string
  username: string
  name?: string
  bio?: string
  avatar?: string
  _count: { builds: number; followers: number; following: number }
  builds: {
    id: string
    title: string
    year: number
    make: string
    model: string
    hpStock?: number
    hpTuned?: number
    totalCost: number
    slug: string
    _count: { likes: number }
  }[]
}

export default function ProfilePage() {
  const { username } = useParams() as { username: string }
  const { data: session } = useSession()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [following, setFollowing] = useState(false)

  useEffect(() => {
    fetch(`/api/public/users/${username}`)
      .then(r => r.json())
      .then(data => {
        if (data.id) setProfile(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [username])

  const handleFollow = async () => {
    if (!session?.user) { window.location.href = '/login'; return }
    const res = await fetch(`/api/users/${username}/follow`, { method: 'POST' })
    const data = await res.json()
    setFollowing(data.following)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-gray-400">
        User not found
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold flex items-center gap-2">
          <span className="text-red-500">🔧</span> CarModList
        </Link>
        <div className="flex items-center gap-4">
          {session?.user ? (
            <Link href="/dashboard" className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
              Dashboard
            </Link>
          ) : (
            <Link href="/signup" className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
              Sign Up
            </Link>
          )}
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Profile header */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 mb-8 flex items-start gap-6">
          {profile.avatar ? (
            <img src={profile.avatar} alt="" className="w-20 h-20 rounded-full" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-red-600 flex items-center justify-center text-3xl font-black">
              {profile.username[0].toUpperCase()}
            </div>
          )}

          <div className="flex-1">
            <h1 className="text-2xl font-black">@{profile.username}</h1>
            {profile.name && <p className="text-gray-400 mt-1">{profile.name}</p>}
            {profile.bio && <p className="text-gray-300 mt-3 max-w-lg">{profile.bio}</p>}

            <div className="flex gap-6 mt-4 text-sm">
              <div>
                <span className="font-bold">{profile._count.builds}</span>{' '}
                <span className="text-gray-400">builds</span>
              </div>
              <div>
                <span className="font-bold">{profile._count.followers}</span>{' '}
                <span className="text-gray-400">followers</span>
              </div>
              <div>
                <span className="font-bold">{profile._count.following}</span>{' '}
                <span className="text-gray-400">following</span>
              </div>
            </div>
          </div>

          {session && (session.user as any)?.username !== username && (
            <button
              onClick={handleFollow}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-colors border ${
                following
                  ? 'border-gray-600 bg-gray-800 text-gray-300'
                  : 'border-red-600 bg-red-600 text-white hover:bg-red-500'
              }`}
            >
              {following ? '✓ Following' : 'Follow'}
            </button>
          )}
        </div>

        {/* Builds grid */}
        <h2 className="text-xl font-bold mb-6">Builds</h2>
        {profile.builds.length === 0 ? (
          <div className="text-center py-16 text-gray-500 border border-dashed border-gray-800 rounded-2xl">
            No public builds yet
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {profile.builds.map((build) => (
              <Link
                key={build.id}
                href={`/${profile.username}/${build.slug}`}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-gray-600 transition-colors block"
              >
                <h3 className="font-bold mb-1">{build.title}</h3>
                <p className="text-gray-400 text-sm mb-4">{build.year} {build.make} {build.model}</p>

                {build.hpStock && build.hpTuned && (
                  <div className="flex items-center gap-2 mb-4 text-sm">
                    <span>{build.hpStock} HP</span>
                    <span className="text-red-500">→</span>
                    <span className="text-red-400 font-bold">{build.hpTuned} HP</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm text-gray-400 pt-4 border-t border-gray-800">
                  <span>${build.totalCost.toLocaleString()}</span>
                  <span>❤️ {build._count.likes}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <footer className="border-t border-gray-800 px-6 py-8 text-center text-gray-500 text-sm mt-8">
        <p>Built for car enthusiasts by <a href="https://ecmtuner.com" target="_blank" rel="noopener noreferrer" className="text-red-400">ECMTuner</a></p>
      </footer>
    </div>
  )
}
