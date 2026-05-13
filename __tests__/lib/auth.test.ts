import { describe, it, expect } from 'vitest'
import {
  validateEmail,
  validatePassword,
  validatePasswordConfirm,
  validateSignupInput,
} from '@/lib/auth'

describe('validateEmail', () => {
  it('空文字はエラー', () => {
    expect(validateEmail('')).toBeTruthy()
    expect(validateEmail('  ')).toBeTruthy()
  })

  it('@ がないとエラー', () => {
    expect(validateEmail('notanemail')).toBeTruthy()
  })

  it('ドメインがないとエラー', () => {
    expect(validateEmail('user@')).toBeTruthy()
  })

  it('正常なメールアドレスは null', () => {
    expect(validateEmail('user@example.com')).toBeNull()
    expect(validateEmail('user+tag@sub.example.co.jp')).toBeNull()
  })
})

describe('validatePassword', () => {
  it('空文字はエラー', () => {
    expect(validatePassword('')).toBeTruthy()
  })

  it('7文字以下はエラー', () => {
    expect(validatePassword('abc1234')).toBeTruthy()
  })

  it('8文字以上は null', () => {
    expect(validatePassword('abcd1234')).toBeNull()
    expect(validatePassword('a'.repeat(100))).toBeNull()
  })
})

describe('validatePasswordConfirm', () => {
  it('不一致はエラー', () => {
    expect(validatePasswordConfirm('password1', 'password2')).toBeTruthy()
  })

  it('一致は null', () => {
    expect(validatePasswordConfirm('password1', 'password1')).toBeNull()
  })
})

describe('validateSignupInput', () => {
  const ok = { email: 'user@example.com', password: 'abcd1234', confirm: 'abcd1234' }

  it('全て正常は null', () => {
    expect(validateSignupInput(ok.email, ok.password, ok.confirm)).toBeNull()
  })

  it('メールが不正ならメールのエラーを返す', () => {
    expect(validateSignupInput('bad', ok.password, ok.confirm)).toBeTruthy()
  })

  it('パスワードが短いとパスワードのエラーを返す', () => {
    expect(validateSignupInput(ok.email, 'short', 'short')).toBeTruthy()
  })

  it('確認が一致しないとエラー', () => {
    expect(validateSignupInput(ok.email, ok.password, 'different')).toBeTruthy()
  })

  it('エラーは最初のものだけ返す（メール > パスワード > 確認の順）', () => {
    // メールが不正なのに確認も不一致 → メールのエラーが先
    const err = validateSignupInput('bad', 'short', 'different')
    expect(err).toBe(validateEmail('bad'))
  })
})
