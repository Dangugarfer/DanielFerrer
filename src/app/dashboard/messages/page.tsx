
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
import { MoreHorizontal, Trash2, Loader2, Inbox, Eye } from 'lucide-react';
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
  DialogClose,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Message } from '@/lib/types';
import { db } from '@/lib/firebase-config';
import { collection, getDocs, deleteDoc, doc, orderBy, query, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { toast } = useToast();

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const messagesQuery = query(collection(db, "messages"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(messagesQuery);
      const messagesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
      setMessages(messagesData);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast({ variant: 'destructive', title: "Error", description: "No se pudieron cargar los mensajes." });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleDelete = async (messageId: string) => {
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, "messages", messageId));
      toast({ title: "Éxito", description: "Mensaje eliminado correctamente." });
      fetchMessages();
      setIsViewOpen(false);
      setSelectedMessage(null);
    } catch (error) {
      console.error("Error deleting message:", error);
      toast({ variant: 'destructive', title: "Error", description: "No se pudo eliminar el mensaje." });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleViewMessage = async (message: Message) => {
    setSelectedMessage(message);
    setIsViewOpen(true);
    if (!message.read) {
      try {
        const messageRef = doc(db, 'messages', message.id);
        await updateDoc(messageRef, { read: true });
        fetchMessages();
      } catch (error) {
        console.error("Error marking message as read:", error);
      }
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
        <CardTitle>Mensajes</CardTitle>
        <CardDescription>Revisa los mensajes enviados desde tu formulario de contacto.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Estado</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead>Mensaje</TableHead>
              <TableHead>
                <span className="sr-only">Acciones</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {messages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Inbox className="h-8 w-8 text-muted-foreground" />
                    <p>No tienes mensajes nuevos.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : messages.map((message) => (
              <TableRow key={message.id} data-state={message.read ? '' : 'selected'}>
                <TableCell>
                  {!message.read && (
                    <div className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                        <span className="hidden md:inline">Nuevo</span>
                    </div>
                  )}
                </TableCell>
                <TableCell className={`whitespace-nowrap ${!message.read ? 'font-bold' : 'font-medium'}`}>
                   {message.createdAt ? format(message.createdAt.toDate(), "d MMM yyyy", { locale: es }) : 'N/A'}
                </TableCell>
                <TableCell className={!message.read ? 'font-bold' : ''}>{message.name}</TableCell>
                <TableCell>{message.contact}</TableCell>
                <TableCell className="max-w-xs truncate">{message.message}</TableCell>
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
                      <DropdownMenuItem onClick={() => handleViewMessage(message)}>
                        <Eye className="mr-2 h-4 w-4" /> Ver
                      </DropdownMenuItem>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600 focus:text-red-600 focus:bg-red-100 dark:focus:bg-red-950">
                                <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                           </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción no se puede deshacer. Esto eliminará permanentemente el mensaje.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(message.id)}>Continuar</AlertDialogAction>
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
    
    <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
      <DialogContent className="sm:max-w-2xl">
        {selectedMessage && (
            <>
                <DialogHeader>
                    <DialogTitle>Mensaje de: {selectedMessage.name}</DialogTitle>
                    <DialogDescription>
                        Recibido el {selectedMessage.createdAt ? format(selectedMessage.createdAt.toDate(), "d 'de' LLLL 'de' yyyy 'a las' HH:mm", { locale: es }) : 'N/A'}
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <div>
                        <h4 className="font-semibold text-sm">Información de Contacto</h4>
                        <p className="text-muted-foreground break-words">{selectedMessage.contact}</p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-sm">Mensaje</h4>
                        <p className="text-muted-foreground whitespace-pre-wrap break-words">{selectedMessage.message}</p>
                    </div>
                </div>
                <DialogFooter className="sm:justify-between">
                    <AlertDialog>
                       <AlertDialogTrigger asChild>
                         <Button variant="destructive" disabled={isDeleting}>
                           {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                           Eliminar
                         </Button>
                       </AlertDialogTrigger>
                       <AlertDialogContent>
                         <AlertDialogHeader>
                           <AlertDialogTitle>¿Confirmar eliminación?</AlertDialogTitle>
                           <AlertDialogDescription>
                             Esta acción es permanente y no se puede deshacer. ¿Seguro que quieres eliminar este mensaje?
                           </AlertDialogDescription>
                         </AlertDialogHeader>
                         <AlertDialogFooter>
                           <AlertDialogCancel>Cancelar</AlertDialogCancel>
                           <AlertDialogAction onClick={() => handleDelete(selectedMessage.id)}>
                             Sí, eliminar
                           </AlertDialogAction>
                         </AlertDialogFooter>
                       </AlertDialogContent>
                     </AlertDialog>
                    <DialogClose asChild>
                        <Button type="button">Cerrar</Button>
                    </DialogClose>
                </DialogFooter>
            </>
        )}
      </DialogContent>
    </Dialog>
    </>
  );
}
