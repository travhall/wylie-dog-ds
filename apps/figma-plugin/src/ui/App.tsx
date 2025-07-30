import { render } from 'preact';
import { useState, useEffect } from 'preact/hooks';

console.log('App.tsx loaded');

interface Collection {
  id: string;
  name: string;
  modes: Array<{ modeId: string; name: string }>;
  variableIds: string[];
}

function App() {
  console.log('App component rendering');
  const [collections, setCollections] = useState<Collection[]>([]);
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

    // Cleanup function
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
    
    try {
      parent.postMessage({ pluginMessage: { type: 'get-collections' } }, '*');
      console.log('Message sent to plugin');
    } catch (err) {
      console.error('Failed to send message:', err);
      setError('Failed to communicate with plugin');
      setLoading(false);
    }
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
          <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 'bold' }}>
            Collections Found ({collections.length}):
          </h3>
          {collections.map(collection => (
            <div 
              key={collection.id} 
              style={{ 
                marginBottom: '8px', 
                padding: '12px', 
                border: '1px solid #ddd',
                borderRadius: '4px',
                backgroundColor: '#f9f9f9'
              }}
            >
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                {collection.name}
              </div>
              <div style={{ fontSize: '11px', color: '#666' }}>
                {collection.variableIds.length} variables • {collection.modes.length} modes
              </div>
            </div>
          ))}
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

