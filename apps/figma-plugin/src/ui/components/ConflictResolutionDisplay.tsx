import { useState } from 'preact/hooks';
import type { TokenConflict, ConflictResolution } from '../../plugin/sync/types';

interface ConflictResolutionDisplayProps {
  conflicts: TokenConflict[];
  onResolve: (resolutions: ConflictResolution[]) => void;
  onCancel: () => void;
  loading?: boolean;
}

export function ConflictResolutionDisplay({ 
  conflicts, 
  onResolve, 
  onCancel, 
  loading = false 
}: ConflictResolutionDisplayProps) {
  const [resolutions, setResolutions] = useState<Map<string, ConflictResolution>>(new Map());
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleResolution = (conflictId: string, resolution: ConflictResolution) => {
    const updated = new Map(resolutions);
    updated.set(conflictId, resolution);
    setResolutions(updated);
  };

  const handleBatchResolve = (strategy: 'take-local' | 'take-remote') => {
    const batchResolutions = new Map(resolutions);
    
    conflicts.forEach(conflict => {
      batchResolutions.set(conflict.conflictId, {
        conflictId: conflict.conflictId,
        resolution: strategy,
        token: strategy === 'take-remote' ? conflict.remoteToken : conflict.localToken
      });
    });
    
    setResolutions(batchResolutions);
  };

  const getConflictsByType = () => {
    const grouped = {
      'value-change': conflicts.filter(c => c.type === 'value-change'),
      'addition': conflicts.filter(c => c.type === 'addition'),
      'deletion': conflicts.filter(c => c.type === 'deletion'),
      'name-conflict': conflicts.filter(c => c.type === 'name-conflict')
    };
    return grouped;
  };

  const allResolved = resolutions.size === conflicts.length;
  const groupedConflicts = getConflictsByType();

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '20px',
        maxWidth: '600px',
        maxHeight: '80vh',
        overflow: 'auto',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
          paddingBottom: '12px',
          borderBottom: '1px solid #e2e8f0'
        }}>
          <div>
            <h2 style={{ margin: '0', fontSize: '18px', fontWeight: 'bold', color: '#1f2937' }}>
              🔄 Sync Conflicts Detected
            </h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#6b7280' }}>
              {conflicts.length} conflicts need resolution before syncing
            </p>
          </div>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            style={{
              padding: '4px 8px',
              backgroundColor: '#f3f4f6',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '11px'
            }}
          >
            {showAdvanced ? 'Simple View' : 'Advanced View'}
          </button>
        </div>

        {/* Batch Actions */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '16px',
          padding: '12px',
          backgroundColor: '#f8fafc',
          borderRadius: '6px',
          border: '1px solid #e2e8f0'
        }}>
          <button
            onClick={() => handleBatchResolve('take-local')}
            style={{
              flex: 1,
              padding: '8px 12px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 'bold'
            }}
          >
            📍 Keep All Local Changes ({resolutions.size === 0 ? conflicts.length : '...'})
          </button>
          <button
            onClick={() => handleBatchResolve('take-remote')}
            style={{
              flex: 1,
              padding: '8px 12px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 'bold'
            }}
          >
            📥 Accept All Remote Changes ({resolutions.size === 0 ? conflicts.length : '...'})
          </button>
        </div>

        {/* Summary Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '8px',
          marginBottom: '16px'
        }}>
          {Object.entries(groupedConflicts).map(([type, conflicts]) => (
            conflicts.length > 0 && (
              <div key={type} style={{
                padding: '8px',
                backgroundColor: type === 'deletion' ? '#fee2e2' : '#f0f9ff',
                borderRadius: '4px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
                  {conflicts.length}
                </div>
                <div style={{ fontSize: '10px', color: '#6b7280', textTransform: 'capitalize' }}>
                  {type.replace('-', ' ')}
                </div>
              </div>
            )
          ))}
        </div>

        {/* Conflicts List */}
        <div style={{
          maxHeight: '400px',
          overflowY: 'auto',
          marginBottom: '16px'
        }}>
          {conflicts.map(conflict => (
            <ConflictItem
              key={conflict.conflictId}
              conflict={conflict}
              resolution={resolutions.get(conflict.conflictId)}
              onResolve={(resolution) => handleResolution(conflict.conflictId, resolution)}
              showAdvanced={showAdvanced}
            />
          ))}
        </div>

        {/* Progress Indicator */}
        <div style={{
          marginBottom: '16px',
          padding: '8px',
          backgroundColor: allResolved ? '#dcfce7' : '#fef3c7',
          borderRadius: '4px',
          fontSize: '12px',
          textAlign: 'center'
        }}>
          {allResolved ? (
            <span style={{ color: '#059669' }}>
              ✅ All conflicts resolved ({resolutions.size}/{conflicts.length})
            </span>
          ) : (
            <span style={{ color: '#d97706' }}>
              ⏳ {resolutions.size}/{conflicts.length} conflicts resolved
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '8px',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={onCancel}
            disabled={loading}
            style={{
              padding: '10px 16px',
              backgroundColor: '#f3f4f6',
              color: '#374151',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '12px'
            }}
          >
            Cancel Sync
          </button>
          <button
            onClick={() => onResolve(Array.from(resolutions.values()))}
            disabled={!allResolved || loading}
            style={{
              padding: '10px 16px',
              backgroundColor: allResolved && !loading ? '#059669' : '#d1d5db',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: allResolved && !loading ? 'pointer' : 'not-allowed',
              fontSize: '12px',
              fontWeight: 'bold'
            }}
          >
            {loading ? 'Applying...' : `Apply Resolutions (${resolutions.size})`}
          </button>
        </div>
      </div>
    </div>
  );
}

// Individual conflict item component
interface ConflictItemProps {
  conflict: TokenConflict;
  resolution?: ConflictResolution;
  onResolve: (resolution: ConflictResolution) => void;
  showAdvanced: boolean;
}

function ConflictItem({ conflict, resolution, onResolve, showAdvanced }: ConflictItemProps) {
  const [showDetails, setShowDetails] = useState(false);

  const handleResolve = (strategy: 'take-local' | 'take-remote' | 'manual') => {
    onResolve({
      conflictId: conflict.conflictId,
      resolution: strategy,
      token: strategy === 'take-remote' ? conflict.remoteToken : conflict.localToken
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'value-change': return '🔄';
      case 'addition': return '➕';
      case 'deletion': return '🗑️';
      case 'name-conflict': return '🏷️';
      default: return '❓';
    }
  };

  return (
    <div style={{
      marginBottom: '12px',
      padding: '12px',
      border: `1px solid ${resolution ? '#10b981' : '#e2e8f0'}`,
      borderRadius: '6px',
      backgroundColor: resolution ? '#f0fdf4' : '#ffffff'
    }}>
      {/* Conflict Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '16px' }}>{getTypeIcon(conflict.type)}</span>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#1f2937' }}>
              {conflict.tokenName}
            </div>
            <div style={{ fontSize: '11px', color: '#6b7280' }}>
              {conflict.collectionName} • {conflict.type}
            </div>
          </div>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{
            padding: '2px 6px',
            borderRadius: '3px',
            fontSize: '10px',
            fontWeight: 'bold',
            color: 'white',
            backgroundColor: getSeverityColor(conflict.severity)
          }}>
            {conflict.severity}
          </span>
          {showAdvanced && (
            <button
              onClick={() => setShowDetails(!showDetails)}
              style={{
                padding: '2px 6px',
                backgroundColor: '#f3f4f6',
                border: '1px solid #d1d5db',
                borderRadius: '3px',
                cursor: 'pointer',
                fontSize: '9px'
              }}
            >
              {showDetails ? 'Hide' : 'Details'}
            </button>
          )}
        </div>
      </div>

      {/* Conflict Description */}
      <p style={{
        margin: '0 0 12px 0',
        fontSize: '12px',
        color: '#4b5563',
        lineHeight: '1.4'
      }}>
        {conflict.description}
      </p>

      {/* Value Comparison */}
      {(conflict.localToken || conflict.remoteToken) && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '8px',
          marginBottom: '12px',
          fontSize: '11px'
        }}>
          <div style={{
            padding: '8px',
            backgroundColor: '#fef3c7',
            borderRadius: '4px',
            border: '1px solid #f59e0b'
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '4px', color: '#92400e' }}>
              📍 Local Value
            </div>
            <code style={{ fontSize: '10px', color: '#92400e' }}>
              {conflict.localToken?.$value || 'undefined'}
            </code>
          </div>
          <div style={{
            padding: '8px',
            backgroundColor: '#dbeafe',
            borderRadius: '4px',
            border: '1px solid #3b82f6'
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '4px', color: '#1e40af' }}>
              📥 Remote Value
            </div>
            <code style={{ fontSize: '10px', color: '#1e40af' }}>
              {conflict.remoteToken?.$value || 'undefined'}
            </code>
          </div>
        </div>
      )}

      {/* Advanced Details */}
      {showDetails && showAdvanced && (
        <div style={{
          padding: '8px',
          backgroundColor: '#f8fafc',
          borderRadius: '4px',
          marginBottom: '12px',
          fontSize: '10px'
        }}>
          <div><strong>Conflict ID:</strong> {conflict.conflictId}</div>
          <div><strong>Auto-resolvable:</strong> {conflict.autoResolvable ? 'Yes' : 'No'}</div>
          <div><strong>Suggested:</strong> {conflict.suggestedResolution}</div>
          {conflict.localToken?.$syncMetadata && (
            <div><strong>Last Modified:</strong> {conflict.localToken.$syncMetadata.lastModified}</div>
          )}
        </div>
      )}

      {/* Resolution Buttons */}
      <div style={{ display: 'flex', gap: '6px' }}>
        <button
          onClick={() => handleResolve('take-local')}
          style={{
            flex: 1,
            padding: '6px 10px',
            backgroundColor: resolution?.resolution === 'take-local' ? '#3b82f6' : '#f3f4f6',
            color: resolution?.resolution === 'take-local' ? 'white' : '#374151',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px'
          }}
        >
          📍 Keep Local
        </button>
        <button
          onClick={() => handleResolve('take-remote')}
          style={{
            flex: 1,
            padding: '6px 10px',
            backgroundColor: resolution?.resolution === 'take-remote' ? '#10b981' : '#f3f4f6',
            color: resolution?.resolution === 'take-remote' ? 'white' : '#374151',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px'
          }}
        >
          📥 Take Remote
        </button>
      </div>
    </div>
  );
}
