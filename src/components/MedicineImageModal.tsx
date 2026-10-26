import React, { useState } from 'react';
import { Medicine } from '../types/pharmacy';
import { uploadMedicineImage, deleteMedicineImage } from '../services/api';
import {
  X,
  Upload,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Camera,
  Image as ImageIcon,
  ShieldCheck,
  FileText,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

interface MedicineImageModalProps {
  medicine: Medicine | null;
  onClose: () => void;
  onSuccess: (updatedMedicine: Medicine) => void;
  canVerify: boolean; // True for Pharmacist, Owner, Admin, IT Admin
}

export const MedicineImageModal: React.FC<MedicineImageModalProps> = ({
  medicine,
  onClose,
  onSuccess,
  canVerify,
}) => {
  if (!medicine) return null;

  const [imageUrl, setImageUrl] = useState<string>(medicine.imageUrl || '');
  const [imageSource, setImageSource] = useState<string>(
    medicine.imageSource || 'DGDA Approved Packaging Scan'
  );
  const [isVerified, setIsVerified] = useState<boolean>(medicine.imageVerified || false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<boolean>(false);

  const fallbackPlaceholder = '/assets/medicine-placeholder.svg';
  const displayImage = previewError || !imageUrl ? fallbackPlaceholder : imageUrl;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // MIME type check
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      setError('Invalid format: Please upload a JPEG, PNG, WebP, or SVG packaging image.');
      return;
    }

    // Size check (< 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File too large: Packaging image must be under 5MB.');
      return;
    }

    setError(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageUrl(reader.result as string);
      setPreviewError(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!imageUrl) {
      setError('Please provide an image URL or upload an image file.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await uploadMedicineImage(medicine.id, {
        imageUrl,
        imageSource,
        isVerified,
      });
      setSuccessMsg('Packaging photo and verification records saved successfully.');
      setTimeout(() => {
        onSuccess(res.medicine);
        onClose();
      }, 700);
    } catch (err: any) {
      setError(err.message || 'Failed to save medicine packaging photo');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    if (!medicine.imageUrl) {
      setImageUrl('');
      return;
    }

    if (!window.confirm(`Are you sure you want to remove the packaging photo for ${medicine.brandName}?`)) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await deleteMedicineImage(medicine.id);
      setImageUrl('');
      setIsVerified(false);
      setSuccessMsg('Packaging photo removed. System will default to the neutral SVG placeholder.');
      setTimeout(() => {
        onSuccess(res.medicine);
        onClose();
      }, 700);
    } catch (err: any) {
      setError(err.message || 'Failed to remove image');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-[#17365D] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
              <Camera className="w-5 h-5 text-[#168C8C]" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Medicine Photo & Packaging Inspection</h3>
              <p className="text-xs text-slate-300">
                {medicine.brandName} • {medicine.strength} • {medicine.manufacturer}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3 text-sm text-[#C62828]">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Validation Error</p>
                <p>{error}</p>
              </div>
            </div>
          )}

          {successMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start space-x-3 text-sm text-[#16803C]">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Success</p>
                <p>{successMsg}</p>
              </div>
            </div>
          )}

          {/* Clinical & Regulatory Spec */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#F3F6FA] p-3 rounded-lg text-xs border border-slate-200">
            <div>
              <span className="text-slate-500 block">DAR Number</span>
              <span className="font-semibold text-slate-800">{medicine.darNumber || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Dosage Form</span>
              <span className="font-semibold text-slate-800">{medicine.dosageForm}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Units Per Pack</span>
              <span className="font-semibold text-slate-800">{medicine.unitsPerPack} {medicine.dispenseUnitName}s</span>
            </div>
            <div>
              <span className="text-slate-500 block">Prescription Schedule</span>
              <span className={`font-semibold ${medicine.isPrescriptionRequired ? 'text-[#B7791F]' : 'text-[#16803C]'}`}>
                {medicine.isPrescriptionRequired ? 'Rx Required' : 'OTC Friendly'}
              </span>
            </div>
          </div>

          {/* Photo Preview & Upload Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Visual Box */}
            <div className="flex flex-col items-center">
              <div className="w-full aspect-square max-w-[240px] bg-slate-100 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden relative shadow-inner">
                <img
                  src={displayImage}
                  alt={medicine.brandName}
                  onError={() => setPreviewError(true)}
                  className="w-full h-full object-contain p-2"
                />
                {isVerified && (
                  <div className="absolute top-2 right-2 bg-[#16803C] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center space-x-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>VERIFIED</span>
                  </div>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-2 text-center">
                {imageUrl ? 'Current Packaging Photo' : 'Using Neutral Brand SVG Fallback'}
              </p>
              {medicine.imageUploadedBy && (
                <p className="text-[10px] text-slate-400 text-center mt-0.5">
                  Uploaded by: {medicine.imageUploadedBy}
                </p>
              )}
            </div>

            {/* Upload Options */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Upload High-Resolution Photo File
                </label>
                <div className="flex items-center space-x-2">
                  <label className="cursor-pointer flex items-center justify-center px-4 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-colors shadow-xs w-full">
                    <Upload className="w-4 h-4 mr-2 text-[#168C8C]" />
                    <span>Choose File (JPG, PNG, WebP &lt; 5MB)</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/svg+xml"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Or Image Web URL
                </label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    setPreviewError(false);
                  }}
                  placeholder="https://..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#168C8C]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Packaging Source Document
                </label>
                <select
                  value={imageSource}
                  onChange={(e) => setImageSource(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#168C8C] bg-white"
                >
                  <option value="DGDA Approved Packaging Scan">DGDA Approved Packaging Scan</option>
                  <option value="Manufacturer Product Master">Manufacturer Product Master (Square / Beximco / Incepta)</option>
                  <option value="Pharmacist High-Res Inspection">Pharmacist High-Res Physical Inspection</option>
                  <option value="Authorized Supplier Consignment Catalog">Authorized Supplier Consignment Catalog</option>
                </select>
              </div>

              {/* Pharmacist Certification */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <label className="flex items-start space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isVerified}
                    onChange={(e) => setIsVerified(e.target.checked)}
                    disabled={!canVerify}
                    className="mt-0.5 rounded text-[#168C8C] focus:ring-[#168C8C]"
                  />
                  <div className="text-xs">
                    <span className="font-semibold text-slate-800 block">
                      Certify Packaging Verification
                    </span>
                    <span className="text-slate-500 text-[11px] leading-tight block">
                      Confirmed packaging labels match approved DGDA DAR typography, strength, and cold chain warning.
                    </span>
                  </div>
                </label>
                {!canVerify && (
                  <p className="text-[10px] text-amber-600 font-medium">
                    * Only A-Grade Pharmacists, IT Admin, or Executive roles can certify packaging photos.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#F3F6FA] border-t border-slate-200 flex items-center justify-between">
          <div>
            {medicine.imageUrl && (
              <button
                type="button"
                onClick={handleRemove}
                disabled={loading}
                className="inline-flex items-center text-xs font-semibold text-[#C62828] hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4 mr-1.5" />
                Remove Photo
              </button>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 bg-[#168C8C] text-white rounded-lg text-xs font-semibold hover:bg-[#127272] transition-colors shadow-xs disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-1.5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-1.5" />
                  Save Photo
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
