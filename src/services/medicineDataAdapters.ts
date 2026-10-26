import { CandidateMedicineMatch, Medicine, DosageForm, PriceHistoryEntry } from '../types/pharmacy';

// Mock reference registry representing DGDA and Authorized Depot feeds
export const AUTHORIZED_DGDA_DEPOT_RECORDS: CandidateMedicineMatch[] = [
  {
    id: 'cand-napa-extra',
    brandName: 'Napa Extra',
    genericName: 'Paracetamol + Caffeine',
    strength: '500 mg + 65 mg',
    dosageForm: 'Tablet',
    packSize: 'Box of 200 (20 Strips)',
    manufacturer: 'Beximco Pharmaceuticals Ltd.',
    barcode: '8941100234561',
    darNumber: '028-114-048',
    publishedMrp: 500.0,
    supplierWholesalePrice: 420.0,
    source: 'DGDA_NATIONAL_REGISTRY',
    matchScore: 100,
    isExactMatch: true,
    imageUrl: '/assets/medicines/napa_extra.png',
    lastUpdated: new Date().toISOString(),
    requiresConfirmation: false,
  },
  {
    id: 'cand-seclo-20',
    brandName: 'Seclo',
    genericName: 'Omeprazole',
    strength: '20 mg',
    dosageForm: 'Capsule',
    packSize: 'Box of 100 (10 Strips)',
    manufacturer: 'Square Pharmaceuticals PLC',
    barcode: '8941100345672',
    darNumber: '001-229-065',
    publishedMrp: 700.0,
    supplierWholesalePrice: 588.0,
    source: 'AUTHORIZED_DEPOT_FEED',
    matchScore: 100,
    isExactMatch: true,
    imageUrl: '/assets/medicines/seclo_20.png',
    lastUpdated: new Date().toISOString(),
    requiresConfirmation: false,
  },
  {
    id: 'cand-maxpro-20',
    brandName: 'Maxpro',
    genericName: 'Esomeprazole Magnesium Trihydrate',
    strength: '20 mg',
    dosageForm: 'Tablet',
    packSize: 'Box of 100 (10 Strips)',
    manufacturer: 'Square Pharmaceuticals PLC',
    barcode: '8941100789012',
    darNumber: '001-445-072',
    publishedMrp: 800.0,
    supplierWholesalePrice: 672.0,
    source: 'DGDA_NATIONAL_REGISTRY',
    matchScore: 100,
    isExactMatch: true,
    imageUrl: '/assets/medicines/maxpro_20.png',
    lastUpdated: new Date().toISOString(),
    requiresConfirmation: false,
  },
  {
    id: 'cand-fexo-120',
    brandName: 'Fexo',
    genericName: 'Fexofenadine Hydrochloride',
    strength: '120 mg',
    dosageForm: 'Tablet',
    packSize: 'Box of 50 (5 Strips)',
    manufacturer: 'Square Pharmaceuticals PLC',
    barcode: '8941100456783',
    darNumber: '001-312-054',
    publishedMrp: 450.0,
    supplierWholesalePrice: 382.5,
    source: 'AUTHORIZED_DEPOT_FEED',
    matchScore: 100,
    isExactMatch: true,
    imageUrl: '/assets/medicines/fexo_120.png',
    lastUpdated: new Date().toISOString(),
    requiresConfirmation: false,
  },
  {
    id: 'cand-ceftron-1g',
    brandName: 'Ceftron',
    genericName: 'Ceftriaxone Sodium',
    strength: '1 g',
    dosageForm: 'Injection',
    packSize: 'Vial with 10ml Water for Injection',
    manufacturer: 'Square Pharmaceuticals PLC',
    barcode: '8941100567894',
    darNumber: '001-189-032',
    publishedMrp: 195.0,
    supplierWholesalePrice: 165.75,
    source: 'DGDA_NATIONAL_REGISTRY',
    matchScore: 100,
    isExactMatch: true,
    imageUrl: '/assets/medicines/ceftron_1g.png',
    lastUpdated: new Date().toISOString(),
    requiresConfirmation: false,
  },
  {
    id: 'cand-monas-10',
    brandName: 'Monas',
    genericName: 'Montelukast Sodium',
    strength: '10 mg',
    dosageForm: 'Tablet',
    packSize: 'Box of 30 (3 Strips)',
    manufacturer: 'Acme Laboratories Ltd.',
    barcode: '8941100678905',
    darNumber: '003-294-081',
    publishedMrp: 525.0,
    supplierWholesalePrice: 441.0,
    source: 'MEDIDATA_BD',
    matchScore: 100,
    isExactMatch: true,
    imageUrl: '/assets/medicines/monas_10.png',
    lastUpdated: new Date().toISOString(),
    requiresConfirmation: false,
  },
  {
    id: 'cand-azithrocin-500',
    brandName: 'Azithrocin',
    genericName: 'Azithromycin Dihydrate',
    strength: '500 mg',
    dosageForm: 'Tablet',
    packSize: 'Box of 18 (3 Strips)',
    manufacturer: 'Beximco Pharmaceuticals Ltd.',
    barcode: '8941100890123',
    darNumber: '028-445-092',
    publishedMrp: 630.0,
    supplierWholesalePrice: 535.5,
    source: 'DGDA_NATIONAL_REGISTRY',
    matchScore: 100,
    isExactMatch: true,
    imageUrl: '/assets/medicines/azithrocin_500.png',
    lastUpdated: new Date().toISOString(),
    requiresConfirmation: false,
  },
  {
    id: 'cand-bexidal-20',
    brandName: 'Bexidal',
    genericName: 'Omeprazole',
    strength: '20 mg',
    dosageForm: 'Capsule',
    packSize: 'Box of 100 (10 Strips)',
    manufacturer: 'Beximco Pharmaceuticals Ltd.',
    barcode: '8941100901234',
    darNumber: '028-190-061',
    publishedMrp: 600.0,
    supplierWholesalePrice: 504.0,
    source: 'MEDIDATA_BD',
    matchScore: 90,
    isExactMatch: false,
    imageUrl: '/assets/medicines/placeholder.png',
    lastUpdated: new Date().toISOString(),
    requiresConfirmation: true, // Requires confirmation because user searched Omeprazole
  },
];

// Provider-Adapter Interface
export interface IMedicineDataProvider {
  sourceName: string;
  searchCandidates(query: string, barcode?: string): Promise<CandidateMedicineMatch[]>;
  verifyPrice(medicineId: string, currentPrice: number): Promise<{
    publishedMrp: number;
    isFresh: boolean;
    verificationStatus: 'VERIFIED' | 'NEEDS_VERIFICATION' | 'STALE' | 'DISCREPANCY';
    lastChecked: string;
  }>;
}

// 1. DGDA National Registry Adapter
export class DgdaNationalRegistryAdapter implements IMedicineDataProvider {
  sourceName = 'DGDA_NATIONAL_REGISTRY';

  async searchCandidates(query: string, barcode?: string): Promise<CandidateMedicineMatch[]> {
    const cleanQuery = query.toLowerCase().trim();
    return AUTHORIZED_DGDA_DEPOT_RECORDS.filter((item) => {
      if (barcode && item.barcode === barcode) return true;
      if (cleanQuery) {
        return (
          item.brandName.toLowerCase().includes(cleanQuery) ||
          item.genericName.toLowerCase().includes(cleanQuery) ||
          item.darNumber.toLowerCase().includes(cleanQuery)
        );
      }
      return false;
    });
  }

  async verifyPrice(medicineId: string, currentPrice: number) {
    const match = AUTHORIZED_DGDA_DEPOT_RECORDS.find((m) => m.id === medicineId || m.brandName.toLowerCase() === medicineId.toLowerCase());
    if (!match) {
      return {
        publishedMrp: currentPrice,
        isFresh: false,
        verificationStatus: 'NEEDS_VERIFICATION' as const,
        lastChecked: new Date().toISOString(),
      };
    }
    const isDiscrepancy = Math.abs(match.publishedMrp - currentPrice) > 5;
    return {
      publishedMrp: match.publishedMrp,
      isFresh: true,
      verificationStatus: isDiscrepancy ? ('DISCREPANCY' as const) : ('VERIFIED' as const),
      lastChecked: new Date().toISOString(),
    };
  }
}

// 2. Authorized Depot Feed Adapter
export class AuthorizedDepotFeedAdapter implements IMedicineDataProvider {
  sourceName = 'AUTHORIZED_DEPOT_FEED';

  async searchCandidates(query: string, barcode?: string): Promise<CandidateMedicineMatch[]> {
    const cleanQuery = query.toLowerCase().trim();
    return AUTHORIZED_DGDA_DEPOT_RECORDS.filter((item) => {
      if (barcode && item.barcode === barcode) return true;
      if (cleanQuery) {
        return (
          item.brandName.toLowerCase().includes(cleanQuery) ||
          item.manufacturer.toLowerCase().includes(cleanQuery)
        );
      }
      return false;
    }).map((item) => ({ ...item, source: 'AUTHORIZED_DEPOT_FEED' }));
  }

  async verifyPrice(medicineId: string, currentPrice: number) {
    const match = AUTHORIZED_DGDA_DEPOT_RECORDS.find((m) => m.id === medicineId);
    return {
      publishedMrp: match?.publishedMrp || currentPrice,
      isFresh: true,
      verificationStatus: 'VERIFIED' as const,
      lastChecked: new Date().toISOString(),
    };
  }
}

// 3. Composite Search Coordinator
export async function searchAllMedicineSources(query: string, barcode?: string): Promise<CandidateMedicineMatch[]> {
  const dgda = new DgdaNationalRegistryAdapter();
  const depot = new AuthorizedDepotFeedAdapter();

  const [res1, res2] = await Promise.all([
    dgda.searchCandidates(query, barcode),
    depot.searchCandidates(query, barcode),
  ]);

  // Deduplicate by barcode + brandName
  const seen = new Set<string>();
  const combined: CandidateMedicineMatch[] = [];

  for (const item of [...res1, ...res2]) {
    const key = `${item.barcode}-${item.brandName}-${item.strength}-${item.packSize}`;
    if (!seen.has(key)) {
      seen.add(key);
      combined.push(item);
    }
  }

  return combined;
}
