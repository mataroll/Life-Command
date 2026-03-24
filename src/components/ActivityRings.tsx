interface ActivityRingsProps {
  daily: number   // 0-100
  weekly: number  // 0-100
  size?: number
}

export default function ActivityRings({ daily, weekly, size = 200 }: ActivityRingsProps) {
  const center = size / 2
  const strokeWidth = size * 0.08
  const gap = strokeWidth * 0.6

  const outerRadius = center - strokeWidth / 2 - 2
  const innerRadius = outerRadius - strokeWidth - gap

  const outerCircumference = 2 * Math.PI * outerRadius
  const innerCircumference = 2 * Math.PI * innerRadius

  const outerOffset = outerCircumference * (1 - weekly / 100)
  const innerOffset = innerCircumference * (1 - daily / 100)

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ transform: 'rotate(-90deg)' }}
    >
      {/* Background tracks */}
      <circle
        cx={center}
        cy={center}
        r={outerRadius}
        fill="none"
        stroke="rgba(102, 187, 106, 0.15)"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={center}
        cy={center}
        r={innerRadius}
        fill="none"
        stroke="rgba(79, 195, 247, 0.15)"
        strokeWidth={strokeWidth}
      />

      {/* Weekly ring (outer, green) */}
      <circle
        cx={center}
        cy={center}
        r={outerRadius}
        fill="none"
        stroke="var(--ring-weekly)"
        strokeWidth={strokeWidth}
        strokeDasharray={outerCircumference}
        strokeDashoffset={outerOffset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 1s ease' }}
      />

      {/* Daily ring (inner, blue) */}
      <circle
        cx={center}
        cy={center}
        r={innerRadius}
        fill="none"
        stroke="var(--ring-daily)"
        strokeWidth={strokeWidth}
        strokeDasharray={innerCircumference}
        strokeDashoffset={innerOffset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 1s ease' }}
      />
    </svg>
  )
}
