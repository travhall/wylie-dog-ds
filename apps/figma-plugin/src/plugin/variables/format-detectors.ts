// Format Detection Registry - Manages multiple format detectors
import type {
  FormatAdapter,
  FormatDetectionResult,
  TokenFormatType,
} from "./format-adapter";

export class FormatDetectorRegistry {
  private detectors: FormatAdapter[] = [];

  register(adapter: FormatAdapter): void {
    this.detectors.push(adapter);
  }

  detectFormat(data: any): FormatDetectionResult {
    console.log(
      `🔍 Running format detection with ${this.detectors.length} detectors`
    );

    const results = this.detectors.map((detector) => {
      const result = detector.detect(data);
      console.log(
        `  ${detector.name}: ${(result.confidence * 100).toFixed(1)}% confidence`
      );
      return result;
    });

    // Return the result with highest confidence
    const best = results.reduce((best, current) =>
      current.confidence > best.confidence ? current : best
    );

    console.log(
      `🏆 Best match: ${best.format} (${(best.confidence * 100).toFixed(1)}% confidence)`
    );
    return best;
  }

  getAdapter(format: TokenFormatType): FormatAdapter | undefined {
    return this.detectors.find((d) => d.detect({}).format === format);
  }

  getAllAdapters(): FormatAdapter[] {
    return this.detectors.slice();
  }

  getRegistrySize(): number {
    return this.detectors.length;
  }
}
