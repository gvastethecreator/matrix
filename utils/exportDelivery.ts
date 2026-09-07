export type ExportDelivery = { kind: 'copied' } | { kind: 'download'; filename: string };

export const downloadExportFilename = (timestamp: number): string => `matrix-digital-rain-${timestamp}.html`;

export const decideExportDelivery = (clipboardOk: boolean, timestamp: number): ExportDelivery => {
  if (clipboardOk) {
    return { kind: 'copied' };
  }
  return { kind: 'download', filename: downloadExportFilename(timestamp) };
};
