import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const user = localStorage.getItem('noema_user')
    if (user) {
      router.push('/dashboard')
    } else {
      router.push('/login')
    }
  }, [])

  return null
}
