import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface ParticleRingCanvasProps {
  onPointerMoveCoords?: (coords: { x: number; y: number }) => void;
}

export const ParticleRingCanvas: React.FC<ParticleRingCanvasProps> = ({ onPointerMoveCoords }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webGlSupported, setWebGlSupported] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    // Check reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    const handleMotionChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleMotionChange);

    const container = containerRef.current;
    if (!container) return;

    // Check WebGL availability
    const testCanvas = document.createElement('canvas');
    const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
    if (!gl) {
      setWebGlSupported(false);
      return;
    }

    let isDestroyed = false;
    let animationFrameId: number | null = null;
    let isVisible = true;

    // Three.js Setup
    const scene = new THREE.Scene();

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 100);
    camera.position.z = 7.5;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebGlSupported(false);
      return;
    }

    const isMobile = window.innerWidth < 768;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0); // Transparent so dark CSS background shows through
    container.appendChild(renderer.domElement);

    // Particle Ring Generation
    // Requirements: hollow centre, irregular depth, resembles a flowing cloud of points
    const particleCount = isMobile ? 3200 : 8000;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const initialRadii = new Float32Array(particleCount);
    const initialAngles = new Float32Array(particleCount);
    const speedFactors = new Float32Array(particleCount);

    const innerRadius = 2.4;
    const ringBandWidth = 2.5;

    // Color palette: crisp white, soft violet, vivid violet (#8b5cf6), electric purple (#a855f7)
    const colorWhite = new THREE.Color(0xffffff);
    const colorSoftWhite = new THREE.Color(0xf1f5f9);
    const colorVioletVivid = new THREE.Color(0x8b5cf6);
    const colorVioletElectric = new THREE.Color(0xa855f7);
    const colorVioletDeep = new THREE.Color(0x7c3aed);

    const tempColor = new THREE.Color();

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const angle = Math.random() * Math.PI * 2;
      initialAngles[i] = angle;
      speedFactors[i] = 0.8 + Math.random() * 0.4;

      // Radial distribution with density peaked toward middle of band
      const radiusOffset = (Math.pow(Math.random(), 0.85) - 0.5) * ringBandWidth;
      const r = innerRadius + ringBandWidth * 0.5 + radiusOffset;
      initialRadii[i] = r;

      // Irregular depth (z) to give volume and cloud feeling
      const zOffset = (Math.random() - 0.5) * 1.8 * (1 - Math.abs(radiusOffset) / (ringBandWidth * 0.8));

      positions[i3] = Math.cos(angle) * r;
      positions[i3 + 1] = Math.sin(angle) * r * 0.78; // Slight elliptical tilt for cinematic perspective
      positions[i3 + 2] = zOffset;

      // Particle color mix
      const rand = Math.random();
      if (rand < 0.42) {
        tempColor.copy(colorWhite);
      } else if (rand < 0.6) {
        tempColor.copy(colorSoftWhite);
      } else if (rand < 0.85) {
        tempColor.copy(colorVioletVivid);
      } else if (rand < 0.95) {
        tempColor.copy(colorVioletElectric);
      } else {
        tempColor.copy(colorVioletDeep);
      }

      colors[i3] = tempColor.r;
      colors[i3 + 1] = tempColor.g;
      colors[i3 + 2] = tempColor.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Circle texture for soft round particles instead of square dots
    const canvasPoint = document.createElement('canvas');
    canvasPoint.width = 32;
    canvasPoint.height = 32;
    const ctx = canvasPoint.getContext('2d');
    if (ctx) {
      const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.35, 'rgba(255, 255, 255, 0.85)');
      grad.addColorStop(0.7, 'rgba(255, 255, 255, 0.2)');
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 32, 32);
    }
    const texture = new THREE.CanvasTexture(canvasPoint);

    const material = new THREE.PointsMaterial({
      size: isMobile ? 0.055 : 0.046,
      map: texture,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Secondary subtle cosmic mist (outer faint layer)
    const dustCount = isMobile ? 400 : 1200;
    const dustPositions = new Float32Array(dustCount * 3);
    const dustColors = new Float32Array(dustCount * 3);

    for (let i = 0; i < dustCount; i++) {
      const i3 = i * 3;
      const angle = Math.random() * Math.PI * 2;
      const r = 1.8 + Math.random() * 5.2;
      dustPositions[i3] = Math.cos(angle) * r;
      dustPositions[i3 + 1] = Math.sin(angle) * r * 0.75;
      dustPositions[i3 + 2] = (Math.random() - 0.5) * 3.0;

      dustColors[i3] = 0.6 + Math.random() * 0.3;
      dustColors[i3 + 1] = 0.4 + Math.random() * 0.3;
      dustColors[i3 + 2] = 0.9;
    }

    const dustGeometry = new THREE.BufferGeometry();
    dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    dustGeometry.setAttribute('color', new THREE.BufferAttribute(dustColors, 3));

    const dustMaterial = new THREE.PointsMaterial({
      size: 0.025,
      map: texture,
      vertexColors: true,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const dustPoints = new THREE.Points(dustGeometry, dustMaterial);
    scene.add(dustPoints);

    // Pointer Parallax state
    let targetMouseX = 0;
    let targetMouseY = 0;
    let currentMouseX = 0;
    let currentMouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const normX = (e.clientX / window.innerWidth) * 2 - 1;
      const normY = -(e.clientY / window.innerHeight) * 2 + 1;
      targetMouseX = normX * 0.4;
      targetMouseY = normY * 0.3;
      if (onPointerMoveCoords) {
        onPointerMoveCoords({ x: normX, y: normY });
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Handle Resize
    const handleResize = () => {
      if (!container || !renderer) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // Animation Loop
    let clock = new THREE.Clock();

    const animate = () => {
      if (isDestroyed) return;

      if (isVisible) {
        const delta = clock.getDelta();
        const elapsedTime = clock.getElapsedTime();

        // Parallax smooth interpolation
        currentMouseX += (targetMouseX - currentMouseX) * 0.04;
        currentMouseY += (targetMouseY - currentMouseY) * 0.04;

        if (!reducedMotion) {
          // Continuous subtle rotation
          particles.rotation.z = elapsedTime * 0.045;
          particles.rotation.x = 0.28 + currentMouseY * 0.25;
          particles.rotation.y = currentMouseX * 0.35;

          dustPoints.rotation.z = -elapsedTime * 0.02;
          dustPoints.rotation.x = 0.28 + currentMouseY * 0.15;
          dustPoints.rotation.y = currentMouseX * 0.2;

          // Camera slight breathe
          camera.position.x = currentMouseX * 0.3;
          camera.position.y = currentMouseY * 0.25;
        }

        renderer.render(scene, camera);
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // IntersectionObserver to pause rendering when hero is offscreen
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting;
        });
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    // Document visibility change to pause when tab hidden
    const handleVisibilityChange = () => {
      if (document.hidden) {
        isVisible = false;
      } else {
        isVisible = true;
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      isDestroyed = true;
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
      mediaQuery.removeEventListener('change', handleMotionChange);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      observer.disconnect();

      // WebGL resource disposal
      geometry.dispose();
      material.dispose();
      dustGeometry.dispose();
      dustMaterial.dispose();
      texture.dispose();
      renderer.dispose();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [reducedMotion, onPointerMoveCoords]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden select-none"
      aria-hidden="true"
    >
      {!webGlSupported && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[360px] h-[360px] md:w-[540px] md:h-[540px] rounded-full border border-violet-500/20 bg-radial from-violet-600/10 via-transparent to-transparent animate-pulse" />
        </div>
      )}
    </div>
  );
};
