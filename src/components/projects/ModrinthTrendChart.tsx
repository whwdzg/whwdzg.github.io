/** Modrinth 趋势折线图 / Mini line chart for snapshot history. */
import type { ModrinthHistoryPoint } from '../../data/projects/modrinth-history';
import { formatViews } from '../../lib/format';

interface ModrinthTrendChartProps {
  points: ModrinthHistoryPoint[];
  metric: 'downloads' | 'followers';
  label: string;
}

export function ModrinthTrendChart({ points, metric, label }: ModrinthTrendChartProps) {
  const values = points.map((point) => ({ date: point.date, value: point[metric] }));
  if (!values.length) return null;
  const width = 320;
  const height = 92;
  const padX = 7;
  const padY = 12;
  const min = Math.min(...values.map((item) => item.value));
  const max = Math.max(...values.map((item) => item.value));
  const span = Math.max(1, max - min);
  const x = (index: number) => padX + (values.length <= 1 ? 0 : (index / (values.length - 1)) * (width - padX * 2));
  const y = (value: number) => height - padY - ((value - min) / span) * (height - padY * 2);
  const line = values.map((item, index) => `${index === 0 ? 'M' : 'L'}${x(index).toFixed(1)},${y(item.value).toFixed(1)}`).join(' ');
  const area = `${line} L${x(values.length - 1).toFixed(1)},${height - padY} L${x(0).toFixed(1)},${height - padY} Z`;
  const first = values[0]?.value ?? 0;
  const last = values[values.length - 1]?.value ?? 0;
  const delta = last - first;
  const color = metric === 'downloads' ? 'var(--accent)' : '#35c07a';

  return (
    <div className="modrinth-trend">
      <div className="modrinth-trend__head">
        <span>{label}</span>
        <strong>{formatViews(last)}</strong>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${label}趋势，最近 ${values.length} 个快照`} preserveAspectRatio="none">
        {[0.25, 0.5, 0.75].map((ratio) => (
          <line key={ratio} x1={padX} x2={width - padX} y1={height * ratio} y2={height * ratio} className="modrinth-trend__grid" />
        ))}
        <path d={area} fill={color} opacity="0.09" />
        <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {values.map((item, index) => (
          <circle key={item.date} cx={x(index)} cy={y(item.value)} r="2.6" fill={color} stroke="var(--surface)" strokeWidth="1.5">
            <title>{item.date} · {formatViews(item.value)}</title>
          </circle>
        ))}
      </svg>
      <div className="modrinth-trend__foot">
        <span>{values[0]?.date.slice(5)} → {values[values.length - 1]?.date.slice(5)}</span>
        <span className={delta >= 0 ? 'is-up' : 'is-down'}>{delta >= 0 ? '+' : ''}{formatViews(Math.abs(delta))}{delta < 0 ? ' ↓' : ''}</span>
      </div>
    </div>
  );
}
