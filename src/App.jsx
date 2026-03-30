import React, { useState, useCallback } from 'react';

import ErrorStatus from './components/ErrorStatus.jsx';
import FilterSelect from './components/FilterSelect.jsx';
import LoadingStatus from './components/LoadingStatus.jsx';
import ModeSelect from './components/ModeSelect.jsx';
import ReconnectingStatus from './components/ReconnectingStatus.jsx';
import ResultStatus from './components/ResultStatus.jsx';
import WorkingStatus from './components/WorkingStatus.jsx';
import { useAutoExit } from './hooks/useAutoExit.js';
import { useCommentRemoval } from './hooks/useCommentRemoval.js';
import { useSteamLogin } from './hooks/useSteamLogin.js';

const App = () => {
  const { loginState, loginError } = useSteamLogin();
  const [mode, setMode] = useState(null);
  const [filter, setFilter] = useState(null);
  const [step, setStep] = useState('select-mode');

  const isWorking = loginState === 'ready' && step === 'working';
  const {
    progress,
    result,
    error: removalError,
  } = useCommentRemoval(mode, filter, isWorking);

  const isDone = isWorking && result !== null;
  const isError =
    loginState === 'error' || (isWorking && removalError !== null);

  useAutoExit(isDone, 0);
  useAutoExit(isError, 1);

  const handleModeSelect = useCallback((item) => {
    setMode(item.value);
    setStep(item.value === 2 ? 'select-filter' : 'working');
  }, []);

  const handleFilterSelect = useCallback((item) => {
    setFilter(item.value);
    setStep('working');
  }, []);

  if (loginState === 'logging-in') {
    return <LoadingStatus message="Logging into Steam..." />;
  }

  if (loginState === 'waiting-session') {
    return <LoadingStatus message="Waiting for web session..." />;
  }

  if (loginState === 'reconnecting') {
    return <ReconnectingStatus message={loginError} />;
  }

  if (loginState === 'error') {
    return <ErrorStatus message={loginError} />;
  }

  if (step === 'select-mode') {
    return <ModeSelect onSelect={handleModeSelect} />;
  }

  if (step === 'select-filter') {
    return <FilterSelect onSelect={handleFilterSelect} />;
  }

  if (isWorking && removalError) {
    return (
      <ErrorStatus message={`Failed to remove comments: ${removalError}`} />
    );
  }

  if (isDone) {
    return <ResultStatus result={result} />;
  }

  if (isWorking) {
    return <WorkingStatus progress={progress} />;
  }

  return null;
};

export default App;
