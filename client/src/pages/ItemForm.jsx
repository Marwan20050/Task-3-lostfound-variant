import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'

const CATEGORIES = ['electronics', 'clothing', 'documents', 'accessories', 'other']
const STATUSES = ['lost', 'found', 'claimed']

const defaults = { title: '', description: '', category: 'other', status: 'lost', location: '' }

export default function ItemForm() {
  const nav = useNavigate()
  const { id } = useParams()
  const [form, setForm] = useState(defaults)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    async function load() {
      try {
        const res = await api.get(`/items/${id}`)
        const item = res.data
        setForm({
          title: item.title,
          status: item.status,
          category: item.category,
          location: item.location || '',
          description: item.description || '',
        })
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load item')
      }
    }
    load()
  }, [id])

  function onChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      if (id) {
        await api.patch(`/items/${id}`, form)
      } else {
        await api.post('/items', form)
      }
      nav('/items')
    } catch (err) {
      setError(err?.response?.data?.message || 'Something went wrong')
    }
  }

  return (
    <div className="max-w-lg mx-auto card">
      <h1 className="text-xl font-semibold mb-4">{id ? 'Edit' : 'Report'} Item</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            className="input w-full"
            name="title"
            value={form.title}
            onChange={onChange}
            placeholder="e.g. Black backpack"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              className="input w-full"
              name="status"
              value={form.status}
              onChange={onChange}
            >
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              className="input w-full"
              name="category"
              value={form.category}
              onChange={onChange}
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Location (optional)</label>
          <input
            className="input w-full"
            name="location"
            value={form.location}
            onChange={onChange}
            placeholder="e.g. Library 2nd floor"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description (optional)</label>
          <textarea
            className="input w-full h-24"
            name="description"
            value={form.description}
            onChange={onChange}
            placeholder="Provide more details..."
          />
        </div>

        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button className="btn w-full" type="submit">Save</button>
      </form>
    </div>
  )
}
