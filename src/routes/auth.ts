import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'
import { randomUUID } from 'node:crypto'

export async function authRoutes(app: FastifyInstance) {
  app.post('/login', async (req, reply) => {
    const bodySchema = z.object({
      email: z.string().email({ message: 'Invalid email address' }),
      password: z.string().min(5, {
        message: 'Password should have at least 5 characters or more',
      }),
    })

    const { success, error, data } = bodySchema.safeParse(req.body)

    if (!success) {
      return reply.status(400).send({ message: error.errors[0].message })
    }

    const { email, password } = data

    const user = await knex('users')
      .where({ email, password })
      .select(['id', 'session_id'])
      .first()

    if (!user) {
      return reply.status(404).send({
        message: 'User not found. Check your email address and password!',
      })
    }

    let sessionId = req.cookies.sessionId

    if (sessionId !== user.session_id) {
      sessionId = randomUUID()

      reply.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 60 * 10, // 6 horas
      })

      await knex('users').where('id', user.id).update('session_id', sessionId)
    }

    return reply.status(200).send({ message: 'Login Successfull!' })
  })

  app.post('/logout', async (req, reply) => {
    const sessionId = req.cookies.sessionId

    if (sessionId) {
      await knex('users')
        .where('session_id', sessionId)
        .update('session_id', null)

      reply.clearCookie('sessionId', { path: '/' })
    }

    return reply.status(204).send()
  })
}
