import { useState, useEffect } from 'preact/hooks';
import type { ConflictAwareGitHubClient } from '../../plugin/sync/conflict-aware-github-client';

interface SyncStatusProps {
  githubClient: ConflictAwareGitHubClient;
  githubConfigured: boolean;
  onRefresh?: () => void;
}

interface SyncStatusData {
  upToDate: boolean;
  localChanges: number;
  remoteChanges: number;
  lastSync?: string;
  checking?: boolean;
  error?: string;
}

export function SyncStatus({ githubClient, githubConfigured, onRefresh }: SyncStatusProps) {
  const [status, setStatus] = useState<SyncStatusData>({
    upToDate: true,
    localChanges: 0,
    remoteChanges: 0,
    checking: false
  });

  const checkSyncStatus = async () => {
    if (!githubConfigured) return;
    
    setStatus(prev => ({ ...prev, checking: true, error: undefined }));
    
    try {
      const syncStatus = await githubClient.getSyncStatus();
      setStatus({
        upToDate: syncStatus.upToDate,
        localChanges: syncStatus.localChanges,
        remoteChanges: syncStatus.remoteChanges,
        lastSync: syncStatus.lastSync,
        checking: false
      });
    } catch (error) {
      console.error('Failed to check sync status:', error);
      setStatus(prev => ({
        ...prev,
        checking: false,
        error: error instanceof Error ? error.message : 'Failed to check sync status'
      }));
    }
  };

  useEffect(() => {
    if (githubConfigured) {
      checkSyncStatus();
    }
  }, [githubConfigured]);

  if (!githubConfigured) {
    return (
      <div style={{
        padding: '8px 12px',
        backgroundColor: '#f9fafb',
        borderRadius: '6px',
        border: '1px solid #e5e7eb',
        fontSize: '11px',
        color: '#6b7280'
      }}>
        🔗 Configure GitHub to see sync status
      </div>
    );
  }

  const formatLastSync = (lastSync?: string) => {
    if (!lastSync) return 'Never';
    
    try {
      const date = new Date(lastSync);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      
      return date.toLocaleDateString();
    } catch {
      return 'Unknown';
    }
  };

  const getStatusColor = () => {
    if (status.error) return '#ef4444';
    if (status.checking) return '#f59e0b';
    if (!status.upToDate) return '#f59e0b';
    return '#10b981';
  };

  const getStatusIcon = () => {
    if (status.error) return '❌';
    if (status.checking) return '🔄';
    if (!status.upToDate) return '⚠️';
    return '✅';
  };

  const getStatusText = () => {
    if (status.error) return 'Error checking status';
    if (status.checking) return 'Checking sync status...';
    if (!status.upToDate) return 'Changes detected';
    return 'Up to date';
  };

  return (
    <div style={{
      padding: '10px 12px',
      backgroundColor: '#f8fafc',
      borderRadius: '6px',
      border: '1px solid #e2e8f0',
      fontSize: '11px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '6px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontWeight: 'bold',
          color: getStatusColor()
        }}>
          <span>{getStatusIcon()}</span>
          <span>{getStatusText()}</span>
        </div>
        
        <button
          onClick={() => {
            checkSyncStatus();
            onRefresh?.();
          }}
          disabled={status.checking}
          style={{
            padding: '2px 6px',
            backgroundColor: '#f3f4f6',
            border: '1px solid #d1d5db',
            borderRadius: '3px',
            cursor: status.checking ? 'not-allowed' : 'pointer',
            fontSize: '9px',
            color: '#374151'
          }}
        >
          {status.checking ? '...' : 'Refresh'}
        </button>
      </div>

      {status.error ? (
        <div style={{ color: '#ef4444', fontSize: '10px' }}>
          {status.error}
        </div>
      ) : (
        <div style={{ color: '#6b7280' }}>
          <div>Last sync: {formatLastSync(status.lastSync)}</div>
          {(!status.upToDate && (status.localChanges > 0 || status.remoteChanges > 0)) && (
            <div style={{ marginTop: '4px', fontSize: '10px' }}>
              {status.localChanges > 0 && (
                <span style={{ color: '#f59e0b' }}>
                  📍 {status.localChanges} local changes
                </span>
              )}
              {status.localChanges > 0 && status.remoteChanges > 0 && ' • '}
              {status.remoteChanges > 0 && (
                <span style={{ color: '#3b82f6' }}>
                  📥 {status.remoteChanges} remote changes
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
