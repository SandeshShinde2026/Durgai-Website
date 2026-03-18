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
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full justify-center">
        <AdminContentEditor />
      </div>
    </main>
  )
}
