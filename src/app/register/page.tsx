import { redirect } from 'next/navigation'

export default function RegisterPage() {
  // Registration disabled for launch
  redirect('/login')
}
