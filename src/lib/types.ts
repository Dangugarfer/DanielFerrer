
import { Timestamp } from "firebase/firestore";

export interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  imageUrl: string;
  screenshots: string[];
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  quote: string;
}

export interface Profile {
  name: string;
  headline: string;
  about: string;
  cvUrl: string;
  aboutImageUrl: string;
}

export interface Message {
    id: string;
    name: string;
    contact: string;
    message: string;
    createdAt: Timestamp;
    read: boolean;
}
