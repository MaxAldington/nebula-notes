import { createContext, ReactNode, useContext, useMemo } from "react";
import { ethers } from "ethers";
import { useMetaMask } from "./useMetaMaskProvider";

export interface UseMetaMaskEthersSignerState {
  signer: Promise<ethers.JsonRpcSigner> | undefined;
  provider: ethers.BrowserProvider | undefined;
}

const MetaMaskEthersSignerContext = createContext<
  UseMetaMaskEthersSignerState | undefined
>(undefined);

export function MetaMaskEthersSignerProvider({
  children,
  initialMockChains,
}: {
  children: ReactNode;
  initialMockChains?: Record<number, string>;
}) {
  const { provider: metaMaskProvider, chainId } = useMetaMask();

  const state = useMemo((): UseMetaMaskEthersSignerState => {
    if (!metaMaskProvider) {
      return { signer: undefined, provider: undefined };
    }

    const ethersProvider = new ethers.BrowserProvider(metaMaskProvider);

    return { signer: ethersProvider.getSigner(), provider: ethersProvider };
  }, [metaMaskProvider]);

  return (
    <MetaMaskEthersSignerContext.Provider value={state}>
      {children}
    </MetaMaskEthersSignerContext.Provider>
  );
}

export function useMetaMaskEthersSigner() {
  const context = useContext(MetaMaskEthersSignerContext);
  if (context === undefined) {
    throw new Error(
      "useMetaMaskEthersSigner must be used within a MetaMaskEthersSignerProvider"
    );
  }
  return context;
}
