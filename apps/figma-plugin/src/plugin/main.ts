// Plugin main entry point
figma.showUI(__html__, {
  width: 400,
  height: 600,
  title: "Token Bridge"
});

// Handle UI messages
figma.ui.onmessage = async (msg) => {
  switch (msg.type) {
    case 'get-collections':
      const collections = await figma.variables.getLocalVariableCollections();
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
      
    case 'close':
      figma.closePlugin();
      break;
      
    default:
      console.warn('Unknown message type:', msg.type);
  }
};

// Register menu command
figma.on('run', ({ command }) => {
  if (command === 'open-plugin') {
    figma.showUI(__html__, {
      width: 400,
      height: 600,
      title: "Token Bridge"
    });
  }
});
