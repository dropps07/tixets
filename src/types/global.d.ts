interface Window {
  ethereum?: ExternalProvider;
}

interface EthereumProvider extends ExternalProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
}