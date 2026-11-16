/** 返回顶部按钮 / Floating scroll-to-top button. */
import { ArrowDownRegular, ArrowUpRegular } from '@fluentui/react-icons';
import { useScrollToTop } from '../../hooks/useScrollToTop';

export function BackToTop() {
  const { visible, returning, onClick } = useScrollToTop();
  const label = returning ? '返回之前位置' : '返回顶部';
  return (
    <button
      type="button"
      className={`back-to-top ${visible ? 'is-visible' : ''}`}
      aria-label={label}
      title={label}
      onClick={onClick}
      tabIndex={visible ? 0 : -1}
    >
      {returning ? <ArrowDownRegular aria-hidden /> : <ArrowUpRegular aria-hidden />}
      <span className="back-to-top__label">{label}</span>
    </button>
  );
}
