'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

interface Build {
  id: string
  title: string
  year: number
  make: string
  model: string
  hpStock: number | null
  hpTuned: number | null
  totalCost: number
  isPublic: boolean
  slug: string
  mods: any[]
  _count: { likes: number }
  createdAt: string
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [builds, setBuilds] = useState<Build[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/builds')
      .then(r => r.json())
      .then(data => {
        setBuilds(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">My Builds</h1>
          <p className="text-gray-400 text-sm mt-1">
            Welcome back{session?.user?.name ? `, ${session.user.name}` : ''}
          </p>
        </div>
        <Link
          href="/dashboard/builds/new"
          className="bg-red-600 hover:bg-red-500 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-colors"
        >
          + New Build
        </Link>
      </div>

      {loading ? (
        <div className="text-gray-400">Loading builds...</div>
      ) : builds.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-gray-800 rounded-2xl">
          <div className="text-5xl mb-4">🔧</div>
          <h2 className="text-xl font-bold mb-2">No builds yet</h2>
          <p className="text-gray-400 mb-6">Create your first build to start tracking your mods</p>
          <Link
            href="/dashboard/builds/new"
            className="bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-xl font-medium transition-colors"
          >
            Create First Build
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {builds.map((build) => (
            <Link
              key={build.id}
              href={`/dashboard/builds/${build.id}`}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-gray-600 transition-colors block"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-white">{build.title}</h3>
                  <p className="text-gray-400 text-sm">{build.year} {build.make} {build.model}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-lg ${build.isPublic ? 'bg-green-600/20 text-green-400' : 'bg-gray-700 text-gray-400'}`}>
                  {build.isPublic ? 'Public' : 'Private'}
                </span>
              </div>

              {(build.hpStock || build.hpTuned) && (
                <div className="flex items-center gap-3 mb-4">
                  {build.hpStock && (
                    <div className="text-center">
                      <div className="font-bold">{build.hpStock}</div>
                      <div className="text-xs text-gray-500">Stock HP</div>
                    </div>
                  )}
                  {build.hpStock && build.hpTuned && <div className="text-red-500">→</div>}
                  {build.hpTuned && (
                    <div className="text-center">
                      <div className="font-bold text-red-400">{build.hpTuned}</div>
                      <div className="text-xs text-gray-500">Tuned HP</div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between text-sm text-gray-400 pt-4 border-t border-gray-800">
                <span>{build.mods.length} mods</span>
                <span className="font-medium text-white">${build.totalCost.toLocaleString()}</span>
                <span>❤️ {build._count.likes}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
