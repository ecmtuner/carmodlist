'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

const CATEGORIES = ['Engine', 'Tune', 'Exhaust', 'Suspension', 'Wheels & Tires', 'Brakes', 'Interior', 'Exterior', 'Other']

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
  isPublic: boolean
  slug: string
  mods: Mod[]
  _count: { likes: number }
}

const emptyMod = {
  category: 'Engine',
  name: '',
  brand: '',
  vendorUrl: '',
  price: '',
  installDate: '',
  notes: '',
  tunerName: '',
  tunerUrl: '',
}

export default function BuildDetailPage() {
  const { id } = useParams() as { id: string }
  const { data: session } = useSession()
  const router = useRouter()
  const [build, setBuild] = useState<Build | null>(null)
  const [loading, setLoading] = useState(true)
  const [showModForm, setShowModForm] = useState(false)
  const [modForm, setModForm] = useState(emptyMod)
  const [savingMod, setSavingMod] = useState(false)

  const fetchBuild = () => {
    fetch(`/api/builds/${id}`)
      .then(r => r.json())
      .then(data => {
        setBuild(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    fetchBuild()
  }, [id])

  const groupedMods = build?.mods.reduce((acc: Record<string, Mod[]>, mod) => {
    if (!acc[mod.category]) acc[mod.category] = []
    acc[mod.category].push(mod)
    return acc
  }, {}) || {}

  const handleAddMod = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingMod(true)

    const res = await fetch(`/api/builds/${id}/mods`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(modForm)
    })

    if (res.ok) {
      setModForm(emptyMod)
      setShowModForm(false)
      fetchBuild()
    }
    setSavingMod(false)
  }

  const handleDeleteMod = async (modId: string) => {
    if (!confirm('Delete this mod?')) return
    await fetch(`/api/mods/${modId}`, { method: 'DELETE' })
    fetchBuild()
  }

  const handleDelete = async () => {
    if (!confirm('Delete this entire build? This cannot be undone.')) return
    await fetch(`/api/builds/${id}`, { method: 'DELETE' })
    router.push('/dashboard')
  }

  const inputClass = "w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-600 text-sm"

  if (loading) return <div className="text-gray-400">Loading...</div>
  if (!build) return <div className="text-gray-400">Build not found</div>

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <Link href="/dashboard" className="text-gray-400 hover:text-white text-sm">← My Builds</Link>
          <h1 className="text-2xl font-bold mt-2">{build.title}</h1>
          <p className="text-gray-400">{build.year} {build.make} {build.model}{build.trim ? ` ${build.trim}` : ''}</p>
        </div>
        <div className="flex gap-3">
          {build.isPublic && (
            <Link
              href={`/${(session?.user as any)?.username}/${build.slug}`}
              target="_blank"
              className="border border-gray-700 hover:border-gray-500 text-gray-300 px-4 py-2 rounded-xl text-sm transition-colors"
            >
              View Public ↗
            </Link>
          )}
          <button
            onClick={handleDelete}
            className="border border-red-800 hover:border-red-600 text-red-400 px-4 py-2 rounded-xl text-sm transition-colors"
          >
            Delete Build
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 text-center">
          <div className="text-2xl font-black text-red-400">${build.totalCost.toLocaleString()}</div>
          <div className="text-xs text-gray-500 mt-1">Total Cost</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 text-center">
          <div className="text-2xl font-black">{build.mods.length}</div>
          <div className="text-xs text-gray-500 mt-1">Mods</div>
        </div>
        {build.hpStock && build.hpTuned && (
          <>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 text-center">
              <div className="text-2xl font-black">{build.hpStock} → <span className="text-red-400">{build.hpTuned}</span></div>
              <div className="text-xs text-gray-500 mt-1">HP Stock → Tuned</div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 text-center">
              <div className="text-2xl font-black text-green-400">+{build.hpTuned - build.hpStock}</div>
              <div className="text-xs text-gray-500 mt-1">HP Gain</div>
            </div>
          </>
        )}
      </div>

      {/* Mods Section */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold">Mods</h2>
          <button
            onClick={() => setShowModForm(!showModForm)}
            className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          >
            {showModForm ? 'Cancel' : '+ Add Mod'}
          </button>
        </div>

        {/* Add Mod Form */}
        {showModForm && (
          <form onSubmit={handleAddMod} className="bg-gray-800 rounded-2xl p-6 mb-6 space-y-4">
            <h3 className="font-bold mb-2">New Mod</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Category *</label>
                <select
                  required
                  value={modForm.category}
                  onChange={e => setModForm({ ...modForm, category: e.target.value })}
                  className={inputClass}
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Mod Name *</label>
                <input
                  required
                  type="text"
                  value={modForm.name}
                  onChange={e => setModForm({ ...modForm, name: e.target.value })}
                  className={inputClass}
                  placeholder="e.g. Wagner Intercooler"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Brand</label>
                <input
                  type="text"
                  value={modForm.brand}
                  onChange={e => setModForm({ ...modForm, brand: e.target.value })}
                  className={inputClass}
                  placeholder="e.g. Wagner"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Price ($)</label>
                <input
                  type="number"
                  value={modForm.price}
                  onChange={e => setModForm({ ...modForm, price: e.target.value })}
                  className={inputClass}
                  placeholder="e.g. 850"
                  step="0.01"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Vendor URL</label>
                <input
                  type="url"
                  value={modForm.vendorUrl}
                  onChange={e => setModForm({ ...modForm, vendorUrl: e.target.value })}
                  className={inputClass}
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Install Date</label>
                <input
                  type="date"
                  value={modForm.installDate}
                  onChange={e => setModForm({ ...modForm, installDate: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>

            {modForm.category === 'Tune' && (
              <div className="grid grid-cols-2 gap-4 p-4 bg-red-900/20 border border-red-800/30 rounded-xl">
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Tuner Name</label>
                  <input
                    type="text"
                    value={modForm.tunerName}
                    onChange={e => setModForm({ ...modForm, tunerName: e.target.value })}
                    className={inputClass}
                    placeholder="e.g. ECMTuner"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Tuner URL</label>
                  <input
                    type="url"
                    value={modForm.tunerUrl}
                    onChange={e => setModForm({ ...modForm, tunerUrl: e.target.value })}
                    className={inputClass}
                    placeholder="https://ecmtuner.com"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Notes</label>
              <textarea
                value={modForm.notes}
                onChange={e => setModForm({ ...modForm, notes: e.target.value })}
                className={`${inputClass} resize-none`}
                rows={2}
                placeholder="Any notes about this mod..."
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={savingMod}
                className="bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors"
              >
                {savingMod ? 'Saving...' : 'Save Mod'}
              </button>
              <button
                type="button"
                onClick={() => setShowModForm(false)}
                className="border border-gray-700 text-gray-400 px-6 py-2.5 rounded-xl text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Grouped Mods */}
        {Object.keys(groupedMods).length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No mods yet. Click "Add Mod" to get started.
          </div>
        ) : (
          Object.entries(groupedMods).map(([category, mods]) => (
            <div key={category} className="mb-6">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">{category}</h3>
              <div className="space-y-2">
                {mods.map((mod) => (
                  <div key={mod.id} className="flex items-center justify-between bg-gray-800/50 rounded-xl px-4 py-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{mod.name}</span>
                        {mod.brand && <span className="text-xs text-gray-500">{mod.brand}</span>}
                        {mod.isTune && mod.tunerUrl?.includes('ecmtuner.com') && (
                          <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-lg">🔧 Powered by ECMTuner</span>
                        )}
                        {mod.isTune && mod.tunerName && !mod.tunerUrl?.includes('ecmtuner.com') && (
                          <span className="bg-gray-700 text-gray-300 text-xs px-2 py-0.5 rounded-lg">🔧 {mod.tunerName}</span>
                        )}
                      </div>
                      {mod.notes && <div className="text-xs text-gray-500 mt-0.5">{mod.notes}</div>}
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      {mod.price && <span className="text-sm font-medium text-green-400">${mod.price.toLocaleString()}</span>}
                      {mod.vendorUrl && (
                        <a href={mod.vendorUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:text-blue-300">
                          Buy ↗
                        </a>
                      )}
                      <button
                        onClick={() => handleDeleteMod(mod.id)}
                        className="text-gray-600 hover:text-red-400 text-xs transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Quick Info */}
      {build.description && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="font-bold mb-3">About this build</h2>
          <p className="text-gray-400 text-sm leading-relaxed">{build.description}</p>
        </div>
      )}
    </div>
  )
}
