import fastify from 'fastify'
import cookie from '@fastify/cookie'
import { usersRoutes } from './routes/users'
import { authRoutes } from './routes/auth'

export const app = fastify()

app.register(cookie)
app.register(usersRoutes, { prefix: 'user' })
app.register(authRoutes, { prefix: 'auth' })
