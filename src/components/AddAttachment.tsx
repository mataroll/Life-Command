import { useState, useRef } from 'react'
import { addLinkToNode, uploadFileToNode } from '../lib/attachments'

interface AddAttachmentProps {
  nodeId: string
  onDone: () => void
}

export default function AddAttachment({ nodeId, onDone }: AddAttachmentProps) {
  const [mode, setMode] = useState<'choose' | 'link'>('choose')
  const [linkUrl, setLinkUrl] = useState('')
  const [linkName, setLinkName] = useState('')
  const [loading, setLoading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleAddLink() {
    if (!linkUrl.trim()) return
    setLoading(true)
    try {
      await addLinkToNode(nodeId, linkUrl.trim(), linkName.trim() || undefined)
      onDone()
    } catch (e) {
      console.error('Failed to add link:', e)
    }
    setLoading(false)
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLoading(true)
    try {
      await uploadFileToNode(nodeId, file)
      onDone()
    } catch (e) {
      console.error('Failed to upload file:', e)
    }
    setLoading(false)
  }

  if (loading) {
    return <div className="add-attachment-loading">מעלה...</div>
  }

  if (mode === 'link') {
    return (
      <div className="add-attachment-form">
        <input
          type="url"
          placeholder="הדבק קישור..."
          value={linkUrl}
          onChange={(e) => setLinkUrl(e.target.value)}
          className="attachment-input"
          autoFocus
          dir="ltr"
        />
        <input
          type="text"
          placeholder="שם (אופציונלי)"
          value={linkName}
          onChange={(e) => setLinkName(e.target.value)}
          className="attachment-input"
        />
        <div className="add-attachment-actions">
          <button className="att-btn primary" onClick={handleAddLink}>הוסף</button>
          <button className="att-btn" onClick={() => setMode('choose')}>ביטול</button>
        </div>
      </div>
    )
  }

  return (
    <div className="add-attachment-choices">
      <button className="att-btn" onClick={() => setMode('link')}>🔗 קישור</button>
      <button className="att-btn" onClick={() => fileRef.current?.click()}>📎 קובץ / תמונה</button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.zip"
        onChange={handleFileUpload}
        style={{ display: 'none' }}
      />
      <button className="att-btn cancel" onClick={onDone}>ביטול</button>
    </div>
  )
}
