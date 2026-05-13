export type ValidationError = string

export function validateEmail(email: string): ValidationError | null {
  if (!email?.trim()) return 'メールアドレスを入力してください'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return 'メールアドレスの形式が正しくありません'
  return null
}

export function validatePassword(password: string): ValidationError | null {
  if (!password) return 'パスワードを入力してください'
  if (password.length < 8) return 'パスワードは8文字以上で入力してください'
  return null
}

export function validatePasswordConfirm(password: string, confirm: string): ValidationError | null {
  if (password !== confirm) return 'パスワードが一致しません'
  return null
}

export function validateSignupInput(
  email: string,
  password: string,
  confirm: string,
): ValidationError | null {
  return validateEmail(email) ?? validatePassword(password) ?? validatePasswordConfirm(password, confirm)
}
