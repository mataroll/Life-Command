import type { Attachment } from '../lib/types'

interface AttachmentListProps {
  attachments: Attachment[]
  onRemove?: (attachment: Attachment) => void
}

const typeIcons: Record<string, string> = {
  link: '🔗',
  pdf: '📄',
  image: '🖼️',
  file: '📎',
}

export default function AttachmentList({ attachments, onRemove }: AttachmentListProps) {
  if (!attachments || attachments.length === 0) return null

  return (
    <div className="attachment-list">
      {attachments.map((att) => (
        <div key={att.id} className="attachment-item">
          <a
            href={att.url}
            target="_blank"
            rel="noopener noreferrer"
            className="attachment-link"
          >
            <span className="attachment-icon">{typeIcons[att.type] || '📎'}</span>
            <span className="attachment-name">{att.name}</span>
            {att.type === 'image' && (
              <img src={att.url} alt={att.name} className="attachment-preview" />
            )}
          </a>
          {onRemove && (
            <button
              className="attachment-remove"
              onClick={(e) => { e.stopPropagation(); onRemove(att) }}
            >
              ✕
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
