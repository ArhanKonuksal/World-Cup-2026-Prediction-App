import { lazy, Suspense, useMemo } from 'react';
import { TopBar } from './components/TopBar';
import { Hero } from './components/Hero';
import { SiteFooter } from './components/SiteFooter';
import { GroupStage } from './components/GroupStage';
import { ThirdPlacePicker } from './components/ThirdPlacePicker';
import { buildKnockoutBracket } from './lib/bracketResolver';
import { isThirdPlaceSelectionValid } from './lib/thirdPlaceValidation';
import { useWorldCupPredictor, DATA_LOAD_ERROR } from './hooks/useWorldCupPredictor';
import { useLanguage } from './i18n/LanguageContext';
import './App.css';

const KnockoutBracket = lazy(() =>
  import('./components/KnockoutBracket').then((m) => ({ default: m.KnockoutBracket })),
);
const PredictionExport = lazy(() =>
  import('./components/PredictionExport').then((m) => ({ default: m.PredictionExport })),
);

function SectionFallback() {
  const { t } = useLanguage();
  return (
    <div className="section-fallback" aria-busy="true">
      <div className="loader" />
      <p>{t('sectionLoading')}</p>
    </div>
  );
}

function AppContent() {
  const { t } = useLanguage();
  const {
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
  } = useWorldCupPredictor();

  const thirdPlaceValid = useMemo(() => {
    if (!data || qualifiedThirdGroups.length !== 8) return true;
    return isThirdPlaceSelectionValid(data, groups, groupOrder, qualifiedThirdGroups);
  }, [data, groups, groupOrder, qualifiedThirdGroups]);

  const bracketMatches = useMemo(() => {
    if (!data || groups.length === 0) return [];
    return buildKnockoutBracket(
      data,
      groups,
      groupOrder,
      qualifiedThirdGroups,
      winners,
    );
  }, [data, groups, groupOrder, qualifiedThirdGroups, winners]);

  if (loading) {
    return (
      <div className="app state-screen">
        <div className="loader" />
        <p>{t('loading')}</p>
      </div>
    );
  }

  if (error || !data) {
    const message = error === DATA_LOAD_ERROR ? t('dataLoadError') : error;
    return (
      <div className="app state-screen state-error">
        <p>{message ?? t('error')}</p>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="site-shell">
        <TopBar onResetAll={resetAll} />
        <Hero />
      </header>

      <main className="main-content">
        <GroupStage
          groups={groups}
          groupOrder={groupOrder}
          qualifiedThirdGroups={qualifiedThirdGroups}
          onReorder={reorderGroup}
        />

        <ThirdPlacePicker
          groups={groups}
          groupOrder={groupOrder}
          selected={qualifiedThirdGroups}
          invalidCombo={qualifiedThirdGroups.length === 8 && !thirdPlaceValid}
          onToggle={toggleThirdGroup}
        />

        <Suspense fallback={<SectionFallback />}>
          <KnockoutBracket
            matches={bracketMatches}
            groups={groups}
            qualifiedCount={qualifiedThirdGroups.length}
            thirdPlaceValid={thirdPlaceValid}
            championId={championId}
            onPickWinner={pickWinner}
            onResetBracket={resetBracket}
          />
        </Suspense>

        <Suspense fallback={<SectionFallback />}>
          <PredictionExport
            matches={bracketMatches}
            groups={groups}
            winners={winners}
            championId={championId}
            userName={userName}
            onUserNameChange={setUserName}
          />
        </Suspense>
      </main>

      <SiteFooter />
    </div>
  );
}

function App() {
  return <AppContent />;
}

export default App;
