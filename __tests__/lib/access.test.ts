import { describe, it, expect, vi, beforeEach } from 'vitest'
import { isAdmin, isSubscribed, canViewContent, getAccessLevel } from '@/lib/access'

// ADMIN_EMAIL を環境変数でモック
beforeEach(() => {
  vi.stubEnv('ADMIN_EMAIL', 'admin@example.com')
})

describe('isAdmin', () => {
  it('ADMIN_EMAIL と一致すれば true', () => {
    expect(isAdmin('admin@example.com')).toBe(true)
  })

  it('大文字小文字を無視する', () => {
    expect(isAdmin('Admin@Example.COM')).toBe(true)
  })

  it('別のメールは false', () => {
    expect(isAdmin('user@example.com')).toBe(false)
  })

  it('undefined は false', () => {
    expect(isAdmin(undefined)).toBe(false)
  })

  it('ADMIN_EMAIL 未設定なら常に false', () => {
    vi.stubEnv('ADMIN_EMAIL', '')
    expect(isAdmin('admin@example.com')).toBe(false)
  })
})

describe('isSubscribed', () => {
  it('未来の日付は true', () => {
    const future = new Date(Date.now() + 1000 * 60 * 60 * 24)
    expect(isSubscribed(future)).toBe(true)
  })

  it('過去の日付は false', () => {
    const past = new Date(Date.now() - 1000)
    expect(isSubscribed(past)).toBe(false)
  })

  it('null は false', () => {
    expect(isSubscribed(null)).toBe(false)
  })

  it('undefined は false', () => {
    expect(isSubscribed(undefined)).toBe(false)
  })
})

describe('canViewContent', () => {
  const future = new Date(Date.now() + 86400000)

  it('未ログインは false', () => {
    expect(canViewContent({})).toBe(false)
  })

  it('管理者はサブスクなしでも true', () => {
    expect(canViewContent({ userId: 1, email: 'admin@example.com', isAdmin: true })).toBe(true)
  })

  it('サブスク有効ユーザーは true', () => {
    expect(canViewContent({ userId: 2, email: 'user@example.com', isAdmin: false }, future)).toBe(true)
  })

  it('ログイン済みでもサブスクなしは false', () => {
    expect(canViewContent({ userId: 2, email: 'user@example.com', isAdmin: false }, null)).toBe(false)
  })

  it('サブスク切れは false', () => {
    const past = new Date(Date.now() - 1000)
    expect(canViewContent({ userId: 2, isAdmin: false }, past)).toBe(false)
  })
})

describe('getAccessLevel', () => {
  const future = new Date(Date.now() + 86400000)

  it('未ログインは free', () => {
    expect(getAccessLevel({})).toBe('free')
  })

  it('管理者は admin', () => {
    expect(getAccessLevel({ userId: 1, isAdmin: true })).toBe('admin')
  })

  it('サブスク有効は subscriber', () => {
    expect(getAccessLevel({ userId: 2, isAdmin: false }, future)).toBe('subscriber')
  })

  it('サブスクなしログイン済みは free', () => {
    expect(getAccessLevel({ userId: 2, isAdmin: false }, null)).toBe('free')
  })
})
