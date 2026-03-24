'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const MAKES = ['All', 'BMW', 'Mercedes', 'Porsche', 'Aston Martin', 'Lamborghini', 'Ferrari', 'Audi', 'Volkswagen', 'Other']
const SORTS = [
  { value: 'latest', label: 'Latest' },
  { value: 'liked', label: 'Most Liked' },
  { value: 'expensive', label: 'Most Expensive' },
]

interface Build {
  id: string
  title: string
  year: number
  make: string
  model: string
  hpStock?: number
  hpTuned?: number
  fuel?: string
  totalCost: number
  slug: string
  user: { username: string; name?: string }
  _count: { likes: number; mods: number }
}

export default function DiscoverPage() {
  const [builds, setBuilds] = useState<Build[]>([])
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState('latest')
  const [make, setMake] = useState('All')

  useEffect(() => {
    const params = new URLSearchParams({ sort, make })
    fetch(`/api/discover?${params}`)
      .then(r => r.json())
      .then(data => {
        setBuilds(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [sort, make])

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Nav */}
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold flex items-center gap-2">
          <span className="text-red-500">🔧</span> CarModList
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-gray-400 hover:text-white text-sm">Login</Link>
          <Link href="/signup" className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
            Sign Up
          </Link>
        </div>
      </nav>

      <div className="px-6 py-12 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Discover Builds</h1>
        <p className="text-gray-400 mb-8">See what the community is building</p>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-8">
          <div className="flex gap-2">
            {SORTS.map(s => (
              <button
                key={s.value}
                onClick={() => setSort(s.value)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  sort === s.value ? 'bg-red-600 text-white' : 'border border-gray-700 text-gray-400 hover:text-white'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2 flex-wrap">
            {MAKES.map(m => (
              <button
                key={m}
                onClick={() => setMake(m)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                  make === m ? 'bg-gray-700 text-white' : 'border border-gray-800 text-gray-500 hover:text-white'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-gray-400">Loading builds...</div>
        ) : builds.length === 0 ? (
          <div className="text-center py-24 text-gray-500">
            <div className="text-5xl mb-4">🏎️</div>
            <p>No builds found</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {builds.map((build) => (
              <Link
                key={build.id}
                href={`/${build.user.username}/${build.slug}`}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-gray-600 transition-colors block"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold">{build.title}</h3>
                    <p className="text-gray-400 text-sm">{build.year} {build.make} {build.model}</p>
                  </div>
                  {build.fuel && (
                    <span className="bg-red-600/20 text-red-400 text-xs px-2 py-1 rounded-lg">{build.fuel}</span>
                  )}
                </div>

                {build.hpStock && build.hpTuned && (
                  <div className="flex items-center gap-3 mb-4">
                    <div className="text-center">
                      <div className="font-bold">{build.hpStock}</div>
                      <div className="text-xs text-gray-500">Stock</div>
                    </div>
                    <div className="text-red-500 text-xl">→</div>
                    <div className="text-center">
                      <div className="font-bold text-red-400">{build.hpTuned}</div>
                      <div className="text-xs text-gray-500">Tuned</div>
                    </div>
                    <div className="ml-auto text-center">
                      <div className="font-bold text-green-400">+{build.hpTuned - build.hpStock}</div>
                      <div className="text-xs text-gray-500">HP</div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm text-gray-400 pt-4 border-t border-gray-800">
                  <span>@{build.user.username}</span>
                  <span>${build.totalCost.toLocaleString()}</span>
                  <span>❤️ {build._count.likes}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <footer className="border-t border-gray-800 px-6 py-8 text-center text-gray-500 text-sm mt-16">
        <p>Built for car enthusiasts by <a href="https://ecmtuner.com" target="_blank" rel="noopener noreferrer" className="text-red-400">ECMTuner</a></p>
      </footer>
    </div>
  )
}
