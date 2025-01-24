import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import request from 'supertest'
import { app } from '../app'
import { execSync } from 'node:child_process'

describe('Auth Route', () => {
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

  it('should be execute the login', async () => {
    await request(app.server).post('/user').send({
      username: 'John Doe',
      email: 'jhon.doe@email.com',
      password: 'jh0nDo3',
    })

    const response = await request(app.server)
      .post('/auth/login')
      .send({
        email: 'jhon.doe@email.com',
        password: 'jh0nDo3',
      })
      .expect(200)

    expect(response.body).toEqual({ message: 'Login Successfull!' })
    expect(response.header['set-cookie'][0]).toBeTypeOf('string')
  })

  it('should be execute the logout', async () => {
    await request(app.server).post('/user').send({
      username: 'John Doe',
      email: 'jhon.doe@email.com',
      password: 'jh0nDo3',
    })

    const response = await request(app.server)
      .post('/auth/logout')
      .send()
      .expect(204)

    expect(response.header['set-cookie']).toBeUndefined()
  })
})
