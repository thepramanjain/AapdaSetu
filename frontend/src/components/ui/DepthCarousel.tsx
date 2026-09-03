import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  PointerEvent as ReactPointerEvent,
  KeyboardEvent as ReactKeyboardEvent
} from 'react';
import gsap from 'gsap';
import {
  ShieldAlert,
  ArrowRight,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Heart,
  Bookmark,
  Send,
  Compass,
  Radio,
  Clock,
  Layers,
  Activity,
  CheckCircle2,
  Zap,
  Radar,
  Cpu,
  ShieldCheck,
  Boxes,
  PackageCheck,
  HeartPulse,
  Crosshair,
  Coins,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export type DepthCarouselItem = {
  id?: string;
  avatar?: string;
  roleIcon?: string;
  role?: string;
  title?: string;
  shortTitle?: string;
  category?: string;
  description?: string;
  tags?: string[];
  status?: string;
  badge?: string;
};

export interface DepthCarouselProps {
  items?: DepthCarouselItem[];
  className?: string;
  onSelectRole?: (role: string) => void;
}

const DEFAULT_ROLES: DepthCarouselItem[] = [
  {
    id: 'r1',
    roleIcon: 'drone',
    shortTitle: 'Field Scout',
    title: 'Emergency Field Scout',
    category: 'Rapid Telemetry',
    description: 'Deploys first-contact drone surveillance, maps live flood lines, and transmits geo-tagged crisis coordinates.',
    tags: ['#InstantTelemetry', '#DroneSurveillance'],
    status: 'Online',
  },
  {
    id: 'r2',
    roleIcon: 'ai',
    shortTitle: 'Triage Lead',
    title: 'AI Incident Assessor',
    category: 'AI Vision & Triage',
    description: 'Processes multispectral satellite feeds, classifies structural damage under 90s, and prioritizes urgent GPS hotspots.',
    tags: ['#SatelliteAI', '#DamageAssessment'],
    status: 'Active',
  },
  {
    id: 'r3',
    roleIcon: 'commander',
    shortTitle: 'Response Commander',
    title: 'Disaster Response Commander',
    category: 'NDRF Coordination',
    description: 'Reads incident feeds, patches emergency logistics, coordinates rescue boats, and mobilizes NDRF units in real time.',
    tags: ['#NDRFCoordination', '#InstantDispatch'],
    status: 'Commanding',
  },
  {
    id: 'r4',
    roleIcon: 'blockchain',
    shortTitle: 'Treasury Auditor',
    title: 'On-Chain Treasury Auditor',
    category: 'Blockchain Ledger',
    description: 'Audits every rupee on the public Polygon ledger, auto-releasing milestone funding directly to verified ground NGOs.',
    tags: ['#TransparentDeFi', '#ZeroFraud'],
    status: 'Verified',
  },
  {
    id: 'r5',
    roleIcon: 'relief',
    shortTitle: 'Relief Coordinator',
    title: 'Ground Relief Coordinator',
    category: 'Food & Medicine Supply',
    description: 'Manages ration kit inventory, registers survivor vital needs with offline sync, and verifies supply delivery.',
    tags: ['#GroundRelief', '#OfflineSync'],
    status: 'On Ground',
  },
  {
    id: 'r6',
    roleIcon: 'medical',
    shortTitle: 'Medical Officer',
    title: 'Trauma & Medical Lead',
    category: 'Casualty Evacuation',
    description: 'Deploys mobile ICUs and air ambulances, triages critical injuries, and routes medical supplies to shelter camps.',
    tags: ['#TraumaCare', '#AirdropMeds'],
    status: 'Priority',
  },
];

// ─── High-Tech Role Logo Component ─────────────────────────────────────
const RoleLogo: React.FC<{ item: DepthCarouselItem; size?: 'sm' | 'lg' }> = ({ item, size = 'lg' }) => {
  const isLg = size === 'lg';

  switch (item.roleIcon || item.id) {
    case 'drone':
    case 'r1':
      return (
        <div
          className={`w-full h-full flex flex-col items-center justify-center relative overflow-hidden text-white ${
            isLg ? 'p-3' : 'p-2'
          }`}
          style={{
            background: 'linear-gradient(135deg, #064E3B 0%, #047857 50%, #059669 100%)',
          }}
        >
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#6EE7B7_1px,transparent_1px)] [background-size:8px_8px]" />
          <div className="absolute inset-0 rounded-full border border-emerald-400/30 scale-75 animate-ping" style={{ animationDuration: '3s' }} />
          <Radar className={`${isLg ? 'h-9 w-9' : 'h-7 w-7'} text-emerald-200 relative z-10 drop-shadow-[0_2px_8px_rgba(16,185,129,0.8)]`} />
          <span className={`font-mono font-black uppercase tracking-wider text-emerald-100 ${isLg ? 'text-[9px] mt-1' : 'text-[7px]'}`}>
            SCOUT-UAV
          </span>
        </div>
      );

    case 'ai':
    case 'r2':
      return (
        <div
          className={`w-full h-full flex flex-col items-center justify-center relative overflow-hidden text-white ${
            isLg ? 'p-3' : 'p-2'
          }`}
          style={{
            background: 'linear-gradient(135deg, #1E1B4B 0%, #3730A3 50%, #4F46E5 100%)',
          }}
        >
          <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#818CF8_1px,transparent_1px)] [background-size:8px_8px]" />
          <Cpu className={`${isLg ? 'h-9 w-9' : 'h-7 w-7'} text-indigo-200 relative z-10 drop-shadow-[0_2px_8px_rgba(99,102,241,0.8)]`} />
          <span className={`font-mono font-black uppercase tracking-wider text-indigo-100 ${isLg ? 'text-[9px] mt-1' : 'text-[7px]'}`}>
            AI-NEURAL
          </span>
        </div>
      );

    case 'commander':
    case 'r3':
      return (
        <div
          className={`w-full h-full flex flex-col items-center justify-center relative overflow-hidden text-white ${
            isLg ? 'p-3' : 'p-2'
          }`}
          style={{
            background: 'linear-gradient(135deg, #78350F 0%, #B45309 50%, #D97706 100%)',
          }}
        >
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#FDE68A_1px,transparent_1px)] [background-size:8px_8px]" />
          <ShieldCheck className={`${isLg ? 'h-9 w-9' : 'h-7 w-7'} text-amber-200 relative z-10 drop-shadow-[0_2px_8px_rgba(245,158,11,0.8)]`} />
          <span className={`font-mono font-black uppercase tracking-wider text-amber-100 ${isLg ? 'text-[9px] mt-1' : 'text-[7px]'}`}>
            NDRF-CMD
          </span>
        </div>
      );

    case 'blockchain':
    case 'r4':
      return (
        <div
          className={`w-full h-full flex flex-col items-center justify-center relative overflow-hidden text-white ${
            isLg ? 'p-3' : 'p-2'
          }`}
          style={{
            background: 'linear-gradient(135deg, #4C1D95 0%, #6D28D9 50%, #7C3AED 100%)',
          }}
        >
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#DDD6FE_1px,transparent_1px)] [background-size:8px_8px]" />
          <Boxes className={`${isLg ? 'h-9 w-9' : 'h-7 w-7'} text-purple-200 relative z-10 drop-shadow-[0_2px_8px_rgba(168,85,247,0.8)]`} />
          <span className={`font-mono font-black uppercase tracking-wider text-purple-100 ${isLg ? 'text-[9px] mt-1' : 'text-[7px]'}`}>
            POLYGON
          </span>
        </div>
      );

    case 'relief':
    case 'r5':
      return (
        <div
          className={`w-full h-full flex flex-col items-center justify-center relative overflow-hidden text-white ${
            isLg ? 'p-3' : 'p-2'
          }`}
          style={{
            background: 'linear-gradient(135deg, #115E59 0%, #0D9488 50%, #14B8A6 100%)',
          }}
        >
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#99F6E4_1px,transparent_1px)] [background-size:8px_8px]" />
          <PackageCheck className={`${isLg ? 'h-9 w-9' : 'h-7 w-7'} text-teal-200 relative z-10 drop-shadow-[0_2px_8px_rgba(20,184,166,0.8)]`} />
          <span className={`font-mono font-black uppercase tracking-wider text-teal-100 ${isLg ? 'text-[9px] mt-1' : 'text-[7px]'}`}>
            RELIEF-AIR
          </span>
        </div>
      );

    case 'medical':
    case 'r6':
    default:
      return (
        <div
          className={`w-full h-full flex flex-col items-center justify-center relative overflow-hidden text-white ${
            isLg ? 'p-3' : 'p-2'
          }`}
          style={{
            background: 'linear-gradient(135deg, #881337 0%, #BE123C 50%, #E11D48 100%)',
          }}
        >
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#FECDD3_1px,transparent_1px)] [background-size:8px_8px]" />
          <HeartPulse className={`${isLg ? 'h-9 w-9' : 'h-7 w-7'} text-rose-200 relative z-10 drop-shadow-[0_2px_8px_rgba(244,63,94,0.8)]`} />
          <span className={`font-mono font-black uppercase tracking-wider text-rose-100 ${isLg ? 'text-[9px] mt-1' : 'text-[7px]'}`}>
            TRAUMA-ICU
          </span>
        </div>
      );
  }
};

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

export const DepthCarousel: React.FC<DepthCarouselProps> = ({
  items = DEFAULT_ROLES,
  className = '',
  onSelectRole,
}) => {
  const data = useMemo(() => (Array.isArray(items) && items.length > 0 ? items : DEFAULT_ROLES), [items]);
  const count = data.length;

  const rootRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const posRef = useRef(2); // Start with center item
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const autoTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [active, setActive] = useState(2);

  // Layout function calculating 3D perspective transforms
  const layout = useCallback(
    (pos: number) => {
      const n = count;
      if (!n) return;

      const spread = 210;
      const depth = 160;
      const tilt = 12;

      for (let i = 0; i < n; i++) {
        const el = cardRefs.current[i];
        if (!el) continue;

        let d = i - pos;
        if (n > 1) {
          d = ((d % n) + n) % n;
          if (d > n / 2) d -= n;
        }

        const absDist = Math.abs(d);
        const shown = absDist <= 2.5;

        // Position calculations
        const tx = spread * d;
        const tz = -depth * absDist;
        const ry = -tilt * clamp(d, -1.5, 1.5);
        const scale = clamp(1 - absDist * 0.12, 0.75, 1);
        const opacity = clamp(1 - absDist * 0.28, 0, 1);
        const zIndex = Math.round(100 - absDist * 10);

        el.style.transform = `translate(-50%, -50%) translateX(${tx.toFixed(1)}px) translateZ(${tz.toFixed(1)}px) rotateY(${ry.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
        el.style.opacity = shown ? opacity.toFixed(3) : '0';
        el.style.zIndex = String(zIndex);
        el.style.pointerEvents = absDist < 0.6 ? 'auto' : absDist < 2 ? 'auto' : 'none';
      }
    },
    [count]
  );

  const tweenTo = useCallback(
    (target: number) => {
      tweenRef.current?.kill();
      const proxy = { p: posRef.current };
      tweenRef.current = gsap.to(proxy, {
        p: target,
        duration: 0.65,
        ease: 'power3.out',
        onUpdate: () => {
          posRef.current = proxy.p;
          layout(proxy.p);
        },
        onComplete: () => {
          const n = count;
          if (n > 0) posRef.current = ((posRef.current % n) + n) % n;
          layout(posRef.current);
        },
      });
    },
    [count, layout]
  );

  const setFocus = useCallback(
    (rawIndex: number) => {
      const n = count;
      if (!n) return;
      const idx = ((rawIndex % n) + n) % n;
      let delta = idx - posRef.current;
      if (n > 1) {
        delta = ((delta % n) + n) % n;
        if (delta > n / 2) delta -= n;
      }
      tweenTo(posRef.current + delta);
      setActive(idx);
      onSelectRole?.(data[idx].title || '');
    },
    [count, data, onSelectRole, tweenTo]
  );

  const navigateBy = useCallback((step: number) => setFocus(active + step), [active, setFocus]);

  useEffect(() => {
    layout(posRef.current);
  }, [layout]);

  // Autoplay loop
  useEffect(() => {
    const root = rootRef.current;
    let hovered = false;
    const start = () => {
      if (autoTimerRef.current) clearInterval(autoTimerRef.current);
      autoTimerRef.current = setInterval(() => {
        if (!hovered) {
          setActive(prev => {
            const next = (prev + 1) % count;
            setFocus(next);
            return next;
          });
        }
      }, 4200);
    };

    const onEnter = () => { hovered = true; };
    const onLeave = () => { hovered = false; };

    root?.addEventListener('mouseenter', onEnter);
    root?.addEventListener('mouseleave', onLeave);
    start();

    return () => {
      if (autoTimerRef.current) clearInterval(autoTimerRef.current);
      root?.removeEventListener('mouseenter', onEnter);
      root?.removeEventListener('mouseleave', onLeave);
    };
  }, [count, setFocus]);

  return (
    <div
      ref={rootRef}
      className={`relative w-full rounded-[2.5rem] overflow-hidden select-none py-12 px-4 sm:px-8 flex flex-col items-center justify-between ${className}`}
      style={{
        background: 'linear-gradient(175deg, #1098AD 0%, #15AABF 25%, #12B886 70%, #0CA678 100%)',
        boxShadow: '0 24px 60px -12px rgba(12, 166, 120, 0.45), inset 0 2px 4px rgba(255, 255, 255, 0.4)',
        minHeight: '620px',
      }}
    >
      {/* ─── FLOATING BACKGROUND DECORATIVE BADGES & PARTICLES ─── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Soft radial glow */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-cyan-300/20 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-emerald-300/25 blur-3xl" />

        {/* Scattered Translucent Icon Chips Matching Screenshot 1 */}
        <div className="absolute top-12 left-10 p-2.5 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 text-white/80 animate-pulse">
          <Bookmark className="h-4 w-4" />
        </div>
        <div className="absolute top-28 left-20 p-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white/70">
          <Zap className="h-3.5 w-3.5" />
        </div>
        <div className="absolute bottom-28 left-14 p-3 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 text-white/80">
          <Sparkles className="h-4 w-4" />
        </div>
        <div className="absolute bottom-12 left-32 p-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white/70">
          <Activity className="h-4 w-4" />
        </div>

        <div className="absolute top-14 right-12 p-3 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 text-white/80">
          <Compass className="h-4 w-4" />
        </div>
        <div className="absolute top-36 right-24 p-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white/70">
          <Sparkles className="h-3.5 w-3.5 text-amber-300" />
        </div>
        <div className="absolute bottom-32 right-16 p-3 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 text-white/80">
          <Send className="h-4 w-4" />
        </div>
        <div className="absolute bottom-12 right-36 p-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white/70">
          <Clock className="h-4 w-4" />
        </div>
      </div>

      {/* ─── TOP HEADER BAR ─── */}
      <div className="relative z-10 w-full flex items-center justify-between px-2 sm:px-6 mb-2">
        {/* Left Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-semibold shadow-sm">
          <Radio className="h-3.5 w-3.5 text-emerald-200 animate-pulse" />
          <span>AapdaSetu Grid</span>
        </div>

        {/* Right Status Badge */}
        <div className="h-8 w-8 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-xs font-mono font-bold text-white shadow-sm">
          IN
        </div>
      </div>

      {/* ─── MAIN TITLE ─── */}
      <div className="relative z-10 text-center mb-6">
        <h2 className="font-display font-black text-3xl sm:text-4xl md:text-5xl text-white tracking-tight drop-shadow-sm">
          AapdaSetu can be your
        </h2>
      </div>

      {/* ─── 3D CAROUSEL STAGE CONTAINER ─── */}
      <div
        className="relative z-10 w-full max-w-5xl h-[330px] sm:h-[350px] flex items-center justify-center [perspective:1400px]"
        style={{ perspectiveOrigin: '50% 50%' }}
      >
        <div className="relative w-full h-full [transform-style:preserve-3d]">
          {data.map((item, i) => {
            const isCenter = active === i;

            return (
              <div
                key={item.id || i}
                ref={el => {
                  cardRefs.current[i] = el;
                }}
                onClick={() => setFocus(i)}
                className={`absolute left-1/2 top-1/2 cursor-pointer transition-all duration-300 ${
                  isCenter ? 'z-50' : 'z-20 hover:scale-[1.02]'
                }`}
                style={{
                  width: isCenter ? '320px' : '230px',
                  maxWidth: '90vw',
                }}
              >
                {isCenter ? (
                  /* ─── ACTIVE CENTER CARD (Elevated with soft gradient & Role Logo) ─── */
                  <div
                    className="w-full rounded-[32px] p-6 sm:p-7 text-center shadow-[0_24px_50px_rgba(0,0,0,0.22)] border border-white/90 flex flex-col items-center justify-between min-h-[330px] transition-all"
                    style={{
                      background: 'linear-gradient(165deg, #FFFFFF 0%, #F8FAFC 55%, #F1F5F9 100%)',
                      boxShadow: '0 24px 50px -10px rgba(6, 78, 59, 0.25), 0 0 0 1.5px rgba(255, 255, 255, 0.95), inset 0 2px 4px rgba(255, 255, 255, 0.95)',
                    }}
                  >
                    {/* Logo Container with Green Online Dot */}
                    <div className="relative mb-3">
                      <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl overflow-hidden shadow-lg border-2 border-white flex items-center justify-center">
                        <RoleLogo item={item} size="lg" />
                      </div>
                      {/* Green Online Dot Badge */}
                      <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center shadow-xs">
                        <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                      </span>
                    </div>

                    {/* Role Title */}
                    <h3 className="font-display font-black text-xl sm:text-2xl text-slate-900 tracking-tight mb-1.5">
                      {item.title}
                    </h3>

                    {/* Description */}
                    <p className="text-xs sm:text-sm font-normal text-slate-600 leading-relaxed max-w-[260px] line-clamp-3 mb-4">
                      {item.description}
                    </p>

                    {/* Hashtag Badges */}
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      {item.tags?.map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className="px-3 py-1 rounded-full text-xs font-semibold text-[#C85A32] bg-[#FCE8DE] border border-[#F9D0BD]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* ─── FLANKING SIDE CARDS (Translucent Gradient Frosted Look) ─── */
                  <div
                    className="w-full rounded-[26px] p-5 text-center flex flex-col items-center justify-center min-h-[220px] backdrop-blur-md border border-white/50 shadow-lg transition-all"
                    style={{
                      background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.45) 0%, rgba(240, 253, 250, 0.28) 100%)',
                      boxShadow: '0 12px 30px -8px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
                    }}
                  >
                    {/* Role Logo */}
                    <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-md border border-white/60 mb-3 flex items-center justify-center">
                      <RoleLogo item={item} size="sm" />
                    </div>
                    {/* Short Title */}
                    <h4 className="font-display font-bold text-sm sm:text-base text-slate-900 tracking-tight">
                      {item.shortTitle || item.title}
                    </h4>
                    <span className="text-[11px] font-medium text-slate-700/80 mt-1">
                      {item.category}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── CONTROLS & PAGINATION BAR (Matching Screenshot 1) ─── */}
      <div className="relative z-10 flex items-center justify-center gap-4 my-4">
        {/* Prev Arrow */}
        <button
          type="button"
          onClick={() => navigateBy(-1)}
          className="h-8 w-8 rounded-full bg-white/25 hover:bg-white/40 backdrop-blur-md border border-white/30 text-white flex items-center justify-center transition-all active:scale-90 cursor-pointer shadow-sm"
          aria-label="Previous role"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* Dots Track */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/25">
          {data.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setFocus(i)}
              className={`rounded-full transition-all duration-300 cursor-pointer ${
                active === i ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>

        {/* Next Arrow */}
        <button
          type="button"
          onClick={() => navigateBy(1)}
          className="h-8 w-8 rounded-full bg-white/25 hover:bg-white/40 backdrop-blur-md border border-white/30 text-white flex items-center justify-center transition-all active:scale-90 cursor-pointer shadow-sm"
          aria-label="Next role"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* ─── BOTTOM CTA BUTTON (Matching Screenshot 1) ─── */}
      <div className="relative z-10 mt-2">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#0D1527] hover:bg-[#15223E] text-white text-sm font-bold shadow-xl border border-white/10 hover:shadow-2xl transition-all duration-200 transform hover:scale-105 active:scale-95"
        >
          <span>Deploy AapdaSetu Response</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
};

export default DepthCarousel;
