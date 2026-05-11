import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { pathToFileURL } from 'node:url'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''))

  return {
    plugins: [
      react(),
      {
        name: 'local-platform-stats-api',
        configureServer(server) {
          server.middlewares.use('/api/platform-stats', async (req, res, next) => {
            try {
              const { default: handler } = await import(
                `${pathToFileURL(path.resolve(process.cwd(), 'api', 'platform-stats.js')).href}?t=${Date.now()}`
              )

              const apiRes = Object.assign(res, {
                status(code: number) {
                  res.statusCode = code
                  return apiRes
                },
                json(body: unknown) {
                  res.setHeader('Content-Type', 'application/json')
                  res.end(JSON.stringify(body))
                },
              })

              await handler(req, apiRes)
            } catch (error) {
              next(error)
            }
          })
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  }
})
