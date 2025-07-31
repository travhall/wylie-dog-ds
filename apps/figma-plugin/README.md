# Token Bridge - Figma Plugin

A design token synchronization plugin for Figma that enables seamless integration between Figma Variables and code repositories.

## Features

- **Local Export**: Download design tokens as W3C DTCG format JSON files
- **GitHub Integration**: Sync tokens directly to GitHub repositories with pull request creation
- **Multiple Collection Support**: Export multiple variable collections simultaneously
- **OKLCH Color Support**: Advanced color format support (extensible architecture)
- **Real-time Validation**: Token structure validation and conflict detection

## Architecture

### Plugin Structure
```
src/
├── plugin/                    # Figma Plugin API context
│   ├── main.ts               # Plugin entry point and message handling
│   ├── variables/
│   │   └── processor.ts      # Variable collection and processing
│   ├── github/
│   │   └── client.ts         # GitHub API integration
│   └── colors/               # Color conversion utilities (future)
├── ui/                       # Plugin UI context (Preact/React)
│   ├── App.tsx              # Main application component
│   └── components/
│       └── GitHubConfig.tsx  # GitHub configuration UI
└── shared/
    └── types/               # Shared TypeScript types
```

### Technology Stack

- **Runtime**: Figma Plugin API + Browser environment
- **UI Framework**: Preact (React-compatible, smaller bundle)
- **Build System**: Vite with single-file output for Figma compatibility
- **GitHub Integration**: Octokit REST API client
- **Token Processing**: W3C Design Token Community Group (DTCG) format
- **TypeScript**: Strict mode for type safety

## Development

### Prerequisites
- Node.js 18+
- pnpm (recommended)
- Figma desktop app

### Setup
```bash
# Install dependencies
pnpm install

# Development with watch mode
pnpm dev

# Build for production
pnpm build
```

### Loading in Figma
1. Open Figma desktop app
2. Go to Plugins → Development → Import plugin from manifest
3. Select the `manifest.json` file from this directory
4. The plugin will appear in your development plugins

## Usage

### Local Export
1. Open the plugin in any Figma file with variable collections
2. Click "Load Variable Collections"
3. Select the collections you want to export
4. Click "📥 Download JSON" to download files locally

### GitHub Integration
1. Configure GitHub integration:
   - Repository owner and name
   - Branch (default: main)
   - Token path (default: tokens)
   - Personal Access Token with 'repo' permissions
2. Click "Save & Test" to validate configuration
3. Use "🚀 Sync to GitHub" to create pull requests with token updates

## Token Format

Exports use the W3C Design Token Community Group (DTCG) format:

```json
{
  "color.primary.500": {
    "$type": "color",
    "$value": "#0ea5e9",
    "$description": "Primary brand color"
  },
  "spacing.base": {
    "$type": "dimension",
    "$value": "16px",
    "$description": "Base spacing unit"
  }
}
```

## Configuration

### GitHub Personal Access Token
Create a token at https://github.com/settings/tokens with these permissions:
- `repo` (Full control of private repositories)

### Repository Structure
Tokens are saved as separate files per collection:
```
tokens/
├── primitive.json           # Primitive color, spacing tokens
├── semantic-light.json      # Light mode semantic tokens
├── semantic-dark.json       # Dark mode semantic tokens
└── component-light.json     # Component-specific tokens
```

## API Integration

### Plugin Messages
The plugin uses Figma's postMessage API for UI ↔ Plugin communication:

- `get-collections`: Load all variable collections
- `export-tokens`: Process and export tokens locally
- `github-sync-tokens`: Sync tokens to GitHub
- `test-github-config`: Validate GitHub repository access

### GitHub API Usage
- Repository validation
- Branch creation for each sync
- File creation/updates
- Pull request generation with detailed descriptions

## Error Handling

- Network failure recovery
- GitHub API rate limit handling
- Token validation with clear error messages
- Graceful fallbacks for missing data

## Future Enhancements

- **OKLCH Color Conversion**: Advanced perceptual color space support
- **Conflict Resolution**: Interactive merge conflict handling
- **Batch Operations**: Multi-repository sync
- **Plugin Analytics**: Usage tracking and optimization
- **OAuth Integration**: Enhanced GitHub authentication flow

## Security

- Secure token storage using Figma's clientStorage API
- No sensitive data in plugin code
- Personal Access Tokens encrypted at rest
- Network requests only to approved domains (api.github.com)

## Contributing

1. Follow TypeScript strict mode
2. Add tests for new functionality
3. Update documentation for API changes
4. Ensure Figma plugin guidelines compliance

## License

Part of the Wylie Dog Design System - MIT License
