import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { isUserLoggedIn } from '../middlewares/check-user-is-logged-in'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'

export async function mealsRoutes(app: FastifyInstance) {
  app.post(
    '/',
    {
      preHandler: [isUserLoggedIn],
    },
    async (req, reply) => {
      const bodySchema = z.object({
        name: z.string().min(3),
        description: z.string().min(5),
        datetime: z.string(),
        isDiet: z.boolean(),
      })

      const { success, error, data } = bodySchema.safeParse(req.body)

      if (!success) {
        return reply.status(400).send({ message: error.errors[0].message })
      }

      const { name, description, datetime, isDiet } = data

      const { sessionId } = req.cookies

      const user = await knex('users')
        .where('session_id', sessionId)
        .select('id')
        .first()

      if (!user) {
        return reply.status(404).send({ message: 'User not found!' })
      }

      await knex('meals_register').insert({
        id: randomUUID(),
        name,
        description,
        datetime: new Date(datetime),
        user_id: user?.id,
        is_diet: isDiet,
      })

      return reply.status(201).send()
    },
  )

  app.get(
    '/',
    {
      preHandler: [isUserLoggedIn],
    },
    async (req, reply) => {
      const { sessionId } = req.cookies

      const user = await knex('users')
        .where('session_id', sessionId)
        .select('id')
        .first()

      if (!user) {
        return reply.status(404).send({ message: 'User not found' })
      }

      const meals = await knex('meals_register')
        .where('user_id', user.id)
        .select()

      return { meals }
    },
  )
}
