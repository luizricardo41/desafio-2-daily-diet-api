import { FastifyReply, FastifyRequest } from 'fastify'

export async function isUserLoggedIn(req: FastifyRequest, reply: FastifyReply) {
  const { sessionId } = req.cookies

  if (!sessionId) {
    return reply.status(401).send({
      message: 'Unauthorized. Log in with your account or create an user',
    })
  }
}
