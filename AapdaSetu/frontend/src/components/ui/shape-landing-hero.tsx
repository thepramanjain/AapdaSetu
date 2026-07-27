"use client";

import React from "react";
import { motion } from "framer-motion";
import { Circle, Users, Activity, ShieldCheck } from "lucide-react";
import { cn } from "../../utils";

interface ElegantShapeProps {
    className?: string;
    delay?: number;
    width?: number;
    height?: number;
    rotate?: number;
    gradient?: string;
}

function ElegantShape({
    className,
    delay = 0,
    width = 400,
    height = 100,
    rotate = 0,
    gradient = "from-emerald-500/[0.08]",
}: ElegantShapeProps) {
    return (
        <motion.div
            initial={{
                opacity: 0,
                y: -150,
                rotate: rotate - 15,
            }}
            animate={{
                opacity: 1,
                y: 0,
                rotate: rotate,
            }}
            transition={{
                duration: 2.4,
                delay,
                ease: [0.23, 0.86, 0.39, 0.96],
                opacity: { duration: 1.2 },
            }}
            className={cn("absolute", className)}
        >
            <motion.div
                animate={{
                    y: [0, 15, 0],
                }}
                transition={{
                    duration: 12,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                }}
                style={{
                    width,
                    height,
                }}
                className="relative"
            >
                <div
                    className={cn(
                        "absolute inset-0 rounded-full",
                        "bg-gradient-to-r to-transparent",
                        gradient,
                        "backdrop-blur-[2px] border border-slate-300/[0.4]",
                        "shadow-[0_8px_32px_0_rgba(11,51,33,0.06)]",
                        "after:absolute after:inset-0 after:rounded-full",
                        "after:bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.4),transparent_70%)]"
                    )}
                />
            </motion.div>
        </motion.div>
    );
}

interface HeroGeometricProps {
    badge?: string;
    title1?: string;
    title2?: string;
    description?: string;
    children?: React.ReactNode;
}

export function HeroGeometric({
    badge = "Autonomous Disaster Coordination Suite",
    title1 = "AapdaSetu",
    title2 = "Liaison & Relief Command Network",
    description = "AI-powered Disaster Intelligence Platform for Government and Relief Agencies. Detect threats, simulate multi-agent resource deployments, and release verified funding on-chain.",
    children,
}: HeroGeometricProps) {
    const fadeUpVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: {
                duration: 1,
                delay: 0.5 + i * 0.2,
                ease: [0.25, 0.4, 0.25, 1],
            },
        }),
    };

    return (
        <div className="relative min-h-[85vh] md:min-h-screen w-full flex items-center overflow-hidden bg-[#F9FAFB] border-b border-slate-200/50">
            {/* Background Glows matching the logo palette */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#DFBD73]/[0.12] via-transparent to-[#1A7151]/[0.12] blur-3xl" />

            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Emerald green shape - top-left */}
                <ElegantShape
                    delay={0.3}
                    width={600}
                    height={140}
                    rotate={12}
                    gradient="from-[#1A7151]/[0.15]"
                    className="left-[-10%] md:left-[-5%] top-[10%] md:top-[15%]"
                />

                {/* Gold/Bronze shape - bottom-right */}
                <ElegantShape
                    delay={0.5}
                    width={500}
                    height={120}
                    rotate={-15}
                    gradient="from-[#A6763C]/[0.15]"
                    className="right-[-5%] md:right-[0%] top-[65%] md:top-[70%]"
                />

                {/* Dark Forest shape - bottom-left */}
                <ElegantShape
                    delay={0.4}
                    width={300}
                    height={80}
                    rotate={-8}
                    gradient="from-[#0B3321]/[0.12]"
                    className="left-[5%] md:left-[10%] bottom-[5%] md:bottom-[10%]"
                />

                {/* Gold shape - top-right */}
                <ElegantShape
                    delay={0.6}
                    width={200}
                    height={60}
                    rotate={20}
                    gradient="from-[#DFBD73]/[0.16]"
                    className="right-[15%] md:right-[20%] top-[10%] md:top-[15%]"
                />

                {/* Mint/Emerald shape - top-left-middle */}
                <ElegantShape
                    delay={0.7}
                    width={150}
                    height={40}
                    rotate={-25}
                    gradient="from-[#1A7151]/[0.12]"
                    className="left-[20%] md:left-[25%] top-[5%] md:top-[10%]"
                />
            </div>

            {/* ─── SPLIT GRID: Left Text + Right Map ─── */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full py-16 md:py-0">
                <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">

                    {/* ─── LEFT COLUMN: Text Content ─── */}
                    <div className="lg:col-span-7 space-y-6 text-left">
                        {/* Badge */}
                        <motion.div
                            custom={0}
                            variants={fadeUpVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/60 shadow-xs">
                                <Circle className="h-2 w-2 fill-emerald-500 stroke-emerald-500 animate-pulse" />
                                <span className="text-xs font-mono font-bold text-emerald-800 tracking-wide">
                                    {badge}
                                </span>
                            </div>
                        </motion.div>

                        {/* Titles */}
                        <motion.div
                            custom={1}
                            variants={fadeUpVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            <h1 className="text-4xl sm:text-5xl md:text-[56px] font-display font-black tracking-tight leading-[1.1]">
                                <span className="bg-clip-text text-transparent bg-gradient-to-b from-[#0B3321] to-[#1A7151] block">
                                    {title1}
                                </span>
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#A6763C] via-[#A6763C]/95 to-[#DFBD73] block">
                                    {title2}
                                </span>
                            </h1>
                        </motion.div>

                        {/* Description */}
                        <motion.div
                            custom={2}
                            variants={fadeUpVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-medium max-w-xl">
                                {description}
                            </p>
                        </motion.div>

                        {/* Portal action buttons passed as children */}
                        {children && (
                            <motion.div
                                custom={3}
                                variants={fadeUpVariants}
                                initial="hidden"
                                animate="visible"
                                className="relative z-20"
                            >
                                {children}
                            </motion.div>
                        )}
                    </div>

                    {/* ─── RIGHT COLUMN: India Map + Floating Alert ─── */}
                    <motion.div
                        className="lg:col-span-5 relative flex items-center justify-center"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1.2, delay: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
                    >
                        <div className="relative w-full max-w-[440px] aspect-[4/5] bg-slate-50/30 rounded-3xl border border-slate-100/80 shadow-xs overflow-hidden p-6 flex items-center justify-center">
                            {/* Dot grid background */}
                            <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] opacity-60" />

                            {/* India Map SVG */}
                            <img
                                src="/hero.svg"
                                alt="AapdaSetu India Map"
                                className="w-full h-full object-contain opacity-90 relative z-0"
                            />



                            {/* Pulsing Disaster Marker Dots on the Map */}
                            <div className="absolute top-[28%] left-[55%] z-10">
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500 border-2 border-white shadow-sm" />
                                </span>
                            </div>
                            <div className="absolute top-[55%] left-[45%] z-10">
                                <span className="relative flex h-4 w-4">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                                    <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white shadow-sm" />
                                </span>
                            </div>
                            <div className="absolute top-[38%] left-[40%] z-10">
                                <span className="relative flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75" />
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-500 border-2 border-white shadow-sm" />
                                </span>
                            </div>
                        </div>
                    </motion.div>

                </div>
            </div>

            {/* Bottom transition gradient */}
            <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-[#F9FAFB] to-transparent pointer-events-none" />
        </div>
    );
}

export default HeroGeometric;

