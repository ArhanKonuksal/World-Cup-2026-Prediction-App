import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { GroupId, GroupState } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { getTeamDisplayName } from '../lib/teamDisplayName';
import { orderedTeamsInGroup } from '../lib/parseWorldCupData';

interface GroupCardProps {
  group: GroupState;
  order: string[];
  qualifiedThirdGroups: GroupId[];
  onReorder: (groupId: GroupId, order: string[]) => void;
}

function SortableTeamRow({
  id,
  rank,
  name,
  flag,
  isThirdQualified,
}: {
  id: string;
  rank: number;
  name: string;
  flag: string;
  isThirdQualified: boolean;
}) {
  const { t } = useLanguage();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.55 : 1,
  };

  const rankClass =
    rank === 1
      ? 'rank-1'
      : rank === 2
        ? 'rank-2'
        : rank === 3 && isThirdQualified
          ? 'rank-3'
          : 'rank-out';

  const showThirdBadge = rank === 3 && isThirdQualified;

  return (
    <li ref={setNodeRef} style={style} className={`team-row ${rankClass}`}>
      <button
        type="button"
        className="drag-handle"
        {...attributes}
        {...listeners}
        aria-label={t('drag')}
      >
        <span className="grip" aria-hidden />
      </button>
      <span className="rank">{rank}</span>
      <span className="flag">{flag}</span>
      <span className="name">{name}</span>
      {rank <= 2 && <span className="badge badge-advance">{t('qualifies')}</span>}
      {showThirdBadge && (
        <span className="badge badge-third">{t('thirdSelected')}</span>
      )}
    </li>
  );
}

export function GroupCard({
  group,
  order,
  qualifiedThirdGroups,
  onReorder,
}: GroupCardProps) {
  const { t, locale } = useLanguage();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const teams = orderedTeamsInGroup(group, order);
  const thirdQualified = qualifiedThirdGroups.includes(group.id);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = order.indexOf(String(active.id));
    const newIndex = order.indexOf(String(over.id));
    onReorder(group.id, arrayMove(order, oldIndex, newIndex));
  }

  return (
    <article className="group-card">
      <header className="group-card-head">
        <span className="group-letter">{group.id}</span>
        <span className="group-meta">{t('groupTop2')}</span>
      </header>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={order} strategy={verticalListSortingStrategy}>
          <ol className="team-list">
            {teams.map((team, index) => (
              <SortableTeamRow
                key={team.id}
                id={team.id}
                rank={index + 1}
                name={getTeamDisplayName(team.name, locale)}
                flag={team.flag}
                isThirdQualified={thirdQualified}
              />
            ))}
          </ol>
        </SortableContext>
      </DndContext>
    </article>
  );
}

interface GroupStageProps {
  groups: GroupState[];
  groupOrder: Record<GroupId, string[]>;
  qualifiedThirdGroups: GroupId[];
  onReorder: (groupId: GroupId, order: string[]) => void;
}

export function GroupStage({
  groups,
  groupOrder,
  qualifiedThirdGroups,
  onReorder,
}: GroupStageProps) {
  const { t } = useLanguage();

  return (
    <section className="panel">
      <div className="panel-head">
        <div>
          <h2>{t('groupStage')}</h2>
          <p>{t('groupStageHint')}</p>
        </div>
      </div>
      <div className="groups-grid">
        {groups.map((group) => (
          <GroupCard
            key={group.id}
            group={group}
            order={groupOrder[group.id]}
            qualifiedThirdGroups={qualifiedThirdGroups}
            onReorder={onReorder}
          />
        ))}
      </div>
    </section>
  );
}
