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

  useEffect(() => {
    console.log('useEffect running');
    window.onmessage = (event) => {
      const msg = event.data.pluginMessage;
      if (msg?.type === 'collections-loaded') {
        setCollections(msg.collections);
        setLoading(false);
      }
    };
  }, []);

  const loadCollections = () => {
    console.log('loadCollections clicked');
    setLoading(true);
    parent.postMessage({ pluginMessage: { type: 'get-collections' } }, '*');
  };

  const closePlugin = () => {
    parent.postMessage({ pluginMessage: { type: 'close' } }, '*');
  };

  console.log('Rendering with collections:', collections.length);

  return (
    <div style={{ padding: '16px' }}>
      <h2 style={{ margin: '0 0 16px 0' }}>Token Bridge</h2>
      
      <button 
        onClick={loadCollections} 
        disabled={loading}
        style={{ marginBottom: '16px' }}
      >
        {loading ? 'Loading...' : 'Load Variable Collections'}
      </button>

      {collections.length > 0 && (
        <div>
          <h3>Collections Found:</h3>
          {collections.map(collection => (
            <div key={collection.id} style={{ marginBottom: '8px', padding: '8px', border: '1px solid #ccc' }}>
              <strong>{collection.name}</strong>
              <div>{collection.variableIds.length} variables</div>
            </div>
          ))}
        </div>
      )}

      <button onClick={closePlugin} style={{ marginTop: '16px' }}>
        Close
      </button>
    </div>
  );
}

console.log('About to render App');
const root = document.getElementById('root');
console.log('Root element:', root);

render(<App />, root!);
