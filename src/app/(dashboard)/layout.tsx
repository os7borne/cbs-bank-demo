import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { DashboardLayout } from '@/components/layout/sidebar';
import { Toaster } from '@/components/ui/sonner';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  const user = {
    ...session.user,
    employeeId: session.user.employeeId || undefined,
  };

  return (
    <>
      <DashboardLayout user={user}>
        {children}
      </DashboardLayout>
      <Toaster position="top-right" />
    </>
  );
}
