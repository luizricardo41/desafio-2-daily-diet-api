import 'fastify'

declare module 'fastify' {
  export interface FastifyRequest {
    user?: {
      id: string
      username: string
      email: string
      password: string
      session_id?: string
      created_at: string
    }
  }
}
