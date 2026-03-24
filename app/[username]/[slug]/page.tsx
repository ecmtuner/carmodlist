'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

interface Mod {
  id: string
  category: string
  name: string
  brand?: string
  vendorUrl?: string
  price?: number
  installDate?: string
  notes?: string
  isTune: boolean
  tunerName?: string
  tunerUrl?: string
}

interface Build {
  id: string
  title: string
  year: number
  make: string
  model: string
  trim?: string
  hpStock?: number
  hpTuned?: number
  torqueStock?: number
  torqueTuned?: number
  fuel?: string
  description?: string
  totalCost: number
  slug: string
  mods: Mod[]
  user: { username: string; name?: string; avatar?: string }
  _count: { likes: number }
}

export default function PublicBuildPage() {
  const { username, slug } = useParams() as { username: string; slug: string }
  const { data: session } = useSession()
  const [build, setBuild] = useState<Build | null>(null)
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [following, setFollowing] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetch(`/api/public/${username}/${slug}`)
      .then(r => r.json())
      .then(data => {
        if (data.id) {
          setBuild(data)
          setLikeCount(data._count.likes)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [username, slug])

  const groupedMods = build?.mods.reduce((acc: Record<string, Mod[]>, mod) => {
    if (!acc[mod.category]) acc[mod.category] = []
    acc[mod.category].push(mod)
    return acc
  }, {}) || {}

  const tuneMod = build?.mods.find(m => m.isTune && m.tunerName)

  const handleLike = async () => {
    if (!session?.user) { window.location.href = '/login'; return }
    const res = await fetch(`/api/builds/${build?.id}/like`, { method: 'POST' })
    const data = await res.json()
    setLiked(data.liked)
    setLikeCount(prev => data.liked ? prev + 1 : prev - 1)
  }

  const handleFollow = async () => {
    if (!session?.user) { window.location.href = '/login'; return }
    const res = await fetch(`/api/users/${username}/follow`, { method: 'POST' })
    const data = await res.json()
    setFollowing(data.following)
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    )
  }

  if (!build) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🔍</div>
          <h1 className="text-xl font-bold mb-2">Build not found</h1>
          <Link href="/discover" className="text-red-400">Browse builds →</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Nav */}
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold flex items-center gap-2">
          <span className="text-red-500">🔧</span> CarModList
        </Link>
        <div className="flex items-center gap-3">
          <button
            onClick={handleShare}
            className="border border-gray-700 hover:border-gray-500 text-gray-300 px-4 py-2 rounded-xl text-sm transition-colors"
          >
            {copied ? '✓ Copied!' : '🔗 Share'}
          </button>
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
        {/* Hero */}
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 mb-8">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-black mb-2">{build.title}</h1>
              <p className="text-xl text-gray-400">
                {build.year} {build.make} {build.model}
                {build.trim ? ` ${build.trim}` : ''}
              </p>
              {build.fuel && (
                <span className="inline-block mt-2 bg-red-600/20 text-red-400 text-sm px-3 py-1 rounded-lg">
                  ⛽ {build.fuel}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleFollow}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-colors border ${
                  following
                    ? 'border-gray-600 bg-gray-800 text-gray-300'
                    : 'border-gray-700 hover:border-gray-500 text-gray-300'
                }`}
              >
                {following ? '✓ Following' : `Follow @${build.user.username}`}
              </button>
              <button
                onClick={handleLike}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  liked ? 'bg-red-600 text-white' : 'border border-gray-700 hover:border-red-600 text-gray-300'
                }`}
              >
                {liked ? '❤️' : '🤍'} {likeCount}
              </button>
            </div>
          </div>

          {/* HP / Torque Graphic */}
          {(build.hpStock || build.hpTuned) && (
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
              {build.hpStock && (
                <div className="bg-gray-800 rounded-2xl p-4 text-center">
                  <div className="text-3xl font-black">{build.hpStock}</div>
                  <div className="text-sm text-gray-500 mt-1">HP Stock</div>
                </div>
              )}
              {build.hpStock && build.hpTuned && (
                <div className="flex items-center justify-center text-red-500 text-3xl font-black">→</div>
              )}
              {build.hpTuned && (
                <div className="bg-red-900/30 border border-red-800/30 rounded-2xl p-4 text-center">
                  <div className="text-3xl font-black text-red-400">{build.hpTuned}</div>
                  <div className="text-sm text-gray-500 mt-1">HP Tuned</div>
                </div>
              )}
              {build.hpStock && build.hpTuned && (
                <div className="bg-green-900/20 border border-green-800/20 rounded-2xl p-4 text-center">
                  <div className="text-3xl font-black text-green-400">+{build.hpTuned - build.hpStock}</div>
                  <div className="text-sm text-gray-500 mt-1">HP Gain</div>
                </div>
              )}
            </div>
          )}

          {/* Tune Badge */}
          {tuneMod && (
            <div className="mt-6">
              {tuneMod.tunerUrl?.includes('ecmtuner.com') ? (
                <a
                  href={tuneMod.tunerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-bold"
                >
                  🔧 Powered by ECMTuner
                </a>
              ) : (
                <div className="inline-flex items-center gap-2 bg-gray-800 text-gray-300 px-4 py-2 rounded-xl text-sm font-medium">
                  🔧 Tuned by{' '}
                  {tuneMod.tunerUrl ? (
                    <a href={tuneMod.tunerUrl} target="_blank" rel="noopener noreferrer" className="text-red-400 hover:text-red-300">
                      {tuneMod.tunerName}
                    </a>
                  ) : tuneMod.tunerName}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Total Cost */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8 flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-400">Total Build Investment</div>
            <div className="text-4xl font-black text-red-400 mt-1">${build.totalCost.toLocaleString()}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400">Mods</div>
            <div className="text-4xl font-black">{build.mods.length}</div>
          </div>
        </div>

        {/* Mods grouped */}
        {Object.entries(groupedMods).map(([category, mods]) => (
          <div key={category} className="mb-8">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              {category}
              <span className="text-sm text-gray-500 font-normal">{mods.length} mod{mods.length !== 1 ? 's' : ''}</span>
            </h2>
            <div className="space-y-3">
              {mods.map((mod) => (
                <div key={mod.id} className="bg-gray-900 border border-gray-800 rounded-2xl px-6 py-4 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-semibold">{mod.name}</span>
                      {mod.brand && <span className="text-sm text-gray-400">{mod.brand}</span>}
                      {mod.isTune && mod.tunerUrl?.includes('ecmtuner.com') && (
                        <a
                          href={mod.tunerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-lg"
                        >
                          🔧 Powered by ECMTuner
                        </a>
                      )}
                      {mod.isTune && mod.tunerName && !mod.tunerUrl?.includes('ecmtuner.com') && (
                        <span className="bg-gray-700 text-gray-300 text-xs px-2 py-0.5 rounded-lg">
                          🔧 {mod.tunerName}
                        </span>
                      )}
                    </div>
                    {mod.notes && <div className="text-sm text-gray-500 mt-1">{mod.notes}</div>}
                    {mod.installDate && <div className="text-xs text-gray-600 mt-0.5">Installed: {mod.installDate}</div>}
                  </div>
                  <div className="flex items-center gap-4 ml-4 shrink-0">
                    {mod.price && (
                      <span className="font-bold text-green-400">${mod.price.toLocaleString()}</span>
                    )}
                    {mod.vendorUrl && (
                      <a
                        href={mod.vendorUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Buy ↗
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {build.description && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mt-8">
            <h2 className="font-bold mb-3">About This Build</h2>
            <p className="text-gray-400 leading-relaxed">{build.description}</p>
          </div>
        )}

        {/* Author */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mt-8 flex items-center gap-4">
          {build.user.avatar ? (
            <img src={build.user.avatar} alt="" className="w-12 h-12 rounded-full" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center font-bold text-xl">
              {build.user.username[0].toUpperCase()}
            </div>
          )}
          <div>
            <div className="font-bold">@{build.user.username}</div>
            {build.user.name && <div className="text-gray-400 text-sm">{build.user.name}</div>}
          </div>
          <Link
            href={`/${build.user.username}`}
            className="ml-auto text-sm text-red-400 hover:text-red-300"
          >
            View Profile →
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 px-6 py-8 text-center text-gray-500 text-sm mt-8">
        <p>
          Built with{' '}
          <Link href="/" className="text-red-400 hover:text-red-300">CarModList</Link>
          {' '} · Built for car enthusiasts by{' '}
          <a href="https://ecmtuner.com" target="_blank" rel="noopener noreferrer" className="text-red-400 hover:text-red-300">ECMTuner</a>
        </p>
      </footer>
    </div>
  )
}
