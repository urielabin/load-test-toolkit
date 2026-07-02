import express, { type Express } from 'express'

/** A small real HTTP app used as a load target in tests — not mocked, an actual server handling real requests. */
export function createFixtureApp(): Express {
  const app = express()

  app.get('/health', (_req, res) => {
    res.status(200).json({ ok: true })
  })

  app.get('/slow', (_req, res) => {
    const delayMs = 20 + Math.random() * 60
    setTimeout(() => res.status(200).json({ ok: true, delayMs }), delayMs)
  })

  app.get('/flaky', (_req, res) => {
    if (Math.random() < 0.2) {
      res.status(500).json({ ok: false })
      return
    }
    res.status(200).json({ ok: true })
  })

  return app
}
