import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const ThreeInteractiveWave: React.FC<{ className?: string }> = ({ className = '' }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      50,
      container.clientWidth / container.clientHeight,
      1,
      1500
    );
    camera.position.set(0, 160, 380);
    camera.lookAt(0, -20, 0);

    // WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // ─── Clean, Smooth Interactive 3D Wave Wireframe / Points Mesh ───
    const cols = 40;
    const rows = 35;
    const count = cols * rows;
    const sep = 32;

    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const basePositions: { x: number; z: number }[] = [];

    const c1 = new THREE.Color(0x10b981); // Emerald
    const c2 = new THREE.Color(0x059669); // Forest
    const c3 = new THREE.Color(0x06b6d4); // Teal

    let idx = 0;
    for (let ix = 0; ix < cols; ix++) {
      for (let iz = 0; iz < rows; iz++) {
        const x = (ix - cols / 2) * sep;
        const z = (iz - rows / 2) * sep;

        positions[idx * 3] = x;
        positions[idx * 3 + 1] = 0;
        positions[idx * 3 + 2] = z;

        basePositions.push({ x, z });

        const dist = Math.sqrt(x * x + z * z) / 600;
        const mixed = c1.clone().lerp(c3, Math.min(dist, 1));

        colors[idx * 3] = mixed.r;
        colors[idx * 3 + 1] = mixed.g;
        colors[idx * 3 + 2] = mixed.b;

        idx++;
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Particle Texture (Soft ambient glow)
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      grad.addColorStop(0, 'rgba(16, 185, 129, 0.9)');
      grad.addColorStop(0.4, 'rgba(16, 185, 129, 0.4)');
      grad.addColorStop(1, 'rgba(16, 185, 129, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(16, 16, 16, 0, Math.PI * 2);
      ctx.fill();
    }
    const texture = new THREE.CanvasTexture(canvas);

    const material = new THREE.PointsMaterial({
      size: 4.2,
      vertexColors: true,
      map: texture,
      transparent: true,
      opacity: 0.55,
      blending: THREE.NormalBlending,
      depthWrite: false,
    });

    const waveParticles = new THREE.Points(geometry, material);
    scene.add(waveParticles);

    // Mouse Tracking
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX - window.innerWidth / 2) * 0.15;
      mouseY = (e.clientY - window.innerHeight / 2) * 0.15;
    };

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationFrameId: number;
    let step = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      step += 0.018;

      const posAttr = geometry.attributes.position as THREE.BufferAttribute;
      const posArr = posAttr.array as Float32Array;

      let pIdx = 0;
      for (let ix = 0; ix < cols; ix++) {
        for (let iz = 0; iz < rows; iz++) {
          const bp = basePositions[pIdx];
          const y =
            Math.sin(ix * 0.25 + step) * 12 +
            Math.cos(iz * 0.25 + step * 0.8) * 12 +
            Math.sin((bp.x * 0.008 + bp.z * 0.008 + step)) * 8;

          posArr[pIdx * 3 + 1] = y;
          pIdx++;
        }
      }
      posAttr.needsUpdate = true;

      targetX += (mouseX - targetX) * 0.03;
      targetY += (mouseY - targetY) * 0.03;

      camera.position.x = targetX * 0.5;
      camera.position.y = 160 - targetY * 0.3;
      camera.lookAt(0, -20, 0);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      texture.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}
      style={{ zIndex: 0 }}
    />
  );
};

export default ThreeInteractiveWave;
