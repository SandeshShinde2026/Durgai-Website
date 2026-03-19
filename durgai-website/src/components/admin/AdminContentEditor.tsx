'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'

const LOCALES = ['en', 'hi', 'mr'] as const
type Locale = (typeof LOCALES)[number]
type JsonPath = Array<string | number>
type JsonObject = Record<string, unknown>

function toDisplayLabel(value: string) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^./, (char) => char.toUpperCase())
}

function isObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function createTemplateValue(value: unknown): unknown {
  if (typeof value === 'string') return ''
  if (typeof value === 'number') return 0
  if (typeof value === 'boolean') return false
  if (Array.isArray(value)) return []
  if (isObject(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [key, createTemplateValue(nestedValue)]),
    )
  }

  return ''
}

function updateAtPath(root: unknown, path: JsonPath, nextValue: unknown): unknown {
  if (path.length === 0) {
    return nextValue
  }

  const [head, ...tail] = path

  if (Array.isArray(root) && typeof head === 'number') {
    const copy = [...root]
    copy[head] = updateAtPath(copy[head], tail, nextValue)
    return copy
  }

  if (isObject(root) && typeof head === 'string') {
    return {
      ...root,
      [head]: updateAtPath(root[head], tail, nextValue),
    }
  }

  return root
}

function removeArrayItemAtPath(root: unknown, path: JsonPath, indexToRemove: number): unknown {
  const target = path.reduce<unknown>((current, segment) => {
    if (Array.isArray(current) && typeof segment === 'number') {
      return current[segment]
    }
    if (isObject(current) && typeof segment === 'string') {
      return current[segment]
    }
    return undefined
  }, root)

  if (!Array.isArray(target)) {
    return root
  }

  const nextArray = target.filter((_, index) => index !== indexToRemove)
  return updateAtPath(root, path, nextArray)
}

function addArrayItemAtPath(root: unknown, path: JsonPath): unknown {
  const target = path.reduce<unknown>((current, segment) => {
    if (Array.isArray(current) && typeof segment === 'number') {
      return current[segment]
    }
    if (isObject(current) && typeof segment === 'string') {
      return current[segment]
    }
    return undefined
  }, root)

  if (!Array.isArray(target)) {
    return root
  }

  const first = target[0]
  let newItem: unknown = ''

  if (first !== undefined) {
    newItem = createTemplateValue(first)
  }

  return updateAtPath(root, path, [...target, newItem])
}

export default function AdminContentEditor() {
  const router = useRouter()
  const latestLoadRequestId = useRef(0)
  const [locale, setLocale] = useState<Locale>('en')
  const [content, setContent] = useState<JsonObject | null>(null)
  const [selectedSection, setSelectedSection] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [uploadingFieldId, setUploadingFieldId] = useState('')
  const [csrfToken, setCsrfToken] = useState('')
  const [status, setStatus] = useState('')

  const statusColor = useMemo(() => {
    if (status.startsWith('Saved')) return 'text-green-700'
    if (status.startsWith('Loading')) return 'text-slate-600'
    return 'text-red-600'
  }, [status])

  const sectionKeys = useMemo(() => (content ? Object.keys(content) : []), [content])

  useEffect(() => {
    if (!sectionKeys.length) {
      setSelectedSection('')
      return
    }

    if (!selectedSection || !sectionKeys.includes(selectedSection)) {
      setSelectedSection(sectionKeys[0] ?? '')
    }
  }, [sectionKeys, selectedSection])

  const loadLocale = useCallback(async (targetLocale: Locale) => {
    const requestId = ++latestLoadRequestId.current
    setIsLoading(true)
    setStatus('Loading content...')

    const response = await fetch(`/api/admin/content?locale=${targetLocale}`, {
      cache: 'no-store',
      credentials: 'same-origin',
    })

    if (requestId !== latestLoadRequestId.current) {
      return
    }

    if (response.status === 401) {
      setUploadingFieldId('')
      router.replace('/admin/login')
      return
    }

    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as { error?: string }
      setStatus(data.error ?? 'Could not load locale content.')
      setIsLoading(false)
      return
    }

    const data = (await response.json()) as { content: unknown }
    const responseCsrfToken = response.headers.get('x-admin-csrf-token')
    if (responseCsrfToken) {
      setCsrfToken(responseCsrfToken)
    }
    if (!isObject(data.content)) {
      setStatus('Invalid content structure from server.')
      setIsLoading(false)
      return
    }
    setContent(data.content)
    setStatus('Loaded.')
    setIsLoading(false)
  }, [router])

  useEffect(() => {
    void loadLocale(locale)
  }, [locale, loadLocale])

  async function handleSave() {
    setIsSaving(true)
    setStatus('')

    if (!csrfToken) {
      setStatus('Missing CSRF token. Reload content and try again.')
      setIsSaving(false)
      return
    }

    if (!content) {
      setStatus('No content loaded.')
      setIsSaving(false)
      return
    }

    const response = await fetch('/api/admin/content', {
      method: 'PUT',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-csrf-token': csrfToken,
      },
      body: JSON.stringify({
        locale,
        content,
      }),
    })

    if (response.status === 401) {
      router.replace('/admin/login')
      return
    }

    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as { error?: string }
      if (response.status === 403 && data.error === 'Invalid CSRF token.') {
        await loadLocale(locale)
        setStatus('Security token refreshed. Please click save again.')
        setIsSaving(false)
        return
      }
      setStatus(data.error ?? 'Save failed.')
      setIsSaving(false)
      return
    }

    setStatus('Saved successfully.')
    setIsSaving(false)
  }

  function setValueAtPath(path: JsonPath, nextValue: unknown) {
    setContent((current) => {
      if (!current) return current
      return updateAtPath(current, path, nextValue) as JsonObject
    })
  }

  function removeArrayItem(path: JsonPath, index: number) {
    setContent((current) => {
      if (!current) return current
      return removeArrayItemAtPath(current, path, index) as JsonObject
    })
  }

  function addArrayItem(path: JsonPath) {
    setContent((current) => {
      if (!current) return current
      return addArrayItemAtPath(current, path) as JsonObject
    })
  }

  async function handleImageUpload(path: JsonPath, file: File) {
    if (!csrfToken) {
      setStatus('Missing CSRF token. Reload content and try again.')
      return
    }

    const fieldId = path.join('-')
    setUploadingFieldId(fieldId)
    setStatus('Uploading image...')

    const formData = new FormData()
    formData.set('image', file)

    const response = await fetch('/api/admin/upload-image', {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'x-admin-csrf-token': csrfToken,
      },
      body: formData,
    })

    if (response.status === 401) {
      router.replace('/admin/login')
      return
    }

    const data = (await response.json().catch(() => ({}))) as { error?: string; url?: string }
    if (!response.ok || !data.url) {
      setStatus(data.error ?? 'Image upload failed.')
      setUploadingFieldId('')
      return
    }

    setValueAtPath(path, data.url)
    setStatus('Image uploaded. Save changes to publish.')
    setUploadingFieldId('')
  }

  function isImageFieldKey(key: string) {
    const normalized = key.toLowerCase()
    return normalized.includes('imageurl') || normalized === 'image'
  }

  function renderNode(key: string, value: unknown, path: JsonPath, depth = 0) {
    const fieldId = path.join('-')

    if (typeof value === 'string') {
      const isImageField = isImageFieldKey(key)
      const multiline = value.length > 120 || value.includes('\n')
      return (
        <div key={fieldId} className="space-y-2">
          <label htmlFor={fieldId} className="block text-sm font-semibold text-slate-700">
            {toDisplayLabel(key)}
          </label>
          {isImageField ? (
            <div className="space-y-2">
              <input
                id={fieldId}
                type="text"
                value={value}
                onChange={(event) => setValueAtPath(path, event.target.value)}
                placeholder="Paste imgbb URL or upload image"
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none ring-primary/20 focus:ring-2"
              />
              <div className="flex flex-wrap items-center gap-2">
                <label
                  htmlFor={`${fieldId}-file`}
                  className="inline-flex cursor-pointer items-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  {uploadingFieldId === fieldId ? 'Uploading...' : 'Upload from device'}
                </label>
                <input
                  id={`${fieldId}-file`}
                  type="file"
                  accept="image/*"
                  disabled={uploadingFieldId === fieldId}
                  onChange={(event) => {
                    const file = event.target.files?.[0]
                    if (file) {
                      void handleImageUpload(path, file)
                    }
                    event.target.value = ''
                  }}
                  className="hidden"
                />
              </div>
              {value.trim() ? (
                <img
                  src={value}
                  alt="Preview"
                  className="h-24 w-24 rounded-lg border border-slate-200 object-cover"
                />
              ) : null}
            </div>
          ) : multiline ? (
            <textarea
              id={fieldId}
              value={value}
              onChange={(event) => setValueAtPath(path, event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none ring-primary/20 focus:ring-2"
              rows={4}
            />
          ) : (
            <input
              id={fieldId}
              type="text"
              value={value}
              onChange={(event) => setValueAtPath(path, event.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none ring-primary/20 focus:ring-2"
            />
          )}
        </div>
      )
    }

    if (typeof value === 'number') {
      return (
        <div key={fieldId} className="space-y-2">
          <label htmlFor={fieldId} className="block text-sm font-semibold text-slate-700">
            {toDisplayLabel(key)}
          </label>
          <input
            id={fieldId}
            type="number"
            value={value}
            onChange={(event) => setValueAtPath(path, Number(event.target.value))}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none ring-primary/20 focus:ring-2"
          />
        </div>
      )
    }

    if (typeof value === 'boolean') {
      return (
        <label
          key={fieldId}
          htmlFor={fieldId}
          className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3"
        >
          <span className="text-sm font-semibold text-slate-700">{toDisplayLabel(key)}</span>
          <input
            id={fieldId}
            type="checkbox"
            checked={value}
            onChange={(event) => setValueAtPath(path, event.target.checked)}
            className="h-4 w-4 accent-primary"
          />
        </label>
      )
    }

    if (Array.isArray(value)) {
      return (
        <div key={fieldId} className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-800">{toDisplayLabel(key)}</h4>
            <button
              type="button"
              onClick={() => addArrayItem(path)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              Add item
            </button>
          </div>
          <div className="space-y-3">
            {value.map((item, index) => (
              <div key={`${fieldId}-${index}`} className="rounded-xl border border-slate-200 bg-white p-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Item {index + 1}</p>
                  <button
                    type="button"
                    onClick={() => removeArrayItem(path, index)}
                    className="text-xs font-semibold text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
                {renderNode(`${key} ${index + 1}`, item, [...path, index], depth + 1)}
              </div>
            ))}
          </div>
        </div>
      )
    }

    if (isObject(value)) {
      const entries = Object.entries(value)
      return (
        <div
          key={fieldId}
          className={`space-y-4 rounded-2xl border border-slate-200 bg-white ${depth === 0 ? 'p-0 border-0' : 'p-4'}`}
        >
          {depth > 0 && <h3 className="text-sm font-bold text-slate-800">{toDisplayLabel(key)}</h3>}
          <div className="grid gap-4">
            {entries.map(([childKey, childValue]) => renderNode(childKey, childValue, [...path, childKey], depth + 1))}
          </div>
        </div>
      )
    }

    return (
      <div key={fieldId} className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
        Unsupported field type for: {toDisplayLabel(key)}
      </div>
    )
  }

  async function handleLogout() {
    await signOut({ callbackUrl: '/admin/login' })
  }

  return (
    <div className="w-full max-w-6xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-slate-900">Admin Content Dashboard</h1>
          <p className="mt-1 text-sm text-slate-600">
            Professional content manager for every section and every locale.
          </p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Logout
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <label htmlFor="locale" className="text-sm font-semibold text-slate-700">
              Locale
            </label>
            <select
              id="locale"
              value={locale}
              onChange={(event) => setLocale(event.target.value as Locale)}
              className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-900"
            >
              {LOCALES.map((item) => (
                <option key={item} value={item}>
                  {item.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
            {sectionKeys.length} sections
          </span>
        </div>

        {isLoading || !content ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-sm font-medium text-slate-600">
            Loading editor...
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
            <aside className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <p className="px-2 pb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Sections</p>
              <div className="space-y-1">
                {sectionKeys.map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedSection(key)}
                    className={`w-full rounded-xl px-3 py-2 text-left text-sm font-semibold transition ${
                      selectedSection === key
                        ? 'bg-primary text-white'
                        : 'text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {toDisplayLabel(key)}
                  </button>
                ))}
              </div>
            </aside>

            <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <h2 className="mb-4 text-lg font-bold text-slate-900">{toDisplayLabel(selectedSection)}</h2>
              {selectedSection && content[selectedSection] !== undefined ? (
                <div className="space-y-4">
                  {renderNode(selectedSection, content[selectedSection], [selectedSection])}
                </div>
              ) : (
                <p className="text-sm text-slate-600">Select a section to edit.</p>
              )}
            </section>
          </div>
        )}

        <div className="mt-4 flex items-center justify-between gap-4">
          <p className={`text-sm ${statusColor}`}>{status}</p>
          <button
            type="button"
            onClick={handleSave}
            disabled={isLoading || isSaving}
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSaving ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
