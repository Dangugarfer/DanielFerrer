
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
import { Project } from '@/lib/types';
import { db } from '@/lib/firebase-config';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import Image from 'next/image';
import { formatImageUrl } from '@/lib/utils';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
 
  const { toast } = useToast();

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "projects"));
      const projectsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
      setProjects(projectsData);
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast({ variant: 'destructive', title: "Error", description: "No se pudieron cargar los proyectos." });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProjects();
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isSubmitting) {
        setIsSubmitting(true);
        const formData = new FormData(e.currentTarget);
        const title = formData.get('title') as string;
        const description = formData.get('description') as string;
        const technologies = (formData.get('technologies') as string).split(',').map(t => t.trim());
        const imageUrl = formData.get('imageUrl') as string;
        const screenshots = (formData.get('screenshots') as string)
          .split(',')
          .map(url => url.trim())
          .filter(url => url);

        try {
          const projectData = { title, description, technologies, imageUrl, screenshots };

          if (currentProject) {
            const projectRef = doc(db, 'projects', currentProject.id);
            await updateDoc(projectRef, projectData);
            toast({ title: "Éxito", description: "Proyecto actualizado correctamente." });
          } else {
            await addDoc(collection(db, 'projects'), projectData);
            toast({ title: "Éxito", description: "Proyecto añadido correctamente." });
          }
          
          await fetchProjects();
          handleCloseDialog();
        } catch (error) {
          console.error("Error saving project:", error);
          toast({ variant: 'destructive', title: "Error", description: "No se pudo guardar el proyecto." });
        } finally {
            setIsSubmitting(false);
        }
    }
  };

  const handleEdit = (project: Project) => {
    setCurrentProject(project);
    setIsDialogOpen(true);
  };
  
  const handleAddNew = () => {
    setCurrentProject(null);
    setIsDialogOpen(true);
  }
  
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setCurrentProject(null);
  }

  const handleDelete = async (project: Project) => {
    try {
      await deleteDoc(doc(db, "projects", project.id));
      toast({ title: "Éxito", description: "Proyecto eliminado correctamente." });
      fetchProjects();
    } catch (error) {
        console.error("Error deleting project:", error);
        toast({ variant: 'destructive', title: "Error", description: "No se pudo eliminar el proyecto." });
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Proyectos</CardTitle>
            <CardDescription>Gestiona tus proyectos personales y profesionales.</CardDescription>
          </div>
          <Button onClick={handleAddNew}>
            <PlusCircle className="mr-2 h-4 w-4" /> Añadir Proyecto
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="hidden w-[100px] sm:table-cell">Imagen</TableHead>
              <TableHead>Título</TableHead>
              <TableHead className="hidden md:table-cell">Tecnologías</TableHead>
              <TableHead>
                <span className="sr-only">Acciones</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                        No se encontraron proyectos. ¡Añade uno nuevo!
                    </TableCell>
                </TableRow>
            ) : projects.map((project) => (
              <TableRow key={project.id}>
                <TableCell className="hidden sm:table-cell">
                  <div className="relative w-10 h-10">
                    <Image
                      alt={project.title}
                      className="aspect-square rounded-md object-cover"
                      fill
                      sizes="40px"
                      src={formatImageUrl(project.imageUrl) || 'https://placehold.co/40x40.png'}
                      data-ai-hint="website screenshot"
                    />
                  </div>
                </TableCell>
                <TableCell className="font-medium">{project.title}</TableCell>
                <TableCell className="hidden md:table-cell">
                  {project.technologies.join(', ')}
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
                      <DropdownMenuItem onClick={() => handleEdit(project)}>
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
                              <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción no se puede deshacer. Esto eliminará permanentemente
                                tu proyecto de la base de datos.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(project)}>Continuar</AlertDialogAction>
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

      <Dialog open={isDialogOpen} onOpenChange={(open) => !open && handleCloseDialog()}>
          <DialogContent className="sm:max-w-[625px]">
              <DialogHeader>
                  <DialogTitle>{currentProject ? 'Editar Proyecto' : 'Añadir Nuevo Proyecto'}</DialogTitle>
                  <DialogDescription>
                      {currentProject ? 'Actualiza los detalles de tu proyecto.' : 'Rellena los detalles de tu nuevo proyecto.'}
                  </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="title" className="text-right">Título</Label>
                      <Input id="title" name="title" defaultValue={currentProject?.title} className="col-span-3" required />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="description" className="text-right">Descripción</Label>
                      <Textarea id="description" name="description" defaultValue={currentProject?.description} className="col-span-3" required />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="technologies" className="text-right">Tecnologías</Label>
                      <Input id="technologies" name="technologies" defaultValue={currentProject?.technologies.join(', ')} className="col-span-3" placeholder="React, Next.js, ..." required />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="imageUrl" className="text-right">URL Imagen Principal</Label>
                    <Input id="imageUrl" name="imageUrl" defaultValue={currentProject?.imageUrl} className="col-span-3" placeholder="https://..." required />
                  </div>
                   {(currentProject?.imageUrl) && (
                    <div className="grid grid-cols-4 items-center gap-4">
                        <div className="col-start-2 col-span-3">
                          <div className="relative w-20 h-20">
                            <Image src={formatImageUrl(currentProject.imageUrl)} alt="Imagen actual" fill sizes="80px" className="rounded-md object-cover" />
                          </div>
                        </div>
                    </div>
                  )}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="screenshots" className="text-right">URLs Capturas</Label>
                     <Textarea id="screenshots" name="screenshots" defaultValue={currentProject?.screenshots.join(',\n')} className="col-span-3" placeholder="Pega las URLs separadas por comas o saltos de línea..." />
                  </div>

                  <DialogFooter>
                      <DialogClose asChild>
                          <Button type="button" variant="outline">Cancelar</Button>
                      </DialogClose>
                      <Button type="submit" disabled={isSubmitting}>
                          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                          {currentProject ? 'Guardar Cambios' : 'Crear Proyecto'}
                      </Button>
                  </DialogFooter>
              </form>
          </DialogContent>
      </Dialog>
    </Card>
  );
}
