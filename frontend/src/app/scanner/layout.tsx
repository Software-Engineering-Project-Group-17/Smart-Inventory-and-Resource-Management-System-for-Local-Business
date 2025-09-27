import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Barcode Scanner - Smart Inventory',
  description: 'Mobile barcode scanner for inventory management',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
};

export default function ScannerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="scanner-layout">
      {children}
    </div>
  );
}