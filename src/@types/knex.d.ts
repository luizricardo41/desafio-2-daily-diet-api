// eslint-disable-next-line
import { Knex } from 'knex'

declare module 'knex/types/tables' {
  export interface Tables {
    users: {
      id: string
      username: string
      email: string
      password: string
      session_id?: string
      created_at: string
    }
    meals_register: {
      id: string
      name: string
      description: string
      datetime: Date
      is_diet: boolean
      user_id: string
    }
  }
}
