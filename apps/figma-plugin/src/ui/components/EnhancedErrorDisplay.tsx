import { ErrorHandler, PluginError, ErrorType } from '../../shared/error-handler';

interface EnhancedErrorDisplayProps {
  error: PluginError | string;
  onDismiss: () => void;
  onRetry?: () => void;
}

export function EnhancedErrorDisplay({ error, onDismiss, onRetry }: EnhancedErrorDisplayProps) {
  const pluginError = typeof error === 'string' 
    ? ErrorHandler.fromException(new Error(error))
    : error;

  return (
    <div style={{
      padding: '12px',
      marginBottom: '16px',
      backgroundColor: '#fef2f2',
      border: `1px solid ${ErrorHandler.getErrorColor(pluginError.type)}`,
      borderRadius: '6px',
      fontSize: '12px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '16px' }}>
            {ErrorHandler.getErrorIcon(pluginError.type)}
          </span>
          <div>
            <div style={{ 
              fontWeight: 'bold', 
              color: ErrorHandler.getErrorColor(pluginError.type),
              marginBottom: '2px'
            }}>
              {pluginError.message}
            </div>
            <div style={{ fontSize: '10px', color: '#6b7280', textTransform: 'capitalize' }}>
              {pluginError.type.replace('-', ' ')} • {pluginError.recoverable ? 'Recoverable' : 'Critical'}
            </div>
          </div>
        </div>
        
        <button
          onClick={onDismiss}
          style={{
            padding: '2px 6px',
            backgroundColor: '#f3f4f6',
            border: '1px solid #d1d5db',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '10px',
            color: '#374151'
          }}
        >
          ✕
        </button>
      </div>

      {pluginError.suggestions && pluginError.suggestions.length > 0 && (
        <div style={{ marginBottom: '8px' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '4px', fontSize: '11px' }}>
            💡 Suggestions:
          </div>
          <ul style={{ 
            margin: '0', 
            paddingLeft: '16px', 
            fontSize: '10px', 
            color: '#4b5563',
            lineHeight: '1.4'
          }}>
            {pluginError.suggestions.map((suggestion, index) => (
              <li key={index}>{suggestion}</li>
            ))}
          </ul>
        </div>
      )}

      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
        {pluginError.recoverable && onRetry && (
          <button
            onClick={onRetry}
            style={{
              padding: '6px 12px',
              backgroundColor: ErrorHandler.getErrorColor(pluginError.type),
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '10px',
              fontWeight: 'bold'
            }}
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}
