import { useState, useEffect, useRef } from 'react';
import './StatsCard.css';

function useCountUp(end, duration = 1500) {
  const [value, setValue] = useState(0);
  const ref = useRef(null);
  const [isIntersected, setIsIntersected] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersected(true);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isIntersected) return;

    let start = value;
    const startTime = performance.now();
    let animationFrameId;

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(start + (end - start) * eased));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [end, isIntersected, duration]);

  return { value, ref };
}

function StatsCard({ icon, value, label, colorClass = 'teal', delay = 0 }) {
  const { value: animatedValue, ref } = useCountUp(value);

  const formatValue = (val) => {
    return val.toLocaleString('pl-PL');
  };

  return (
    <div
      className="stats-card animate-fade-in-up"
      style={{ animationDelay: `${delay}s` }}
      ref={ref}
    >
      <div className={`stats-card-icon ${colorClass}`}>{icon}</div>
      <div className="stats-card-value">{formatValue(animatedValue)}</div>
      <div className="stats-card-label">{label}</div>
    </div>
  );
}

export function ProfileStatsCard({ label, value, orangeBorder = false, delay = 0 }) {
  const { value: animatedValue, ref } = useCountUp(
    typeof value === 'number' ? value : parseInt(value.replace(/\D/g, '')) || 0
  );

  const formatValue = () => {
    if (typeof value === 'string' && value.includes('zł')) {
      return `${animatedValue.toLocaleString('pl-PL')} zł`;
    }
    return animatedValue.toLocaleString('pl-PL');
  };

  return (
    <div
      className={`stats-card-profile animate-fade-in-up ${orangeBorder ? 'orange-border' : ''}`}
      style={{ animationDelay: `${delay}s` }}
      ref={ref}
    >
      <div className="stats-card-profile-label">{label}</div>
      <div className="stats-card-profile-value">{formatValue()}</div>
    </div>
  );
}

export default StatsCard;
