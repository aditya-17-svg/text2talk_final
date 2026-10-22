import { describe, it, expect } from 'vitest'
import { registerSchema } from './AuthPages'
const ok = { fullName: 'Ada Lovelace', email: 'a@b.com', password: 'Passw0rdX', confirm: 'Passw0rdX', terms: true }
describe('registerSchema', () => {
  it('accepts valid input', () => expect(registerSchema.safeParse(ok).success).toBe(true))
  it('rejects mismatched passwords', () => expect(registerSchema.safeParse({ ...ok, confirm: 'x' }).success).toBe(false))
  it('rejects weak passwords', () => expect(registerSchema.safeParse({ ...ok, password: 'abc', confirm: 'abc' }).success).toBe(false))
})
