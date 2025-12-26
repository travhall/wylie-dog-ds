/**
 * Wylie Dog Project Detection
 * Auto-detects if GitHub repo is a Wylie Dog Design System project
 * and provides smart defaults for token sync path
 */

export const WYLIE_DOG_TOKEN_PATH = "packages/tokens/io/sync/";
export const DEFAULT_TOKEN_PATH = "tokens/";

export interface ProjectDetectionResult {
  isWylieDogProject: boolean;
  detectedPaths: string[];
  recommendedPath: string;
  confidence: "high" | "medium" | "low";
}

/**
 * Detect if a GitHub repository is a Wylie Dog Design System project
 */
export async function detectWylieDogProject(
  github: any,
  owner: string,
  repo: string,
  branch: string
): Promise<ProjectDetectionResult> {
  const detectedPaths: string[] = [];
  let isWylieDogProject = false;
  let confidence: "high" | "medium" | "low" = "low";

  try {
    // Check for Wylie Dog Design System structure
    const pathsToCheck = [
      "packages/tokens/io/sync/",
      "packages/tokens/package.json",
      "packages/tokens/io/processed/",
      "packages/tokens/scripts/process-token-io.js",
    ];

    let wylieDogMarkers = 0;

    for (const path of pathsToCheck) {
      try {
        const response = await github.repos.getContent({
          owner,
          repo,
          path,
          ref: branch,
        });

        if (response.status === 200) {
          detectedPaths.push(path);
          wylieDogMarkers++;
        }
      } catch (err) {
        // Path doesn't exist, continue
      }
    }

    // High confidence: Found all key markers
    if (wylieDogMarkers >= 3) {
      isWylieDogProject = true;
      confidence = "high";
    }
    // Medium confidence: Found some markers
    else if (wylieDogMarkers >= 2) {
      isWylieDogProject = true;
      confidence = "medium";
    }

    // If not Wylie Dog, check for common token directories
    if (!isWylieDogProject) {
      const commonPaths = [
        "tokens/",
        "design-tokens/",
        "src/tokens/",
        "packages/tokens/",
      ];

      for (const path of commonPaths) {
        try {
          const response = await github.repos.getContent({
            owner,
            repo,
            path,
            ref: branch,
          });

          if (response.status === 200) {
            detectedPaths.push(path);
          }
        } catch (err) {
          // Path doesn't exist, continue
        }
      }
    }

    const recommendedPath = isWylieDogProject
      ? WYLIE_DOG_TOKEN_PATH
      : detectedPaths.length > 0
        ? detectedPaths[0]
        : DEFAULT_TOKEN_PATH;

    return {
      isWylieDogProject,
      detectedPaths,
      recommendedPath,
      confidence,
    };
  } catch (error) {
    console.error("Error detecting Wylie Dog project:", error);

    // Return safe defaults on error
    return {
      isWylieDogProject: false,
      detectedPaths: [],
      recommendedPath: DEFAULT_TOKEN_PATH,
      confidence: "low",
    };
  }
}

/**
 * Get the appropriate sync path based on project type
 */
export function getTokenSyncPath(config: {
  isWylieDogProject?: boolean;
  tokenPath?: string;
}): string {
  // If user has explicitly set a path, use it
  if (config.tokenPath) {
    return config.tokenPath;
  }

  // Otherwise use smart default
  return config.isWylieDogProject ? WYLIE_DOG_TOKEN_PATH : DEFAULT_TOKEN_PATH;
}
