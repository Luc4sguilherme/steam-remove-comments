import { useApp } from 'ink';
import { useEffect } from 'react';

export function useAutoExit(shouldExit, exitCode = 0) {
  const { exit } = useApp();

  useEffect(() => {
    if (!shouldExit) return undefined;

    const timer = setTimeout(() => {
      exit();
      process.exit(exitCode);
    }, 500);

    return () => clearTimeout(timer);
  }, [shouldExit, exitCode, exit]);
}
