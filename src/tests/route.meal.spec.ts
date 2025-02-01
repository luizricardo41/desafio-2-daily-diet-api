import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import request from 'supertest'
import { app } from '../app'
import { execSync } from 'node:child_process'

describe('Meals Route', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(async () => {
    execSync('npm run knex -- migrate:rollback --all')
    execSync('npm run knex -- migrate:latest')

    await request(app.server).post('/user').send({
      username: 'John Doe',
      email: 'jhon.doe@email.com',
      password: 'jh0nDo3',
    })
  })

  it('should be create a meal', async () => {
    const login = await request(app.server).post('/auth/login').send({
      email: 'jhon.doe@email.com',
      password: 'jh0nDo3',
    })

    let cookies = login.get('Set-Cookie')
    cookies = cookies || ['']

    const response = await request(app.server)
      .post('/meal')
      .set('Cookie', cookies)
      .send({
        name: 'Café da manhã',
        description: 'Pão com ovo mexido',
        datetime: '2025-01-14 04:30:00',
        isDiet: true,
      })
      .expect(201)

    expect(response.body).toEqual({ message: 'Meal created!' })
  })

  it('should get all meals for the user', async () => {
    const login = await request(app.server).post('/auth/login').send({
      email: 'jhon.doe@email.com',
      password: 'jh0nDo3',
    })

    let cookies = login.get('Set-Cookie')
    cookies = cookies || ['']

    await request(app.server).post('/meal').set('Cookie', cookies).send({
      name: 'Café da manhã',
      description: 'Pão com ovo mexido',
      datetime: '2025-01-14 04:30:00',
      isDiet: true,
    })

    const response = await request(app.server)
      .get('/meal')
      .set('Cookie', cookies)
      .expect(200)

    expect(response.body).toHaveProperty('formattedInfosMeals')
    expect(response.body.formattedInfosMeals.length).toEqual(1)
    expect(response.body.formattedInfosMeals[0]).toHaveProperty('id')
    expect(response.body.formattedInfosMeals[0]).toHaveProperty('name')
  })

  it('should get a meal for the user', async () => {
    const login = await request(app.server).post('/auth/login').send({
      email: 'jhon.doe@email.com',
      password: 'jh0nDo3',
    })

    let cookies = login.get('Set-Cookie')
    cookies = cookies || ['']

    await request(app.server).post('/meal').set('Cookie', cookies).send({
      name: 'Café da manhã',
      description: 'Pão com ovo mexido',
      datetime: '2025-01-14 04:30:00',
      isDiet: true,
    })

    const getAllMeals = await request(app.server)
      .get('/meal')
      .set('Cookie', cookies)

    const idMeal = getAllMeals.body.formattedInfosMeals[0].id

    const getOneMeal = await request(app.server)
      .get(`/meal/${idMeal}`)
      .set('Cookie', cookies)
      .expect(200)

    expect(getOneMeal.body).toHaveProperty('meal')
    expect(getOneMeal.body.meal).toHaveProperty('id')
    expect(getOneMeal.body.meal.id).toEqual(idMeal)
    expect(getOneMeal.body.meal).toHaveProperty('name')
  })

  it('should delete a meal for the user', async () => {
    const login = await request(app.server).post('/auth/login').send({
      email: 'jhon.doe@email.com',
      password: 'jh0nDo3',
    })

    let cookies = login.get('Set-Cookie')
    cookies = cookies || ['']

    await request(app.server).post('/meal').set('Cookie', cookies).send({
      name: 'Café da manhã',
      description: 'Pão com ovo mexido',
      datetime: '2025-01-14 04:30:00',
      isDiet: true,
    })

    const getAllMeals = await request(app.server)
      .get('/meal')
      .set('Cookie', cookies)

    const idMeal = getAllMeals.body.formattedInfosMeals[0].id

    await request(app.server)
      .delete(`/meal/${idMeal}`)
      .set('Cookie', cookies)
      .expect(204)

    const getOneMeal = await request(app.server)
      .get(`/meal/${idMeal}`)
      .set('Cookie', cookies)
      .expect(404)

    expect(getOneMeal.body.message).toEqual('Meal not found')
  })
})
