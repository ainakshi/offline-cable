import { describe, it, expect } from 'vitest'
import { createRoot } from 'react-dom/client'
import { act } from 'react'
import App from '../App'

describe('Application Bootstrap (Smoke Test)', () => {
  it('TC-17: mounts App into #root container without throwing runtime errors', async () => {
    const rootDiv = document.createElement('div')
    rootDiv.id = 'root'
    document.body.appendChild(rootDiv)

    const root = createRoot(rootDiv)

    await act(async () => {
      root.render(<App />)
    })

    expect(rootDiv.textContent).toContain('Offline Cable')
    expect(rootDiv.querySelectorAll('.task-card')).toHaveLength(3)

    await act(async () => {
      root.unmount()
    })

    document.body.removeChild(rootDiv)
  })
})
