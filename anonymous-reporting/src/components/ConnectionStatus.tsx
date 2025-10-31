interface ConnectionStatusProps {
  isConnected: boolean;
  account: string;
  onConnect: () => void;
}

function ConnectionStatus({ isConnected, account, onConnect }: ConnectionStatusProps) {
  return (
    <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
      {isConnected ? (
        <>
          🟢 Connected: {account.substring(0, 6)}...{account.substring(account.length - 4)}
        </>
      ) : (
        <>
          🔴 Wallet Not Connected{' '}
          <button onClick={onConnect} style={{ marginLeft: '10px' }}>
            Connect Wallet
          </button>
        </>
      )}
    </div>
  );
}

export default ConnectionStatus;
