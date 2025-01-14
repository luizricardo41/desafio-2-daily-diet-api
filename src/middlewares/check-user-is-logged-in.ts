import { FastifyReply, FastifyRequest } from 'fastify'
import { knex } from '../database'

export async function isUserLoggedIn(req: FastifyRequest, reply: FastifyReply) {
  const { sessionId } = req.cookies

  if (!sessionId) {
    return reply.status(401).send({
      message: 'Unauthorized. Log in with your account or create an user',
    })
  }

  const user = await knex('users')
    .where('session_id', sessionId)
    .select('*')
    .first()

  if (!user) {
    return reply.status(404).send({ message: 'User not found' })
  }

  req.user = user
}
