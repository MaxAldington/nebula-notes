import { useEffect, useMemo, useRef, useState } from "react";
import {
  Eip6963AnnounceProviderEvent,
  Eip6963ProviderDetail,
} from "./Eip6963Types";

export interface Eip6963State {
  uuids: Record<string, Eip6963ProviderDetail> | undefined;
  error: Error | undefined;
  providers: Eip6963ProviderDetail[];
}

export function useEip6963(): Eip6963State {
  const [error, setError] = useState<Error | undefined>(undefined);
  const [uuids, setUuids] = useState<
    Record<string, Eip6963ProviderDetail> | undefined
  >(undefined);
  const activeLoadId = useRef(0);
  const isListener = useRef<boolean>(false);
  const providers = useMemo<Eip6963ProviderDetail[]>(
    () => (uuids ? Object.values(uuids) : []),
    [uuids]
  );

  // Never exported or exposed to a child
  function _addUuidInternal(providerDetail: Eip6963ProviderDetail) {
    // Exits immediately.
    // Lazy call, will be executed in render phase.
    setUuids((prev) => {
      if (!prev) {
        return { [providerDetail.info.uuid]: providerDetail };
      }
      const existing = prev[providerDetail.info.uuid];
      if (
        !!existing &&
        existing.info.uuid === providerDetail.info.uuid &&
        existing.info.name === providerDetail.info.name &&
        existing.info.rdns === providerDetail.info.rdns &&
        existing.info.icon === providerDetail.info.icon &&
        existing.provider === providerDetail.provider
      ) {
        return prev;
      }
      if (existing) {
        console.log(`addUuid(${providerDetail.info.uuid}) update existing.`);
      } else {
        console.log(`addUuid(${providerDetail.info.uuid}) add new.`);
      }
      return { ...prev, [providerDetail.info.uuid]: providerDetail };
    });
  }

  useEffect(() => {
    if (isListener.current) {
      return;
    }
    isListener.current = true;

    function onAnnounceProvider(event: Eip6963AnnounceProviderEvent) {
      try {
        _addUuidInternal(event.detail);
      } catch (e) {
        console.error("useEip6963.onAnnounceProvider", e);
        setError(e as Error);
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).addEventListener(
      "eip6963:announceProvider",
      onAnnounceProvider as EventListener
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).dispatchEvent(new Event("eip6963:requestProvider"));

    return () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).removeEventListener(
        "eip6963:announceProvider",
        onAnnounceProvider as EventListener
      );
    };
  }, []);

  return {
    uuids,
    error,
    providers,
  };
}

