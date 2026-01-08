/**
 * Collection Handlers
 *
 * Handles CRUD operations for Figma variable collections.
 */

import { setLoading, processInChunks, sendError, sendSuccess } from "./utils";

/**
 * Get all variable collections
 */
export async function handleGetCollections(msg: any): Promise<void> {
  console.log("Getting variable collections...");

  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  console.log("Found collections:", collections.length);

  figma.ui.postMessage({
    type: "collections-loaded",
    collections: collections.map((c) => ({
      id: c.id,
      name: c.name,
      modes: c.modes,
      variableIds: c.variableIds,
    })),
  });
}

/**
 * Get detailed information about a specific collection
 */
export async function handleGetCollectionDetails(msg: any): Promise<void> {
  console.log("Getting collection details for:", msg.collectionId);

  try {
    // Get all collections first, then find the one we want
    const collections =
      await figma.variables.getLocalVariableCollectionsAsync();
    const collection = collections.find((c) => c.id === msg.collectionId);

    if (!collection) {
      throw new Error("Collection not found");
    }

    console.log(
      "Found collection:",
      collection.name,
      "with",
      collection.variableIds.length,
      "variables"
    );

    setLoading(
      true,
      `Processing ${collection.variableIds.length} variables...`
    );

    // Process variables in chunks
    const variables = await processInChunks(
      collection.variableIds,
      async (id: string, index: number) => {
        try {
          const variable = await figma.variables.getVariableByIdAsync(id);
          if (variable) {
            return {
              id: variable.id,
              name: variable.name,
              description: variable.description || "",
              resolvedType: variable.resolvedType,
              scopes: variable.scopes,
              valuesByMode: variable.valuesByMode,
              remote: variable.remote,
              key: variable.key,
            };
          }
          return null;
        } catch (err) {
          console.error("Error processing variable:", id, err);
          return null;
        }
      },
      100, // Process 100 variables at a time
      (current, total, message) => {
        setLoading(true, message);
      }
    );

    // Filter out null results
    const validVariables = variables.filter((v) => v !== null);

    console.log("Processed", validVariables.length, "variables successfully");
    setLoading(false);

    figma.ui.postMessage({
      type: "collection-details-loaded",
      collection: {
        id: collection.id,
        name: collection.name,
        modes: collection.modes,
        variables: validVariables,
      },
    });
  } catch (error: unknown) {
    console.error("Error getting collection details:", error);
    setLoading(false);
    sendError(
      `Failed to load collection details: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
