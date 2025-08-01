// Plugin main entry point
import { processCollectionsForExport } from './variables/processor';
import { importTokenData, parseTokenFile, validateTokenStructure } from './variables/importer';
// import { GitHubClient } from './github/client'; // Temporarily disabled

console.log('Plugin starting...');

// Helper function to communicate loading state to UI
function setLoading(loading: boolean, message?: string) {
  figma.ui.postMessage({
    type: 'loading-state',
    loading,
    message
  });
}

// GitHub client instance - temporarily disabled
// let githubClient = new GitHubClient();

figma.showUI(__html__, {
  width: 400,
  height: 600,
  title: "Token Bridge"
});

// Handle UI messages
figma.ui.onmessage = async (msg) => {
  console.log('Plugin received message:', msg.type);
  
  try {
    switch (msg.type) {
      case 'get-collections':
        console.log('Getting variable collections...');
        const collections = await figma.variables.getLocalVariableCollectionsAsync();
        console.log('Found collections:', collections.length);
        
        figma.ui.postMessage({
          type: 'collections-loaded',
          collections: collections.map(c => ({
            id: c.id,
            name: c.name,
            modes: c.modes,
            variableIds: c.variableIds
          }))
        });
        break;
        
      case 'get-collection-details':
        console.log('Getting collection details for:', msg.collectionId);
        try {
          // Get all collections first, then find the one we want
          const collections = await figma.variables.getLocalVariableCollectionsAsync();
          const collection = collections.find(c => c.id === msg.collectionId);
          
          if (!collection) {
            throw new Error('Collection not found');
          }
          
          console.log('Found collection:', collection.name, 'with', collection.variableIds.length, 'variables');
          
          // Get variables one by one with error handling
          const variables = [];
          console.log('Processing', collection.variableIds.length, 'variable IDs...');
          
          for (let i = 0; i < collection.variableIds.length; i++) {
            const id = collection.variableIds[i];
            console.log(`Processing variable ${i + 1}/${collection.variableIds.length}: ${id}`);
            
            try {
              const variable = await figma.variables.getVariableByIdAsync(id);
              console.log('Variable result:', variable ? 'found' : 'null', variable ? variable.name : 'undefined');
              
              if (variable) {
                variables.push({
                  id: variable.id,
                  name: variable.name,
                  description: variable.description || '',
                  resolvedType: variable.resolvedType,
                  scopes: variable.scopes,
                  valuesByMode: variable.valuesByMode,
                  remote: variable.remote,
                  key: variable.key
                });
                console.log('Added variable:', variable.name);
              } else {
                console.warn('Variable returned null for ID:', id);
              }
            } catch (err) {
              console.error('Error processing variable:', id, err);
            }
          }
          
          console.log('Processed', variables.length, 'variables successfully');
          
          figma.ui.postMessage({
            type: 'collection-details-loaded',
            collection: {
              id: collection.id,
              name: collection.name,
              modes: collection.modes,
              variables: variables
            }
          });
        } catch (error) {
          console.error('Error getting collection details:', error);
          figma.ui.postMessage({
            type: 'error',
            message: `Failed to load collection details: ${error.message}`
          });
        }
        break;

      case 'export-tokens':
        console.log('Exporting tokens for collections:', msg.selectedCollectionIds);
        try {
          setLoading(true, 'Processing tokens...');
          
          // Get all collections with their variables
          const collections = await figma.variables.getLocalVariableCollectionsAsync();
          const collectionsWithVariables = [];
          
          for (const collection of collections) {
            // Only process selected collections
            if (!msg.selectedCollectionIds.includes(collection.id)) {
              continue;
            }
            
            console.log(`Processing collection: ${collection.name}`);
            const variables = [];
            
            // Get variables for this collection
            for (const variableId of collection.variableIds) {
              try {
                const variable = await figma.variables.getVariableByIdAsync(variableId);
                if (variable) {
                  variables.push({
                    id: variable.id,
                    name: variable.name,
                    description: variable.description || '',
                    resolvedType: variable.resolvedType,
                    scopes: variable.scopes,
                    valuesByMode: variable.valuesByMode,
                    remote: variable.remote,
                    key: variable.key
                  });
                }
              } catch (err) {
                console.error('Error processing variable:', variableId, err);
              }
            }
            
            collectionsWithVariables.push({
              id: collection.id,
              name: collection.name,
              modes: collection.modes,
              variables: variables
            });
          }
          
          console.log(`Processing ${collectionsWithVariables.length} collections for export`);
          
          // Process collections into token format
          const exportData = await processCollectionsForExport(
            collectionsWithVariables,
            msg.selectedCollectionIds
          );
          
          setLoading(false);
          
          // Send processed tokens back to UI
          figma.ui.postMessage({
            type: 'tokens-exported',
            exportData: exportData
          });
          
          console.log('Export completed successfully');
        } catch (error) {
          console.error('Error exporting tokens:', error);
          setLoading(false);
          figma.ui.postMessage({
            type: 'error',
            message: `Failed to export tokens: ${error.message}`
          });
        }
        break;

      case 'import-tokens':
        console.log('Importing tokens from files:', msg.files?.length || 0);
        try {
          setLoading(true, 'Parsing token files...');
          
          if (!msg.files || msg.files.length === 0) {
            throw new Error('No files provided for import');
          }
          
          const allResults = [];
          
          for (const file of msg.files) {
            console.log(`Processing file: ${file.filename}`);
            
            try {
              // Parse the JSON content
              const tokenData = parseTokenFile(file.content);
              
              // Validate structure
              const validation = validateTokenStructure(tokenData);
              if (!validation.valid) {
                console.error(`Validation failed for ${file.filename}:`, validation.errors);
                throw new Error(`Invalid token structure in ${file.filename}: ${validation.errors.join(', ')}`);
              }
              
              console.log(`File ${file.filename} validated successfully`);
              
              // Import the tokens
              setLoading(true, `Importing tokens from ${file.filename}...`);
              const results = await importTokenData(tokenData, {
                mergeStrategy: 'merge',
                createMissingModes: true,
                preserveExistingVariables: false
              });
              
              allResults.push(...results);
              console.log(`Successfully imported tokens from ${file.filename}`);
              
            } catch (fileError) {
              console.error(`Error processing file ${file.filename}:`, fileError);
              throw new Error(`Failed to process ${file.filename}: ${fileError.message}`);
            }
          }
          
          setLoading(false);
          
          // Send results back to UI
          figma.ui.postMessage({
            type: 'tokens-imported',
            results: allResults
          });
          
          console.log('Import completed successfully:', allResults.length, 'results');
        } catch (error) {
          console.error('Error importing tokens:', error);
          setLoading(false);
          figma.ui.postMessage({
            type: 'import-error',
            error: error.message
          });
        }
        break;

      case 'get-github-config':
        // GitHub temporarily disabled - return null config
        figma.ui.postMessage({
          type: 'github-config-loaded',
          config: null
        });
        break;

      case 'test-github-config':
        // GitHub temporarily disabled
        figma.ui.postMessage({
          type: 'github-config-tested',
          success: false,
          error: 'GitHub integration temporarily disabled'
        });
        break;

      case 'github-sync-tokens':
        // GitHub temporarily disabled
        figma.ui.postMessage({
          type: 'github-sync-complete',
          result: {
            success: false,
            error: 'GitHub integration temporarily disabled'
          }
        });
        break;
        
      case 'close':
        console.log('Closing plugin...');
        figma.closePlugin();
        break;
        
      default:
        console.warn('Unknown message type:', msg.type);
        figma.ui.postMessage({
          type: 'error',
          message: `Unknown message type: ${msg.type}`
        });
    }
  } catch (error) {
    console.error('Plugin error:', error);
    figma.ui.postMessage({
      type: 'error',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
};

// Register menu command
figma.on('run', ({ command }) => {
  console.log('Plugin run command:', command);
  if (command === 'open-plugin') {
    figma.showUI(__html__, {
      width: 400,
      height: 600,
      title: "Token Bridge"
    });
  }
});

console.log('Plugin initialized');
