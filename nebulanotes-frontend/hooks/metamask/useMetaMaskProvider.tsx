import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Eip1193Provider, ethers } from "ethers";
import { useEip6963 } from "./useEip6963";

interface ProviderConnectInfo {
  readonly chainId: string;
}

interface ProviderRpcError extends Error {
  message: string;
  code: number;
  data?: unknown;
}

type ConnectListenerFn = (connectInfo: ProviderConnectInfo) => void;
type DisconnectListenerFn = (error: ProviderRpcError) => void;
type ChainChangedListenerFn = (chainId: string) => void;
type AccountsChangedListenerFn = (accounts: string[]) => void;

type Eip1193EventMap = {
  connect: ConnectListenerFn;
  chainChanged: ChainChangedListenerFn;
  accountsChanged: AccountsChangedListenerFn;
  disconnect: DisconnectListenerFn;
};

type Eip1193EventFn = <E extends keyof Eip1193EventMap>(
  event: E,
  fn: Eip1193EventMap[E]
) => void;

interface Eip1193ProviderWithEvent extends ethers.Eip1193Provider {
  on?: Eip1193EventFn;
  off?: Eip1193EventFn;
  addListener?: Eip1193EventFn;
  removeListener?: Eip1193EventFn;
}

export interface UseMetaMaskState {
  provider: Eip1193Provider | undefined;
  chainId: number | undefined;
  accounts: string[] | undefined;
  isConnected: boolean;
  error: Error | undefined;
  connect: () => void;
}

const MetaMaskContext = createContext<UseMetaMaskState | undefined>(undefined);

export function MetaMaskProvider({ children }: { children: ReactNode }) {
  const state = useMetaMaskInternal();
  return (
    <MetaMaskContext.Provider value={state}>
      {children}
    </MetaMaskContext.Provider>
  );
}

export function useMetaMask() {
  const context = useContext(MetaMaskContext);
  if (context === undefined) {
    throw new Error("useMetaMask must be used within a MetaMaskProvider");
  }
  return context;
}

function useMetaMaskInternal(): UseMetaMaskState {
  const { error: eip6963Error, providers } = useEip6963();
  const [_currentProvider, _setCurrentProvider] = useState<
    Eip1193ProviderWithEvent | undefined
  >(undefined);
  const [chainId, _setChainId] = useState<number | undefined>(undefined);
  const [accounts, _setAccounts] = useState<string[] | undefined>(undefined);
  const [error, setError] = useState<Error | undefined>(undefined);

  const connectListenerRef = useRef<ConnectListenerFn | undefined>(undefined);
  const disconnectListenerRef = useRef<DisconnectListenerFn | undefined>(
    undefined
  );
  const chainChangedListenerRef = useRef<ChainChangedListenerFn | undefined>(
    undefined
  );
  const accountsChangedListenerRef = useRef<
    AccountsChangedListenerFn | undefined
  >(undefined);

  const metaMaskProviderRef = useRef<Eip1193ProviderWithEvent | undefined>(
    undefined
  );

  const hasProvider = Boolean(_currentProvider);
  const hasAccounts = (accounts?.length ?? 0) > 0;
  const hasChain = typeof chainId === "number";

  const isConnected = hasProvider && hasAccounts && hasChain;

  const connect = useCallback(() => {
    if (!_currentProvider) {
      return;
    }

    if (accounts && accounts.length > 0) {
      // already connected
      return;
    }

    // Prompt connection
    _currentProvider.request({ method: "eth_requestAccounts" });
  }, [_currentProvider, accounts]);

  useEffect(() => {
    let next: Eip1193ProviderWithEvent | undefined = undefined;

    if (providers.length > 0) {
      // Prioritize MetaMask
      const metaMaskProvider = providers.find(
        (p) => p.info.name === "MetaMask"
      );
      if (metaMaskProvider) {
        next = metaMaskProvider.provider as Eip1193ProviderWithEvent;
      } else {
        // Fallback to first available provider
        next = providers[0].provider as Eip1193ProviderWithEvent;
      }
    }

    if (next !== _currentProvider) {
      _setCurrentProvider(next);
    }
  }, [providers, _currentProvider]);

  useEffect(() => {
    if (eip6963Error) {
      setError(eip6963Error);
    }
  }, [eip6963Error]);

  useEffect(() => {
    const provider = _currentProvider;
    if (!provider) {
      return;
    }

    const connectListener: ConnectListenerFn = (connectInfo) => {
      _setChainId(Number.parseInt(connectInfo.chainId, 16));
    };

    const disconnectListener: DisconnectListenerFn = (error) => {
      setError(error);
      _setChainId(undefined);
      _setAccounts(undefined);
    };

    const chainChangedListener: ChainChangedListenerFn = (chainId) => {
      _setChainId(Number.parseInt(chainId, 16));
    };

    const accountsChangedListener: AccountsChangedListenerFn = (accounts) => {
      _setAccounts(accounts);
    };

    connectListenerRef.current = connectListener;
    disconnectListenerRef.current = disconnectListener;
    chainChangedListenerRef.current = chainChangedListener;
    accountsChangedListenerRef.current = accountsChangedListener;

    if (provider.on) {
      provider.on("connect", connectListener);
      provider.on("disconnect", disconnectListener);
      provider.on("chainChanged", chainChangedListener);
      provider.on("accountsChanged", accountsChangedListener);
    }

    // Initialize current state
    Promise.all([
      provider.request({ method: "eth_chainId" }),
      provider.request({ method: "eth_accounts" }),
    ])
      .then(([chainId, accounts]) => {
        _setChainId(Number.parseInt(chainId as string, 16));
        _setAccounts(accounts as string[]);
      })
      .catch((e) => {
        setError(e as Error);
      });

    return () => {
      if (provider.off) {
        provider.off("connect", connectListener);
        provider.off("disconnect", disconnectListener);
        provider.off("chainChanged", chainChangedListener);
        provider.off("accountsChanged", accountsChangedListener);
      }
    };
  }, [_currentProvider]);

  return {
    provider: _currentProvider,
    chainId,
    accounts,
    isConnected,
    error,
    connect,
  };
}

