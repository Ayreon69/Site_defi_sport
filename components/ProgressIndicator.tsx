"use client";

import { motion } from "framer-motion";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { getProgressionType, isTimeMetric } from "@/lib/challengeStats";

type Props = {
  value: number;
  metric: string;
  label: string;
};

function formatTimeDelta(secondsDelta: number): string {
  const absolute = Math.abs(secondsDelta);
  if (absolute < 60) {
    return `${absolute.toFixed(1)} s`;
  }

  const totalSeconds = Math.round(absolute);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function formatCountDelta(delta: number): string {
  const absolute = Math.abs(delta);
  return Number.isInteger(absolute) ? `${absolute}` : absolute.toFixed(1);
}

export function ProgressIndicator({ value, metric, label }: Props) {
  const [animatedValue, setAnimatedValue] = useState(0);
  const previousRef = useRef(0);

  useEffect(() => {
    const start = previousRef.current;
    const end = value;
    const duration = 360;
    const startTs = performance.now();
    let frame = 0;

    const tick = (timestamp: number) => {
      const elapsed = timestamp - startTs;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      const current = start + (end - start) * eased;
      setAnimatedValue(current);

      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        previousRef.current = end;
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  const progressionType = getProgressionType(value, metric);

  const style = useMemo(() => {
    if (progressionType === "positive") {
      return {
        text: "text-emerald-700",
        bg: "bg-emerald-50 border-emerald-100",
      };
    }
    if (progressionType === "negative") {
      return {
        text: "text-red-700",
        bg: "bg-red-50 border-red-100",
      };
    }
    return {
      text: "text-slate-600",
      bg: "bg-slate-50 border-slate-100",
    };
  }, [progressionType]);

  const formatted = isTimeMetric(metric) ? formatTimeDelta(animatedValue) : formatCountDelta(animatedValue);
  const sign = animatedValue > 0 ? "+" : animatedValue < 0 ? "-" : "";

  return (
    <motion.div
      key={`${metric}-${label}-${value}`}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className={`flex items-center gap-2 rounded-xl border px-3 py-2 ${style.bg}`}
    >
      {progressionType === "positive" ? <ArrowUp size={16} className={style.text} /> : null}
      {progressionType === "negative" ? <ArrowDown size={16} className={style.text} /> : null}
      {progressionType === "neutral" ? <Minus size={16} className={style.text} /> : null}
      <div>
        <p className={`font-display text-base font-semibold ${style.text}`}>
          {sign}
          {formatted}
        </p>
        <p className="text-xs text-muted">{label}</p>
      </div>
    </motion.div>
  );
}
