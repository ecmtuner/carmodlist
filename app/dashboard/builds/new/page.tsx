'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const MAKES = ['BMW', 'Mercedes', 'Porsche', 'Aston Martin', 'Lamborghini', 'Ferrari', 'Audi', 'Volkswagen', 'Other']
const FUELS = ['Pump', 'E30', 'E40', 'E50', 'E85']
const YEARS = Array.from({ length: 2026 - 1990 + 1 }, (_, i) => 2026 - i)

export default function NewBuildPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    title: '',
    year: '2024',
    make: 'BMW',
    model: '',
    trim: '',
    hpStock: '',
    hpTuned: '',
    torqueStock: '',
    torqueTuned: '',
    fuel: 'Pump',
    description: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/builds', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error || 'Failed to create build')
      setLoading(false)
      return
    }

    const build = await res.json()
    router.push(`/dashboard/builds/${build.id}`)
  }

  const inputClass = "w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-600"

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/dashboard" className="text-gray-400 hover:text-white">← Back</Link>
        <div className="w-px h-4 bg-gray-700" />
        <h1 className="text-2xl font-bold">New Build</h1>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-800 text-red-400 px-4 py-3 rounded-xl text-sm mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
          <h2 className="font-bold text-lg mb-4">Build Info</h2>

          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Build Title *</label>
            <input
              required
              type="text"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              className={inputClass}
              placeholder="e.g. F80 M3 Stage 2 Build"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Year *</label>
              <select
                required
                value={form.year}
                onChange={e => setForm({ ...form, year: e.target.value })}
                className={inputClass}
              >
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Make *</label>
              <select
                required
                value={form.make}
                onChange={e => setForm({ ...form, make: e.target.value })}
                className={inputClass}
              >
                {MAKES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Model *</label>
              <input
                required
                type="text"
                value={form.model}
                onChange={e => setForm({ ...form, model: e.target.value })}
                className={inputClass}
                placeholder="e.g. M3, C63, GT3"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Trim</label>
              <input
                type="text"
                value={form.trim}
                onChange={e => setForm({ ...form, trim: e.target.value })}
                className={inputClass}
                placeholder="e.g. Competition"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Fuel</label>
            <select
              value={form.fuel}
              onChange={e => setForm({ ...form, fuel: e.target.value })}
              className={inputClass}
            >
              {FUELS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
          <h2 className="font-bold text-lg mb-4">Performance</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">HP Stock</label>
              <input
                type="number"
                value={form.hpStock}
                onChange={e => setForm({ ...form, hpStock: e.target.value })}
                className={inputClass}
                placeholder="e.g. 425"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">HP Tuned</label>
              <input
                type="number"
                value={form.hpTuned}
                onChange={e => setForm({ ...form, hpTuned: e.target.value })}
                className={inputClass}
                placeholder="e.g. 520"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Torque Stock (lb-ft)</label>
              <input
                type="number"
                value={form.torqueStock}
                onChange={e => setForm({ ...form, torqueStock: e.target.value })}
                className={inputClass}
                placeholder="e.g. 406"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Torque Tuned (lb-ft)</label>
              <input
                type="number"
                value={form.torqueTuned}
                onChange={e => setForm({ ...form, torqueTuned: e.target.value })}
                className={inputClass}
                placeholder="e.g. 490"
              />
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="font-bold text-lg mb-4">Description</h2>
          <textarea
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            className={`${inputClass} resize-none`}
            rows={4}
            placeholder="Tell the story of your build..."
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white px-8 py-3 rounded-xl font-bold transition-colors"
          >
            {loading ? 'Creating...' : 'Create Build'}
          </button>
          <Link
            href="/dashboard"
            className="border border-gray-700 hover:border-gray-500 text-gray-300 px-8 py-3 rounded-xl font-medium transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
