
'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { Profile } from '@/lib/types';
import { db } from '@/lib/firebase-config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { formatImageUrl } from '@/lib/utils';
import Image from 'next/image';

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const profileRef = doc(db, 'profile', 'main');
      const docSnap = await getDoc(profileRef);
      if (docSnap.exists()) {
        setProfile(docSnap.data() as Profile);
      } else {
        // Set a default profile if one doesn't exist
        setProfile({
          name: 'Daniel Ferrer',
          headline: 'Apasionado Desarrollador Full-Stack y Especialista en TI...',
          about: 'Soy un profesional dedicado y versátil...',
          cvUrl: '',
          aboutImageUrl: ''
        })
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);
  
  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!profile) return;
    setIsSaving(true);
    
    try {
        const profileRef = doc(db, 'profile', 'main');
        await setDoc(profileRef, profile);
        
        toast({ title: 'Éxito', description: 'Perfil actualizado correctamente.' });
    } catch (error) {
        console.error("Error saving profile:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudo guardar el perfil.' });
    } finally {
        setIsSaving(false);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (!profile) return;
      const { id, value } = e.target;
      setProfile({ ...profile, [id]: value });
  }

  if (loading) {
    return <div className="flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }
  
  if (!profile) {
    return <p>No se pudo cargar el perfil.</p>;
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Perfil</CardTitle>
          <CardDescription>Actualiza tu información personal, imágenes y CV.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSave}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre Completo</Label>
                <Input id="name" value={profile.name} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="headline">Titular</Label>
                <Input id="headline" value={profile.headline} onChange={handleInputChange} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="about">Sobre Mí</Label>
              <Textarea id="about" rows={5} value={profile.about} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="aboutImageUrl">URL de Imagen "Sobre Mí"</Label>
              <Input id="aboutImageUrl" value={profile.aboutImageUrl} onChange={handleInputChange} placeholder="https://..." />
              {profile.aboutImageUrl && (
                <div className="relative w-40 h-24 mt-2">
                  <Image src={formatImageUrl(profile.aboutImageUrl)} alt="Vista previa de Sobre Mí" fill className="rounded-md object-cover" />
                </div>
              )}
              <p className="text-xs text-muted-foreground">Pega la URL para la imagen que aparece junto a tu sección "Sobre Mí".</p>
            </div>
             <div className="space-y-2">
              <Label htmlFor="cvUrl">URL del CV (PDF)</Label>
               <Input id="cvUrl" value={profile.cvUrl} onChange={handleInputChange} placeholder="https://..."/>
               {profile.cvUrl && <a href={formatImageUrl(profile.cvUrl)} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">Ver CV actual</a>}
               <p className="text-xs text-muted-foreground">Pega un enlace para compartir de tu CV (Google Drive, etc).</p>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar Cambios
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
