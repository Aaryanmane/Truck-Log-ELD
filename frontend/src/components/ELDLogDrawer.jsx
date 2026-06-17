import React, { useState } from 'react'
import DailyLogSheet, { formatCoord } from './DailyLogSheet'

const SAMPLE_LOGS = [
  {
    day_index: 1,
    segments: [
      { status: 'OFF_DUTY', start_hour: 0, duration: 6 },
      { status: 'ON_DUTY_PICKUP', start_hour: 6, duration: 1 },
      { status: 'DRIVING', start_hour: 7, duration: 11 },
      { status: 'OFF_DUTY', start_hour: 18, duration: 6 },
    ],
    cycle_hours_after_day: 22,
    cycle_violation: false,
  },
  {
    day_index: 2,
    segments: [
      { status: 'OFF_DUTY', start_hour: 0, duration: 10 },
      { status: 'DRIVING', start_hour: 10, duration: 8 },
      { status: 'ON_DUTY', start_hour: 18, duration: 0.5 },
      { status: 'ON_DUTY_DROPOFF', start_hour: 18.5, duration: 1 },
      { status: 'OFF_DUTY', start_hour: 19.5, duration: 4.5 },
    ],
    cycle_hours_after_day: 31.5,
    cycle_violation: false,
  },
]

const SAMPLE_META = {
  from: '37.77°N, 122.42°W',
  to: '34.05°N, 118.24°W',
  totalDistanceMiles: 382,
  totalDays: 2,
}

export default function ELDLogDrawer({ logs, tripMeta }) {
  const [preview, setPreview] = useState(false)
  const [visible, setVisible] = useState(true)

  const displayLogs = logs?.length ? logs : preview ? SAMPLE_LOGS : null
  const displayMeta = tripMeta || (preview ? SAMPLE_META : null)

  // When there are no logs or preview, show the empty-state which can set preview
  if (!displayLogs?.length || !visible) {
    return (
      <div className={"eld-log-drawer " + (!visible ? 'eld-log-drawer--closed' : 'eld-log-drawer--empty')}>
        <div className="eld-empty-state">
          <p className="eld-empty-title">Drivers Daily Log</p>
          <p className="eld-empty-sub">Plan a trip to generate filled log sheets</p>
          <div className="eld-empty-actions">
            <button type="button" className="eld-preview-btn" onClick={() => { setPreview(true); setVisible(true); }}>
              Preview sample log sheet
            </button>
          </div>
        </div>
      </div>
    )
  }

  const startDate = new Date()

  return (
    <div className="eld-log-drawer">
      <div className="eld-log-drawer-header">
        {!logs?.length && preview && (
          <p className="eld-preview-banner">Sample preview — plan a trip for live data</p>
        )}
        <div className="eld-drawer-actions">
          <button type="button" className="eld-close-btn" onClick={() => { setVisible(false); setPreview(false); }} aria-label="Close logs">Close</button>
        </div>
      </div>
      <div className="eld-log-scroll">
        {displayLogs.map(day => (
          <DailyLogSheet
            key={day.day_index}
            day={day}
            tripMeta={displayMeta}
            startDate={startDate}
          />
        ))}
      </div>
    </div>
  )
}

export { formatCoord }
