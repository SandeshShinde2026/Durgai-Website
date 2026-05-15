'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Globe2,
  ImagePlus,
  Layers3,
  Loader2,
  LogOut,
  Plus,
  Save,
  Search,
  ShieldCheck,
  Trash2,
  Undo2,
  Redo2,
  Wand2,
} from 'lucide-react'

const LOCALES = ['en', 'hi', 'mr'] as const
type Locale = (typeof LOCALES)[number]
type JsonPath = Array<string | number>
type JsonObject = Record<string, unknown>
type FieldHistoryEntry = {
  past: unknown[]
  future: unknown[]
}

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

function getValueAtPath(root: unknown, path: JsonPath): unknown {
  return path.reduce<unknown>((current, segment) => {
    if (Array.isArray(current) && typeof segment === 'number') {
      return current[segment]
    }
    if (isObject(current) && typeof segment === 'string') {
      return current[segment]
    }
    return undefined
  }, root)
}

function areValuesEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true

  try {
    return JSON.stringify(a) === JSON.stringify(b)
  } catch {
    return false
  }
}

export default function AdminContentEditor() {
  const router = useRouter()
  const latestLoadRequestId = useRef(0)
  const [locale, setLocale] = useState<Locale>('en')
  const [content, setContent] = useState<JsonObject | null>(null)
  const [initialSerialized, setInitialSerialized] = useState('')
  const [selectedSection, setSelectedSection] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [uploadingFieldId, setUploadingFieldId] = useState('')
  const [csrfToken, setCsrfToken] = useState('')
  const [status, setStatus] = useState('')
  const [autoCommit, setAutoCommit] = useState(false)
  const [sectionQuery, setSectionQuery] = useState('')
  const [collapsedNodes, setCollapsedNodes] = useState<Record<string, boolean>>({})
  const [fieldHistory, setFieldHistory] = useState<Record<string, FieldHistoryEntry>>({})
  const [draftOffer, setDraftOffer] = useState<string | null>(null)

  const statusColor = useMemo(() => {
    if (status.startsWith('Saved')) return 'text-green-700'
    if (status.includes('committed')) return 'text-emerald-700'
    if (status.startsWith('Loading')) return 'text-slate-600'
    if (status.startsWith('Uploading')) return 'text-orange-700'
    return 'text-red-600'
  }, [status])

  const sectionKeys = useMemo(() => (content ? Object.keys(content) : []), [content])
  const filteredSectionKeys = useMemo(() => {
    const query = sectionQuery.trim().toLowerCase()
    if (!query) return sectionKeys
    return sectionKeys.filter((key) => toDisplayLabel(key).toLowerCase().includes(query))
  }, [sectionKeys, sectionQuery])

  const currentSerialized = useMemo(() => (content ? JSON.stringify(content) : ''), [content])
  const isDirty = Boolean(content) && Boolean(initialSerialized) && currentSerialized !== initialSerialized
  const draftStorageKey = useMemo(() => `durgai-admin-draft:${locale}`, [locale])

  const stats = useMemo(() => {
    function countFields(node: unknown): number {
      if (node === null || node === undefined) return 0
      if (typeof node === 'string' || typeof node === 'number' || typeof node === 'boolean') return 1
      if (Array.isArray(node)) return node.reduce((total: number, item) => total + countFields(item), 0)
      if (isObject(node)) {
        return Object.values(node).reduce((total: number, value) => total + countFields(value), 0)
      }
      return 0
    }

    return {
      sections: sectionKeys.length,
      fields: content ? countFields(content) : 0,
      locale: locale.toUpperCase(),
    }
  }, [content, locale, sectionKeys.length])

  useEffect(() => {
    if (!filteredSectionKeys.length) {
      setSelectedSection('')
      return
    }

    if (!selectedSection || !filteredSectionKeys.includes(selectedSection)) {
      setSelectedSection(filteredSectionKeys[0] ?? '')
    }
  }, [filteredSectionKeys, selectedSection])

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
    setFieldHistory({})
    setInitialSerialized(JSON.stringify(data.content))

    if (typeof window !== 'undefined') {
      const storedDraft = window.localStorage.getItem(`durgai-admin-draft:${targetLocale}`)
      if (storedDraft && storedDraft !== JSON.stringify(data.content)) {
        setDraftOffer(storedDraft)
        setStatus('Local draft found. Review restore options.')
      } else {
        setDraftOffer(null)
      }
    }

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
        autoCommit,
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

    const result = (await response.json().catch(() => ({}))) as {
      ok?: boolean
      autoCommit?: {
        attempted?: boolean
        committed?: boolean
        message?: string
      } | null
    }

    const commitStatus = result.autoCommit
    if (commitStatus?.attempted) {
      if (commitStatus.committed) {
        setStatus(`Saved and committed. ${commitStatus.message ?? ''}`.trim())
      } else {
        setStatus(`Saved. Auto-commit skipped/failed: ${commitStatus.message ?? 'No details.'}`)
      }
    } else {
      setStatus('Saved successfully.')
    }
    if (content) {
      setInitialSerialized(JSON.stringify(content))
    }
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(draftStorageKey)
      setDraftOffer(null)
    }
    setIsSaving(false)
  }

  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      const isSaveShortcut = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's'
      if (!isSaveShortcut) return
      event.preventDefault()
      if (!isLoading && !isSaving) {
        void handleSave()
      }
    }

    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [isLoading, isSaving, content, csrfToken, autoCommit, locale, loadLocale])

  function pushFieldHistory(path: JsonPath, previousValue: unknown) {
    const pathId = getPathId(path)
    setFieldHistory((current) => {
      const entry = current[pathId] ?? { past: [], future: [] }
      const nextPast = [...entry.past, previousValue]

      return {
        ...current,
        [pathId]: {
          past: nextPast.slice(-30),
          future: [],
        },
      }
    })
  }

  function setValueAtPath(path: JsonPath, nextValue: unknown, trackHistory = true) {
    setContent((current) => {
      if (!current) return current
      const previousValue = getValueAtPath(current, path)
      if (areValuesEqual(previousValue, nextValue)) {
        return current
      }
      if (trackHistory) {
        pushFieldHistory(path, previousValue)
      }
      return updateAtPath(current, path, nextValue) as JsonObject
    })
  }

  function undoField(path: JsonPath) {
    if (!content) return

    const pathId = getPathId(path)
    const entry = fieldHistory[pathId]
    if (!entry || entry.past.length === 0) return

    const currentValue = getValueAtPath(content, path)
    const previousValue = entry.past[entry.past.length - 1]

    setContent(updateAtPath(content, path, previousValue) as JsonObject)
    setFieldHistory((current) => {
      const target = current[pathId]
      if (!target || target.past.length === 0) return current
      return {
        ...current,
        [pathId]: {
          past: target.past.slice(0, -1),
          future: [currentValue, ...target.future].slice(0, 30),
        },
      }
    })
  }

  function redoField(path: JsonPath) {
    if (!content) return

    const pathId = getPathId(path)
    const entry = fieldHistory[pathId]
    if (!entry || entry.future.length === 0) return

    const currentValue = getValueAtPath(content, path)
    const redoValue = entry.future[0]

    setContent(updateAtPath(content, path, redoValue) as JsonObject)
    setFieldHistory((current) => {
      const target = current[pathId]
      if (!target || target.future.length === 0) return current
      return {
        ...current,
        [pathId]: {
          past: [...target.past, currentValue].slice(-30),
          future: target.future.slice(1),
        },
      }
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

  function getPathId(path: JsonPath) {
    return path.join('.')
  }

  function toggleCollapsed(path: JsonPath) {
    const id = getPathId(path)
    setCollapsedNodes((current) => ({
      ...current,
      [id]: !current[id],
    }))
  }

  function renderNode(key: string, value: unknown, path: JsonPath, depth = 0) {
    const fieldId = path.join('-')
    const pathId = getPathId(path)
    const isCollapsed = collapsedNodes[pathId] === true
    const historyEntry = fieldHistory[pathId] ?? { past: [], future: [] }
    const canUndo = historyEntry.past.length > 0
    const canRedo = historyEntry.future.length > 0
    const undoCount = historyEntry.past.length
    const redoCount = historyEntry.future.length
    const historyTooltipText = `Undo ${undoCount} | Redo ${redoCount}`

    if (typeof value === 'string') {
      const isImageField = isImageFieldKey(key)
      const multiline = value.length > 120 || value.includes('\n')
      return (
        <motion.div
          key={fieldId}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-2 rounded-xl border border-slate-200/70 bg-white px-3 py-3"
        >
          <div className="flex items-center justify-between gap-2">
            <label htmlFor={fieldId} className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
              {toDisplayLabel(key)}
            </label>
            <div className="inline-flex items-center gap-1">
              <div className="group relative">
                <span className="inline-flex cursor-help items-center rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
                  History
                </span>
                <span className="pointer-events-none absolute -top-8 right-0 z-20 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-[10px] font-semibold text-white opacity-0 shadow-lg transition group-hover:opacity-100">
                  {historyTooltipText}
                </span>
              </div>
              <button
                type="button"
                onClick={() => undoField(path)}
                disabled={!canUndo}
                className="rounded-md border border-slate-200 bg-white p-1 text-slate-500 transition hover:border-primary/30 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                aria-label={`Undo ${toDisplayLabel(key)}`}
                title={`Undo (${undoCount})`}
              >
                <Undo2 className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => redoField(path)}
                disabled={!canRedo}
                className="rounded-md border border-slate-200 bg-white p-1 text-slate-500 transition hover:border-primary/30 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                aria-label={`Redo ${toDisplayLabel(key)}`}
                title={`Redo (${redoCount})`}
              >
                <Redo2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          {isImageField ? (
            <div className="space-y-2">
              <input
                id={fieldId}
                type="text"
                value={value}
                onChange={(event) => setValueAtPath(path, event.target.value)}
                placeholder="Paste imgbb URL or upload image"
                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none ring-primary/20 transition-all focus:border-primary focus:ring-2"
              />
              <div className="flex flex-wrap items-center gap-2">
                <label
                  htmlFor={`${fieldId}-file`}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-primary/30 hover:bg-rose-50"
                >
                  <ImagePlus className="h-3.5 w-3.5" />
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
                  className="h-24 w-24 rounded-xl border border-slate-200 object-cover shadow-sm"
                />
              ) : null}
            </div>
          ) : multiline ? (
            <textarea
              id={fieldId}
              value={value}
              onChange={(event) => setValueAtPath(path, event.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none ring-primary/20 transition-all focus:border-primary focus:ring-2"
              rows={4}
            />
          ) : (
            <input
              id={fieldId}
              type="text"
              value={value}
              onChange={(event) => setValueAtPath(path, event.target.value)}
              className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none ring-primary/20 transition-all focus:border-primary focus:ring-2"
            />
          )}
        </motion.div>
      )
    }

    if (typeof value === 'number') {
      return (
        <motion.div key={fieldId} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-2 rounded-xl border border-slate-200/70 bg-white px-3 py-3">
          <div className="flex items-center justify-between gap-2">
            <label htmlFor={fieldId} className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
              {toDisplayLabel(key)}
            </label>
            <div className="inline-flex items-center gap-1">
              <div className="group relative">
                <span className="inline-flex cursor-help items-center rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
                  History
                </span>
                <span className="pointer-events-none absolute -top-8 right-0 z-20 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-[10px] font-semibold text-white opacity-0 shadow-lg transition group-hover:opacity-100">
                  {historyTooltipText}
                </span>
              </div>
              <button
                type="button"
                onClick={() => undoField(path)}
                disabled={!canUndo}
                className="rounded-md border border-slate-200 bg-white p-1 text-slate-500 transition hover:border-primary/30 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                aria-label={`Undo ${toDisplayLabel(key)}`}
                title={`Undo (${undoCount})`}
              >
                <Undo2 className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => redoField(path)}
                disabled={!canRedo}
                className="rounded-md border border-slate-200 bg-white p-1 text-slate-500 transition hover:border-primary/30 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                aria-label={`Redo ${toDisplayLabel(key)}`}
                title={`Redo (${redoCount})`}
              >
                <Redo2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <input
            id={fieldId}
            type="number"
            value={value}
            onChange={(event) => setValueAtPath(path, Number(event.target.value))}
            className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none ring-primary/20 transition-all focus:border-primary focus:ring-2"
          />
        </motion.div>
      )
    }

    if (typeof value === 'boolean') {
      return (
        <motion.label
          key={fieldId}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          htmlFor={fieldId}
          className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-700">{toDisplayLabel(key)}</span>
            <div className="group relative">
              <span className="inline-flex cursor-help items-center rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
                History
              </span>
              <span className="pointer-events-none absolute -top-8 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-[10px] font-semibold text-white opacity-0 shadow-lg transition group-hover:opacity-100">
                {historyTooltipText}
              </span>
            </div>
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault()
                undoField(path)
              }}
              disabled={!canUndo}
              className="rounded-md border border-slate-200 bg-white p-1 text-slate-500 transition hover:border-primary/30 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
              aria-label={`Undo ${toDisplayLabel(key)}`}
              title={`Undo (${undoCount})`}
            >
              <Undo2 className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault()
                redoField(path)
              }}
              disabled={!canRedo}
              className="rounded-md border border-slate-200 bg-white p-1 text-slate-500 transition hover:border-primary/30 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
              aria-label={`Redo ${toDisplayLabel(key)}`}
              title={`Redo (${redoCount})`}
            >
              <Redo2 className="h-3.5 w-3.5" />
            </button>
          </div>
          <input
            id={fieldId}
            type="checkbox"
            checked={value}
            onChange={(event) => setValueAtPath(path, event.target.checked)}
            className="h-4 w-4 accent-primary"
          />
        </motion.label>
      )
    }

    if (Array.isArray(value)) {
      return (
        <div key={fieldId} className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => toggleCollapsed(path)}
              className="inline-flex items-center gap-1.5 text-left"
            >
              {isCollapsed ? <ChevronRight className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
              <h4 className="text-sm font-bold text-slate-800">{toDisplayLabel(key)}</h4>
              <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-600">{value.length}</span>
            </button>
            <button
              type="button"
              onClick={() => addArrayItem(path)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-primary/30 hover:bg-rose-50"
            >
              <Plus className="h-3.5 w-3.5" />
              Add item
            </button>
          </div>

          {!isCollapsed && (
            <div className="space-y-3">
              {value.map((item, index) => (
                <motion.div key={`${fieldId}-${index}`} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }} className="rounded-xl border border-slate-200 bg-white p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Item {index + 1}</p>
                    <button
                      type="button"
                      onClick={() => removeArrayItem(path, index)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 transition hover:text-red-700"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove
                    </button>
                  </div>
                  {renderNode(`${key} ${index + 1}`, item, [...path, index], depth + 1)}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )
    }

    if (isObject(value)) {
      const entries = Object.entries(value)
      return (
        <div
          key={fieldId}
          className={`space-y-4 rounded-2xl border border-slate-200 bg-white ${depth === 0 ? 'border-0 bg-transparent p-0' : 'p-4 shadow-sm'}`}
        >
          {depth > 0 ? (
            <button
              type="button"
              onClick={() => toggleCollapsed(path)}
              className="inline-flex items-center gap-1.5"
            >
              {isCollapsed ? <ChevronRight className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
              <h3 className="text-sm font-bold text-slate-800">{toDisplayLabel(key)}</h3>
              <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-600">{entries.length}</span>
            </button>
          ) : null}

          {(depth === 0 || !isCollapsed) && (
            <div className="grid gap-4">
              {entries.map(([childKey, childValue]) => renderNode(childKey, childValue, [...path, childKey], depth + 1))}
            </div>
          )}
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

  function handleRestoreDraft() {
    if (!draftOffer) return
    try {
      const parsed = JSON.parse(draftOffer) as unknown
      if (!isObject(parsed)) {
        setStatus('Draft is invalid and cannot be restored.')
        return
      }
      setContent(parsed)
      setFieldHistory({})
      setDraftOffer(null)
      setStatus('Draft restored. Review and save when ready.')
    } catch {
      setStatus('Draft parsing failed. Discarding invalid draft.')
      handleDiscardDraft()
    }
  }

  function handleDiscardDraft() {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(draftStorageKey)
    }
    setDraftOffer(null)
    setStatus('Local draft discarded.')
  }

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!content || !initialSerialized) return
    if (!isDirty) return

    const timeoutId = window.setTimeout(() => {
      window.localStorage.setItem(draftStorageKey, currentSerialized)
    }, 700)

    return () => window.clearTimeout(timeoutId)
  }, [content, currentSerialized, draftStorageKey, initialSerialized, isDirty])

  return (
    <div className="w-full max-w-7xl">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mb-5 rounded-3xl border border-white/70 bg-white/95 p-5 shadow-[0_20px_60px_rgba(229,57,53,0.12)] backdrop-blur">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
              <ShieldCheck className="h-3.5 w-3.5" />
              Content Control Center
            </div>
            <h1 className="font-heading text-3xl font-bold text-slate-900">Admin Content Dashboard</h1>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">
              Manage locale content, section flow, and media assets with full control.
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-primary/30 hover:bg-rose-50"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Locale</p>
            <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-bold text-slate-800"><Globe2 className="h-4 w-4 text-primary" />{stats.locale}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Sections</p>
            <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-bold text-slate-800"><Layers3 className="h-4 w-4 text-primary" />{stats.sections}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Editable fields</p>
            <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-bold text-slate-800"><Wand2 className="h-4 w-4 text-primary" />{stats.fields}</p>
          </div>
        </div>
      </motion.div>

      <div className="rounded-3xl border border-white/70 bg-white/95 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur">
        {draftOffer ? (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="inline-flex items-center gap-2 text-sm font-medium text-amber-800">
              <AlertTriangle className="h-4 w-4" />
              A local draft from an unsaved session was found for this locale.
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRestoreDraft}
                className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-amber-700"
              >
                Restore draft
              </button>
              <button
                type="button"
                onClick={handleDiscardDraft}
                className="rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-700 transition hover:bg-amber-100"
              >
                Discard
              </button>
            </div>
          </div>
        ) : null}

        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <label htmlFor="locale" className="text-sm font-semibold text-slate-700">
              Locale
            </label>
            <div className="relative">
              <select
                id="locale"
                value={locale}
                onChange={(event) => setLocale(event.target.value as Locale)}
                className="h-11 appearance-none rounded-xl border border-slate-300 bg-white px-3 pr-9 text-sm font-semibold text-slate-900 outline-none ring-primary/20 transition-all focus:border-primary focus:ring-2"
              >
                {LOCALES.map((item) => (
                  <option key={item} value={item}>
                    {item.toUpperCase()}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            </div>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">
            {isDirty ? (
              <>
                <span className="h-2 w-2 rounded-full bg-orange-500" />
                Unsaved changes
              </>
            ) : (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                Synced
              </>
            )}
          </div>
        </div>

        {isLoading || !content ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-sm font-medium text-slate-600">
            <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Loading editor...</span>
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
            <aside className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3">
              <div className="mb-3 space-y-2">
                <p className="px-2 text-xs font-bold uppercase tracking-wide text-slate-500">Sections</p>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={sectionQuery}
                    onChange={(event) => setSectionQuery(event.target.value)}
                    placeholder="Search section"
                    className="h-10 w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 text-sm text-slate-900 outline-none ring-primary/20 transition-all focus:border-primary focus:ring-2"
                  />
                </div>
              </div>

              <div className="max-h-[60vh] space-y-1 overflow-auto pr-1">
                {filteredSectionKeys.map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedSection(key)}
                    className={`w-full rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-all ${
                      selectedSection === key
                        ? 'bg-primary text-white shadow-md shadow-primary/20'
                        : 'text-slate-700 hover:-translate-y-0.5 hover:bg-white hover:shadow-sm'
                    }`}
                  >
                    {toDisplayLabel(key)}
                  </button>
                ))}
                {!filteredSectionKeys.length && (
                  <p className="px-2 py-4 text-sm text-slate-500">No matching section found.</p>
                )}
              </div>
            </aside>

            <section className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-heading text-xl font-bold text-slate-900">{toDisplayLabel(selectedSection)}</h2>
                <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-500">
                  Path: {selectedSection || 'N/A'}
                </span>
              </div>

              <AnimatePresence mode="wait">
                {selectedSection && content[selectedSection] !== undefined ? (
                  <motion.div
                    key={selectedSection}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18 }}
                    className="space-y-4"
                  >
                    {renderNode(selectedSection, content[selectedSection], [selectedSection])}
                  </motion.div>
                ) : (
                  <motion.p
                    key="empty-selection"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-sm text-slate-600"
                  >
                    Select a section to edit.
                  </motion.p>
                )}
              </AnimatePresence>
            </section>
          </div>
        )}

        <div className="sticky bottom-0 mt-5 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-[0_12px_40px_rgba(15,23,42,0.12)] backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-col gap-2">
              <p className={`text-sm font-medium ${statusColor}`}>{status}</p>
              <label htmlFor="auto-commit-toggle" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700">
                <input
                  id="auto-commit-toggle"
                  type="checkbox"
                  checked={autoCommit}
                  onChange={(event) => setAutoCommit(event.target.checked)}
                  className="h-4 w-4 accent-primary"
                />
                Auto-commit this locale file after save
              </label>
              <p className="text-[11px] text-slate-500">Shortcut: Cmd/Ctrl + S</p>
            </div>

            <button
              type="button"
              onClick={handleSave}
              disabled={isLoading || isSaving}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-primary/25 transition-all hover:-translate-y-0.5 hover:bg-primary-dark hover:shadow-lg hover:shadow-primary/30 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {isSaving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
