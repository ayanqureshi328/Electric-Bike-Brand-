import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import mongoose from 'mongoose'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const app = express()
const port = process.env.PORT || 4000
const directory = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(directory, '..')

app.use(cors())
app.use(express.json({ limit: '10kb' }))

const preorderSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
  color: { type: String, required: true, enum: ['Volt', 'Carbon', 'Chalk'] },
}, { timestamps: true })

const Preorder = mongoose.model('Preorder', preorderSchema)

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' })
})

app.post('/api/preorders', async (request, response) => {
  if (mongoose.connection.readyState !== 1) {
    return response.status(503).json({ message: 'Pre-orders are temporarily unavailable. Please try again shortly.' })
  }

  const { name, email, color } = request.body ?? {}
  if (typeof name !== 'string' || !name.trim() || typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email) || !['Volt', 'Carbon', 'Chalk'].includes(color)) {
    return response.status(400).json({ message: 'Enter a valid name, email, and color selection.' })
  }

  try {
    await Preorder.create({ name, email, color })
    return response.status(201).json({ message: 'You’re on the list. We’ll be in touch.' })
  } catch (error) {
    console.error('Could not save preorder:', error.message)
    return response.status(500).json({ message: 'We could not save your pre-order. Please try again.' })
  }
})

if (existsSync(path.join(projectRoot, 'dist'))) {
  app.use(express.static(path.join(projectRoot, 'dist')))
  app.get('*splat', (_request, response) => response.sendFile(path.join(projectRoot, 'dist', 'index.html')))
}

app.listen(port, () => console.log(`Velocity API listening on http://localhost:${port}`))

if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => console.error('MongoDB connection failed:', error.message))
} else {
  console.warn('MONGODB_URI is not set. Pre-order submissions will be unavailable.')
}
