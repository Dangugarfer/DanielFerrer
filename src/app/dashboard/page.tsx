
'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PenSquare, MessageSquareQuote, Eye, Loader2 } from 'lucide-react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase-config';

export default function DashboardPage() {
  const [projectCount, setProjectCount] = useState(0);
  const [testimonialCount, setTestimonialCount] = useState(0);
  const [viewCount, setViewCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      setLoading(true);
      try {
        const projectsSnapshot = await getDocs(collection(db, 'projects'));
        setProjectCount(projectsSnapshot.size);

        const testimonialsSnapshot = await getDocs(collection(db, 'testimonials'));
        setTestimonialCount(testimonialsSnapshot.size);
        
        const viewsDoc = await getDoc(doc(db, 'analytics', 'pageViews'));
        if (viewsDoc.exists()) {
          setViewCount(viewsDoc.data().count);
        }

      } catch (error) {
        console.error("Error fetching counts:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCounts();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold font-headline mb-6">Resumen</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Proyectos Totales</CardTitle>
            <PenSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <div className="text-2xl font-bold">{projectCount}</div>
            )}
            <p className="text-xs text-muted-foreground">Gestionados en el dashboard</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Testimonios</CardTitle>
            <MessageSquareQuote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {loading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <div className="text-2xl font-bold">{testimonialCount}</div>
            )}
            <p className="text-xs text-muted-foreground">Reseñas positivas de colegas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vistas del Portafolio</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {loading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
                <div className="text-2xl font-bold">{viewCount}</div>
            )}
            <p className="text-xs text-muted-foreground">Total de visitas a la página</p>
          </CardContent>
        </Card>
      </div>
      <div className="mt-8">
        <Card>
            <CardHeader>
                <CardTitle>¡Bienvenido a tu Dashboard!</CardTitle>
            </CardHeader>
            <CardContent>
                <p>Usa la barra lateral para navegar y gestionar el contenido de tu portafolio. Puedes añadir nuevos proyectos, actualizar tu perfil y gestionar testimonios desde aquí.</p>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
