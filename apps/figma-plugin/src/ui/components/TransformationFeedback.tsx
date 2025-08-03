// Format Transformation Display Component
import type { AdapterProcessResult, TransformationLog } from '../../plugin/variables/format-adapter';

interface TransformationFeedbackProps {
  adapterResults: Array<{
    filename: string;
  } & AdapterProcessResult>;
}

export function TransformationFeedback({ adapterResults }: TransformationFeedbackProps) {
  if (!adapterResults || adapterResults.length === 0) {
    return null;
  }

  return (
    <div className="transformation-feedback" style={{ marginTop: '16px', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '6px', border: '1px solid #e1e4e8' }}>
      <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
        Format Adaptation Results
      </h3>
      
      {adapterResults.map((result, index) => (
        <div key={index} style={{ marginBottom: index < adapterResults.length - 1 ? '16px' : '0' }}>
          <div style={{ marginBottom: '8px' }}>
            <strong style={{ fontSize: '13px' }}>{result.filename}</strong>
            <span style={{ 
              marginLeft: '8px', 
              padding: '2px 6px', 
              backgroundColor: getConfidenceColor(result.detection.confidence),
              color: 'white',
              borderRadius: '3px',
              fontSize: '11px',
              fontWeight: 500
            }}>
              {result.detection.format} ({Math.round(result.detection.confidence * 100)}%)
            </span>
          </div>
          
          {result.transformations.length > 0 && (
            <details style={{ marginBottom: '8px' }}>
              <summary style={{ 
                cursor: 'pointer', 
                fontSize: '12px', 
                color: '#586069',
                marginBottom: '6px'
              }}>
                {result.transformations.length} transformation{result.transformations.length !== 1 ? 's' : ''} applied
              </summary>
              <div style={{ paddingLeft: '16px' }}>
                {result.transformations.map((transformation, tIndex) => (
                  <div key={tIndex} style={{ 
                    marginBottom: '4px',
                    fontSize: '11px',
                    padding: '4px 8px',
                    backgroundColor: 'white',
                    borderRadius: '3px',
                    border: '1px solid #e1e4e8'
                  }}>
                    <div style={{ fontWeight: 600, color: '#24292e' }}>
                      {transformation.type}
                    </div>
                    <div style={{ color: '#586069', marginTop: '2px' }}>
                      {transformation.description}
                    </div>
                    {transformation.before !== transformation.after && (
                      <div style={{ 
                        marginTop: '4px',
                        fontSize: '10px',
                        fontFamily: 'monospace',
                        color: '#666'
                      }}>
                        {transformation.before} → {transformation.after}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </details>
          )}
          
          <div style={{ 
            display: 'flex', 
            gap: '12px', 
            fontSize: '11px', 
            color: '#586069' 
          }}>
            <span>{result.stats.totalTokens} tokens</span>
            <span>{result.stats.totalCollections} collections</span>
            <span>{result.stats.totalReferences} references</span>
            <span>{result.processingTime.toFixed(1)}ms</span>
          </div>
          
          {result.warnings.length > 0 && (
            <div style={{ marginTop: '8px' }}>
              {result.warnings.map((warning, wIndex) => (
                <div key={wIndex} style={{ 
                  fontSize: '11px',
                  color: '#b08800',
                  backgroundColor: '#fffbdd',
                  padding: '4px 8px',
                  borderRadius: '3px',
                  border: '1px solid #f1e05a',
                  marginBottom: '2px'
                }}>
                  ⚠️ {warning}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.8) return '#28a745'; // Green
  if (confidence >= 0.6) return '#ffc107'; // Yellow  
  if (confidence >= 0.4) return '#fd7e14'; // Orange
  return '#dc3545'; // Red
}
