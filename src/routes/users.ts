import { FastifyInstance } from 'fastify'
import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { knex } from '../database'

export async function usersRoutes(app: FastifyInstance) {
  app.post('/', async (req, reply) => {
    const bodySchema = z.object({
      username: z.string(),
      email: z.string().email({ message: 'Invalid email address' }),
      password: z.string().min(5, {
        message: 'Password should have at least 5 characters or more',
      }),
    })

    const validation = bodySchema.safeParse(req.body)

    if (!validation.success) {
      return reply
        .status(400)
        .send({ message: validation.error.errors[0].message })
    }

    const { username, email, password } = validation.data

    await knex('users').insert({
      id: randomUUID(),
      username,
      email,
      password,
    })

    return reply.status(201).send()
  })
}
