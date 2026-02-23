import { Board } from '../types';
import { KanbanColumn } from './KanbanColumn';

interface Props {
  board: Board;
  onMove: (candidateId: string, targetStageId: string) => Promise<void>;
}

export function KanbanBoard({ board, onMove }: Props) {
  return (
    <div className="flex gap-5 overflow-x-auto pb-4">
      {board.stages.map((stage) => (
        <KanbanColumn
          key={stage.id}
          stage={stage}
          allowedTransitions={board.allowedTransitions}
          onMove={onMove}
        />
      ))}
    </div>
  );
}
