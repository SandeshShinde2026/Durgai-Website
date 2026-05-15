import AdminContentEditor from '@/components/admin/AdminContentEditor'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/admin/login')
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-rose-50 via-white to-orange-50 px-4 py-8 sm:px-6 lg:px-8">
      <div aria-hidden="true" className="pointer-events-none absolute -top-28 left-[-80px] h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute bottom-[-80px] right-[-80px] h-72 w-72 rounded-full bg-orange-200/30 blur-3xl" />
      <div className="relative mx-auto flex w-full max-w-7xl justify-center">
        <AdminContentEditor />
      </div>
    </main>
  )
}
