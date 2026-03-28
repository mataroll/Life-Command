import { useState } from 'react'
import AttachmentList from './AttachmentList'
import AddAttachment from './AddAttachment'
import { removeAttachmentFromNode } from '../lib/attachments'
import type { LifeNode } from '../lib/types'

interface TaskDetailProps {
  node: LifeNode
  onClose: () => void
}

export default function TaskDetail({ node, onClose }: TaskDetailProps) {
  const [showAdd, setShowAdd] = useState(false)

  return (
    <div className="task-detail-overlay" onClick={onClose}>
      <div className="task-detail-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="task-detail-header">
          <h3>{node.name}</h3>
          <button className="task-detail-close" onClick={onClose}>✕</button>
        </div>

        <div className="task-detail-meta">
          {node.category && <span className="task-detail-tag">{node.category}</span>}
          <span className="task-detail-tag">{node.rhythm}</span>
          {node.moneyRequired && <span className="task-detail-tag">₪{node.moneyRequired}</span>}
          {node.streak !== undefined && <span className="task-detail-tag">רצף: {node.streak}</span>}
        </div>

        {/* Attachments */}
        <div className="task-detail-section">
          <h4 className="task-detail-section-title">קבצים וקישורים</h4>
          <AttachmentList
            attachments={node.attachments || []}
            onRemove={(att) => removeAttachmentFromNode(node.id, att)}
          />
          {(!node.attachments || node.attachments.length === 0) && !showAdd && (
            <p className="task-detail-empty">אין קבצים מצורפים</p>
          )}
        </div>

        {/* Add attachment */}
        {showAdd ? (
          <AddAttachment nodeId={node.id} onDone={() => setShowAdd(false)} />
        ) : (
          <button className="att-btn primary" onClick={() => setShowAdd(true)}>
            + הוסף קישור או קובץ
          </button>
        )}
      </div>
    </div>
  )
}
