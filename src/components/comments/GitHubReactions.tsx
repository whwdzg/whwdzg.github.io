/** GitHub reactions / 只读的反应计数。 */
import { reactionViews, type GitHubReactions } from '../../lib/github';

export function GitHubReactions({ reactions }: { reactions?: GitHubReactions }) {
  const views = reactionViews(reactions);
  if (!views.length) return null;

  return (
    <ul className="gh-reactions" aria-label="GitHub 反应">
      {views.map((view) => (
        <li key={view.label} title={`${view.label} ${view.count}`}>
          <span aria-hidden>{view.emoji}</span>
          <span>{view.count}</span>
        </li>
      ))}
    </ul>
  );
}
