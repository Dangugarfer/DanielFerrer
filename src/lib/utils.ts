import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatImageUrl(url: string | undefined | null): string {
  if (!url) return '';
  
  // Lista de extensiones de imagen comunes
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp'];
  
  // Comprueba si la URL ya es un enlace directo a una imagen
  const isDirectImageLink = imageExtensions.some(ext => url.toLowerCase().includes(ext));

  if (isDirectImageLink || url.startsWith('https://placehold.co') || url.startsWith('https://res.cloudinary.com')) {
    return url;
  }
  
  // Intenta extraer el ID de un enlace de Google Drive
  const match = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    const fileId = match[1];
    return `https://drive.google.com/uc?export=view&id=${fileId}`;
  }
  
  // Si no es un enlace de imagen directo ni un enlace de Drive reconocible,
  // devuelve la URL original. Podría ser una URL sin extensión que funcione.
  return url; 
}
