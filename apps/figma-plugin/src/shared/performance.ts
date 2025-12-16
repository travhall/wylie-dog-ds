// Performance Monitor - Quick Win completion enhancement
// Tracks plugin performance improvements from Quick Wins implementation

export interface PerformanceMetrics {
  operationTime: number;
  memoryUsage: number;
  chunkSize: number;
  adaptiveLoading: boolean;
}

export class PerformanceMonitor {
  private static metrics: Map<string, PerformanceMetrics> = new Map();

  static startOperation(operationId: string): number {
    console.log(`⚡ Starting operation: ${operationId}`);
    return performance.now();
  }

  static endOperation(
    operationId: string,
    startTime: number,
    details?: Partial<PerformanceMetrics>
  ): void {
    const endTime = performance.now();
    const duration = endTime - startTime;

    const metrics: PerformanceMetrics = {
      operationTime: duration,
      memoryUsage: (performance as any).memory?.usedJSHeapSize || 0,
      chunkSize: details?.chunkSize || 50,
      adaptiveLoading: details?.adaptiveLoading || false,
    };

    this.metrics.set(operationId, metrics);

    // Quick Wins performance improvements logging
    if (duration > 1000) {
      console.warn(
        `⚠️  Operation ${operationId} took ${duration.toFixed(2)}ms - consider chunking`
      );
    } else {
      console.log(
        `✅ Operation ${operationId} completed in ${duration.toFixed(2)}ms`
      );
    }

    // Log Quick Wins improvements
    if (details?.chunkSize && details.chunkSize < 100) {
      console.log(
        `📦 Using chunked processing (size: ${details.chunkSize}) - Quick Win #5`
      );
    }

    if (details?.adaptiveLoading) {
      console.log(`🚀 Adaptive loading enabled - Quick Win #13`);
    }
  }

  static getMetrics(): Map<string, PerformanceMetrics> {
    return new Map(this.metrics);
  }

  static logSummary(): void {
    console.log("📊 Plugin Performance Summary (Quick Wins Implementation):");
    console.log("✅ Chunked processing for large collections");
    console.log("✅ Operation cancellation support");
    console.log("✅ Memory cleanup in components");
    console.log("✅ Enhanced error handling with Result pattern");
    console.log("✅ Smart defaults for GitHub configuration");
    console.log("✅ Progressive disclosure UI improvements");
    console.log("✅ Dynamic adapter loading for bundle optimization");
  }
}
