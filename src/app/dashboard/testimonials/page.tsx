
'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PlusCircle, MoreHorizontal, FilePenLine, Trash2, Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog"
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Testimonial } from '@/lib/types';
import { db } from '@/lib/firebase-config';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState<Testimonial | null>(null);

  const { toast } = useToast();

  const fetchTestimonials = async () => {
    setLoading(true);
    try {
        const querySnapshot = await getDocs(collection(db, "testimonials"));
        const testimonialsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Testimonial));
        setTestimonials(testimonialsData);
    } catch (error) {
        console.error("Error fetching testimonials:", error);
        toast({ variant: 'destructive', title: "Error", description: "No se pudieron cargar los testimonios." });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTestimonials();
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isSubmitting) {
        setIsSubmitting(true);
        const formData = new FormData(e.currentTarget);
        const name = formData.get('name') as string;
        const role = formData.get('role') as string;
        const company = formData.get('company') as string;
        const quote = formData.get('quote') as string;
        
        try {
          const testimonialData = { name, role, company, quote };

          if (currentTestimonial) {
            const testimonialRef = doc(db, 'testimonials', currentTestimonial.id);
            await updateDoc(testimonialRef, testimonialData);
            toast({ title: "Éxito", description: "Testimonio actualizado correctamente." });
          } else {
            await addDoc(collection(db, 'testimonials'), testimonialData);
            toast({ title: "Éxito", description: "Testimonio añadido correctamente." });
          }
          
          await fetchTestimonials();
          handleCloseDialog();
        } catch (error) {
          console.error("Error saving testimonial:", error);
          toast({ variant: 'destructive', title: "Error", description: "No se pudo guardar el testimonio." });
        } finally {
            setIsSubmitting(false);
        }
    }
  };

  const handleEdit = (testimonial: Testimonial) => {
    setCurrentTestimonial(testimonial);
    setIsDialogOpen(true);
  };
  
  const handleAddNew = () => {
    setCurrentTestimonial(null);
    setIsDialogOpen(true);
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setCurrentTestimonial(null);
  }

  const handleDelete = async (testimonialId: string) => {
    try {
      await deleteDoc(doc(db, "testimonials", testimonialId));
      toast({ title: "Éxito", description: "Testimonio eliminado correctamente." });
      fetchTestimonials();
    } catch (error) {
        console.error("Error deleting testimonial:", error);
        toast({ variant: 'destructive', title: "Error", description: "No se pudo eliminar el testimonio." });
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Testimonios</CardTitle>
              <CardDescription>Gestiona las reseñas de colegas y clientes.</CardDescription>
            </div>
            <Button onClick={handleAddNew}>
              <PlusCircle className="mr-2 h-4 w-4" /> Añadir Testimonio
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Autor</TableHead>
                <TableHead className="hidden md:table-cell">Cita</TableHead>
                <TableHead>
                  <span className="sr-only">Acciones</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {testimonials.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    No se encontraron testimonios. ¡Añade uno nuevo!
                  </TableCell>
                </TableRow>
              ) : testimonials.map((testimonial) => (
                <TableRow key={testimonial.id}>
                  <TableCell>
                    <div>
                        <div className="font-medium">{testimonial.name}</div>
                        <div className="text-sm text-muted-foreground">{testimonial.role} en {testimonial.company}</div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell max-w-sm truncate">
                    {testimonial.quote}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleEdit(testimonial)}>
                          <FilePenLine className="mr-2 h-4 w-4" /> Editar
                        </DropdownMenuItem>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                             <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                              </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Estás absolutely seguro?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción no se puede deshacer. Esto eliminará permanentemente
                                tu testimonio.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(testimonial.id)}>Continuar</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={(open) => !open && handleCloseDialog()}>
          <DialogContent className="sm:max-w-[625px]">
              <DialogHeader>
                  <DialogTitle>{currentTestimonial ? 'Editar Testimonio' : 'Añadir Nuevo Testimonio'}</DialogTitle>
                  <DialogDescription>
                      {currentTestimonial ? 'Actualiza los detalles del testimonio.' : 'Rellena los detalles del nuevo testimonio.'}
                  </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">Nombre</Label>
                      <Input id="name" name="name" defaultValue={currentTestimonial?.name} className="col-span-3" required />
                  </div>
                   <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="role" className="text-right">Rol</Label>
                      <Input id="role" name="role" defaultValue={currentTestimonial?.role} className="col-span-3" required />
                  </div>
                   <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="company" className="text-right">Empresa</Label>
                      <Input id="company" name="company" defaultValue={currentTestimonial?.company} className="col-span-3" required />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="quote" className="text-right">Cita</Label>
                      <Textarea id="quote" name="quote" defaultValue={currentTestimonial?.quote} className="col-span-3" required />
                  </div>
                  <DialogFooter>
                      <DialogClose asChild>
                          <Button type="button" variant="outline">Cancelar</Button>
                      </DialogClose>
                      <Button type="submit" disabled={isSubmitting}>
                          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                          {currentTestimonial ? 'Guardar Cambios' : 'Crear Testimonio'}
                      </Button>
                  </DialogFooter>
              </form>
          </DialogContent>
      </Dialog>
    </>
  );
}
