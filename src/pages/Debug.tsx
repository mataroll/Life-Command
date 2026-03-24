import { useState, useEffect } from 'react'
import { onNodesChange, onFinanceChange } from '../lib/firestore'
import { seedAll } from '../lib/seed'
import type { LifeNode, Finance } from '../lib/types'

export default function Debug() {
  const [nodes, setNodes] = useState<LifeNode[]>([])
  const [finance, setFinance] = useState<Finance | null>(null)
  const [seeding, setSeeding] = useState(false)
  const [seeded, setSeeded] = useState(false)

  useEffect(() => {
    const unsub1 = onNodesChange(setNodes)
    const unsub2 = onFinanceChange(setFinance)
    return () => { unsub1(); unsub2() }
  }, [])

  async function handleSeed() {
    setSeeding(true)
    try {
      await seedAll()
      setSeeded(true)
    } catch (e) {
      console.error('Seed failed:', e)
      alert('Seed failed — check console')
    }
    setSeeding(false)
  }

  const statusColor: Record<string, string> = {
    'blocked': '#888',
    'open': '#ffa726',
    'in-progress': '#66bb6a',
    'done': '#4fc3f7',
  }

  return (
    <div className="page">
      <h2 className="page-title">Debug View</h2>
      <p className="page-subtitle">Firestore data — live</p>

      <button
        className="notif-btn"
        onClick={handleSeed}
        disabled={seeding}
        style={{ marginBottom: 24, opacity: seeding ? 0.5 : 1 }}
      >
        {seeding ? 'טוען...' : seeded ? 'נטען בהצלחה!' : 'טען נתוני דוגמה'}
      </button>

      {/* Finance */}
      {finance && (
        <div className="status-card" style={{ marginBottom: 16 }}>
          <span className="status-card-label">יתרה: ₪{finance.balance}</span>
          <span className="status-card-label">בטחון: ₪{finance.safetyBuffer}</span>
        </div>
      )}

      {/* Nodes */}
      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 8 }}>
        {nodes.length} nodes
      </div>
      <div className="status-cards">
        {nodes.map((node) => (
          <div key={node.id} className="status-card" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600 }}>{node.name}</span>
              <span style={{
                fontSize: '0.75rem',
                padding: '2px 8px',
                borderRadius: 6,
                background: statusColor[node.status] || '#888',
                color: '#0f0f0f',
                fontWeight: 700,
              }}>
                {node.status}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 12, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <span>{node.type}</span>
              <span>{node.rhythm}</span>
              {node.streak !== undefined && <span>רצף: {node.streak}</span>}
              {node.moneyRequired && <span>₪{node.moneyRequired}</span>}
              {node.dependencies.length > 0 && <span>תלויות: {node.dependencies.length}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
