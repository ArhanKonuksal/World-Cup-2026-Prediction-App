import { useCallback, useEffect, useState } from 'react';
import type { GroupId, GroupState, PredictionsState, RawWorldCupData } from '../types';
import { applyWinnerPick } from '../lib/bracketCascade';
import {
  buildInitialPredictions,
  extractGroups,
  loadWorldCupData,
} from '../lib/parseWorldCupData';

export const DATA_LOAD_ERROR = 'DATA_LOAD_FAILED';

const STORAGE_KEY = 'wc2026-predictions-v1';

function loadStored(): Partial<PredictionsState> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function useWorldCupPredictor() {
  const [data, setData] = useState<RawWorldCupData | null>(null);
  const [groups, setGroups] = useState<GroupState[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [groupOrder, setGroupOrder] = useState<Record<GroupId, string[]>>({} as Record<GroupId, string[]>);
  const [qualifiedThirdGroups, setQualifiedThirdGroups] = useState<GroupId[]>([]);
  const [winners, setWinners] = useState<Record<number, string>>({});
  const [championId, setChampionId] = useState<string | undefined>();
  const [userName, setUserName] = useState('');

  useEffect(() => {
    loadWorldCupData()
      .then((json) => {
        const extracted = extractGroups(json);
        setData(json);
        setGroups(extracted);
        const initial = buildInitialPredictions(extracted);
        const stored = loadStored();
        setGroupOrder(stored?.groups ?? initial);
        setQualifiedThirdGroups(stored?.qualifiedThirdGroups ?? []);
        setWinners(stored?.winners ?? {});
        setChampionId(stored?.championId);
        setUserName(stored?.userName ?? '');
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (loading || groups.length === 0) return;
    const state: PredictionsState = {
      groups: groupOrder,
      qualifiedThirdGroups,
      winners,
      championId,
      userName,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [groupOrder, qualifiedThirdGroups, winners, championId, userName, loading, groups.length]);

  const reorderGroup = useCallback((groupId: GroupId, newOrder: string[]) => {
    setGroupOrder((prev) => ({ ...prev, [groupId]: newOrder }));
    setWinners({});
    setChampionId(undefined);
  }, []);

  const toggleThirdGroup = useCallback((groupId: GroupId) => {
    setQualifiedThirdGroups((prev) => {
      if (prev.includes(groupId)) {
        return prev.filter((g) => g !== groupId);
      }
      if (prev.length >= 8) return prev;
      return [...prev, groupId].sort();
    });
    setWinners({});
    setChampionId(undefined);
  }, []);

  const pickWinner = useCallback((matchNum: number, teamId: string, round: string) => {
    setWinners((prev) => applyWinnerPick(prev, matchNum, teamId));
    if (round === 'Final') {
      setChampionId(teamId);
    } else {
      setChampionId(undefined);
    }
  }, []);

  const resetAll = useCallback(() => {
    if (groups.length === 0) return;
    setGroupOrder(buildInitialPredictions(groups));
    setQualifiedThirdGroups([]);
    setWinners({});
    setChampionId(undefined);
  }, [groups]);

  const resetBracket = useCallback(() => {
    setWinners({});
    setChampionId(undefined);
  }, []);

  return {
    data,
    groups,
    loading,
    error,
    groupOrder,
    qualifiedThirdGroups,
    winners,
    championId,
    userName,
    setUserName,
    reorderGroup,
    toggleThirdGroup,
    pickWinner,
    resetAll,
    resetBracket,
  };
}
