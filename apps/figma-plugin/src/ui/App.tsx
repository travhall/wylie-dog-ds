import { render } from 'preact';
import { useState, useEffect } from 'preact/hooks';

console.log('App.tsx loaded');

interface Collection {
  id: string;
  name: string;
  modes: Array<{ modeId: string; name: string }>;
  variableIds: string[];
}

interface Variable {
  id: string;
  name: string;
  description: string;
  resolvedType: string;
  scopes: string[];
  valuesByMode: Record<string, any>;
  remote: boolean;
  key: string;
}

interface CollectionDetails {
  id: string;
  name: string;
  modes: Array<{ modeId: string; name: string }>;
  variables: Variable[];
}

type ViewState = 'collections' | 'collection-detail';

function App() {
  console.log('App component rendering');
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollections, setSelectedCollections] = useState<Set<string>>(new Set());
  const [currentView, setCurrentView] = useState<ViewState>('collections');
  const [selectedCollection, setSelectedCollection] = useState<CollectionDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('useEffect running - setting up message listener');
    
    const handleMessage = (event: MessageEvent) => {
      console.log('Received message:', event.data);
      const msg = event.data.pluginMessage;
      
      if (!msg) {
        console.warn('No pluginMessage in event data');
        return;
      }
      
      switch (msg.type) {
        case 'collections-loaded':
          console.log('Collections loaded:', msg.collections);
          setCollections(msg.collections || []);
          // Default to selecting all collections
          setSelectedCollections(new Set(msg.collections?.map(c => c.id) || []));
          setLoading(false);
          setError(null);
          break;
        case 'collection-details-loaded':
          console.log('Collection details loaded:', msg.collection);
          setSelectedCollection(msg.collection);
          setCurrentView('collection-detail');
          setLoading(false);
          setError(null);
          break;
        case 'error':
          console.error('Plugin error:', msg.message);
          setError(msg.message);
          setLoading(false);
          break;
        default:
          console.warn('Unknown message type:', msg.type);
      }
    };

    window.addEventListener('message', handleMessage);
    console.log('Message listener added');

    return () => {
      console.log('Cleaning up message listener');
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  const loadCollections = () => {
    console.log('loadCollections clicked');
    setLoading(true);
    setError(null);
    setCollections([]);
    setCurrentView('collections');
    
    try {
      parent.postMessage({ pluginMessage: { type: 'get-collections' } }, '*');
      console.log('Message sent to plugin');
    } catch (err) {
      console.error('Failed to send message:', err);
      setError('Failed to communicate with plugin');
      setLoading(false);
    }
  };

  const loadCollectionDetails = (collectionId: string) => {
    console.log('Loading collection details for:', collectionId);
    setLoading(true);
    setError(null);
    
    try {
      parent.postMessage({ 
        pluginMessage: { 
          type: 'get-collection-details', 
          collectionId 
        } 
      }, '*');
    } catch (err) {
      console.error('Failed to send message:', err);
      setError('Failed to load collection details');
      setLoading(false);
    }
  };

  const toggleCollection = (collectionId: string) => {
    const newSelection = new Set(selectedCollections);
    if (newSelection.has(collectionId)) {
      newSelection.delete(collectionId);
    } else {
      newSelection.add(collectionId);
    }
    setSelectedCollections(newSelection);
  };

  const formatTokenValue = (variable: Variable, modeId: string) => {
    const value = variable.valuesByMode[modeId];
    
    if (!value) return 'undefined';
    
    // Handle variable references
    if (typeof value === 'object' && value.type === 'VARIABLE_ALIAS') {
      return `{${value.id}}`; // We'd need to resolve this to show the actual reference
    }
    
    // Handle different value types
    switch (variable.resolvedType) {
      case 'COLOR':
        if (typeof value === 'object' && value.r !== undefined) {
          // Convert RGB to hex
          const r = Math.round(value.r * 255);
          const g = Math.round(value.g * 255);
          const b = Math.round(value.b * 255);
          return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        }
        return String(value);
      case 'FLOAT':
        return `${value}px`;
      case 'STRING':
        return `"${value}"`;
      case 'BOOLEAN':
        return value ? 'true' : 'false';
      default:
        return String(value);
    }
  };

  const goBack = () => {
    setCurrentView('collections');
    setSelectedCollection(null);
  };

  const closePlugin = () => {
    console.log('closePlugin clicked');
    try {
      parent.postMessage({ pluginMessage: { type: 'close' } }, '*');
    } catch (err) {
      console.error('Failed to send close message:', err);
    }
  };

  console.log('Rendering with collections:', collections.length, 'loading:', loading, 'error:', error);

  if (currentView === 'collection-detail' && selectedCollection) {
    return (
      <div style={{ padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
          <button 
            onClick={goBack}
            style={{ 
              marginRight: '12px',
              padding: '4px 8px',
              backgroundColor: '#f1f5f9',
              border: '1px solid #cbd5e1',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '11px'
            }}
          >
            ← Back
          </button>
          <h2 style={{ margin: '0', fontSize: '16px', fontWeight: 'bold' }}>
            {selectedCollection.name}
          </h2>
        </div>

        {loading && (
          <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
            Loading...
          </div>
        )}

        {error && (
          <div style={{ 
            padding: '8px 12px', 
            marginBottom: '16px', 
            backgroundColor: '#fee', 
            border: '1px solid #fcc',
            borderRadius: '4px',
            color: '#c33'
          }}>
            ❌ {error}
          </div>
        )}

        <div style={{ marginBottom: '16px', fontSize: '12px', color: '#666' }}>
          {selectedCollection.variables.length} variables • {selectedCollection.modes.length} modes
        </div>

        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {selectedCollection.variables.map(variable => (
            <div 
              key={variable.id}
              style={{
                marginBottom: '12px',
                padding: '12px',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                backgroundColor: '#f8fafc'
              }}
            >
              <div style={{ 
                fontWeight: 'bold', 
                fontSize: '13px', 
                marginBottom: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span>{variable.name}</span>
                <span style={{ 
                  fontSize: '10px', 
                  backgroundColor: '#cbd5e1',
                  padding: '2px 6px',
                  borderRadius: '3px',
                  fontWeight: 'normal'
                }}>
                  {variable.resolvedType}
                </span>
              </div>
              
              {variable.description && (
                <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '8px' }}>
                  {variable.description}
                </div>
              )}

              {selectedCollection.modes.map(mode => {
                const value = formatTokenValue(variable, mode.modeId);
                return (
                  <div key={mode.modeId} style={{ 
                    fontSize: '11px', 
                    marginBottom: '4px',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <span style={{ 
                      fontWeight: 'medium', 
                      minWidth: '60px',
                      color: '#475569'
                    }}>
                      {mode.name}:
                    </span>
                    <span style={{ 
                      fontFamily: 'monospace',
                      fontSize: '10px',
                      marginLeft: '8px'
                    }}>
                      {value}
                    </span>
                    {variable.resolvedType === 'COLOR' && value.startsWith('#') && (
                      <div style={{
                        width: '16px',
                        height: '16px',
                        backgroundColor: value,
                        border: '1px solid #ccc',
                        borderRadius: '3px',
                        marginLeft: '8px'
                      }} />
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '16px' }}>
      <h2 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 'bold' }}>Token Bridge</h2>
      
      {error && (
        <div style={{ 
          padding: '8px 12px', 
          marginBottom: '16px', 
          backgroundColor: '#fee', 
          border: '1px solid #fcc',
          borderRadius: '4px',
          color: '#c33'
        }}>
          ❌ {error}
        </div>
      )}
      
      <button 
        onClick={loadCollections} 
        disabled={loading}
        style={{ 
          marginBottom: '16px',
          padding: '8px 16px',
          backgroundColor: loading ? '#ccc' : '#0066cc',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: '12px'
        }}
      >
        {loading ? 'Loading...' : 'Load Variable Collections'}
      </button>

      {collections.length > 0 && (
        <div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            marginBottom: '12px' 
          }}>
            <h3 style={{ margin: '0', fontSize: '14px', fontWeight: 'bold' }}>
              Collections Found ({collections.length}):
            </h3>
            <div style={{ fontSize: '11px', color: '#666' }}>
              {selectedCollections.size} selected for export
            </div>
          </div>
          
          {collections.map(collection => (
            <div 
              key={collection.id} 
              style={{ 
                marginBottom: '8px', 
                padding: '12px', 
                border: '1px solid #ddd',
                borderRadius: '4px',
                backgroundColor: selectedCollections.has(collection.id) ? '#f0f9ff' : '#f9f9f9'
              }}
            >
              <div style={{ 
                display: 'flex', 
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '4px'
              }}>
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 'bold'
                }}>
                  <input
                    type="checkbox"
                    checked={selectedCollections.has(collection.id)}
                    onChange={() => toggleCollection(collection.id)}
                    style={{ marginRight: '8px' }}
                  />
                  {collection.name}
                </label>
                <button 
                  onClick={() => loadCollectionDetails(collection.id)}
                  style={{ 
                    padding: '4px 8px',
                    backgroundColor: '#e2e8f0',
                    border: '1px solid #cbd5e1',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    fontSize: '10px'
                  }}
                >
                  View Details →
                </button>
              </div>
              <div style={{ fontSize: '11px', color: '#666' }}>
                {collection.variableIds.length} variables • {collection.modes.length} modes
              </div>
            </div>
          ))}

          <div style={{ 
            marginTop: '16px',
            padding: '12px',
            backgroundColor: '#f1f5f9',
            border: '1px solid #cbd5e1',
            borderRadius: '4px'
          }}>
            <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>
              Export Options
            </div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>
              Selected collections will be exported to JSON format.
              Repository sync coming next.
            </div>
          </div>
        </div>
      )}

      {collections.length === 0 && !loading && !error && (
        <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
          Click "Load Variable Collections" to get started
        </div>
      )}
    </div>
  );
}

console.log('About to render App');
const root = document.getElementById('root');
console.log('Root element:', root);

if (root) {
  render(<App />, root);
  console.log('App rendered successfully');
} else {
  console.error('Root element not found!');
}
