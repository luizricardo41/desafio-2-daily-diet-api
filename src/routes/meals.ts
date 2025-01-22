import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { isUserLoggedIn } from '../middlewares/check-user-is-logged-in'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { ObjectUpdate } from '../@types/ObjectUpdate'

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
      const meals = await knex('meals_register')
        .where('user_id', req.user?.id)
        .select()

      const formattedInfosMeals = meals.map((meal) => {
        return {
          ...meal,
          datetime: new Date(meal.datetime).toISOString(),
        }
      })

      return reply.status(200).send({ formattedInfosMeals })
    },
  )

  app.put(
    '/:id',
    {
      preHandler: [isUserLoggedIn],
    },
    async (req, reply) => {
      const idSchema = z.object({
        id: z.string().uuid(),
      })

      const { success, data, error } = idSchema.safeParse(req.params)

      if (!success) {
        return reply.status(400).send({ message: error.errors[0].message })
      }

      const { id } = data

      const meal = await knex('meals_register')
        .where({ id, user_id: req.user?.id })
        .select()
        .first()

      if (!meal) {
        return reply.status(404).send({ message: 'Meal not found' })
      }

      if (JSON.stringify(req.body) === '{}') {
        return reply.status(304).send()
      }

      const bodySchema = z.object({
        name: z.string().min(3).optional(),
        description: z.string().min(5).optional(),
        datetime: z.string().optional(),
        isDiet: z.boolean().optional(),
      })

      const {
        success: successBody,
        data: dataBody,
        error: errorBody,
      } = bodySchema.safeParse(req.body)

      if (!successBody) {
        return reply.status(400).send({ message: errorBody.errors[0].message })
      }

      const { name, description, datetime, isDiet } = dataBody
      const objUpdate = {} as ObjectUpdate

      if (name) objUpdate.name = name
      if (description) objUpdate.description = description
      if (datetime) objUpdate.datetime = new Date(datetime)
      if (isDiet) objUpdate.is_diet = isDiet

      await knex('meals_register').where('id', id).update(objUpdate)

      return reply.status(201).send({ message: 'Meal Updated' })
    },
  )

  app.get(
    '/:id',
    {
      preHandler: [isUserLoggedIn],
    },
    async (req, reply) => {
      const idSchema = z.object({
        id: z.string().uuid(),
      })

      const { success, data, error } = idSchema.safeParse(req.params)

      if (!success) {
        return reply.status(400).send({ message: error.errors[0].message })
      }

      const { id } = data

      const meal = await knex('meals_register')
        .where({ id, user_id: req.user?.id })
        .select()
        .first()

      if (!meal) {
        return reply.status(404).send({ message: 'Meal not found' })
      }

      const formattedMeal = {
        ...meal,
        datetime: new Date(meal.datetime).toISOString(),
      }

      return reply.status(200).send({ meal: formattedMeal })
    },
  )

  app.get(
    '/metrics',
    {
      preHandler: [isUserLoggedIn],
    },
    async (req, reply) => {
      const meals = await knex('meals_register')
        .where({ user_id: req.user?.id })
        .select()

      if (!meals) {
        return reply
          .status(404)
          .send({ message: 'Meal not found for this user' })
      }

      const quantityMeals = meals.length
      let quantityMealsIntoDiet = 0
      let quantityMealsOutDiet = 0
      let bestSequenceInDiet = 0
      let auxSequence = 0

      for (const meal of meals) {
        if (meal.is_diet) {
          quantityMealsIntoDiet += 1
          auxSequence += 1
        }
        if (!meal.is_diet) {
          quantityMealsOutDiet += 1
          auxSequence = 0
        }
        if (auxSequence > bestSequenceInDiet) bestSequenceInDiet = auxSequence
      }

      return reply.status(200).send({
        quantityMeals,
        quantityMealsIntoDiet,
        quantityMealsOutDiet,
        bestSequenceInDiet,
      })
    },
  )

  app.delete(
    '/:id',
    {
      preHandler: [isUserLoggedIn],
    },
    async (req, reply) => {
      const idSchema = z.object({
        id: z.string().uuid(),
      })

      const { success, data, error } = idSchema.safeParse(req.params)

      if (!success) {
        return reply.status(400).send({ message: error.errors[0].message })
      }

      const { id } = data

      const meal = await knex('meals_register')
        .where({ id, user_id: req.user?.id })
        .select()
        .first()

      if (!meal) {
        return reply.status(404).send({ message: 'Meal not found' })
      }

      await knex('meals_register').where('id', meal.id).delete()

      return reply.status(204).send()
    },
  )
}
