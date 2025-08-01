import { render } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { GitHubConfig } from './components/GitHubConfig';

console.log('App.tsx loaded');

interface GitHubConfig {
  owner: string;
  repo: string;
  branch: string;
  tokenPath: string;
  accessToken: string;
}

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

type ViewState = 'collections' | 'collection-detail' | 'github-config';

function App() {
  console.log('App component rendering');
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollections, setSelectedCollections] = useState<Set<string>>(new Set());
  const [currentView, setCurrentView] = useState<ViewState>('collections');
  const [selectedCollection, setSelectedCollection] = useState<CollectionDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [githubConfig, setGithubConfig] = useState<GitHubConfig | null>(null);
  const [githubConfigured, setGithubConfigured] = useState(false);
  const [downloadQueue, setDownloadQueue] = useState<any[]>([]);
  const [importLoading, setImportLoading] = useState(false);

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
          setSelectedCollections(new Set(msg.collections && msg.collections.map((c: Collection) => c.id) || []));
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
          setLoadingMessage('');
          break;
        case 'tokens-exported':
          console.log('Tokens exported successfully:', msg.exportData);
          console.log('Export data length:', msg.exportData ? msg.exportData.length : 0);
          console.log('Export data structure:', msg.exportData && msg.exportData.map((item: any) => Object.keys(item)));
          console.log('Full export data:', JSON.stringify(msg.exportData, null, 2));
          setLoading(false);
          setLoadingMessage('');
          setError(null);
          
          // Trigger download queue setup
          if (msg.exportData && msg.exportData.length > 0) {
            if (msg.exportData.length === 1) {
              // Single file - direct download
              downloadSingleFile(msg.exportData[0]);
            } else {
              // Multiple files - set up download queue
              setDownloadQueue(msg.exportData);
            }
            
            // Show success message
            const fileCount = msg.exportData.length;
            setSuccessMessage(`✅ ${fileCount} token file${fileCount > 1 ? 's' : ''} ready for download!`);
            setTimeout(() => {
              setSuccessMessage(null);
            }, 4000);
          } else {
            setError('No token data received from export');
            console.warn('Export data was empty or null');
          }
          break;
        case 'loading-state':
          console.log('Loading state update:', msg.loading, msg.message);
          setLoading(msg.loading);
          setLoadingMessage(msg.message || '');
          if (!msg.loading) {
            setTimeout(() => setLoadingMessage(''), 500);
          }
          break;
        case 'github-config-loaded':
          console.log('GitHub config loaded:', msg.config);
          if (msg.config) {
            setGithubConfig(msg.config);
            setGithubConfigured(true);
          }
          break;
        case 'github-config-tested':
          console.log('GitHub config test result:', msg.success);
          setLoading(false);
          if (msg.success) {
            setGithubConfig(msg.config);
            setGithubConfigured(true);
            setCurrentView('collections');
            setSuccessMessage('✅ GitHub configuration saved and tested successfully!');
            setTimeout(() => setSuccessMessage(null), 4000);
          } else {
            setError(msg.error || 'Failed to connect to GitHub repository');
          }
          break;
        case 'github-sync-complete':
          console.log('GitHub sync completed:', msg.result);
          setLoading(false);
          setLoadingMessage('');
          if (msg.result.success) {
            setSuccessMessage(`✅ Tokens synced successfully! Pull request created: ${msg.result.pullRequestUrl}`);
            setTimeout(() => setSuccessMessage(null), 6000);
          } else {
            setError(`GitHub sync failed: ${msg.result.error}`);
          }
          break;
        case 'tokens-imported':
          console.log('Tokens imported successfully:', msg.result);
          setImportLoading(false);
          setLoading(false);
          setLoadingMessage('');
          if (msg.result && msg.result.success) {
            const totalVariables = msg.result.totalVariablesCreated || 0;
            const totalCollections = msg.result.collectionsProcessed || 0;
            const resolvedReferences = msg.result.totalReferencesResolved || 0;
            
            let successText = `✅ Successfully imported ${totalVariables} variables across ${totalCollections} collections!`;
            if (resolvedReferences > 0) {
              successText += ` (${resolvedReferences} references resolved)`;
            }
            
            setSuccessMessage(successText);
            setTimeout(() => setSuccessMessage(null), 5000);
            // Reload collections to show imported data
            loadCollections();
          } else {
            const errorMsg = msg.result?.message || 'Import completed but no results received';
            setError(errorMsg);
          }
          break;
        case 'import-error':
          console.error('Import error:', msg.error);
          setImportLoading(false);
          setLoading(false);
          setLoadingMessage('');
          setError(`Import failed: ${msg.error}`);
          break;
        default:
          console.warn('Unknown message type:', msg.type);
      }
    };

    window.addEventListener('message', handleMessage);
    console.log('Message listener added');

    // Load initial data
    loadCollections();
    loadGitHubConfig();

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

  const loadGitHubConfig = () => {
    try {
      parent.postMessage({ pluginMessage: { type: 'get-github-config' } }, '*');
    } catch (err) {
      console.error('Failed to load GitHub config:', err);
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

  const exportTokens = (useGitHub = false) => {
    console.log('Exporting tokens for selected collections:', Array.from(selectedCollections));
    console.log('Export mode:', useGitHub ? 'GitHub sync' : 'Local download');
    
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    if (useGitHub && githubConfigured) {
      setLoadingMessage('Syncing to GitHub...');
      try {
        parent.postMessage({ 
          pluginMessage: { 
            type: 'github-sync-tokens',
            selectedCollectionIds: Array.from(selectedCollections)
          } 
        }, '*');
      } catch (err) {
        console.error('Failed to sync to GitHub:', err);
        setError('Failed to sync to GitHub');
        setLoading(false);
        setLoadingMessage('');
      }
    } else if (useGitHub && !githubConfigured) {
      // User clicked GitHub sync but it's not configured
      setLoading(false);
      setError('Please configure GitHub integration first');
      return;
    } else {
      // Local export
      setLoadingMessage('Preparing local download...');
      try {
        parent.postMessage({ 
          pluginMessage: { 
            type: 'export-tokens',
            selectedCollectionIds: Array.from(selectedCollections)
          } 
        }, '*');
      } catch (err) {
        console.error('Failed to export tokens:', err);
        setError('Failed to export tokens');
        setLoading(false);
        setLoadingMessage('');
      }
    }
  };

  const downloadSingleFile = (collectionData: any) => {
    try {
      const collectionName = Object.keys(collectionData)[0];
      const tokens = collectionData[collectionName];
      
      // Match your existing token file structure: [{"collection-name": {...}}]
      const fileContent = [{ [collectionName]: tokens }];
      const jsonString = JSON.stringify(fileContent, null, 2);
      
      // Create and download file
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${collectionName.toLowerCase().replace(/\s+/g, '-')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      console.log(`Downloaded: ${collectionName.toLowerCase().replace(/\s+/g, '-')}.json`);
      
      // Remove from queue
      setDownloadQueue(prev => prev.filter(item => Object.keys(item)[0] !== collectionName));
    } catch (err) {
      console.error('Failed to download file:', err);
      setError(`Failed to download ${Object.keys(collectionData)[0]}.json`);
    }
  };

  const clearDownloadQueue = () => {
    setDownloadQueue([]);
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

  const showGitHubConfig = () => {
    setCurrentView('github-config');
  };

  const handleGitHubConfigSaved = (config: GitHubConfig) => {
    console.log('GitHub config saved:', config);
    setLoading(true);
    setError(null);
    
    try {
      parent.postMessage({
        pluginMessage: {
          type: 'test-github-config',
          config
        }
      }, '*');
    } catch (err) {
      console.error('Failed to test GitHub config:', err);
      setError('Failed to test configuration');
      setLoading(false);
    }
  };

  const handleGitHubConfigClose = () => {
    setCurrentView('collections');
  };

  const handleTokenImport = () => {
    // Create file input
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    fileInput.multiple = true; // Allow multiple files
    
    fileInput.onchange = async (event) => {
      const files = (event.target as HTMLInputElement).files;
      if (!files || files.length === 0) return;
      
      setImportLoading(true);
      setLoading(true);
      setLoadingMessage('Reading token files...');
      setError(null);
      
      try {
        const fileContents = [];
        
        // Read all selected files
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const content = await readFileAsText(file);
          fileContents.push({
            filename: file.name,
            content: content
          });
        }
        
        setLoadingMessage('Importing tokens to Figma...');
        
        // Send to plugin for processing
        parent.postMessage({
          pluginMessage: {
            type: 'import-tokens',
            files: fileContents
          }
        }, '*');
        
      } catch (err) {
        console.error('Failed to read files:', err);
        setError(`Failed to read files: ${err.message}`);
        setImportLoading(false);
        setLoading(false);
        setLoadingMessage('');
      }
    };
    
    // Trigger file picker
    fileInput.click();
  };

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`));
      reader.readAsText(file);
    });
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

  if (currentView === 'github-config') {
    return (
      <GitHubConfig
        onConfigSaved={handleGitHubConfigSaved}
        onClose={handleGitHubConfigClose}
      />
    );
  }

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
            {loadingMessage || 'Loading...'}
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

      {successMessage && (
        <div style={{ 
          padding: '8px 12px', 
          marginBottom: '16px', 
          backgroundColor: '#f0f9ff', 
          border: '1px solid #bae6fd',
          borderRadius: '4px',
          color: '#0369a1'
        }}>
          {successMessage}
        </div>
      )}
      
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button 
          onClick={loadCollections} 
          disabled={loading || importLoading}
          style={{ 
            flex: 1,
            padding: '8px 16px',
            backgroundColor: loading || importLoading ? '#cbd5e1' : '#0066cc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading || importLoading ? 'not-allowed' : 'pointer',
            fontSize: '12px'
          }}
        >
          {loading && !importLoading ? 'Loading...' : 'Load Variable Collections'}
        </button>

        <button 
          onClick={handleTokenImport} 
          disabled={loading || importLoading}
          style={{ 
            flex: 1,
            padding: '8px 16px',
            backgroundColor: loading || importLoading ? '#cbd5e1' : '#16a34a',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading || importLoading ? 'not-allowed' : 'pointer',
            fontSize: '12px'
          }}
        >
          {importLoading ? 'Importing...' : 'Import Tokens'}
        </button>
      </div>

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
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            {/* GitHub Sync Section */}
            <div style={{
              padding: '12px',
              backgroundColor: githubConfigured ? '#f0f9ff' : '#f9fafb',
              border: githubConfigured ? '1px solid #bae6fd' : '1px solid #e5e7eb',
              borderRadius: '6px'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                marginBottom: '8px'
              }}>
                <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#374151' }}>
                  🔗 GitHub Integration
                </div>
                <button
                  onClick={showGitHubConfig}
                  style={{
                    padding: '4px 8px',
                    backgroundColor: '#f3f4f6',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '10px',
                    color: '#374151'
                  }}
                >
                  {githubConfigured ? 'Edit Config' : 'Configure'}
                </button>
              </div>
              
              {githubConfigured ? (
                <div>
                  <div style={{ fontSize: '10px', color: '#059669', marginBottom: '8px' }}>
                    ✅ Connected to {githubConfig && githubConfig.owner}/{githubConfig && githubConfig.repo}
                  </div>
                  <button 
                    onClick={() => exportTokens(true)}
                    disabled={loading || selectedCollections.size === 0}
                    style={{ 
                      width: '100%',
                      padding: '10px 16px',
                      backgroundColor: loading || selectedCollections.size === 0 ? '#cbd5e1' : '#0ea5e9',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: loading || selectedCollections.size === 0 ? 'not-allowed' : 'pointer',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}
                  >
                    {loading ? 'Syncing...' : `🚀 Sync to GitHub (${selectedCollections.size})`}
                  </button>
                </div>
              ) : (
                <div style={{ fontSize: '10px', color: '#6b7280' }}>
                  Configure GitHub to sync tokens directly to your repository
                </div>
              )}
            </div>

            {/* Local Export Section */}
            <div style={{
              padding: '12px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '6px'
            }}>
              <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#374151', marginBottom: '8px' }}>
                💾 Local Export
              </div>
              <button 
                onClick={() => exportTokens(false)}
                disabled={loading || selectedCollections.size === 0}
                style={{ 
                  width: '100%',
                  padding: '10px 16px',
                  backgroundColor: loading || selectedCollections.size === 0 ? '#cbd5e1' : '#16a34a',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: loading || selectedCollections.size === 0 ? 'not-allowed' : 'pointer',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}
              >
                {loading ? 'Exporting...' : `📥 Download JSON (${selectedCollections.size})`}
              </button>
            </div>
          </div>

          {/* Download Queue - shown when multiple files need downloading */}
          {downloadQueue.length > 0 && (
            <div style={{
              marginTop: '16px',
              padding: '12px',
              backgroundColor: '#f0f9ff',
              border: '1px solid #bae6fd',
              borderRadius: '6px'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                marginBottom: '8px'
              }}>
                <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#0369a1' }}>
                  📥 Files Ready for Download
                </div>
                <button
                  onClick={clearDownloadQueue}
                  style={{
                    padding: '2px 6px',
                    backgroundColor: '#f3f4f6',
                    border: '1px solid #d1d5db',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    fontSize: '9px',
                    color: '#374151'
                  }}
                >
                  Clear
                </button>
              </div>
              
              <div style={{ fontSize: '10px', color: '#0369a1', marginBottom: '8px' }}>
                Click each button to download individual files (browser blocks multiple downloads)
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {downloadQueue.map((collectionData, index) => {
                  const collectionName = Object.keys(collectionData)[0];
                  const tokenCount = Object.keys(collectionData[collectionName]).length;
                  
                  return (
                    <button
                      key={index}
                      onClick={() => downloadSingleFile(collectionData)}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: '#0ea5e9',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '11px',
                        textAlign: 'left',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <span>📄 {collectionName}.json</span>
                      <span style={{ fontSize: '9px', opacity: 0.8 }}>
                        {tokenCount} tokens
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div style={{ 
            marginTop: '12px',
            padding: '12px',
            backgroundColor: '#f1f5f9',
            border: '1px solid #cbd5e1',
            borderRadius: '6px'
          }}>
            <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '6px' }}>
              ℹ️ Export Information
            </div>
            <div style={{ fontSize: '10px', color: '#64748b', lineHeight: '1.4' }}>
              <strong>Local Export:</strong> Downloads W3C DTCG format JSON files to your computer<br/>
              <strong>GitHub Sync:</strong> Creates pull request with token files in your repository<br/>
              <strong>Format:</strong> Each collection becomes a separate file (e.g., primitive.json, semantic-light.json)
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
