
'use client';
import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Home, LayoutGrid, LogOut, PenSquare, User, MessageSquareQuote, Loader2, Mail } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { Code2 } from 'lucide-react';
import { auth } from '@/lib/firebase-config';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = React.useState<FirebaseUser | null>(null);
  const [loading, setLoading] = React.useState(true);
  
  const isActive = (path: string) => pathname.startsWith(path);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
      } else {
        router.push('/admin-login');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({
        title: 'Sesión cerrada',
        description: 'Has cerrado sesión correctamente.',
      });
      router.push('/admin-login');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error al cerrar sesión',
        description: error.message,
      });
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  if (!user) {
    return null; 
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <SidebarContent>
            <SidebarHeader>
              <div className="flex items-center gap-2">
                <Code2 className="h-6 w-6 text-primary" />
                <h2 className="font-bold text-lg font-headline">Daniel Ferrer</h2>
              </div>
            </SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <Link href="/dashboard" passHref>
                  <SidebarMenuButton isActive={pathname === '/dashboard'}>
                    <LayoutGrid />
                    <span>Resumen</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
               <SidebarMenuItem>
                <Link href="/dashboard/messages" passHref>
                  <SidebarMenuButton isActive={isActive('/dashboard/messages')}>
                    <Mail />
                    <span>Mensajes</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="/dashboard/projects" passHref>
                  <SidebarMenuButton isActive={isActive('/dashboard/projects')}>
                    <PenSquare />
                    <span>Proyectos</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="/dashboard/testimonials" passHref>
                  <SidebarMenuButton isActive={isActive('/dashboard/testimonials')}>
                    <MessageSquareQuote />
                    <span>Testimonios</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="/dashboard/profile" passHref>
                  <SidebarMenuButton isActive={isActive('/dashboard/profile')}>
                    <User />
                    <span>Perfil</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <div className="flex items-center justify-end gap-2">
                <Button variant="ghost" size="icon" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" />
                </Button>
            </div>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset className="bg-muted/50 flex-1">
          <header className="flex items-center justify-between p-4 border-b bg-background md:justify-end">
            <SidebarTrigger className="md:hidden" />
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Link href="/">
                <Button variant="outline">
                  <Home className="mr-2 h-4 w-4" />
                  Ver Sitio
                </Button>
              </Link>
            </div>
          </header>
          <main className="p-4 lg:p-8">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
