'use client';
import React, { useRef, useEffect, useCallback } from 'react';
import { useTheme } from 'next-themes';

class ParticleNetworkAnimation {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  particles: Particle[];
  mouse: { x: number | null; y: number | null; maxDistance: number };
  animationFrameId?: number;
  width: number = 0;
  height: number = 0;
  colors: { particle: string; line: string, mouseLine: string };

  constructor(canvas: HTMLCanvasElement, colors: { particle: string; line: string, mouseLine: string }) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.colors = colors;
    this.particles = [];
    this.mouse = {
      x: null,
      y: null,
      maxDistance: 150,
    };
    this.resize = this.resize.bind(this);
    this.animate = this.animate.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseOut = this.handleMouseOut.bind(this);
  }

  init() {
    this.resize();
    window.addEventListener('resize', this.resize);
    this.canvas.addEventListener('mousemove', this.handleMouseMove);
    this.canvas.addEventListener('mouseout', this.handleMouseOut);
    
    const particleCount = (this.canvas.width * this.canvas.height) / 9000;
    this.particles = [];
    for (let i = 0; i < particleCount; i++) {
        this.particles.push(new Particle(this.width, this.height, this.colors.particle));
    }

    if (!this.animationFrameId) {
      this.animate();
    }
  }

  resize() {
    const parent = this.canvas.parentElement;
    if (parent) {
      this.width = parent.clientWidth;
      this.height = parent.clientHeight;
      this.canvas.width = this.width;
      this.canvas.height = this.height;
    }
    const particleCount = (this.canvas.width * this.canvas.height) / 9000;
    this.particles = [];
    for (let i = 0; i < particleCount; i++) {
        this.particles.push(new Particle(this.width, this.height, this.colors.particle));
    }
  }

  handleMouseMove(event: MouseEvent) {
    if(this.canvas.parentElement) {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = event.clientX - rect.left;
      this.mouse.y = event.clientY - rect.top;
    }
  }
  
  handleMouseOut() {
    this.mouse.x = null;
    this.mouse.y = null;
  }
  
  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    for(const particle of this.particles) {
        particle.update(this.width, this.height);
        particle.draw(this.ctx);
    }
    
    this.connectParticles();

    this.animationFrameId = requestAnimationFrame(this.animate);
  }

  connectParticles() {
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const dx = this.particles[i].x - this.particles[j].x;
        const dy = this.particles[i].y - this.particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 120) {
          this.ctx.beginPath();
          this.ctx.strokeStyle = this.colors.line;
          this.ctx.lineWidth = 0.3;
          this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
          this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
          this.ctx.stroke();
          this.ctx.closePath();
        }
      }
      
      if (this.mouse.x !== null && this.mouse.y !== null) {
        const dx = this.particles[i].x - this.mouse.x;
        const dy = this.particles[i].y - this.mouse.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.mouse.maxDistance) {
          this.ctx.beginPath();
          this.ctx.strokeStyle = this.colors.mouseLine;
          this.ctx.lineWidth = 0.5;
          this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
          this.ctx.lineTo(this.mouse.x, this.mouse.y);
          this.ctx.stroke();
          this.ctx.closePath();
        }
      }
    }
  }

  destroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    window.removeEventListener('resize', this.resize);
    this.canvas.removeEventListener('mousemove', this.handleMouseMove);
    this.canvas.removeEventListener('mouseout', this.handleMouseOut);
  }
}

class Particle {
    x: number;
    y: number;
    radius: number;
    vx: number;
    vy: number;
    color: string;

    constructor(width: number, height: number, color: string) {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.radius = Math.random() * 2 + 1;
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = (Math.random() - 0.5) * 0.3;
        this.color = color;
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }

    update(width: number, height: number) {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;
    }
}


const ParticleNetwork: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { theme } = useTheme();

    const getThemeColors = useCallback(() => {
        if (typeof window === 'undefined') {
            return {
                particle: 'hsl(210 40% 98%)',
                line: 'hsl(217.2 32.6% 17.5%)',
                mouseLine: 'hsl(212.7 26.8% 83.9%)',
            };
        }
        
        const style = getComputedStyle(document.documentElement);
        
        const parseHslColor = (variable: string) => `hsl(${style.getPropertyValue(variable).trim()})`
        
        return {
            particle: parseHslColor('--foreground'),
            line: parseHslColor('--secondary'),
            mouseLine: parseHslColor('--ring')
        };
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        let particleNetwork: ParticleNetworkAnimation | null = null;
        
        const initAnimation = () => {
             if (particleNetwork) {
                particleNetwork.destroy();
            }
            const colors = getThemeColors();
            particleNetwork = new ParticleNetworkAnimation(canvas, colors);
            particleNetwork.init();
        }

        const timeoutId = setTimeout(initAnimation, 50);

        return () => {
            clearTimeout(timeoutId);
            if (particleNetwork) {
              particleNetwork.destroy();
            }
        };
    }, [theme, getThemeColors]);

    return <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full z-0" />;
};

export default ParticleNetwork;
