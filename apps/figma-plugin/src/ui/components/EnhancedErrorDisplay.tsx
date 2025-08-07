import { ErrorHandler, PluginError, ErrorType } from '../../shared/error-handler';
import { useState } from 'preact/hooks';

interface EnhancedErrorDisplayProps {
  error: PluginError | string;
  onDismiss: () => void;
  onRetry?: () => void;
}

export function EnhancedErrorDisplay({ error, onDismiss, onRetry }: EnhancedErrorDisplayProps) {
  const [showDetails, setShowDetails] = useState(false);
  
  const pluginError = typeof error === 'string' 
    ? ErrorHandler.fromException(new Error(error))
    : error;

  // Get user-friendly messages
  const getFriendlyMessage = (error: PluginError): string => {
    switch (error.type) {
      case ErrorType.NETWORK_ERROR:
        return "Can't connect to GitHub. Check your internet connection.";
      case ErrorType.AUTHENTICATION_ERROR:
        return "GitHub authentication failed. Your access token may be expired.";
      case ErrorType.REPOSITORY_ERROR:
        return "Repository not found. Check the owner and repository name.";
      case ErrorType.TOKEN_FORMAT_ERROR:
        return "Token file format issue. The file may be corrupted or in an unsupported format.";
      case ErrorType.CONFLICT_ERROR:
        return "Found conflicts between local and remote tokens that need resolution.";
      case ErrorType.FIGMA_API_ERROR:
        return "Figma couldn't process the request. Try refreshing your variable collections.";
      case ErrorType.VALIDATION_ERROR:
        return "Some tokens have issues. Check the validation report for details.";
      default:
        return "Something went wrong. Don't worry - this is usually fixable!";
    }
  };

  const friendlyMessage = getFriendlyMessage(pluginError);

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
          <span style={{ fontSize: '16px' }}>
            {ErrorHandler.getErrorIcon(pluginError.type)}
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ 
              fontWeight: 'bold', 
              color: ErrorHandler.getErrorColor(pluginError.type),
              marginBottom: '4px'
            }}>
              {friendlyMessage}
            </div>
            <div style={{ 
              fontSize: '10px', 
              color: '#6b7280',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{ textTransform: 'capitalize' }}>
                {pluginError.type.replace('-', ' ')} • {pluginError.recoverable ? 'Can be fixed' : 'Needs attention'}
              </span>
              <button
                onClick={() => setShowDetails(!showDetails)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#6366f1',
                  cursor: 'pointer',
                  fontSize: '10px',
                  textDecoration: 'underline',
                  padding: '0'
                }}
              >
                {showDetails ? 'Hide Details' : 'Show Details'}
              </button>
            </div>
          </div>
        </div>
        
        <button
          onClick={onDismiss}
          style={{
            padding: '4px 8px',
            backgroundColor: '#f3f4f6',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '10px',
            color: '#374151',
            marginLeft: '8px'
          }}
        >
          ✕
        </button>
      </div>

      {/* Technical details - progressive disclosure */}
      {showDetails && (
        <div style={{
          padding: '8px',
          backgroundColor: '#f9fafb',
          borderRadius: '4px',
          marginBottom: '8px',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ fontSize: '10px', fontWeight: 'bold', marginBottom: '4px' }}>
            Technical Details:
          </div>
          <div style={{ fontSize: '9px', color: '#6b7280', fontFamily: 'monospace' }}>
            {pluginError.message}
          </div>
        </div>
      )}

      {pluginError.suggestions && pluginError.suggestions.length > 0 && (
        <div style={{ marginBottom: '8px' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '4px', fontSize: '11px' }}>
            💡 Try this:
          </div>
          <ul style={{ 
            margin: '0', 
            paddingLeft: '16px', 
            fontSize: '10px', 
            color: '#4b5563',
            lineHeight: '1.4'
          }}>
            {pluginError.suggestions.slice(0, 3).map((suggestion, index) => (
              <li key={index} style={{ marginBottom: '2px' }}>{suggestion}</li>
            ))}
            {pluginError.suggestions.length > 3 && showDetails && 
              pluginError.suggestions.slice(3).map((suggestion, index) => (
                <li key={index + 3} style={{ marginBottom: '2px' }}>{suggestion}</li>
              ))
            }
          </ul>
        </div>
      )}

      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
        {pluginError.recoverable && onRetry && (
          <button
            onClick={onRetry}
            style={{
              padding: '8px 16px',
              backgroundColor: ErrorHandler.getErrorColor(pluginError.type),
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '11px',
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
