'use client'

import { useEffect, useRef, useState } from 'react'
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

interface BuildPhoto {
  id: string
  url: string
  publicId: string
  order: number
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
  coverImage?: string
  youtubeUrl?: string
  run060?: number
  run0100?: number
  runQuarter?: number
  runTrap?: number
  run60130?: number
  run100150?: number
  run150200?: number
  mods: Mod[]
  photos: BuildPhoto[]
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
  const [editingModId, setEditingModId] = useState<string | null>(null)
  const [brandSuggestions, setBrandSuggestions] = useState<string[]>([])
  const brandDatalistId = 'brand-suggestions'
  const [linkPreview, setLinkPreview] = useState<{ image: string | null; title: string | null } | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [settingCover, setSettingCover] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

    if (editingModId) {
      // Edit existing mod
      const res = await fetch(`/api/mods/${editingModId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(modForm)
      })
      if (res.ok) {
        setModForm(emptyMod)
        setShowModForm(false)
        setEditingModId(null)
        setLinkPreview(null)
        fetchBuild()
      }
    } else {
      // Add new mod
      const res = await fetch(`/api/builds/${id}/mods`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(modForm)
      })
      if (res.ok) {
        setModForm(emptyMod)
        setShowModForm(false)
        setLinkPreview(null)
        fetchBuild()
      }
    }
    setSavingMod(false)
  }

  const handleEditMod = (mod: Mod) => {
    setModForm({
      category: mod.category,
      name: mod.name,
      brand: mod.brand || '',
      price: mod.price?.toString() || '',
      vendorUrl: mod.vendorUrl || '',
      installDate: mod.installDate || '',
      notes: mod.notes || '',
      isTune: mod.isTune,
      tunerName: mod.tunerName || '',
      tunerUrl: mod.tunerUrl || '',
    })
    setEditingModId(mod.id)
    setShowModForm(true)
    setLinkPreview(null)
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
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

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if ((build?.photos.length ?? 0) >= 10) {
      alert('Maximum 10 photos per build')
      return
    }

    setUploadingPhoto(true)
    const form = new FormData()
    form.append('file', file)

    try {
      const res = await fetch(`/api/builds/${id}/photos`, {
        method: 'POST',
        body: form,
      })
      if (res.ok) {
        fetchBuild()
      } else {
        const err = await res.json()
        alert(err.error || 'Upload failed')
      }
    } catch {
      alert('Upload failed')
    } finally {
      setUploadingPhoto(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDeletePhoto = async (photoId: string) => {
    if (!confirm('Delete this photo?')) return
    const res = await fetch(`/api/builds/${id}/photos?photoId=${photoId}`, { method: 'DELETE' })
    if (res.ok) fetchBuild()
  }

  const handleSetCover = async (photoUrl: string) => {
    setSettingCover(photoUrl)
    const res = await fetch(`/api/builds/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...build,
        coverImage: photoUrl,
      })
    })
    if (res.ok) fetchBuild()
    setSettingCover(null)
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

      {/* Photos Section */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Photos</h2>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500">{build.photos.length}/10</span>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPhoto || build.photos.length >= 10}
              className="bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
            >
              {uploadingPhoto ? 'Uploading...' : '+ Add Photo'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoUpload}
            />
          </div>
        </div>

        {build.photos.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <div className="text-4xl mb-2">📸</div>
            <p className="text-sm">No photos yet. Add up to 10 photos of your build.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {build.photos
              .sort((a, b) => a.order - b.order)
              .map((photo, index) => (
                <div key={photo.id} className="relative group aspect-square rounded-xl overflow-hidden bg-gray-800">
                  <img
                    src={photo.url}
                    alt={`Build photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {/* Cover badge */}
                  {build.coverImage === photo.url && (
                    <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded-lg font-medium">
                      Cover
                    </div>
                  )}
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                    {build.coverImage !== photo.url && (
                      <button
                        onClick={() => handleSetCover(photo.url)}
                        disabled={settingCover === photo.url}
                        className="bg-white text-black text-xs px-3 py-1.5 rounded-lg font-medium w-full text-center hover:bg-gray-200 transition-colors"
                      >
                        {settingCover === photo.url ? 'Setting...' : 'Set as Cover'}
                      </button>
                    )}
                    <button
                      onClick={() => handleDeletePhoto(photo.id)}
                      className="bg-red-600 hover:bg-red-500 text-white text-xs px-3 py-1.5 rounded-lg font-medium w-full text-center transition-colors"
                    >
                      Delete ✕
                    </button>
                  </div>
                </div>
              ))}
            {uploadingPhoto && (
              <div className="aspect-square rounded-xl bg-gray-800 flex items-center justify-center border-2 border-dashed border-gray-600">
                <div className="text-gray-400 text-sm text-center">
                  <div className="animate-spin text-2xl mb-1">⏳</div>
                  Uploading...
                </div>
              </div>
            )}
          </div>
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
            <h3 className="font-bold mb-2">{editingModId ? 'Edit Mod' : 'New Mod'}</h3>
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

            {/* Vendor URL — first so it auto-fills everything below */}
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Product Link <span className="text-gray-600">(paste first — auto-fills name, brand &amp; price)</span></label>
              <input
                type="text"
                value={modForm.vendorUrl}
                onChange={e => {
                  let val = e.target.value
                  if (val && !val.startsWith('http://') && !val.startsWith('https://')) {
                    val = 'https://' + val
                  }
                  setModForm({ ...modForm, vendorUrl: val })
                  if (!val) setLinkPreview(null)
                }}
                onBlur={e => {
                  let val = e.target.value.trim()
                  if (val && !val.startsWith('http://') && !val.startsWith('https://')) {
                    val = 'https://' + val
                    setModForm({ ...modForm, vendorUrl: val })
                  }
                  if (val && val.startsWith('http')) {
                    setPreviewLoading(true)
                    fetch(`/api/link-preview?url=${encodeURIComponent(val)}`)
                      .then(r => r.json())
                      .then(data => {
                        setLinkPreview(data)
                        setPreviewLoading(false)
                        setModForm(f => ({
                          ...f,
                          name: f.name || data.title || f.name,
                          brand: f.brand || data.brand || f.brand,
                          price: (!f.price || f.price === '') && data.price ? data.price.toString() : f.price,
                        }))
                      })
                      .catch(() => setPreviewLoading(false))
                  }
                }}
                className={inputClass}
                placeholder="amazon.com/dp/... or ecmtuner.com/products/..."
              />
              {previewLoading && <p className="text-xs text-gray-500 mt-1">⏳ Fetching product info...</p>}
              {linkPreview?.image && (
                <div className="flex items-center gap-3 mt-2 p-3 bg-gray-900 rounded-xl border border-gray-700">
                  <img src={linkPreview.image} alt="" className="w-14 h-14 object-cover rounded-lg flex-shrink-0" />
                  <div className="text-xs text-gray-400">
                    {linkPreview.title && <div className="text-white font-medium mb-0.5">{linkPreview.title.slice(0, 60)}</div>}
                    <div className="text-green-400">✓ Info auto-filled below</div>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Brand</label>
                <input
                  type="text"
                  list={brandDatalistId}
                  value={modForm.brand}
                  onChange={e => {
                    setModForm({ ...modForm, brand: e.target.value })
                    if (e.target.value.length >= 1) {
                      fetch(`/api/brands?category=${encodeURIComponent(modForm.category)}&q=${encodeURIComponent(e.target.value)}`)
                        .then(r => r.json()).then(setBrandSuggestions)
                    }
                  }}
                  onFocus={() => {
                    fetch(`/api/brands?category=${encodeURIComponent(modForm.category)}`)
                      .then(r => r.json()).then(setBrandSuggestions)
                  }}
                  className={inputClass}
                  placeholder="e.g. Wagner"
                  autoComplete="off"
                />
                <datalist id={brandDatalistId}>
                  {brandSuggestions.map(b => <option key={b} value={b} />)}
                </datalist>
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

            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Install Date</label>
              <input
                type="date"
                value={modForm.installDate}
                onChange={e => setModForm({ ...modForm, installDate: e.target.value })}
                className={`${inputClass} w-1/2`}
              />
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
                    type="text"
                    value={modForm.tunerUrl}
                    onChange={e => {
                      let val = e.target.value
                      if (val && !val.startsWith('http://') && !val.startsWith('https://')) {
                        val = 'https://' + val
                      }
                      setModForm({ ...modForm, tunerUrl: val })
                    }}
                    onBlur={e => {
                      let val = e.target.value.trim()
                      if (val && !val.startsWith('http://') && !val.startsWith('https://')) {
                        val = 'https://' + val
                        setModForm({ ...modForm, tunerUrl: val })
                      }
                    }}
                    className={inputClass}
                    placeholder="ecmtuner.com"
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
                onClick={() => { setShowModForm(false); setEditingModId(null); setModForm(emptyMod); setLinkPreview(null) }}
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
                        onClick={() => handleEditMod(mod)}
                        className="text-gray-600 hover:text-blue-400 text-xs transition-colors"
                        title="Edit mod"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteMod(mod.id)}
                        className="text-gray-600 hover:text-red-400 text-xs transition-colors"
                        title="Delete mod"
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
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
          <h2 className="font-bold mb-3">About this build</h2>
          <p className="text-gray-400 text-sm leading-relaxed">{build.description}</p>
        </div>
      )}

      {/* Performance Times */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
        <h2 className="font-bold mb-1">Performance Times <span className="text-gray-500 text-sm font-normal">(optional — enter your best Dragy runs)</span></h2>
        <p className="text-xs text-gray-600 mb-4">Shows on your public build page as a performance card</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {([
            { label: '0–60 mph', key: 'run060', unit: 's', placeholder: '3.2' },
            { label: '0–100 mph', key: 'run0100', unit: 's', placeholder: '6.8' },
            { label: '¼ Mile', key: 'runQuarter', unit: 's', placeholder: '11.4' },
            { label: 'Trap Speed', key: 'runTrap', unit: 'mph', placeholder: '124' },
            { label: '60–130 mph', key: 'run60130', unit: 's', placeholder: '8.1' },
            { label: '100–150 mph', key: 'run100150', unit: 's', placeholder: '7.4' },
            { label: '150–200 mph', key: 'run150200', unit: 's', placeholder: '12.0' },
          ].map(({ label, key, unit, placeholder }) => (
            <div key={key}>
              <label className="block text-xs text-gray-400 mb-1.5">{label} <span className="text-gray-600">({unit})</span></label>
              <input
                type="number"
                step="0.01"
                className={inputClass}
                placeholder={placeholder}
                defaultValue={(build as any)[key] || ''}
                onBlur={async (e) => {
                  const val = e.target.value.trim()
                  const num = val ? parseFloat(val) : null
                  if (num === ((build as any)[key] ?? null)) return
                  await fetch(`/api/builds/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...build, [key]: num })
                  })
                  fetchBuild()
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* YouTube Video */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h2 className="font-bold mb-3">Build Video <span className="text-gray-500 text-sm font-normal">(optional)</span></h2>
        <div className="flex gap-3">
          <input
            type="text"
            className={inputClass}
            placeholder="Paste YouTube link — exhaust sound, dyno pull, track lap..."
            defaultValue={build.youtubeUrl || ''}
            onBlur={async (e) => {
              const val = e.target.value.trim()
              if (val === (build.youtubeUrl || '')) return
              await fetch(`/api/builds/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...build, youtubeUrl: val || null })
              })
              fetchBuild()
            }}
          />
        </div>
        {build.youtubeUrl && (() => {
          const embedId = build.youtubeUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/)?.[1]
          return embedId ? (
            <div className="mt-4 aspect-video rounded-xl overflow-hidden">
              <iframe
                src={`https://www.youtube.com/embed/${embedId}`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : null
        })()}
      </div>
    </div>
  )
}
