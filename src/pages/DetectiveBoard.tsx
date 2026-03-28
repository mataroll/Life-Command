import { useEffect, useState, useRef, useCallback } from 'react'
import { onNodesChange } from '../lib/firestore'
import type { LifeNode } from '../lib/types'

interface BoardNode {
  id: string
  name: string
  group: string
  status: 'blocked' | 'open' | 'in-progress' | 'done' | 'skip'
  blockedBy?: string[]
  unlocks?: string[]
  money?: number
  note?: string
  x: number  // position on canvas
  y: number
}

// ====== BOARD LAYOUT ======
// Canvas is 3600 x 2800 — positions hand-placed, spacing for 200px wide pins

const BOARD_NODES: BoardNode[] = [
  // === KEY BLOCKERS (top row — the big 4) ===
  { id: 'talk-dad', name: 'דיבור עם אבא', group: 'חוסמים', status: 'open', x: 100, y: 100,
    unlocks: ['doctors-group', 'eyes', 'back-doc', 'sweat-surgery', 'head-heat', 'throat', 'stomach', 'skin',
              'swim', 'apartment', 'chiropractor', 'curls', 'arsenal', 'kotel', 'sites', 'apple-watch', 'back-pillow'] },
  { id: 'haifa', name: 'חיפה', group: 'חוסמים', status: 'open', x: 900, y: 100,
    unlocks: ['friends-group', 'shai', 'nir', 'amit', 'bsha', 'danik', 'ofri', 'bar-yaron', 'amit-arad', 'padel'] },
  { id: 'citron', name: 'ציטרון', group: 'חוסמים', status: 'open', x: 1700, y: 100,
    unlocks: ['bracelets', 'creative-group', 'veo3'] },
  { id: 'learning', name: 'עקומת למידה', group: 'חוסמים', status: 'in-progress', x: 2500, y: 100,
    note: 'אינפי 1 → אינפי 2 → אלגברה → טכניון',
    unlocks: ['technion-drive', 'amit-cousin', 'python-teacher', 'omer-photographer', 'shared-albums', 'phone-fix', 'brain-mapping', 'nikud', 'ai-browser', 'riddles', 'piano', 'scorpion', 'margalit', 'mishpat', 'skits', 'technion'] },

  // === DAD TALK UNLOCKS (row 2, left side) ===
  { id: 'apartment', name: 'מעבר דירה', group: 'אחרי אבא', status: 'blocked', blockedBy: ['talk-dad'], x: 50, y: 350,
    unlocks: ['kitchen-course', 'protein-shakes', 'hot-discount', 'symbol-shirt', 'wall-writing', 'electric-knife'] },
  { id: 'back-pillow', name: 'כרית לגב + כירופרקט', group: 'אחרי אבא', status: 'blocked', blockedBy: ['talk-dad'], x: 300, y: 350 },
  { id: 'arsenal', name: 'ארסנל', group: 'אחרי אבא', status: 'blocked', blockedBy: ['talk-dad'], x: 550, y: 350 },
  { id: 'curls', name: 'תלתלים', group: 'אחרי אבא', status: 'blocked', blockedBy: ['talk-dad'], x: 300, y: 470 },
  { id: 'kotel', name: 'כותל', group: 'אחרי אבא', status: 'blocked', blockedBy: ['talk-dad'], x: 550, y: 470 },
  { id: 'sites', name: 'אתרים', group: 'אחרי אבא', status: 'blocked', blockedBy: ['talk-dad'], x: 300, y: 590 },
  { id: 'apple-watch', name: 'Apple Watch סוללה', group: 'אחרי אבא', status: 'blocked', blockedBy: ['talk-dad'], x: 550, y: 590 },
  { id: 'chiropractor', name: 'כירופרקט', group: 'אחרי אבא', status: 'blocked', blockedBy: ['talk-dad'], x: 300, y: 710 },
  { id: 'swim', name: 'ללמוד לשחות', group: 'אחרי אבא', status: 'blocked', blockedBy: ['talk-dad'], x: 550, y: 710, note: '+ סטריק ריצה 90 יום' },

  // === DOCTORS (below dad, far left) ===
  { id: 'doctors-group', name: 'רופאה כללי', group: 'רופאים', status: 'blocked', blockedBy: ['talk-dad'], x: 50, y: 870 },
  { id: 'eyes', name: 'עיניים / בדיקת ראייה', group: 'רופאים', status: 'blocked', blockedBy: ['talk-dad'], x: 300, y: 870 },
  { id: 'back-doc', name: 'גב', group: 'רופאים', status: 'blocked', blockedBy: ['talk-dad'], x: 550, y: 870 },
  { id: 'sweat-surgery', name: 'ניתוח זיעה', group: 'רופאים', status: 'blocked', blockedBy: ['talk-dad'], x: 50, y: 990 },
  { id: 'head-heat', name: 'ראש וחום', group: 'רופאים', status: 'blocked', blockedBy: ['talk-dad'], x: 300, y: 990 },
  { id: 'throat', name: 'גרון', group: 'רופאים', status: 'blocked', blockedBy: ['talk-dad'], x: 550, y: 990 },
  { id: 'stomach', name: 'בטן', group: 'רופאים', status: 'blocked', blockedBy: ['talk-dad'], x: 50, y: 1110 },
  { id: 'skin', name: 'עור', group: 'רופאים', status: 'blocked', blockedBy: ['talk-dad'], x: 300, y: 1110 },
  { id: 'blood', name: 'בדיקות דם', group: 'רופאים', status: 'open', x: 550, y: 1110 },

  // === APARTMENT UNLOCKS ===
  { id: 'kitchen-course', name: 'קורס בצק + מטבח', group: 'אחרי דירה', status: 'blocked', blockedBy: ['apartment'], x: 50, y: 1300 },
  { id: 'protein-shakes', name: 'שייק חלבון', group: 'אחרי דירה', status: 'blocked', blockedBy: ['apartment'], x: 300, y: 1300 },
  { id: 'hot-discount', name: 'הנחה מהוט', group: 'אחרי דירה', status: 'blocked', blockedBy: ['apartment'], x: 550, y: 1300 },
  { id: 'symbol-shirt', name: 'חולצה עם סמלים', group: 'אחרי דירה', status: 'blocked', blockedBy: ['apartment'], x: 50, y: 1420 },
  { id: 'wall-writing', name: 'קיר כיתובים', group: 'אחרי דירה', status: 'blocked', blockedBy: ['apartment'], x: 300, y: 1420 },
  { id: 'electric-knife', name: 'סכין חשמלית', group: 'אחרי דירה', status: 'blocked', blockedBy: ['apartment'], x: 550, y: 1420 },

  // === FRIENDS (below haifa, center column) ===
  { id: 'friends-group', name: 'רזאביב', group: 'חברים', status: 'blocked', blockedBy: ['haifa'], x: 800, y: 350 },
  { id: 'shai', name: 'שי', group: 'חברים', status: 'blocked', blockedBy: ['haifa'], x: 1050, y: 350 },
  { id: 'nir', name: 'ניר', group: 'חברים', status: 'blocked', blockedBy: ['haifa'], x: 800, y: 470 },
  { id: 'amit', name: 'עמית', group: 'חברים', status: 'blocked', blockedBy: ['haifa'], x: 1050, y: 470 },
  { id: 'bsha', name: 'בשה', group: 'חברים', status: 'blocked', blockedBy: ['haifa'], x: 800, y: 590 },
  { id: 'danik', name: 'דניק', group: 'חברים', status: 'blocked', blockedBy: ['haifa'], x: 1050, y: 590 },
  { id: 'ofri', name: 'עופרי', group: 'חברים', status: 'blocked', blockedBy: ['haifa'], x: 800, y: 710 },
  { id: 'bar-yaron', name: 'בר ירון', group: 'חברים', status: 'blocked', blockedBy: ['haifa'], x: 1050, y: 710 },
  { id: 'amit-arad', name: 'עמית ארד', group: 'חברים', status: 'blocked', blockedBy: ['haifa'], x: 800, y: 830 },
  { id: 'padel', name: 'פאדל חברים', group: 'חברים', status: 'blocked', blockedBy: ['haifa'], x: 1050, y: 830 },

  // === CREATIVE (below citron, center-right) ===
  { id: 'creative-group', name: 'שיר וסיפור veo3', group: 'יצירתי', status: 'blocked', blockedBy: ['learning', 'citron', 'talk-dad'], x: 1600, y: 350 },
  { id: 'veo3', name: 'Veo3 סרטונים', group: 'יצירתי', status: 'blocked', blockedBy: ['learning', 'citron', 'talk-dad'], x: 1850, y: 350 },
  { id: 'poems', name: 'לכתוב שירים', group: 'יצירתי', status: 'open', x: 1600, y: 470 },
  { id: 'riddles', name: 'חידות בסמח', group: 'יצירתי', status: 'blocked', blockedBy: ['learning'], x: 1850, y: 470 },
  { id: 'piano', name: 'פסנתר / palm trees', group: 'יצירתי', status: 'blocked', blockedBy: ['learning'], x: 1600, y: 590 },
  { id: 'scorpion', name: 'Scorpion', group: 'יצירתי', status: 'blocked', blockedBy: ['learning'], x: 1850, y: 590 },
  { id: 'margalit', name: 'מרגלית הבלשית', group: 'יצירתי', status: 'blocked', blockedBy: ['learning'], x: 1600, y: 710 },
  { id: 'mishpat', name: 'פרויקט משפט', group: 'יצירתי', status: 'blocked', blockedBy: ['learning'], x: 1850, y: 710 },
  { id: 'skits', name: 'לא נעים אחי', group: 'יצירתי', status: 'blocked', blockedBy: ['learning'], x: 1725, y: 830 },
  { id: 'bracelets', name: 'צמידים מוארים', group: 'יצירתי', status: 'blocked', blockedBy: ['citron'], x: 1725, y: 230 },

  // === LEARNING UNLOCKS (below learning, right side) ===
  { id: 'technion-drive', name: 'דרייב טכניון', group: 'למידה', status: 'blocked', blockedBy: ['learning'], x: 2400, y: 350 },
  { id: 'amit-cousin', name: 'הנדסה כימית עמית', group: 'למידה', status: 'blocked', blockedBy: ['learning'], x: 2650, y: 350 },
  { id: 'python-teacher', name: 'מורה לפייתון', group: 'למידה', status: 'blocked', blockedBy: ['learning'], x: 2400, y: 470 },
  { id: 'omer-photographer', name: 'עומר צלם', group: 'למידה', status: 'blocked', blockedBy: ['learning'], x: 2650, y: 470 },
  { id: 'shared-albums', name: 'אלבומים משותפים', group: 'למידה', status: 'blocked', blockedBy: ['learning'], x: 2400, y: 590 },
  { id: 'phone-fix', name: 'לטפל בטלפון', group: 'למידה', status: 'blocked', blockedBy: ['learning'], x: 2650, y: 590 },
  { id: 'brain-mapping', name: 'Brain Mapping', group: 'למידה', status: 'blocked', blockedBy: ['learning'], x: 2400, y: 710 },
  { id: 'nikud', name: 'ללמוד לנקד', group: 'למידה', status: 'blocked', blockedBy: ['learning'], x: 2650, y: 710 },

  // === TECH (below learning unlocks) ===
  { id: 'claude-tools', name: 'כלים חדשים בקלאוד', group: 'טכני', status: 'open', x: 2400, y: 900 },
  { id: 'ai-browser', name: 'דפדפן AI', group: 'טכני', status: 'blocked', blockedBy: ['learning'], x: 2650, y: 900 },
  { id: 'stars', name: 'פרויקט כוכבים', group: 'טכני', status: 'open', x: 2900, y: 900 },
  { id: 'beamng', name: 'BeamNG', group: 'טכני', status: 'open', x: 2400, y: 1020 },
  { id: 'arduino', name: 'ארדואינו', group: 'טכני', status: 'open', x: 2650, y: 1020 },
  { id: 'soldier-game', name: 'משחק חיילים', group: 'טכני', status: 'open', x: 2900, y: 1020 },
  { id: 'zoom-earth', name: 'Zoom Earth', group: 'טכני', status: 'open', x: 2650, y: 1140 },

  // === GOALS & DREAMS (bottom center) ===
  { id: 'calisthenics', name: 'קליסטניקס', group: 'יעדים', status: 'blocked', x: 900, y: 1100, note: 'סטריק אימוני כוח' },
  { id: 'skydiving', name: 'צניחה חופשית', group: 'חלומות', status: 'open', x: 1150, y: 1100 },
  { id: 'technion', name: 'טכניון → הנדסה כימית', group: 'חלומות', status: 'blocked', blockedBy: ['learning'], x: 1400, y: 1100, note: 'סוף שרשרת למידה' },

  // === MONTHLY & REMINDERS (bottom row) ===
  { id: 'clean-photos', name: 'לנקות תמונות', group: 'חודשי', status: 'open', x: 800, y: 1350 },
  { id: 'car-check', name: 'שמן/מים באוטו', group: 'חודשי', status: 'open', x: 1050, y: 1350 },
  { id: 'haircut', name: 'להסתפר', group: 'חודשי', status: 'open', x: 1300, y: 1350 },
  { id: 'arsenal-2027', name: 'להתכונן לארסנל', group: 'תזכורות', status: 'open', x: 1600, y: 1350, note: 'יולי 2026' },
  { id: 'zara', name: 'Zara משלוח', group: 'תזכורות', status: 'open', x: 1850, y: 1350 },
  { id: 'luna', name: 'לבקר לונה', group: 'חד-פעמי', status: 'open', x: 2100, y: 1350, note: 'שבת שמשית' },

  // === NOTES ===
  { id: 'tennis-net', name: 'רשת טניס כדורגל', group: 'הערות', status: 'open', x: 2400, y: 1350 },
  { id: 'emulsion', name: 'ללמוד אמולסיה', group: 'הערות', status: 'open', x: 2650, y: 1350 },
]

const STATUS_COLORS: Record<string, { bg: string; border: string; dot: string; string: string; glow: string; text: string }> = {
  'blocked':     { bg: 'rgba(30, 33, 50, 0.85)',     border: 'rgba(100,110,140,0.45)', dot: '#7a85a8', string: 'rgba(100,110,140,0.22)', glow: 'rgba(100,110,140,0.12)', text: '#a0a8c0' },
  'open':        { bg: 'rgba(45, 35, 15, 0.85)',     border: 'rgba(255,183,77,0.6)',   dot: '#ffca28', string: 'rgba(255,202,40,0.35)',  glow: 'rgba(255,202,40,0.18)',  text: '#ffe0a0' },
  'in-progress': { bg: 'rgba(20, 45, 25, 0.85)',     border: 'rgba(105,240,174,0.5)',  dot: '#69f0ae', string: 'rgba(105,240,174,0.35)', glow: 'rgba(105,240,174,0.2)',  text: '#b9f6ca' },
  'done':        { bg: 'rgba(15, 35, 50, 0.85)',     border: 'rgba(128,216,255,0.5)',  dot: '#80d8ff', string: 'rgba(128,216,255,0.35)', glow: 'rgba(128,216,255,0.18)', text: '#b3e5fc' },
  'skip':        { bg: 'rgba(30,30,35,0.7)',          border: 'rgba(80,80,90,0.4)',     dot: '#666',    string: 'rgba(80,80,90,0.2)',     glow: 'rgba(80,80,90,0.08)',    text: '#888' },
}

const GROUP_LABELS: Record<string, string> = {
  'חוסמים': 'חוסמים ראשיים',
  'אחרי אבא': 'אחרי דיבור עם אבא',
  'רופאים': 'רופאים',
  'אחרי דירה': 'נפתח ע"י מעבר דירה',
  'חברים': 'חברים',
  'יצירתי': 'פרויקטים יצירתיים',
  'למידה': 'נפתח ע"י עקומת למידה',
  'טכני': 'פרויקטים טכניים',
  'יעדים': 'יעדים',
  'חלומות': 'חלומות',
  'חודשי': 'חודשי',
  'תזכורות': 'תזכורות',
  'חד-פעמי': 'חד-פעמי',
  'הערות': 'הערות כלליות',
}

// Collect all connections (from blockedBy)
function getConnections(nodes: BoardNode[]): { from: BoardNode; to: BoardNode }[] {
  const conns: { from: BoardNode; to: BoardNode }[] = []
  const nodeMap = new Map(nodes.map(n => [n.id, n]))
  for (const node of nodes) {
    if (node.blockedBy) {
      for (const blockerId of node.blockedBy) {
        const blocker = nodeMap.get(blockerId)
        if (blocker) {
          conns.push({ from: blocker, to: node })
        }
      }
    }
  }
  return conns
}

// Group label positions
function getGroupLabelPositions(nodes: BoardNode[]): { group: string; label: string; x: number; y: number }[] {
  const groups = new Map<string, { minX: number; minY: number; maxX: number }>()
  for (const n of nodes) {
    const g = groups.get(n.group)
    if (!g) {
      groups.set(n.group, { minX: n.x, minY: n.y, maxX: n.x })
    } else {
      g.minX = Math.min(g.minX, n.x)
      g.minY = Math.min(g.minY, n.y)
      g.maxX = Math.max(g.maxX, n.x)
    }
  }
  return Array.from(groups.entries()).map(([group, { minX, minY, maxX }]) => ({
    group,
    label: GROUP_LABELS[group] || group,
    x: (minX + maxX) / 2,
    y: minY - 35,
  }))
}

const CANVAS_W = 3200
const CANVAS_H = 1550

export default function DetectiveBoard() {
  const [firestoreNodes, setFirestoreNodes] = useState<LifeNode[]>([])
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Pan & zoom state
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [scale, setScale] = useState(0.15)
  const [ready, setReady] = useState(false)
  const dragRef = useRef<{ startX: number; startY: number; panX: number; panY: number } | null>(null)
  const pinchRef = useRef<{ dist: number; scale: number } | null>(null)

  useEffect(() => {
    const unsub = onNodesChange(setFirestoreNodes)
    return unsub
  }, [])

  // Auto-fit on mount + window resize
  const doFit = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return
    const padding = 20
    const scaleX = (rect.width - padding * 2) / CANVAS_W
    const scaleY = (rect.height - padding * 2) / CANVAS_H
    const fitScale = Math.min(scaleX, scaleY)
    const fitX = (rect.width - CANVAS_W * fitScale) / 2
    const fitY = (rect.height - CANVAS_H * fitScale) / 2
    setScale(fitScale)
    setPan({ x: fitX, y: fitY })
    setReady(true)
  }, [])

  useEffect(() => {
    // Try immediately, then retry after a short delay for mobile
    doFit()
    const t1 = setTimeout(doFit, 150)
    const t2 = setTimeout(doFit, 500)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [doFit])

  // Merge Firestore status
  const mergedNodes = BOARD_NODES.map(bn => {
    const fsNode = firestoreNodes.find(n => n.id === bn.id || n.name === bn.name)
    if (fsNode && fsNode.status === 'done') return { ...bn, status: 'done' as const }
    return bn
  })

  const connections = getConnections(mergedNodes)
  const groupLabels = getGroupLabelPositions(mergedNodes)
  const nodeMap = new Map(mergedNodes.map(n => [n.id, n]))

  // Highlight connections for selected node
  const highlightedIds = new Set<string>()
  if (selectedNode) {
    highlightedIds.add(selectedNode)
    const sel = nodeMap.get(selectedNode)
    if (sel?.blockedBy) sel.blockedBy.forEach(id => highlightedIds.add(id))
    if (sel?.unlocks) sel.unlocks.forEach(id => highlightedIds.add(id))
  }

  // Touch handlers for pan
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('.board-pin')) return
    dragRef.current = { startX: e.clientX, startY: e.clientY, panX: pan.x, panY: pan.y }
  }, [pan])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current) return
    const dx = e.clientX - dragRef.current.startX
    const dy = e.clientY - dragRef.current.startY
    setPan({ x: dragRef.current.panX + dx, y: dragRef.current.panY + dy })
  }, [])

  const handlePointerUp = useCallback(() => {
    dragRef.current = null
  }, [])

  // Pinch zoom
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      pinchRef.current = { dist: Math.hypot(dx, dy), scale }
    }
  }, [scale])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchRef.current) {
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      const dist = Math.hypot(dx, dy)
      const newScale = Math.max(0.15, Math.min(1.5, pinchRef.current.scale * (dist / pinchRef.current.dist)))
      setScale(newScale)
    }
  }, [])

  const handleTouchEnd = useCallback(() => {
    pinchRef.current = null
  }, [])

  // Node width for centering strings
  const NW = 200
  const NH = 56

  return (
    <div className="board-detective">
      {/* Zoom controls */}
      <div className="board-zoom-controls">
        <button onClick={() => setScale(s => Math.min(1.5, s + 0.1))}>+</button>
        <button onClick={() => setScale(s => Math.max(0.15, s - 0.1))}>-</button>
        <button onClick={doFit}>R</button>
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        className="board-canvas-container"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="board-canvas"
          style={{
            width: CANVAS_W,
            height: CANVAS_H,
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
            transformOrigin: '0 0',
            opacity: ready ? 1 : 0,
            transition: ready ? 'opacity 0.3s' : 'none',
          }}
        >
          {/* SVG strings layer */}
          <svg className="board-strings" width={CANVAS_W} height={CANVAS_H}>
            {connections.map(({ from, to }, i) => {
              const isHighlighted = selectedNode && (highlightedIds.has(from.id) && highlightedIds.has(to.id))
              const color = isHighlighted
                ? STATUS_COLORS[from.status].dot
                : STATUS_COLORS[from.status].string
              return (
                <line
                  key={i}
                  x1={from.x + NW / 2}
                  y1={from.y + NH}
                  x2={to.x + NW / 2}
                  y2={to.y}
                  stroke={color}
                  strokeWidth={isHighlighted ? 3 : 1.8}
                  strokeDasharray={isHighlighted ? 'none' : '8 5'}
                  opacity={selectedNode && !isHighlighted ? 0.15 : 1}
                />
              )
            })}
          </svg>

          {/* Group labels */}
          {groupLabels.map(({ group, label, x, y }) => (
            <div
              key={group}
              className="board-group-label"
              style={{ left: x, top: y, transform: 'translateX(-50%)' }}
            >
              {label}
            </div>
          ))}

          {/* Pins */}
          {mergedNodes.map(node => {
            const colors = STATUS_COLORS[node.status]
            const isSelected = selectedNode === node.id
            const isConnected = highlightedIds.has(node.id)
            const dimmed = selectedNode && !isConnected

            return (
              <div
                key={node.id}
                className={`board-pin ${isSelected ? 'selected' : ''} ${dimmed ? 'dimmed' : ''}`}
                style={{
                  left: node.x,
                  top: node.y,
                  background: colors.bg,
                  borderColor: isSelected ? '#fff' : colors.border,
                  '--pin-dot': colors.dot,
                  '--pin-glow': colors.glow,
                  '--pin-text': colors.text,
                } as React.CSSProperties}
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedNode(selectedNode === node.id ? null : node.id)
                }}
              >
                <span className="pin-dot" />
                <span className="pin-name">{node.name}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Detail popup */}
      {selectedNode && nodeMap.get(selectedNode) && (() => {
        const node = nodeMap.get(selectedNode)!
        const blockerNames = (node.blockedBy || []).map(id => nodeMap.get(id)?.name ?? id)
        const unlockNames = (node.unlocks || []).map(id => nodeMap.get(id)?.name ?? id)
        return (
          <div className="board-detail" onClick={() => setSelectedNode(null)}>
            <div className="board-detail-card" onClick={e => e.stopPropagation()}>
              <div className="board-detail-header">
                <span className="board-detail-dot" style={{ background: STATUS_COLORS[node.status].dot }} />
                <span className="board-detail-name">{node.name}</span>
                <button className="board-detail-close" onClick={() => setSelectedNode(null)}>✕</button>
              </div>
              {node.note && <p className="board-detail-note">{node.note}</p>}
              {blockerNames.length > 0 && (
                <div className="board-detail-section">
                  <span className="board-detail-label">חסום ע״י:</span>
                  <div className="board-detail-tags">
                    {blockerNames.map(n => <span key={n} className="board-tag blocker">{n}</span>)}
                  </div>
                </div>
              )}
              {unlockNames.length > 0 && (
                <div className="board-detail-section">
                  <span className="board-detail-label">פותח:</span>
                  <div className="board-detail-tags">
                    {unlockNames.map(n => <span key={n} className="board-tag unlock">{n}</span>)}
                  </div>
                </div>
              )}
            </div>
          </div>
        )
      })()}
    </div>
  )
}
