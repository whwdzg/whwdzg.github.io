/** 页面骨架 / Suspense fallback. */
export function PageSkeleton() {
  return (
    <div className="page-skeleton" aria-busy="true" aria-label="正在加载页面">
      <div className="page-skeleton__hero skeleton" />
      <div className="page-skeleton__row">
        <div className="skeleton page-skeleton__card" />
        <div className="skeleton page-skeleton__card" />
        <div className="skeleton page-skeleton__card" />
      </div>
      <span className="sr-only">正在加载页面…</span>
    </div>
  );
}
