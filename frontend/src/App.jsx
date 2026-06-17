import React, { useState } from "react";
import TripPlanner from "./pages/TripPlanner";

export default function App() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")

  function handleContactSubmit(e) {
    e.preventDefault()
    // Build a mailto: link to open user's mail client with prefilled fields
    const to = 'aaryanrahulmane@gmail.com'
    const subject = encodeURIComponent('Contact from Truck Log ELD')
    const bodyLines = [
      `Name: ${name || '---'}`,
      `Email: ${email || '---'}`,
      '',
      message || 'No message provided',
    ]
    const body = encodeURIComponent(bodyLines.join('\n'))
    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`
  }

  return (
    <div className="app-root">
      <header className="app-header">
        <div className="app-header-inner">
          <div className="app-title">Truck Log ELD</div>
          <div className="app-top-right">
            <div className="author-desc">
              Built by Aaryan Mane —
              <a href="https://github.com/Aaryanmane" target="_blank" rel="noopener noreferrer"> GitHub</a>
              {' | '}
              <a href="https://www.linkedin.com/in/aaryan-mane-474a4a3aa/" target="_blank" rel="noopener noreferrer"> LinkedIn</a>
            </div>
            <form className="contact-box" onSubmit={handleContactSubmit}>
              <input placeholder="Your name" value={name} onChange={e => setName(e.target.value)} />
              <input placeholder="Your email" value={email} onChange={e => setEmail(e.target.value)} />
              <textarea placeholder="Message" value={message} onChange={e => setMessage(e.target.value)} />
              <button type="submit">Send</button>
            </form>
          </div>
        </div>
      </header>
      <main>
        <TripPlanner />
      </main>
    </div>
  );
}
