import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest'
import request from 'supertest'
import { app } from '../app'
import { execSync } from 'node:child_process'

describe('User Route', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex -- migrate:rollback --all')
    execSync('npm run knex -- migrate:latest')
  })

  it('should be create an user', async () => {
    await request(app.server)
      .post('/user')
      .send({
        username: 'John Doe',
        email: 'jhon.doe@email.com',
        password: 'jh0nDo3',
      })
      .expect(201)
  })
})
