import { useEffect, useRef } from 'react';

/**
 * useScrollReveal — attaches IntersectionObserver to a container ref
 * and adds 'sr-visible' class to elements with sr-hidden / sr-left / sr-right / sr-scale / stagger-grid
 * when they enter the viewport.
 *
 * Usage:
 *   const sectionRef = useScrollReveal();
 *   <section ref={sectionRef} className="sr-hidden">...</section>
 *
 * Or pass children with sr-* classes inside any container.
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  options: IntersectionObserverInit = {}
) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const targets: Element[] = [];

    // If the root element itself has a sr-* class, observe it
    const rootClasses = ['sr-hidden', 'sr-left', 'sr-right', 'sr-scale', 'stagger-grid'];
    const isTarget = rootClasses.some((c) => el.classList.contains(c));
    if (isTarget) targets.push(el);

    // Also observe any children with sr-* classes
    rootClasses.forEach((c) => {
      el.querySelectorAll(`.${c}`).forEach((child) => targets.push(child));
    });

    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('sr-visible');
            // Don't unobserve — keeps it visible (once = true behaviour)
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '-40px 0px',
        ...options,
      }
    );

    targets.forEach((t) => observer.observe(t));

    return () => observer.disconnect();
  }, []);

  return ref;
}

/**
 * useScrollRevealAll — convenience version that auto-observes
 * ALL sr-* elements on the page. Call once at the root layout level.
 */
export function useScrollRevealAll(options: IntersectionObserverInit = {}) {
  useEffect(() => {
    const selectors = '.sr-hidden,.sr-left,.sr-right,.sr-scale,.stagger-grid';
    const targets = Array.from(document.querySelectorAll(selectors));
    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('sr-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '-30px 0px', ...options }
    );

    targets.forEach((t) => observer.observe(t));
    return () => observer.disconnect();
  }, []);
}

export default useScrollReveal;
