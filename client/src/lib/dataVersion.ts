/**
 * Data version for cache-busting the CSV file.
 * Update this value whenever the CSV data is modified to ensure
 * users get the latest data instead of a cached version.
 * 
 * Format: YYYYMMDD-count (e.g., "20260205-2692")
 */
export const DATA_VERSION = "20260205-2692";

/**
 * Get the CSV URL with cache-busting version parameter
 */
export function getDataUrl(): string {
  return `/data/master_recycling_directory.csv?v=${DATA_VERSION}`;
}
