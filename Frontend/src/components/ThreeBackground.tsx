import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeBackgroundProps {
  theme?: 'emerald' | 'blue' | 'amber' | 'slate';
  opacity?: number;
  interactive?: boolean;
}

export const ThreeBackground: React.FC<ThreeBackgroundProps> = ({
  theme = 'emerald',
  opacity = 0.35,
  interactive = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Portal Theme Colors
    let colorHex = 0x10b981; // Emerald for NGO
    if (theme === 'blue') {
      colorHex = 0x0284c7; // Sky Blue for Gov
    } else if (theme === 'amber') {
      colorHex = 0xd97706; // Amber for Donor
    } else if (theme === 'slate') {
      colorHex = 0x64748b;
    }

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / (container.clientHeight || 1),
      0.1,
      1000
    );
    camera.position.set(0, -18, 42);
    camera.rotation.x = 0.45;

    // 2. Ultra-Light WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    container.appendChild(renderer.domElement);

    // 3. Subtle Gentle Topographic 3D Plane Mesh (Lightweight & Silky Smooth)
    const cols = 36;
    const rows = 28;
    const geometry = new THREE.PlaneGeometry(90, 70, cols, rows);
    const posAttribute = geometry.attributes.position;
    const count = posAttribute.count;

    // Store base positions
    const initialPositions = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
      initialPositions[i] = posAttribute.array[i];
    }

    // Delicate wireframe material with soft opacity
    const material = new THREE.MeshBasicMaterial({
      color: colorHex,
      wireframe: true,
      transparent: true,
      opacity: 0.28,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Mouse Tracking for Gentle Fluid Tilt
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return;
      mouseX = (e.clientX / window.innerWidth - 0.5) * 4;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 4;
    };

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / (container.clientHeight || 1);
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('resize', handleResize);

    // 4. Silky Wave Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime() * 0.7;

      const pArr = posAttribute.array as Float32Array;

      // Soft undulating gentle wave
      for (let i = 0; i < count; i++) {
        const x = initialPositions[i * 3];
        const y = initialPositions[i * 3 + 1];

        // Harmonic dual-frequency wave (super calm, elegant and lightweight)
        const z =
          Math.sin(x * 0.12 + t * 1.2) * 2.2 +
          Math.cos(y * 0.14 + t * 0.9) * 2.0 +
          Math.sin((x + y) * 0.08 + t * 0.5) * 1.4;

        pArr[i * 3 + 2] = z;
      }
      posAttribute.needsUpdate = true;

      // Smooth subtle camera tilt
      targetX += (mouseX - targetX) * 0.03;
      targetY += (mouseY - targetY) * 0.03;

      mesh.rotation.z = targetX * 0.02;
      camera.position.x = targetX * 0.8;
      camera.position.y = -18 + targetY * 0.5;

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
      renderer.dispose();
    };
  }, [theme, interactive]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none overflow-hidden transition-opacity duration-700"
      style={{ zIndex: 0, opacity }}
    />
  );
};

export default ThreeBackground;
