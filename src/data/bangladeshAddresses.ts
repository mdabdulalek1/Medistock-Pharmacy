import { BangladeshDivision, BangladeshDistrict, BangladeshThana, SavedDeliveryAddress } from '../types/pharmacy';

export const BANGLADESH_DIVISIONS: BangladeshDivision[] = [
  { id: 'div-dhaka', nameEn: 'Dhaka', nameBn: 'ঢাকা' },
  { id: 'div-ctg', nameEn: 'Chattogram', nameBn: 'চট্টগ্রাম' },
  { id: 'div-syl', nameEn: 'Sylhet', nameBn: 'সিলেট' },
  { id: 'div-raj', nameEn: 'Rajshahi', nameBn: 'রাজশাহী' },
  { id: 'div-khulna', nameEn: 'Khulna', nameBn: 'খুলনা' },
  { id: 'div-barishal', nameEn: 'Barishal', nameBn: 'বরিশাল' },
  { id: 'div-rangpur', nameEn: 'Rangpur', nameBn: 'রংপুর' },
  { id: 'div-mym', nameEn: 'Mymensingh', nameBn: 'ময়মনসিংহ' },
];

export const BANGLADESH_DISTRICTS: BangladeshDistrict[] = [
  // Dhaka Division
  { id: 'dist-dhaka', divisionId: 'div-dhaka', nameEn: 'Dhaka', nameBn: 'ঢাকা' },
  { id: 'dist-gazipur', divisionId: 'div-dhaka', nameEn: 'Gazipur', nameBn: 'গাজীপুর' },
  { id: 'dist-narayanganj', divisionId: 'div-dhaka', nameEn: 'Narayanganj', nameBn: 'নারায়ণগঞ্জ' },
  // Chattogram Division
  { id: 'dist-ctg', divisionId: 'div-ctg', nameEn: 'Chattogram', nameBn: 'চট্টগ্রাম' },
  { id: 'dist-cox', divisionId: 'div-ctg', nameEn: "Cox's Bazar", nameBn: 'কক্সবাজার' },
  // Sylhet Division
  { id: 'dist-sylhet', divisionId: 'div-syl', nameEn: 'Sylhet', nameBn: 'সিলেট' },
  { id: 'dist-moulvibazar', divisionId: 'div-syl', nameEn: 'Moulvibazar', nameBn: 'মৌলভীবাজার' },
  // Rajshahi Division
  { id: 'dist-rajshahi', divisionId: 'div-raj', nameEn: 'Rajshahi', nameBn: 'রাজশাহী' },
  { id: 'dist-bogra', divisionId: 'div-raj', nameEn: 'Bogura', nameBn: 'বগুড়া' },
  // Khulna Division
  { id: 'dist-khulna', divisionId: 'div-khulna', nameEn: 'Khulna', nameBn: 'খুলনা' },
  { id: 'dist-jessore', divisionId: 'div-khulna', nameEn: 'Jashore', nameBn: 'যশোর' },
  // Barishal Division
  { id: 'dist-barishal', divisionId: 'div-barishal', nameEn: 'Barishal', nameBn: 'বরিশাল' },
  // Rangpur Division
  { id: 'dist-rangpur', divisionId: 'div-rangpur', nameEn: 'Rangpur', nameBn: 'রংপুর' },
  // Mymensingh Division
  { id: 'dist-mymensingh', divisionId: 'div-mym', nameEn: 'Mymensingh', nameBn: 'ময়মনসিংহ' },
];

export const BANGLADESH_THANAS: BangladeshThana[] = [
  // Dhaka District Thanas
  { id: 'thana-dhanmondi', districtId: 'dist-dhaka', nameEn: 'Dhanmondi', nameBn: 'ধানমন্ডি', postalCode: '1209', deliveryCoverage: 'FULL_COVERAGE', standardDeliveryFeeBDT: 60 },
  { id: 'thana-gulshan', districtId: 'dist-dhaka', nameEn: 'Gulshan', nameBn: 'গুলশান', postalCode: '1212', deliveryCoverage: 'FULL_COVERAGE', standardDeliveryFeeBDT: 60 },
  { id: 'thana-banani', districtId: 'dist-dhaka', nameEn: 'Banani', nameBn: 'বনানী', postalCode: '1213', deliveryCoverage: 'FULL_COVERAGE', standardDeliveryFeeBDT: 60 },
  { id: 'thana-uttara', districtId: 'dist-dhaka', nameEn: 'Uttara', nameBn: 'উত্তরা', postalCode: '1230', deliveryCoverage: 'FULL_COVERAGE', standardDeliveryFeeBDT: 60 },
  { id: 'thana-mirpur', districtId: 'dist-dhaka', nameEn: 'Mirpur', nameBn: 'মিরপুর', postalCode: '1216', deliveryCoverage: 'FULL_COVERAGE', standardDeliveryFeeBDT: 60 },
  { id: 'thana-mohammadpur', districtId: 'dist-dhaka', nameEn: 'Mohammadpur', nameBn: 'মোহাম্মদপুর', postalCode: '1207', deliveryCoverage: 'FULL_COVERAGE', standardDeliveryFeeBDT: 60 },
  { id: 'thana-motijheel', districtId: 'dist-dhaka', nameEn: 'Motijheel', nameBn: 'মতিঝিল', postalCode: '1000', deliveryCoverage: 'FULL_COVERAGE', standardDeliveryFeeBDT: 60 },
  { id: 'thana-shahbagh', districtId: 'dist-dhaka', nameEn: 'Shahbagh', nameBn: 'শাহবাগ', postalCode: '1000', deliveryCoverage: 'FULL_COVERAGE', standardDeliveryFeeBDT: 60 },
  { id: 'thana-badda', districtId: 'dist-dhaka', nameEn: 'Badda', nameBn: 'বাড্ডা', postalCode: '1212', deliveryCoverage: 'FULL_COVERAGE', standardDeliveryFeeBDT: 60 },
  { id: 'thana-khilgaon', districtId: 'dist-dhaka', nameEn: 'Khilgaon', nameBn: 'খিলগাঁও', postalCode: '1219', deliveryCoverage: 'FULL_COVERAGE', standardDeliveryFeeBDT: 60 },
  { id: 'thana-savar', districtId: 'dist-dhaka', nameEn: 'Savar', nameBn: 'সাভার', postalCode: '1340', deliveryCoverage: 'SUBURB_COVERAGE', standardDeliveryFeeBDT: 100 },

  // Gazipur District
  { id: 'thana-gazipur-sadar', districtId: 'dist-gazipur', nameEn: 'Gazipur Sadar', nameBn: 'গাজীপুর সদর', postalCode: '1700', deliveryCoverage: 'SUBURB_COVERAGE', standardDeliveryFeeBDT: 100 },
  { id: 'thana-tongi', districtId: 'dist-gazipur', nameEn: 'Tongi', nameBn: 'টঙ্গী', postalCode: '1710', deliveryCoverage: 'FULL_COVERAGE', standardDeliveryFeeBDT: 70 },

  // Narayanganj District
  { id: 'thana-narayanganj-sadar', districtId: 'dist-narayanganj', nameEn: 'Narayanganj Sadar', nameBn: 'নারায়ণগঞ্জ সদর', postalCode: '1400', deliveryCoverage: 'SUBURB_COVERAGE', standardDeliveryFeeBDT: 100 },

  // Chattogram District
  { id: 'thana-double-mooring', districtId: 'dist-ctg', nameEn: 'Double Mooring (Agrabad)', nameBn: 'ডাবল মুরিং (আগ্রাবাদ)', postalCode: '4100', deliveryCoverage: 'FULL_COVERAGE', standardDeliveryFeeBDT: 60 },
  { id: 'thana-kotwali-ctg', districtId: 'dist-ctg', nameEn: 'Kotwali (Chattogram)', nameBn: 'কোতোয়ালী (চট্টগ্রাম)', postalCode: '4000', deliveryCoverage: 'FULL_COVERAGE', standardDeliveryFeeBDT: 60 },
  { id: 'thana-panchlaish', districtId: 'dist-ctg', nameEn: 'Panchlaish', nameBn: 'পাঁচলাইশ', postalCode: '4203', deliveryCoverage: 'FULL_COVERAGE', standardDeliveryFeeBDT: 60 },
  { id: 'thana-khulshi', districtId: 'dist-ctg', nameEn: 'Khulshi', nameBn: 'খুলশী', postalCode: '4225', deliveryCoverage: 'FULL_COVERAGE', standardDeliveryFeeBDT: 60 },

  // Sylhet District
  { id: 'thana-kotwali-syl', districtId: 'dist-sylhet', nameEn: 'Kotwali (Zindabazar)', nameBn: 'কোতোয়ালী (জিন্দাবাজার)', postalCode: '3100', deliveryCoverage: 'FULL_COVERAGE', standardDeliveryFeeBDT: 60 },
  { id: 'thana-shah-paran', districtId: 'dist-sylhet', nameEn: 'Shah Paran', nameBn: 'শাহ পরাণ', postalCode: '3104', deliveryCoverage: 'FULL_COVERAGE', standardDeliveryFeeBDT: 60 },

  // Rajshahi District
  { id: 'thana-boalia', districtId: 'dist-rajshahi', nameEn: 'Boalia', nameBn: 'বোয়ালিয়া', postalCode: '6000', deliveryCoverage: 'FULL_COVERAGE', standardDeliveryFeeBDT: 60 },
  { id: 'thana-motihar', districtId: 'dist-rajshahi', nameEn: 'Motihar', nameBn: 'মতিহার', postalCode: '6205', deliveryCoverage: 'FULL_COVERAGE', standardDeliveryFeeBDT: 60 },

  // Khulna District
  { id: 'thana-khulna-sadar', districtId: 'dist-khulna', nameEn: 'Khulna Sadar', nameBn: 'খুলনা সদর', postalCode: '9100', deliveryCoverage: 'COURIER_ONLY', standardDeliveryFeeBDT: 130 },

  // Barishal District
  { id: 'thana-barishal-sadar', districtId: 'dist-barishal', nameEn: 'Barishal Sadar', nameBn: 'বরিশাল সদর', postalCode: '8200', deliveryCoverage: 'COURIER_ONLY', standardDeliveryFeeBDT: 130 },

  // Rangpur District
  { id: 'thana-rangpur-sadar', districtId: 'dist-rangpur', nameEn: 'Rangpur Sadar', nameBn: 'রংপুর সদর', postalCode: '5400', deliveryCoverage: 'COURIER_ONLY', standardDeliveryFeeBDT: 130 },

  // Mymensingh District
  { id: 'thana-mymensingh-sadar', districtId: 'dist-mymensingh', nameEn: 'Mymensingh Sadar', nameBn: 'ময়মনসিংহ সদর', postalCode: '2200', deliveryCoverage: 'COURIER_ONLY', standardDeliveryFeeBDT: 130 },
];

export const INITIAL_SAVED_ADDRESSES: SavedDeliveryAddress[] = [
  {
    id: 'addr-01',
    userId: 'usr-cust-01',
    label: 'Home',
    recipientName: 'Khandakar Rafiqul Hasan',
    recipientPhone: '+880 1711-889900',
    divisionId: 'div-dhaka',
    divisionName: 'Dhaka (ঢাকা)',
    districtId: 'dist-dhaka',
    districtName: 'Dhaka (ঢাকা)',
    thanaId: 'thana-dhanmondi',
    thanaName: 'Dhanmondi (ধানমন্ডি)',
    postalCode: '1209',
    addressLine: 'House 14/A, Road 8/A, Dhanmondi R/A, Apt 4B',
    isDefault: true,
    deliveryInstructions: 'Call before arrival. Leave with building security if unavailable.',
  },
  {
    id: 'addr-02',
    userId: 'usr-cust-01',
    label: 'Work',
    recipientName: 'Khandakar Rafiqul Hasan',
    recipientPhone: '+880 1711-889900',
    divisionId: 'div-dhaka',
    divisionName: 'Dhaka (ঢাকা)',
    districtId: 'dist-dhaka',
    districtName: 'Dhaka (ঢাকা)',
    thanaId: 'thana-motijheel',
    thanaName: 'Motijheel (মতিঝিল)',
    postalCode: '1000',
    addressLine: 'Shapla Bhaban, Level 7, 49 Motijheel C/A',
    isDefault: false,
    deliveryInstructions: 'Deliver during office hours (10 AM - 5 PM).',
  },
];
