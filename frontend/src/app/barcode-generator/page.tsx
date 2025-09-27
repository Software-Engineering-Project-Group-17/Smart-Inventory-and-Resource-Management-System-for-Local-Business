"use client";

import { useEffect, useRef, useState } from 'react';
import JsBarcode from 'jsbarcode';
import { Download, Copy, Check } from 'lucide-react';

export default function BarcodeGeneratorPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [barcodeText, setBarcodeText] = useState('b2#1212');
  const [barcodeFormat, setBarcodeFormat] = useState('CODE128');
  const [copied, setCopied] = useState(false);
  const [generated, setGenerated] = useState(false);

  const generateBarcode = () => {
    if (!canvasRef.current) return;

    try {
      // Clear the canvas first
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }

      // Generate barcode
      JsBarcode(canvas, barcodeText, {
        format: barcodeFormat,
        width: 2,
        height: 100,
        displayValue: true,
        fontSize: 20,
        margin: 10,
        background: '#ffffff',
        lineColor: '#000000'
      });

      setGenerated(true);
      console.log(`Generated barcode: ${barcodeText} in format: ${barcodeFormat}`);
    } catch (error) {
      console.error('Error generating barcode:', error);
      alert('Error generating barcode. Please check the input text and format.');
    }
  };

  const downloadBarcode = () => {
    if (!canvasRef.current || !generated) return;

    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = `barcode_${barcodeText}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const copyBarcodeText = async () => {
    try {
      await navigator.clipboard.writeText(barcodeText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const barcodeFormats = [
    { value: 'CODE128', label: 'CODE128 (Recommended)' },
    { value: 'CODE39', label: 'CODE39' },
    { value: 'EAN13', label: 'EAN13' },
    { value: 'EAN8', label: 'EAN8' },
    { value: 'UPC', label: 'UPC' },
    { value: 'ITF14', label: 'ITF14' },
    { value: 'MSI', label: 'MSI' },
    { value: 'pharmacode', label: 'Pharmacode' }
  ];

  // Generate barcode on component mount and when inputs change
  useEffect(() => {
    if (barcodeText.trim()) {
      generateBarcode();
    }
  }, [barcodeText, barcodeFormat]);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Barcode Generator</h1>
          <p className="text-gray-600 mb-6">Generate barcodes for testing your scanner application</p>

          {/* Input Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Barcode Text
              </label>
              <input
                type="text"
                value={barcodeText}
                onChange={(e) => setBarcodeText(e.target.value)}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                placeholder="Enter text to encode"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Barcode Format
              </label>
              <select
                value={barcodeFormat}
                onChange={(e) => setBarcodeFormat(e.target.value)}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              >
                {barcodeFormats.map((format) => (
                  <option key={format.value} value={format.value}>
                    {format.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Generated Barcode Display */}
          <div className="bg-gray-50 rounded-xl p-8 mb-6 text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Generated Barcode</h2>
            
            <div className="inline-block bg-white p-6 rounded-lg shadow-md">
              <canvas
                ref={canvasRef}
                className="max-w-full h-auto"
                style={{ maxWidth: '100%' }}
              />
            </div>

            {generated && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-4">
                  Barcode text: <span className="font-mono font-semibold">{barcodeText}</span>
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  Format: <span className="font-semibold">{barcodeFormat}</span>
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={generateBarcode}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200"
            >
              Regenerate Barcode
            </button>

            <button
              onClick={downloadBarcode}
              disabled={!generated}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Download PNG</span>
            </button>

            <button
              onClick={copyBarcodeText}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied!' : 'Copy Text'}</span>
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">How to Use</h2>
          <div className="space-y-3 text-gray-600">
            <p><strong>1. Enter Text:</strong> Type the text you want to encode (e.g., "b2#1212")</p>
            <p><strong>2. Choose Format:</strong> Select the barcode format (CODE128 works well for text with special characters)</p>
            <p><strong>3. Generate:</strong> The barcode will be generated automatically</p>
            <p><strong>4. Download:</strong> Click "Download PNG" to save the barcode image</p>
            <p><strong>5. Test:</strong> Use your mobile scanner to test if it reads correctly</p>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Testing with Your Scanner</h3>
            <ol className="list-decimal list-inside space-y-1 text-blue-700">
              <li>Download the generated barcode image</li>
              <li>Display it on another device or print it out</li>
              <li>Open your mobile scanner: <code className="bg-blue-100 px-1 rounded">http://localhost:3000/scanner?user=thivinu%40gmail.com</code></li>
              <li>Point the scanner at the barcode</li>
              <li>Verify it reads "b2#1212" correctly</li>
            </ol>
          </div>

          <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-2">Format Notes</h3>
            <ul className="list-disc list-inside space-y-1 text-yellow-700">
              <li><strong>CODE128:</strong> Best for alphanumeric text with special characters like "#"</li>
              <li><strong>CODE39:</strong> Simple format, limited character set</li>
              <li><strong>EAN13/EAN8:</strong> Numeric only, used for retail products</li>
              <li>For "b2#1212", CODE128 is recommended as it supports all characters</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}