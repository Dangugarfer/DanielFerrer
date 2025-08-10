
'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Download,
  Eye,
  Github,
  Linkedin,
  Mail,
  Briefcase,
  Award,
  ChevronRight,
  Code,
  Server,
  Wrench,
  Copy,
  Loader2,
  Cpu,
  Layers3
} from 'lucide-react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Project, Testimonial, Profile } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { useToast } from "@/hooks/use-toast"
import { db } from '@/lib/firebase-config';
import { collection, getDocs, doc, getDoc, setDoc, increment, addDoc, serverTimestamp } from 'firebase/firestore';
import { formatImageUrl } from '@/lib/utils';
import ParticleNetwork from '@/components/neural-network-animation';
import { Label } from '@/components/ui/label';

const WhatsappIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );

const ProjectCard = ({ project, priority = false }: { project: Project, priority?: boolean }) => (
  <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-1">
     <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100 card-glow"></div>
    <CardHeader className="p-0">
      <Dialog>
        <DialogTrigger asChild>
          <div className="relative w-full h-48 group/image">
            <Image
              src={formatImageUrl(project.imageUrl) || 'https://placehold.co/600x400.png'}
              alt={project.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover cursor-pointer transition-transform duration-300 group-hover/image:scale-105"
              data-ai-hint="website screenshot"
              priority={priority}
            />
            <div className="absolute inset-0 bg-black/20 group-hover/image:bg-black/40 transition-colors" />
          </div>
        </DialogTrigger>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>{project.title}</DialogTitle>
            <DialogDescription>{project.description}</DialogDescription>
          </DialogHeader>
           {project.screenshots && project.screenshots.length > 0 && (
              <Carousel className="w-full">
                <CarouselContent>
                  {project.screenshots.map((ss, index) => (
                    <CarouselItem key={index}>
                      <div className="relative w-full h-96">
                        <Image 
                          src={formatImageUrl(ss) || 'https://placehold.co/1200x800.png'} 
                          alt={`${project.title} screenshot ${index + 1}`} 
                          fill
                          sizes="100vw"
                          className="object-contain rounded-lg" 
                          data-ai-hint="app interface" 
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
           )}
        </DialogContent>
      </Dialog>
    </CardHeader>
    <CardContent className="p-6">
      <h3 className="text-xl font-bold font-headline">{project.title}</h3>
      <p className="text-sm text-muted-foreground mt-2 h-12">{project.description}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {project.technologies.map((tech) => (
          <Badge key={tech} variant="secondary">{tech}</Badge>
        ))}
      </div>
    </CardContent>
    <CardFooter className="p-6 bg-muted/50">
      {project.link && (
        <a href={project.link} target="_blank" rel="noopener noreferrer">
            <Button variant="link" className="p-0 h-auto">
            Ver Proyecto <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
        </a>
      )}
    </CardFooter>
  </Card>
);

const ContactForm = () => {
    const { toast } = useToast()
    const [name, setName] = useState('');
    const [contact, setContact] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const copyToClipboard = (text: string, type: string) => {
        navigator.clipboard.writeText(text);
        toast({
          title: `${type} copiado!`,
          description: `Se ha copiado ${text} al portapapeles.`,
        })
    }
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await addDoc(collection(db, 'messages'), {
                name,
                contact,
                message,
                createdAt: serverTimestamp(),
                read: false,
            });
            toast({
                title: '¡Mensaje Enviado!',
                description: 'Gracias por contactarme. Te responderé pronto.',
            });
            setName('');
            setContact('');
            setMessage('');
        } catch (error) {
            console.error("Error sending message:", error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Hubo un problema al enviar tu mensaje. Por favor, inténtalo de nuevo.',
            });
        } finally {
            setIsSubmitting(false);
        }
    }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-headline">Contáctame</CardTitle>
        <CardDescription>¿Tienes una pregunta o quieres que trabajemos juntos? ¡Envíame un mensaje!</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" placeholder="Tu Nombre" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact">Correo electrónico o Teléfono</Label>
            <Input id="contact" type="text" placeholder="Tu información de contacto" value={contact} onChange={e => setContact(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Mensaje</Label>
            <Textarea id="message" placeholder="Tu Mensaje" value={message} onChange={e => setMessage(e.target.value)} required />
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Enviar Mensaje'}
          </Button>
        </CardContent>
      </form>
      <CardFooter className="flex-col gap-4 items-start">
        <p className="text-sm text-muted-foreground">O contáctame directamente:</p>
        <div className="flex flex-wrap gap-2">
            <div className="inline-flex rounded-md shadow-sm">
                <a href="mailto:dangugarfer.09@gmail.com" className="inline-flex items-center">
                    <Button variant="outline" className="rounded-r-none pl-3 pr-2">
                        <Mail className="mr-2" />
                        dangugarfer.09@gmail.com
                    </Button>
                </a>
                <Button variant="outline" className="rounded-l-none px-2" onClick={() => copyToClipboard('dangugarfer.09@gmail.com', 'Email')}>
                    <Copy className="h-4 w-4" />
                </Button>
            </div>
          <a href="https://wa.me/4121178312" target="_blank" rel="noopener noreferrer">
            <Button variant="outline"><WhatsappIcon className="mr-2" /> WhatsApp</Button>
          </a>
          <a href="https://www.linkedin.com/in/dangugarfer/" target="_blank" rel="noopener noreferrer">
            <Button variant="outline"><Linkedin className="mr-2" /> LinkedIn</Button>
          </a>
          <a href="https://github.com/Dangugarfer" target="_blank" rel="noopener noreferrer">
            <Button variant="outline"><Github className="mr-2" /> GitHub</Button>
          </a>
        </div>
      </CardFooter>
    </Card>
  );
};


export default function Home() {
  const [projectsData, setProjectsData] = useState<Project[]>([]);
  const [testimonialsData, setTestimonialsData] = useState<Testimonial[]>([]);
  const [profileData, setProfileData] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const viewsRef = doc(db, 'analytics', 'pageViews');
        const viewDoc = await getDoc(viewsRef);
        if (!viewDoc.exists()) {
          await setDoc(viewsRef, { count: 1 });
        } else {
          await setDoc(viewsRef, { count: increment(1) }, { merge: true });
        }


        const projectsQuery = await getDocs(collection(db, "projects"));
        const projects = projectsQuery.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
        setProjectsData(projects);

        const testimonialsQuery = await getDocs(collection(db, "testimonials"));
        const testimonials = testimonialsQuery.docs.map(doc => ({ id: doc.id, ...doc.data() } as Testimonial));
        setTestimonialsData(testimonials);

        const profileQuery = await getDoc(doc(db, "profile", "main"));
        if (profileQuery.exists()) {
          setProfileData(profileQuery.data() as Profile);
        }
      } catch (error) {
          console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section id="home" className="container mx-auto px-4 text-center flex flex-col items-center relative overflow-hidden min-h-screen justify-center">
          <ParticleNetwork />
          <div className="relative z-10">
            <p className="text-xl md:text-2xl text-muted-foreground mb-2">Bienvenido, soy</p>
            <div className="inline-block">
                <h1 className="text-5xl md:text-7xl font-bold font-headline text-foreground bg-clip-text text-transparent bg-gradient-to-b from-foreground to-muted-foreground overflow-hidden whitespace-nowrap border-r-4 border-r-primary animate-[typing_2s_steps(30,end),blink-caret_.75s_step-end_infinite]">
                {profileData?.name || 'Daniel Ferrer'}
                </h1>
            </div>
            <h2 className="text-2xl md:text-4xl font-light text-primary mt-2">
              {profileData?.headline || 'Front-End Developer'}
            </h2>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#projects">
                  <Button size="lg">Ver Proyectos</Button>
              </a>
              <a href="/CV-Daniel-Ferrer.pdf" download>
                  <Button size="lg" variant="default">
                  <Download className="mr-2" /> Descargar CV
                  </Button>
              </a>
            </div>
          </div>
        </section>

        {/* About Me Section */}
        <section id="about" className="bg-muted/50 py-24 sm:py-32">
          <div className="container mx-auto px-4 grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold font-headline mb-8">Sobre Mí</h2>
              <div className="mb-8 text-muted-foreground space-y-4 text-lg" dangerouslySetInnerHTML={{ __html: profileData?.about?.replace(/\\n/g, '<br />') || 'Soy un profesional dedicado...' }} />
              {profileData?.cvUrl && (
                <a href={formatImageUrl(profileData.cvUrl)} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="lg">
                        <Eye className="mr-2" /> Ver CV en línea
                    </Button>
                </a>
              )}
            </div>
            <div className="relative h-96 rounded-lg overflow-hidden shadow-xl group">
                 <Image src={formatImageUrl(profileData?.aboutImageUrl) || "https://placehold.co/600x400.png"} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover transition-transform duration-500 group-hover:scale-105" alt="Workspace" data-ai-hint="workspace desk" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
          </div>
        </section>

        {/* Projects Section */}
        <section id="projects" className="py-24 sm:py-32">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold font-headline">Proyectos</h2>
                <p className="text-muted-foreground mt-2 text-lg">Una selección de mi trabajo reciente.</p>
            </div>
             {projectsData.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {projectsData.map((project, index) => (
                    <ProjectCard key={project.id} project={project} priority={index < 3} />
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground text-lg">No hay proyectos para mostrar. ¡Añade uno desde el dashboard!</p>
             )}
          </div>
        </section>

        {/* Professional Development Section */}
        <section id="experience" className="bg-muted/50 py-24 sm:py-32">
            <div className="container mx-auto px-4">
                <div className="text-center mb-20">
                    <h2 className="text-4xl md:text-5xl font-bold font-headline">Desarrollo Profesional</h2>
                    <p className="text-muted-foreground mt-2 text-lg">Mi trayectoria y experiencia laboral.</p>
                </div>
                <div className="relative max-w-4xl mx-auto">
                    <div className="absolute left-4 top-2 h-full w-0.5 bg-border"></div>
                    <div className="space-y-16">
                        {/* Work Experience 1 */}
                        <div className="relative pl-12 timeline-item">
                            <div className="absolute left-0 top-1.5 transform -translate-x-1/2 "><Briefcase className="w-8 h-8 text-primary bg-background rounded-full p-1.5"/></div>
                            <h3 className="text-2xl font-semibold font-headline">Residente de TI (Prácticas Profesionales)</h3>
                            <p className="text-md text-muted-foreground mt-1">Hutchinson Autopartes México | Celaya, Gto. | Ene 2024 - Ene 2025</p>
                            <div className="mt-4 text-foreground/80 text-lg space-y-2">
                                <p>Integrante del equipo de infraestructura TI para más de 250 usuarios, con responsabilidades en:</p>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>Virtualización de entornos (Hyper-V/VMware) e implementación de Active Directory y DHCP.</li>
                                    <li>Configuración de más de 10 switches Cisco/Dell para optimizar la red.</li>
                                    <li>Migración de 150 equipos a Windows 11 y soporte técnico integral (presencial/remoto).</li>
                                </ul>
                                <p className="font-semibold">Logros Destacados:</p>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>Reducción del 30% en el tiempo de recuperación de datos.</li>
                                    <li>Aumento del 25% en la eficiencia del equipo de soporte.</li>
                                    <li>Disminución del 40% en tickets de soporte recurrentes.</li>
                                </ul>
                            </div>
                        </div>
                        {/* Work Experience 2 */}
                        <div className="relative pl-12 timeline-item">
                            <div className="absolute left-0 top-1.5 transform -translate-x-1/2 "><Briefcase className="w-8 h-8 text-primary bg-background rounded-full p-1.5"/></div>
                            <h3 className="text-2xl font-semibold font-headline">Desarrollador Full Stack</h3>
                            <p className="text-md text-muted-foreground mt-1">STREIT Group (Mei Ta) | Comonfort, Gto. | Feb 2025 - Ago 2025</p>
                            <div className="mt-4 text-foreground/80 text-lg space-y-2">
                                <p>Desarrollo de un Sistema de Gestión de Metrología (Web App) con el stack Next.js, React, Firebase y Vercel.</p>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>Implementación de un semáforo visual para aprobaciones de calidad y sistema multilingüe (ES/EN/CH).</li>
                                    <li>Creación de un dashboard analítico en tiempo real con gestión de roles.</li>
                                    <li><span className="font-semibold">Impacto:</span> Aceleración del 40% en el proceso de aprobaciones de calidad.</li>
                                </ul>
                            </div>
                        </div>
                        {/* Work Experience 3 */}
                        <div className="relative pl-12 timeline-item">
                            <div className="absolute left-0 top-1.5 transform -translate-x-1/2 "><Briefcase className="w-8 h-8 text-primary bg-background rounded-full p-1.5"/></div>
                            <h3 className="text-2xl font-semibold font-headline">Desarrollador Independiente</h3>
                            <p className="text-md text-muted-foreground mt-1">Proyectos Freelance | 2022 – Presente</p>
                             <div className="mt-4 text-foreground/80 text-lg space-y-2">
                                <p>Desarrollo de soluciones web a medida para diversos clientes, gestionando el ciclo completo del proyecto desde la concepción hasta el despliegue y mantenimiento.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* Skills Section */}
        <section id="skills" className="py-24 sm:py-32">
          <div className="container mx-auto px-4">
             <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold font-headline">Habilidades Técnicas</h2>
                <p className="text-muted-foreground mt-2 text-lg">Las tecnologías y herramientas con las que trabajo.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="group relative transition-all duration-300 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-1">
                 <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100 card-glow"></div>
                <CardHeader><CardTitle className="text-2xl flex items-center justify-center gap-3"><Code/>Frontend</CardTitle></CardHeader>
                <CardContent className="flex flex-wrap justify-center gap-2">
                  <Badge variant="outline" className="text-md px-4 py-1">React</Badge>
                  <Badge variant="outline" className="text-md px-4 py-1">Next.js</Badge>
                  <Badge variant="outline" className="text-md px-4 py-1">JavaScript</Badge>
                  <Badge variant="outline" className="text-md px-4 py-1">TypeScript</Badge>
                  <Badge variant="outline" className="text-md px-4 py-1">Tailwind CSS</Badge>
                </CardContent>
              </Card>
              <Card className="group relative transition-all duration-300 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100 card-glow"></div>
                <CardHeader><CardTitle className="text-2xl flex items-center justify-center gap-3"><Server/>Backend</CardTitle></CardHeader>
                <CardContent className="flex flex-wrap justify-center gap-2">
                  <Badge variant="outline" className="text-md px-4 py-1">Node.js</Badge>
                  <Badge variant="outline" className="text-md px-4 py-1">Express</Badge>
                  <Badge variant="outline" className="text-md px-4 py-1">Firebase</Badge>
                </CardContent>
              </Card>
              <Card className="group relative transition-all duration-300 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-1">
                 <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100 card-glow"></div>
                <CardHeader><CardTitle className="text-2xl flex items-center justify-center gap-3"><Layers3/>DevOps</CardTitle></CardHeader>
                <CardContent className="flex flex-wrap justify-center gap-2">
                  <Badge variant="outline" className="text-md px-4 py-1">Vercel</Badge>
                  <Badge variant="outline" className="text-md px-4 py-1">Ubuntu Server LTS</Badge>
                  <Badge variant="outline" className="text-md px-4 py-1">Docker (básico)</Badge>
                </CardContent>
              </Card>
              <Card className="group relative transition-all duration-300 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-1">
                 <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100 card-glow"></div>
                <CardHeader><CardTitle className="text-2xl flex items-center justify-center gap-3"><Cpu/>Infraestructura</CardTitle></CardHeader>
                <CardContent className="flex flex-wrap justify-center gap-2">
                   <Badge variant="outline" className="text-md px-4 py-1">Active Directory</Badge>
                   <Badge variant="outline" className="text-md px-4 py-1">Cisco/Dell</Badge>
                   <Badge variant="outline" className="text-md px-4 py-1">Hyper-V/VMware</Badge>
                </CardContent>
              </Card>
               <Card className="group relative transition-all duration-300 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-1">
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100 card-glow"></div>
                <CardHeader><CardTitle className="text-2xl flex items-center justify-center gap-3"><Wrench/>Soporte TI</CardTitle></CardHeader>
                <CardContent className="flex flex-wrap justify-center gap-2">
                   <Badge variant="outline" className="text-md px-4 py-1">Helpdesk</Badge>
                   <Badge variant="outline" className="text-md px-4 py-1">Remote Desktop</Badge>
                   <Badge variant="outline" className="text-md px-4 py-1">Troubleshooting</Badge>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Certifications Section */}
        <section id="certifications" className="bg-muted/50 py-24 sm:py-32">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold font-headline">Certificaciones</h2>
                  
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 justify-center">
                    <Card className="flex items-center p-6 gap-5 group relative transition-all duration-300 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-1">
                        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100 card-glow"></div>
                        <Award className="w-16 h-16 text-primary flex-shrink-0" />
                        <div>
                            <h3 className="font-semibold text-lg">Oracle Next Education: Back-end</h3>
                            <p className="text-sm text-muted-foreground">Java, Spring Boot</p>
                        </div>
                    </Card>
                     <Card className="flex items-center p-6 gap-5 group relative transition-all duration-300 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-1">
                        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100 card-glow"></div>
                        <Award className="w-16 h-16 text-primary flex-shrink-0" />
                        <div>
                            <h3 className="font-semibold text-lg">Business Agility</h3>
                            <p className="text-sm text-muted-foreground">Plataforma: Oracle Next Education</p>
                        </div>
                    </Card>
                    <Card className="flex items-center p-6 gap-5 group relative transition-all duration-300 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-1">
                        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100 card-glow"></div>
                        <Award className="w-16 h-16 text-primary flex-shrink-0" />
                        <div>
                            <h3 className="font-semibold text-lg">Desarrollo Personal G4 - ONE</h3>
                            <p className="text-sm text-muted-foreground">Plataforma: Oracle Next Education</p>
                        </div>
                    </Card>
                </div>
            </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-24 sm:py-32">
          <div className="container mx-auto px-4">
             <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold font-headline">Testimonios</h2>
            </div>
             {testimonialsData.length > 0 ? (
                <Carousel opts={{ loop: testimonialsData.length > 1 }} className="max-w-3xl mx-auto">
                  <CarouselContent>
                    {testimonialsData.map((testimonial) => (
                       <CarouselItem key={testimonial.id}>
                        <Card className="border-l-4 border-primary bg-muted/50">
                          <CardContent className="p-8 text-center">
                            <blockquote className="italic text-xl mb-6 before:content-['“'] after:content-['”']">
                                {testimonial.quote}
                            </blockquote>
                            <footer>
                              <p className="font-semibold text-lg">{testimonial.name}</p>
                              <p className="text-md text-muted-foreground">{testimonial.role}, {testimonial.company}</p>
                            </footer>
                          </CardContent>
                        </Card>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>
              ) : (
                <p className="text-center text-muted-foreground text-lg">No hay testimonios para mostrar. ¡Añade uno desde el dashboard!</p>
              )}
          </div>
        </section>
        
        {/* Contact Section */}
        <section id="contact" className="bg-muted/50 py-24 sm:py-32">
          <div className="container mx-auto px-4 max-w-2xl">
            <ContactForm />
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}

    