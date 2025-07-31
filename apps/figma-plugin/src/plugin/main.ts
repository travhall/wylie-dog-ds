// Plugin main entry point
console.log('Plugin starting...');

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
