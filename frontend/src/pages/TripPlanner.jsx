import React, { useState } from 'react'
import MapView from '../components/MapView'
import ELDLogDrawer, { formatCoord } from '../components/ELDLogDrawer'

export default function TripPlanner() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [form, setForm] = useState({
    current_mode: 'coords',
    current_lat: '37.7749',
    current_lon: '-122.4194',
    current_place: '',

    pickup_mode: 'coords',
    pickup_lat: '36.7783',
    pickup_lon: '-119.4179',
    pickup_place: '',

    dropoff_mode: 'coords',
    dropoff_lat: '34.0522',
    dropoff_lon: '-118.2437',
    dropoff_place: '',

    current_cycle_used_hours: '10',
  })

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  async function geocodePlace(q) {
    if (!q) throw new Error('Empty place')
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1`
    const resp = await fetch(url, { headers: { Accept: 'application/json' } })
    const data = await resp.json()
    if (!data || !data.length) throw new Error('Place not found')
    const item = data[0]
    return { lat: parseFloat(item.lat), lon: parseFloat(item.lon) }
  }

  const submit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      // Resolve coordinates either from direct lat/lon inputs or from place name via geocoding
      let current, pickup, dropoff

      if (form.current_mode === 'place') {
        current = await geocodePlace(form.current_place)
      } else {
        current = { lat: parseFloat(form.current_lat), lon: parseFloat(form.current_lon) }
      }

      if (form.pickup_mode === 'place') {
        pickup = await geocodePlace(form.pickup_place)
      } else {
        pickup = { lat: parseFloat(form.pickup_lat), lon: parseFloat(form.pickup_lon) }
      }

      if (form.dropoff_mode === 'place') {
        dropoff = await geocodePlace(form.dropoff_place)
      } else {
        dropoff = { lat: parseFloat(form.dropoff_lat), lon: parseFloat(form.dropoff_lon) }
      }

      const body = {
        current,
        pickup,
        dropoff,
        current_cycle_used_hours: parseFloat(form.current_cycle_used_hours || 0),
      }

      const resp = await fetch('/api/plan/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await resp.json()
      if (!resp.ok) throw new Error(data.error || 'Request failed')

      const totalDistanceMiles = (data.legs?.total_distance_km || 0) / 1.609
      data.tripMeta = {
        from: formatCoord(current.lat, current.lon),
        to: formatCoord(dropoff.lat, dropoff.lon),
        pickup: formatCoord(pickup.lat, pickup.lon),
        totalDistanceMiles: Math.round(totalDistanceMiles),
        totalDays: data.eld_logs?.length || 1,
      }
      setResult(data)
    } catch (err) {
      console.error(err)
      alert('Request failed — is the Django backend running?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="trip-planner">
      <section className="planner-card">
        <h2 className="section-title">Trip Details</h2>
        <form onSubmit={submit} className="trip-form">
          <fieldset className="form-group">
            <legend>Current Location</legend>
            <label className="mode-select">
              <input type="radio" name="current_mode" value="coords" checked={form.current_mode === 'coords'} onChange={handleChange} /> Coordinates
            </label>
            <label className="mode-select">
              <input type="radio" name="current_mode" value="place" checked={form.current_mode === 'place'} onChange={handleChange} /> Place name
            </label>
            {form.current_mode === 'coords' ? (
              <>
                <label>
                  Latitude
                  <input name="current_lat" value={form.current_lat} onChange={handleChange} />
                </label>
                <label>
                  Longitude
                  <input name="current_lon" value={form.current_lon} onChange={handleChange} />
                </label>
              </>
            ) : (
              <label>
                Place name
                <input name="current_place" value={form.current_place} onChange={handleChange} placeholder="e.g. San Francisco, CA" />
              </label>
            )}
          </fieldset>
          <fieldset className="form-group">
            <legend>Pickup Location</legend>
            <label className="mode-select">
              <input type="radio" name="pickup_mode" value="coords" checked={form.pickup_mode === 'coords'} onChange={handleChange} /> Coordinates
            </label>
            <label className="mode-select">
              <input type="radio" name="pickup_mode" value="place" checked={form.pickup_mode === 'place'} onChange={handleChange} /> Place name
            </label>
            {form.pickup_mode === 'coords' ? (
              <>
                <label>
                  Latitude
                  <input name="pickup_lat" value={form.pickup_lat} onChange={handleChange} />
                </label>
                <label>
                  Longitude
                  <input name="pickup_lon" value={form.pickup_lon} onChange={handleChange} />
                </label>
              </>
            ) : (
              <label>
                Place name
                <input name="pickup_place" value={form.pickup_place} onChange={handleChange} placeholder="e.g. Fresno, CA" />
              </label>
            )}
          </fieldset>
          <fieldset className="form-group">
            <legend>Dropoff Location</legend>
            <label className="mode-select">
              <input type="radio" name="dropoff_mode" value="coords" checked={form.dropoff_mode === 'coords'} onChange={handleChange} /> Coordinates
            </label>
            <label className="mode-select">
              <input type="radio" name="dropoff_mode" value="place" checked={form.dropoff_mode === 'place'} onChange={handleChange} /> Place name
            </label>
            {form.dropoff_mode === 'coords' ? (
              <>
                <label>
                  Latitude
                  <input name="dropoff_lat" value={form.dropoff_lat} onChange={handleChange} />
                </label>
                <label>
                  Longitude
                  <input name="dropoff_lon" value={form.dropoff_lon} onChange={handleChange} />
                </label>
              </>
            ) : (
              <label>
                Place name
                <input name="dropoff_place" value={form.dropoff_place} onChange={handleChange} placeholder="e.g. Los Angeles, CA" />
              </label>
            )}
          </fieldset>
          <fieldset className="form-group form-group--narrow">
            <legend>HOS Cycle</legend>
            <label>
              Current cycle used (hrs)
              <input
                name="current_cycle_used_hours"
                type="number"
                min="0"
                max="70"
                step="0.5"
                value={form.current_cycle_used_hours}
                onChange={handleChange}
              />
            </label>
          </fieldset>
          <div className="form-actions">
            <button type="submit" disabled={loading}>
              {loading ? 'Planning…' : 'Plan Trip'}
            </button>
          </div>
        </form>
      </section>

      {result?.legs && (
        <section className="trip-summary">
          <span>Distance: <strong>{result.legs.total_distance_km} km</strong></span>
          <span>Drive time: <strong>{result.legs.total_duration_hours} hrs</strong></span>
          <span>Log days: <strong>{result.eld_logs?.length || 0}</strong></span>
        </section>
      )}

      <div className="outputs">
        <MapView legs={result?.legs} />
        <ELDLogDrawer logs={result?.eld_logs} tripMeta={result?.tripMeta} />
      </div>
    </div>
  )
}
