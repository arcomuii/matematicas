import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { createHash }  from 'node:crypto'
import { URL }         from 'node:url'

const BITUNIX_API_KEY     = "e6aea4343b38c0568e524558020afbe2"
const BITUNIX_SECRET      = "fb29ee282e536d6dc05a7c3fa7479146"
const BITUNIX_FUTURES_BASE = "https://fapi.bitunix.com"
const BITUNIX_SPOT_BASE    = "https://openapi.bitunix.com"
const PROXY_PREFIX         = "/api/bitunix"

function bitunixProxy() {
  return {
    name: 'bitunix-proxy',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url.startsWith(PROXY_PREFIX)) return next()

        const nonce     = String(Math.floor(Math.random() * 900000 + 100000))
        const timestamp = String(Date.now())

        // Extraer y ordenar query params (ASCII ascendente por key)
        const parsed      = new URL(req.url, 'http://localhost')
        const queryParams = [...parsed.searchParams.entries()]
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([k, v]) => `${k}${v}`)
          .join('')

        const body   = ''
        const digest = createHash('sha256')
          .update(nonce + timestamp + BITUNIX_API_KEY + queryParams + body)
          .digest('hex')
        const signature = createHash('sha256')
          .update(digest + BITUNIX_SECRET)
          .digest('hex')

        const targetPath = req.url.slice(PROXY_PREFIX.length) || '/'
        const base = targetPath.startsWith('/api/spot/') ? BITUNIX_SPOT_BASE : BITUNIX_FUTURES_BASE

        const targetUrl = `${base}${targetPath}`
        try {
          const upstream = await fetch(targetUrl, {
            method: req.method,
            headers: {
              'api-key'       : BITUNIX_API_KEY,
              'sign'          : signature,
              'nonce'         : nonce,
              'timestamp'     : timestamp,
              'Content-Type'  : 'application/json',
              'Accept'        : 'application/json',
              'User-Agent'    : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
            },
          })

          const text = await upstream.text()
          res.setHeader('Content-Type', 'application/json')
          res.statusCode = upstream.status
          try {
            res.end(JSON.stringify(JSON.parse(text)))
          } catch {
            res.end(JSON.stringify({ raw: text }))
          }
        } catch (err) {
          console.error(`[bitunix-proxy] ${targetUrl} →`, err.message)
          res.statusCode = 502
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: err.message, url: targetUrl }))
        }
      })
    },
  }
}

const YAHOO_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
let yahooSession = { cookie: '', crumb: '', refreshAt: 0 }

async function refreshYahooSession() {
  try {
    // 1. Obtener cookies de Yahoo Finance
    const fcRes  = await fetch('https://fc.yahoo.com/', {
      headers: { 'User-Agent': YAHOO_UA },
      redirect: 'follow',
    })
    const setCookies = fcRes.headers.getSetCookie?.() ?? [fcRes.headers.get('set-cookie') ?? '']
    const cookie     = setCookies.map(c => c.split(';')[0]).filter(Boolean).join('; ')

    // 2. Obtener crumb usando esas cookies
    const crumbRes = await fetch('https://query1.finance.yahoo.com/v1/test/getcrumb', {
      headers: { 'User-Agent': YAHOO_UA, 'Cookie': cookie },
    })
    const crumb = await crumbRes.text()

    yahooSession = { cookie, crumb, refreshAt: Date.now() + 3_600_000 }
    console.log('[yahoo-proxy] sesión renovada, crumb:', crumb)
  } catch (err) {
    console.error('[yahoo-proxy] error al renovar sesión:', err.message)
  }
}

function yahooProxy() {
  return {
    name: 'yahoo-proxy',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url.startsWith('/api/yahoo')) return next()

        if (Date.now() >= yahooSession.refreshAt) await refreshYahooSession()

        const relativePath = req.url.slice('/api/yahoo'.length) || '/'
        const targetUrl    = new URL(relativePath, 'https://query1.finance.yahoo.com')
        targetUrl.searchParams.set('crumb', yahooSession.crumb)

        try {
          const upstream = await fetch(targetUrl.toString(), {
            headers: {
              'User-Agent': YAHOO_UA,
              'Cookie'    : yahooSession.cookie,
              'Accept'    : 'application/json',
            },
          })
          const text = await upstream.text()
          res.setHeader('Content-Type', 'application/json')
          res.statusCode = upstream.status
          try {
            res.end(JSON.stringify(JSON.parse(text)))
          } catch {
            res.end(JSON.stringify({ raw: text }))
          }
        } catch (err) {
          console.error(`[yahoo-proxy] ${targetUrl} →`, err.message)
          res.statusCode = 502
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: err.message }))
        }
      })
    },
  }
}

function coingeckoProxy() {
  const CG_PREFIX = '/api/coingecko'
  const CG_BASE   = 'https://api.coingecko.com'
  const CG_KEY    = process.env.CG_API_KEY || ''

  return {
    name: 'coingecko-proxy',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url.startsWith(CG_PREFIX)) return next()

        const targetPath = req.url.slice(CG_PREFIX.length) || '/'
        const targetUrl  = `${CG_BASE}${targetPath}`

        const headers = {
          'Accept'    : 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        }
        if (CG_KEY) headers['x-cg-demo-api-key'] = CG_KEY

        try {
          const upstream = await fetch(targetUrl, { headers })
          const text = await upstream.text()
          res.setHeader('Content-Type', 'application/json')
          res.statusCode = upstream.status
          try {
            res.end(JSON.stringify(JSON.parse(text)))
          } catch {
            res.end(JSON.stringify({ raw: text }))
          }
        } catch (err) {
          console.error(`[coingecko-proxy] ${targetUrl} →`, err.message)
          res.statusCode = 502
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: err.message }))
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), bitunixProxy(), yahooProxy(), coingeckoProxy()],
})