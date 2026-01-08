declare module "@wyliedog/tokens/manifest.json" {
  const manifest: {
    primitives: {
      colors: Record<string, Record<string, any>>;
      spacing: Record<string, any>;
      borderRadius: Record<string, any>;
      borderWidth: Record<string, any>;
      typography: {
        family: Record<string, any>;
        size: Record<string, any>;
        weight: Record<string, any>;
        lineHeight: Record<string, any>;
      };
    };
    semantics: Record<string, Record<string, any>>;
    components: Record<string, Record<string, any>>;
  };
  export default manifest;
}
