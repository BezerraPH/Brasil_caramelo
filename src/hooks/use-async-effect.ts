import { useEffect } from "react";

/** Executa efeito assíncrono sem setState síncrono no corpo do useEffect (eslint). */
export function useAsyncEffect(
  effect: () => void | Promise<void>,
  deps: React.DependencyList,
) {
  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      void effect();
    });
    return () => {
      active = false;
    };
    // deps vêm do caller (ex.: [load])
    // eslint-disable-next-line react-hooks/exhaustive-deps -- forwarded
  }, deps);
}
