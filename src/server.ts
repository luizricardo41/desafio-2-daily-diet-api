import fastify from 'fastify'
import { knex } from './database'

const app = fastify()

app.get('/', async () => {
  return await knex('sqlite_schema').select()
})

app.listen({ port: 3001 }).then(() => console.log('HTTP Server Running!'))
