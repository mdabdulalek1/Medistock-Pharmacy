import React, { useState } from 'react';
import { Medicine, User } from '../types/pharmacy';
import { FileSpreadsheet, Upload, CheckCircle2, AlertCircle, ArrowRight, Download, Database, Check } from 'lucide-react';
import { formatBDT } from '../utils/formatters';

interface DataImportViewProps {
  currentUser: User;
  onImportMedicines: (medicines: Partial<Medicine>[]) => Promise<void>;
  onNavigateTab: (tab: string) => void;
}

export const DataImportView: React.FC<DataImportViewProps> = ({
  currentUser,
  onImportMedicines,
  onNavigateTab,
}) => {
  const [csvText, setCsvText] = useState('');
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [successCount, setSuccessCount] = useState<number | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const sampleCsv = `brandName,genericName,strength,dosageForm,manufacturer,category,publishedMrpPrice,supplierPurchaseCost,darNumber,barcode
Napa Extra,Paracetamol + Caffeine,500 mg + 65 mg,Tablet,Beximco Pharmaceuticals Ltd.,Analgesic & Antipyretic,500,420,028-114-048,8941100234561
Seclo,Omeprazole,20 mg,Capsule,Square Pharmaceuticals PLC,Gastrointestinal & Antacid,700,588,001-229-065,8941100345672
Maxpro,Esomeprazole Magnesium,20 mg,Tablet,Square Pharmaceuticals PLC,Gastrointestinal & Antacid,800,672,001-445-072,8941100789012
Fexo,Fexofenadine HCl,120 mg,Tablet,Square Pharmaceuticals PLC,Respiratory & Antihistamine,450,382,001-312-054,8941100456783`;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setCsvText(content);
        parseCsv(content);
      }
    };
    reader.readAsText(file);
  };

  const parseCsv = (text: string) => {
    setError(null);
    setSuccessCount(null);
    try {
      const lines = text.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
      if (lines.length < 2) {
        throw new Error('CSV file must contain a header row and at least one data row.');
      }

      const headers = lines[0].split(',').map((h) => h.trim().replace(/^["']|["']$/g, ''));
      const rows = [];

      for (let i = 1; i < lines.length; i++) {
        // Simple comma split (handling quotes if basic)
        const currentLine = lines[i];
        const values = currentLine.split(',').map((v) => v.trim().replace(/^["']|["']$/g, ''));

        const rowObj: any = {};
        headers.forEach((h, index) => {
          rowObj[h] = values[index] !== undefined ? values[index] : '';
        });

        if (rowObj.brandName) {
          rows.push({
            brandName: rowObj.brandName,
            genericName: rowObj.genericName || 'General Formulation',
            strength: rowObj.strength || '500 mg',
            dosageForm: rowObj.dosageForm || 'Tablet',
            manufacturer: rowObj.manufacturer || 'Authorized Manufacturer',
            category: rowObj.category || 'Analgesic & Antipyretic',
            publishedMrpPrice: Number(rowObj.publishedMrpPrice || rowObj.price || 100),
            supplierPurchaseCost: Number(rowObj.supplierPurchaseCost || rowObj.cost || 80),
            pharmacySellingPrice: Number(rowObj.publishedMrpPrice || rowObj.price || 100),
            darNumber: rowObj.darNumber || '000-000-000',
            barcode: rowObj.barcode || `8941${Math.floor(100000000 + Math.random() * 900000000)}`,
            active: true,
            isPrescriptionRequired: false,
          });
        }
      }

      if (rows.length === 0) {
        throw new Error('No valid medicine rows parsed. Ensure "brandName" column exists.');
      }

      setParsedRows(rows);
    } catch (err: any) {
      setError(err.message || 'Failed to parse CSV file.');
      setParsedRows([]);
    }
  };

  const handleExecuteImport = async () => {
    if (parsedRows.length === 0) return;
    setIsImporting(true);
    setError(null);
    try {
      await onImportMedicines(parsedRows);
      setSuccessCount(parsedRows.length);
      setParsedRows([]);
      setCsvText('');
    } catch (err: any) {
      setError(err.message || 'Import execution failed.');
    } finally {
      setIsImporting(false);
    }
  };

  const handleDownloadSample = () => {
    const blob = new Blob([sampleCsv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'medistock_medicine_import_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="p-3 rounded-2xl bg-[#079B8C]/10 text-[#079B8C]">
            <FileSpreadsheet className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-xl font-bold text-[#123B5D]">CSV Data Import & Catalogue Population</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Upload authorized CSV files to bulk import medicines, pricing tiers, and manufacturer records.
            </p>
          </div>
        </div>
        <button
          onClick={handleDownloadSample}
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-[#123B5D] hover:bg-slate-50 transition-colors shadow-2xs"
        >
          <Download className="h-4 w-4 text-[#079B8C]" />
          <span>Download CSV Template</span>
        </button>
      </div>

      {successCount !== null && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs text-[#168653] flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <div>
              <span className="font-bold text-sm block">Successfully Imported {successCount} Medicine Records!</span>
              <span>All records have been securely added to your local master inventory catalogue.</span>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('medicines')}
            className="rounded-xl bg-[#168653] text-white px-4 py-2 font-bold hover:bg-[#126b42] transition-colors"
          >
            View Catalogue
          </button>
        </div>
      )}

      {error && (
        <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 text-xs text-[#D64545] flex items-center gap-3 shadow-xs">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <div>
            <span className="font-bold block">Import Error</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Upload Box */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-[#123B5D]">1. Upload CSV File</h3>
          <p className="text-xs text-slate-500">
            Select a comma-separated values (.csv) file containing columns for brandName, genericName, strength, dosageForm, and publishedMrpPrice.
          </p>

          <label className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-[#F3F7FA] p-6 text-center hover:border-[#079B8C] cursor-pointer transition-colors">
            <Upload className="h-8 w-8 text-[#079B8C] mb-2" />
            <span className="text-xs font-bold text-slate-700">Click to browse CSV file</span>
            <span className="text-[10px] text-slate-400 mt-1">Supports standard CSV spreadsheets</span>
            <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
          </label>

          <div className="border-t border-slate-100 pt-4">
            <h4 className="font-bold text-xs text-slate-700 mb-1">Required CSV Columns:</h4>
            <p className="text-[11px] font-mono text-slate-500 leading-relaxed">
              brandName, genericName, strength, dosageForm, manufacturer, category, publishedMrpPrice, supplierPurchaseCost, darNumber, barcode
            </p>
          </div>
        </div>

        {/* Preview Table */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-[#123B5D]">2. Preview Parsed Records ({parsedRows.length})</h3>
              {parsedRows.length > 0 && (
                <span className="rounded-full bg-[#DDF6EF] px-2.5 py-0.5 text-[10px] font-mono font-bold text-[#079B8C]">
                  Ready for Bulk Import
                </span>
              )}
            </div>

            {parsedRows.length === 0 ? (
              <div className="py-20 text-center text-slate-400 bg-[#F3F7FA] rounded-2xl border border-slate-200/80">
                <Database className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                <p className="text-xs font-semibold text-slate-600">No CSV file uploaded yet.</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Upload a file or download the template to begin.</p>
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F3F7FA] text-slate-700 font-bold sticky top-0 border-b border-slate-200">
                    <tr>
                      <th className="p-3">Brand Name</th>
                      <th className="p-3">Strength & Form</th>
                      <th className="p-3">Manufacturer</th>
                      <th className="p-3">MRP (৳)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                    {parsedRows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-[#123B5D]">{row.brandName}</td>
                        <td className="p-3 text-slate-600">{row.strength} · {row.dosageForm}</td>
                        <td className="p-3 text-slate-500">{row.manufacturer}</td>
                        <td className="p-3 font-mono font-bold text-[#079B8C]">
                          {formatBDT(row.publishedMrpPrice)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-end">
            <button
              onClick={handleExecuteImport}
              disabled={parsedRows.length === 0 || isImporting}
              className="flex items-center gap-2 rounded-xl bg-[#079B8C] hover:bg-[#068577] text-white px-6 py-3 text-xs font-bold transition-all shadow-sm disabled:opacity-50"
            >
              <span>{isImporting ? 'Importing Records...' : `Import ${parsedRows.length} Medicines to Database`}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
