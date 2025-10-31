export interface Eip6963ProviderInfo {
  uuid: string;
  name: string;
  icon: string;
  rdns: string;
}

export interface Eip6963ProviderDetail {
  info: Eip6963ProviderInfo;
  provider: Eip1193Provider;
}

export interface Eip6963AnnounceProviderEvent extends CustomEvent {
  type: "eip6963:announceProvider";
  detail: Eip6963ProviderDetail;
}

export interface Eip1193Provider {
  request(args: {
    readonly method: string;
    readonly params?: readonly unknown[] | object;
  }): Promise<unknown>;
  on(eventName: string, handler: (...args: any[]) => void): void;
  removeListener(eventName: string, handler: (...args: any[]) => void): void;
  isMetaMask?: boolean;
  isConnected?: () => boolean;
}

