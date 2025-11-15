import { useEffect, useRef } from 'react';

/**
 * AnimatedBackground - Modern geometric pattern animation
 * Professional abstract shapes with blockchain-inspired grid
 */
function AnimatedBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];
    let time = 0;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Geometric shape types
    const shapeTypes = ['circle', 'square', 'hexagon', 'triangle'];
    const gradients = [
      { start: 'rgba(249, 115, 22, 0.15)', end: 'rgba(220, 38, 38, 0.05)' },
      { start: 'rgba(251, 191, 36, 0.15)', end: 'rgba(249, 115, 22, 0.05)' },
      { start: 'rgba(236, 72, 153, 0.15)', end: 'rgba(239, 68, 68, 0.05)' },
    ];

    // Geometric particle class
    class GeometricParticle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 40 + 20;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.shape = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
        this.gradient = gradients[Math.floor(Math.random() * gradients.length)];
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.01;
        this.opacity = Math.random() * 0.4 + 0.1;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.rotation += this.rotationSpeed;

        // Wrap around screen
        if (this.x > canvas.width + this.size) this.x = -this.size;
        if (this.x < -this.size) this.x = canvas.width + this.size;
        if (this.y > canvas.height + this.size) this.y = -this.size;
        if (this.y < -this.size) this.y = canvas.height + this.size;
      }

      draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        // Create gradient
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size);
        gradient.addColorStop(0, this.gradient.start);
        gradient.addColorStop(1, this.gradient.end);
        ctx.fillStyle = gradient;

        switch (this.shape) {
          case 'circle':
            ctx.beginPath();
            ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
            ctx.fill();
            break;

          case 'square':
            ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
            break;

          case 'hexagon':
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
              const angle = (Math.PI / 3) * i;
              const x = (this.size / 2) * Math.cos(angle);
              const y = (this.size / 2) * Math.sin(angle);
              if (i === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fill();
            break;

          case 'triangle':
            ctx.beginPath();
            ctx.moveTo(0, -this.size / 2);
            ctx.lineTo(-this.size / 2, this.size / 2);
            ctx.lineTo(this.size / 2, this.size / 2);
            ctx.closePath();
            ctx.fill();
            break;
        }

        ctx.restore();
      }
    }

    // Create particles
    const createParticles = () => {
      const numberOfParticles = Math.min(25, Math.floor(canvas.width / 50));
      for (let i = 0; i < numberOfParticles; i++) {
        particles.push(new GeometricParticle());
      }
    };
    createParticles();

    // Draw grid pattern
    const drawGrid = () => {
      const gridSize = 100;
      ctx.strokeStyle = 'rgba(249, 115, 22, 0.03)';
      ctx.lineWidth = 1;

      // Vertical lines
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x + (time * 0.5) % gridSize, 0);
        ctx.lineTo(x + (time * 0.5) % gridSize, canvas.height);
        ctx.stroke();
      }

      // Horizontal lines
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y + (time * 0.5) % gridSize);
        ctx.lineTo(canvas.width, y + (time * 0.5) % gridSize);
        ctx.stroke();
      }
    };

    // Draw connecting lines (blockchain network)
    const drawConnections = () => {
      ctx.strokeStyle = 'rgba(249, 115, 22, 0.08)';
      ctx.lineWidth = 1.5;
      
      particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach(p2 => {
          const distance = Math.hypot(p1.x - p2.x, p1.y - p2.y);
          if (distance < 200) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.globalAlpha = (1 - distance / 200) * 0.15;
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        });
      });
    };

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw subtle grid
      drawGrid();

      // Draw connection lines
      drawConnections();

      // Update and draw particles
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });

      time += 0.3;
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.7 }}
    />
  );
}

export default AnimatedBackground;

