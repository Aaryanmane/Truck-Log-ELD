import React, { useMemo } from 'react'

const ROWS = [
  { key: 'OFF_DUTY', label: '1. Off Duty' },
  { key: 'SLEEPER', label: '2. Sleeper Berth' },
  { key: 'DRIVING', label: '3. Driving' },
  { key: 'ON_DUTY', label: '4. On Duty (not driving)' },
]

const STATUS_ROW = {
  OFF_DUTY: 0,
  SLEEPER: 1,
  DRIVING: 2,
  ON_DUTY: 3,
  ON_DUTY_PICKUP: 3,
  ON_DUTY_DROPOFF: 3,
}

const HOUR_LABELS = [
  'Mid-night', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11',
  'Noon', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', 'Mid-night',
]

function formatCoord(lat, lon) {
  const ns = lat >= 0 ? 'N' : 'S'
  const ew = lon >= 0 ? 'E' : 'W'
  return `${Math.abs(lat).toFixed(2)}°${ns}, ${Math.abs(lon).toFixed(2)}°${ew}`
}

function formatHour(h) {
  const hr = Math.floor(h)
  const min = Math.round((h - hr) * 60)
  const suffix = hr >= 12 ? 'PM' : 'AM'
  const display = hr % 12 || 12
  return `${display}:${String(min).padStart(2, '0')} ${suffix}`
}

function addDays(date, days) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function statusLabel(status) {
  const map = {
    OFF_DUTY: 'Off Duty',
    SLEEPER: 'Sleeper Berth',
    DRIVING: 'Driving',
    ON_DUTY: 'On Duty',
    ON_DUTY_PICKUP: 'On Duty (Pickup)',
    ON_DUTY_DROPOFF: 'On Duty (Dropoff)',
  }
  return map[status] || status
}

function computeTotals(segments) {
  const totals = { OFF_DUTY: 0, SLEEPER: 0, DRIVING: 0, ON_DUTY: 0 }
  for (const s of segments) {
    const key = s.status === 'ON_DUTY_PICKUP' || s.status === 'ON_DUTY_DROPOFF' ? 'ON_DUTY' : s.status
    if (totals[key] !== undefined) totals[key] += s.duration
  }
  return totals
}

function buildRemarks(segments) {
  return segments
    .filter(s => s.status !== 'OFF_DUTY')
    .map(s => `${formatHour(s.start_hour)} – ${statusLabel(s.status)} (${s.duration.toFixed(1)}h)`)
    .join('; ')
}

function buildDutyPath(segments, gridW, rowH) {
  if (!segments.length) return ''
  const parts = []
  let prevRow = null
  let prevX = null

  for (const seg of segments) {
    const row = STATUS_ROW[seg.status] ?? 3
    const y = row * rowH + rowH / 2
    const x1 = (seg.start_hour / 24) * gridW
    const x2 = ((seg.start_hour + seg.duration) / 24) * gridW

    if (prevRow === null) {
      parts.push(`M ${x1} ${y}`)
    } else if (prevRow !== row) {
      parts.push(`L ${x1} ${prevRow * rowH + rowH / 2}`)
      parts.push(`L ${x1} ${y}`)
    } else if (prevX !== null && Math.abs(prevX - x1) > 0.5) {
      parts.push(`M ${x1} ${y}`)
    }

    parts.push(`L ${x2} ${y}`)
    prevRow = row
    prevX = x2
  }

  return parts.join(' ')
}

function DutyGrid({ segments }) {
  const gridW = 720
  const rowH = 22
  const gridH = rowH * 4

  const path = useMemo(() => buildDutyPath(segments, gridW, rowH), [segments])

  return (
    <div className="log-grid-wrap">
      <div className="log-grid-layout">
        <div className="log-grid-spacer" />
        <div className="log-grid-header">
          {HOUR_LABELS.map((label, i) => (
            <span key={i} className="log-grid-hour">{label}</span>
          ))}
        </div>
        <div className="log-grid-totals-header">Total Hours</div>

        <div className="log-grid-labels">
          {ROWS.map(r => (
            <div key={r.key} className="log-grid-row-label">{r.label}</div>
          ))}
        </div>
        <svg
          className="log-grid-svg"
          viewBox={`0 0 ${gridW} ${gridH}`}
          preserveAspectRatio="none"
        >
          {Array.from({ length: 25 }, (_, i) => (
            <line
              key={`v${i}`}
              x1={(i / 24) * gridW}
              y1={0}
              x2={(i / 24) * gridW}
              y2={gridH}
              className="log-grid-line-major"
            />
          ))}
          {Array.from({ length: 96 }, (_, i) => {
            if (i % 4 === 0) return null
            return (
              <line
                key={`q${i}`}
                x1={(i / 96) * gridW}
                y1={0}
                x2={(i / 96) * gridW}
                y2={gridH}
                className="log-grid-line-minor"
              />
            )
          })}
          {[1, 2, 3].map(i => (
            <line
              key={`h${i}`}
              x1={0}
              y1={i * rowH}
              x2={gridW}
              y2={i * rowH}
              className="log-grid-line-major"
            />
          ))}
          <path d={path} className="log-duty-line" fill="none" />
        </svg>
        <div className="log-grid-totals">
          {ROWS.map(r => {
            const totals = computeTotals(segments)
            const val = totals[r.key] ?? 0
            return (
              <div key={r.key} className="log-grid-total-cell">
                {val > 0 ? val.toFixed(1) : ''}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default function DailyLogSheet({ day, tripMeta, startDate }) {
  const date = addDays(startDate, day.day_index - 1)
  const month = date.getMonth() + 1
  const dayNum = date.getDate()
  const year = date.getFullYear()

  const totals = computeTotals(day.segments)
  const onDutyToday = totals.DRIVING + totals.ON_DUTY
  const recapA = day.cycle_hours_after_day
  const recapB = Math.max(0, 70 - recapA)
  const milesToday = day.day_index === 1
    ? Math.round((tripMeta?.totalDistanceMiles || 0) / Math.max(tripMeta?.totalDays || 1, 1))
    : ''

  return (
    <article className="daily-log-sheet">
      <header className="log-sheet-header">
        <div className="log-title-block">
          <h2 className="log-title">Drivers Daily Log</h2>
          <p className="log-subtitle">( 24 hours )</p>
        </div>
        <div className="log-date-block">
          <div className="log-date-row">
            <span className="log-date-val">{month}</span>
            <span className="log-date-sep">/</span>
            <span className="log-date-val">{dayNum}</span>
            <span className="log-date-sep">/</span>
            <span className="log-date-val">{year}</span>
          </div>
          <div className="log-date-labels">
            <span>( month )</span>
            <span>( day )</span>
            <span>( year )</span>
          </div>
        </div>
        <p className="log-filing-note">
          Original — File at home terminal. Duplicate — Driver retains in his/her possession for 8 days.
        </p>
      </header>

      <div className="log-route-row">
        <div className="log-field-line">
          <span className="log-field-label">From:</span>
          <span className="log-field-value">{tripMeta?.from || '—'}</span>
        </div>
        <div className="log-field-line">
          <span className="log-field-label">To:</span>
          <span className="log-field-value">{tripMeta?.to || '—'}</span>
        </div>
      </div>

      <div className="log-info-grid">
        <div className="log-info-left">
          <div className="log-info-boxes-row">
            <div className="log-info-box">
              <span className="log-info-box-label">Total Miles Driving Today</span>
              <span className="log-info-box-value">{milesToday}</span>
            </div>
            <div className="log-info-box">
              <span className="log-info-box-label">Total Mileage Today</span>
              <span className="log-info-box-value">{milesToday}</span>
            </div>
          </div>
          <div className="log-info-box log-info-box-wide">
            <span className="log-info-box-label">
              Truck/Tractor and Trailer Numbers or License Plate(s)/State (show each unit)
            </span>
            <span className="log-info-box-value">Unit 101 / CA</span>
          </div>
        </div>
        <div className="log-info-right">
          <div className="log-field-line">
            <span className="log-field-value">ENA Spotter Logistics</span>
            <span className="log-field-caption">Name of Carrier or Carriers</span>
          </div>
          <div className="log-field-line">
            <span className="log-field-value">100 Terminal Blvd, Home Base, USA</span>
            <span className="log-field-caption">Main Office Address</span>
          </div>
          <div className="log-field-line">
            <span className="log-field-value">100 Terminal Blvd, Home Base, USA</span>
            <span className="log-field-caption">Home Terminal Address</span>
          </div>
        </div>
      </div>

      <DutyGrid segments={day.segments} />

      <div className="log-remarks">
        <h3 className="log-remarks-title">Remarks</h3>
        <div className="log-remarks-body">
          <div className="log-remarks-left">
            <p>Shipping Documents:</p>
            <p>BOL / Manifest No. or</p>
            <p>Shipper &amp; Commodity</p>
          </div>
          <div className="log-remarks-text">
            {buildRemarks(day.segments)}
            {day.cycle_violation && (
              <span className="log-violation"> — 70-hour/8-day cycle limit exceeded</span>
            )}
          </div>
        </div>
        <p className="log-remarks-note">
          Enter name of place you reported and where released from work and when and where each change of duty occurred.
          Use time standard of home terminal.
        </p>
      </div>

      <div className="log-recap">
        <h3 className="log-recap-title">Recap: Complete at end of day</h3>
        <table className="log-recap-table">
          <thead>
            <tr>
              <th rowSpan={2}>On duty hours today,<br />Total lines 3 &amp; 4</th>
              <th colSpan={3}>70 Hour / 8 Day Drivers</th>
              <th colSpan={3}>60 Hour / 7 Day Drivers</th>
            </tr>
            <tr>
              <th>A</th><th>B</th><th>C</th>
              <th>A</th><th>B</th><th>C</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="log-recap-val">{onDutyToday.toFixed(1)}</td>
              <td className="log-recap-val">{recapA.toFixed(1)}</td>
              <td className="log-recap-val">{recapB.toFixed(1)}</td>
              <td className="log-recap-val">{recapA.toFixed(1)}</td>
              <td className="log-recap-val">{Math.max(0, 60 - recapA).toFixed(1)}</td>
              <td className="log-recap-val">{Math.max(0, recapA - 10).toFixed(1)}</td>
              <td className="log-recap-val">{Math.max(0, 60 - recapA).toFixed(1)}</td>
            </tr>
          </tbody>
        </table>
        <p className="log-recap-footnote">
          *If you took 34 consecutive hours off duty you have 60/70 hours available
        </p>
      </div>
    </article>
  )
}

export { formatCoord, addDays }
