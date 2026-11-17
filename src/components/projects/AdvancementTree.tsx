/** 进度树 / Advancement tree using native details/summary. */
import { SparkleRegular } from '@fluentui/react-icons';
import type { AdvancementNode } from '../../data/projects/types';
import { cn } from '../../lib/cn';
import { ItemIcon } from './ItemIcon';

const FRAME_LABEL = {
  task: '任务',
  goal: '目标',
  challenge: '挑战',
  unknown: '进度',
} as const;

function AdvancementBranch({ node, depth }: { node: AdvancementNode; depth: number }) {
  return (
    <details className={cn('adv-node', `adv-node--${node.frame}`)} open>
      <summary className="adv-node__summary">
        <span className="adv-node__icon">
          {node.icon ? <ItemIcon id={node.icon} size={32} /> : <SparkleRegular aria-hidden />}
        </span>
        <span className="adv-node__text">
          <strong>{node.title}</strong>
          {node.description && <span>{node.description}</span>}
        </span>
        <span className="adv-node__frame">{FRAME_LABEL[node.frame]}</span>
      </summary>
      {node.children.length > 0 && (
        <div className="adv-node__children">
          {node.children.map((child) => (
            <AdvancementBranch key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </details>
  );
}

export function AdvancementTree({ nodes }: { nodes: AdvancementNode[] }) {
  return (
    <div className="adv-tree">
      {nodes.map((node) => (
        <AdvancementBranch key={node.id} node={node} depth={0} />
      ))}
    </div>
  );
}
