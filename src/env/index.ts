import { z } from 'zod'
import 'dotenv/config'

const envSchema = z.object({
  NODE_ENV: z.enum(['production', 'development', 'test']).default('production'),
  DATABASE_URL: z.string(),
  PORT: z.coerce.number().default(3001),
})

const _env = envSchema.safeParse(process.env)

if (!_env.success) {
  throw new Error(
    `Invalid Environment Variables - ${JSON.stringify(_env.error.format())}`,
  )
}

export const env = _env.data
