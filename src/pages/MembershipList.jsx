import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Modal from '../components/Modal';
import SearchFilterBar from '../components/SearchFilterBar';
import FilterSelect from '../components/FilterSelect';
import SearchableFormSelect from '../components/SearchableFormSelect';
import {
  UserCheck,
  User,
  Plus,
  Search,
  Edit3,
  Trash2,
  Eye,
  Printer,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  X,
  AlertCircle,
  AlertTriangle,
  Building,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Layers,
  Check,
  Download,
  Filter,
  RefreshCw,
  Sparkles,
  Award,
  TrendingUp,
  Coins,
  Receipt,
  Info
} from 'lucide-react';
import {
  getStoredMembers,
  saveStoredMembers,
  getStoredMembershipTypes,
  getStoredReceipts,
  findMatchingReceiptForMember,
  calculateMemberMembershipStatus,
  getStoredStates,
  getStoredDistricts,
  getStoredTaluks,
  getStoredPostalCodes,
  lookupLocationByPin,
  getStoredGothras,
  getActivePaymentModes
} from '../utils/receiptStore';
import CountryCodeSelect from '../components/CountryCodeSelect';
import { validateInternationalPhone } from '../utils/phoneValidation';
import { formatDate, formatDateTime, toISODate } from '../utils/dateUtils';
import DateInput from '../components/DateInput';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const QUALIFICATIONS_LIST = [
  'BE',
  'BTech',
  'MBA',
  'MCA',
  'ME',
  'MTech',
  'MS Eng',
  'CA',
  'CS',
  'MBBS',
  'MD',
  'MS Med',
  'MSc',
  'MCom',
  'MA',
  'MFA',
  'ML',
  'BCom',
  'BSc',
  'BCA',
  'BBA',
  'BA',
  'BDS',
  'BFA',
  'BArch',
  'BFD',
  'BDes',
  'BJMC',
  'LLB',
  'BAMS',
  'BPharm',
  'PhD',
  'Diploma',
  'ICWA',
  'MPharm',
  'BHMS',
  'BHM',
  'BSc in Nursing',
  'MSc in Nursing',
  'BL',
  'MHA',
  'BLA',
  'BSc MLT',
  'MSc MLT',
  'BNYS',
  'BPT',
  'MPT',
  'MPED',
  'PUC',
  'HIGH SCHOOL',
  'OTHERS',
  'ANY'
];


const BEHALF_OPTIONS = [
  'Self',
  'Family',
  'Father',
  'Mother',
  'Son',
  'Daughter',
  'Spouse',
  'Relative',
  'Others'
];

export default function MembershipList() {
  const location = useLocation();
  const navigate = useNavigate();
  // ----------------------------------------------------
  // MASTER STORES
  // ----------------------------------------------------
  const [members, setMembers] = useState(getStoredMembers());
  const [membershipTypes, setMembershipTypes] = useState(getStoredMembershipTypes());
  const [receipts, setReceipts] = useState(getStoredReceipts());
  const [states, setStates] = useState(getStoredStates());
  const [districts, setDistricts] = useState(getStoredDistricts());
  const [taluks, setTaluks] = useState(getStoredTaluks());
  const [postalCodes, setPostalCodes] = useState(getStoredPostalCodes());
  const [gothras] = useState(getStoredGothras());
  const [paymentModes, setPaymentModes] = useState(getActivePaymentModes());

  // Reload fresh data from stores on mount
  useEffect(() => {
    setMembers(getStoredMembers());
    setMembershipTypes(getStoredMembershipTypes());
    setReceipts(getStoredReceipts());
    setStates(getStoredStates());
    setDistricts(getStoredDistricts());
    setTaluks(getStoredTaluks());
    setPostalCodes(getStoredPostalCodes());
    setPaymentModes(getActivePaymentModes());

    const handleModesChanged = () => setPaymentModes(getActivePaymentModes());
    window.addEventListener('hms_payment_modes_updated', handleModesChanged);
    return () => window.removeEventListener('hms_payment_modes_updated', handleModesChanged);
  }, []);

  const persistMembers = (updated) => {
    setMembers(updated);
    saveStoredMembers(updated);
  };

  // Toast feedback
  const [toastMessage, setToastMessage] = useState(null);
  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // ----------------------------------------------------
  // SEARCH, FILTER & PAGINATION STATE
  // ----------------------------------------------------
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [stateFilter, setStateFilter] = useState('ALL');
  const [districtFilter, setDistrictFilter] = useState('ALL');

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Row Selection (Set of Selected Members)
  const [selectedMemberIds, setSelectedMemberIds] = useState(new Set());

  // ----------------------------------------------------
  // MODAL STATES
  // ----------------------------------------------------
  // 1. Add / Edit Member Modal
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formModalMode, setFormModalMode] = useState('add'); // 'add' | 'edit'
  const [editingMember, setEditingMember] = useState(null);

  // Form tab inside Add/Edit modal: 'membershipDetails' | 'paymentInfo'
  const [activeFormSection, setActiveFormSection] = useState('membershipDetails');
  const fileInputRef = useRef(null);

  const initialFormState = {
    // Top dropdowns
    membershipTypeCategory: 'Only Havyaka Mahasabha Membership',
    membershipTypeId: '',
    membershipType: '',

    // Photo
    photoUrl: '',

    // Personal / Basic Info
    name: '',
    fatherHusbandName: '',
    mobileCountryCode: '+91',
    mobileCountryIso: 'IN',
    mobile: '',
    whatsappCountryCode: '+91',
    whatsappCountryIso: 'IN',
    whatsappNumber: '',
    email: '',
    birthDate: '',
    age: '',

    // Details Grid
    gothra: '',
    gender: '',
    bloodGroup: '',
    aadharNumber: '',
    address: '',
    postalCode: '',
    nativePlace: '',
    appliedOnBehalfOf: 'Self',
    qualification: '',
    employment: '',
    magazineNeeded: 'YES',

    // Referred By
    referredMembershipNo: '',
    referredMembershipName: '',

    // Family Membership Details
    familyMembershipNo: '',
    familyMembershipName: '',

    // Payment Information
    paymentMode: 'Cash',
    bankAccount: '',
    amount: '',
    receiptDate: new Date().toISOString().split('T')[0],
    transactionId: '',
    transactionDate: '',
    paymentRemarks: ''
  };

  const [formData, setFormData] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState({});
  const [isWhatsAppSameAsMobile, setIsWhatsAppSameAsMobile] = useState(false);

  // 2. View Member Details Modal
  const [viewingMember, setViewingMember] = useState(null);

  // 3. Status Change Confirmation Modal
  const [statusDialog, setStatusDialog] = useState(null); // { member, nextStatus }

  // 4. Delete Confirmation Modal
  const [deleteDialog, setDeleteDialog] = useState(null); // member

  // 5. Label Preview Modal
  const [isLabelPreviewOpen, setIsLabelPreviewOpen] = useState(false);
  const printContainerRef = useRef(null);

  // Active membership types available for new registrations
  const activeMembershipTypes = useMemo(() => {
    return membershipTypes.filter((mt) => formModalMode === 'edit' || mt.status === 'Active');
  }, [membershipTypes, formModalMode]);

  // Filtered districts for Add/Edit Form based on selected State
  const formDistricts = useMemo(() => {
    return districts.filter((d) => d.stateId === formData.stateId && (formModalMode === 'edit' || d.status === 'Active'));
  }, [districts, formData.stateId, formModalMode]);

  // Filtered taluks for Add/Edit Form based on selected District
  const formTaluks = useMemo(() => {
    return taluks.filter((t) => t.districtId === formData.districtId && (formModalMode === 'edit' || t.status === 'Active'));
  }, [taluks, formData.districtId, formModalMode]);

  // Districts for table filter dropdown based on table state filter
  const tableFilterDistricts = useMemo(() => {
    if (stateFilter === 'ALL') return districts;
    const st = states.find((s) => s.name.toLowerCase() === stateFilter.toLowerCase());
    return st ? districts.filter((d) => d.stateId === st.id) : districts;
  }, [districts, states, stateFilter]);

  // ----------------------------------------------------
  // FILTERING LOGIC
  // ----------------------------------------------------
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const memberName = (m.fullName || m.name || '').toLowerCase();
        const memberNo = (m.membershipNumber || m.id || '').toLowerCase();
        const mobile = (m.mobile || m.mobileNumber || '').toLowerCase();
        const email = (m.email || '').toLowerCase();
        const pinLookup = m.postalCode ? lookupLocationByPin(m.postalCode) : null;
        const city = (m.city || m.place || m.talukName || m.taluk || m.locality || (pinLookup?.found ? pinLookup.talukName : '') || '').toLowerCase();
        const district = (m.districtName || m.district || (pinLookup?.found ? pinLookup.districtName : '') || '').toLowerCase();
        const pin = (m.postalCode || '').toLowerCase();

        if (
          !memberName.includes(q) &&
          !memberNo.includes(q) &&
          !mobile.includes(q) &&
          !email.includes(q) &&
          !city.includes(q) &&
          !district.includes(q) &&
          !pin.includes(q)
        ) {
          return false;
        }
      }

      // Membership Type Filter (Dynamically calculated based on cumulative membership receipts & Master)
      if (typeFilter !== 'ALL') {
        const memStatus = calculateMemberMembershipStatus(m, receipts, membershipTypes);
        const currentType = (memStatus.currentMembershipType || '').toLowerCase();
        if (typeFilter === 'None' || typeFilter === 'Not Yet Reached') {
          if (memStatus.isMilestoneReached) return false;
        } else {
          if (currentType !== typeFilter.toLowerCase()) return false;
        }
      }

      // Status Filter
      if (statusFilter !== 'ALL') {
        const normStatus = m.status === 'Approved' ? 'Active' : m.status;
        if (normStatus !== statusFilter) return false;
      }

      // State Filter
      if (stateFilter !== 'ALL') {
        const pinLookup = m.postalCode ? lookupLocationByPin(m.postalCode) : null;
        const memberState = (m.stateName || m.state || (pinLookup?.found ? pinLookup.stateName : '') || '').toLowerCase();
        if (memberState !== stateFilter.toLowerCase()) return false;
      }

      // District Filter
      if (districtFilter !== 'ALL') {
        const pinLookup = m.postalCode ? lookupLocationByPin(m.postalCode) : null;
        const memberDistrict = (m.districtName || m.district || (pinLookup?.found ? pinLookup.districtName : '') || '').toLowerCase();
        if (memberDistrict !== districtFilter.toLowerCase()) return false;
      }

      return true;
    });
  }, [members, searchQuery, typeFilter, statusFilter, stateFilter, districtFilter]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredMembers.length / pageSize));
  const paginatedMembers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredMembers.slice(start, start + pageSize);
  }, [filteredMembers, currentPage, pageSize]);

  // Checkbox selection helpers
  const isAllPaginatedSelected = useMemo(() => {
    if (paginatedMembers.length === 0) return false;
    return paginatedMembers.every((m) => selectedMemberIds.has(m.id));
  }, [paginatedMembers, selectedMemberIds]);

  const handleToggleSelectAll = () => {
    const next = new Set(selectedMemberIds);
    if (isAllPaginatedSelected) {
      paginatedMembers.forEach((m) => next.delete(m.id));
    } else {
      paginatedMembers.forEach((m) => next.add(m.id));
    }
    setSelectedMemberIds(next);
  };

  const handleToggleSelectRow = (id) => {
    const next = new Set(selectedMemberIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedMemberIds(next);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setTypeFilter('ALL');
    setStatusFilter('ALL');
    setStateFilter('ALL');
    setDistrictFilter('ALL');
    setCurrentPage(1);
  };

  // ----------------------------------------------------
  // PIN LOOKUP HELPER (LOCATION SETUP INTEGRATION)
  // ----------------------------------------------------
  const handlePinCodeLookup = (pin) => {
    if (!pin || pin.length !== 6 || !/^\d{6}$/.test(pin)) return;

    const lookup = lookupLocationByPin(pin);
    if (lookup.found) {
      // Cascading match against master states & districts
      const matchState = states.find(
        (s) => s.id === lookup.stateId || s.name.toLowerCase() === (lookup.stateName || '').toLowerCase()
      ) || states[0];

      const stateDistrictsList = districts.filter(
        (d) => d.stateId === (matchState ? matchState.id : lookup.stateId)
      );

      const matchDistrict = stateDistrictsList.find(
        (d) => d.id === lookup.districtId || d.name.toLowerCase() === (lookup.districtName || '').toLowerCase()
      ) || districts.find((d) => d.id === lookup.districtId || d.name.toLowerCase() === (lookup.districtName || '').toLowerCase());

      setFormData((prev) => ({
        ...prev,
        postalCode: pin,
        country: 'India',
        stateId: matchState ? matchState.id : (lookup.stateId || 'ST-01'),
        stateName: matchState ? matchState.name : (lookup.stateName || 'Karnataka'),
        districtId: matchDistrict ? matchDistrict.id : (lookup.districtId || ''),
        districtName: matchDistrict ? matchDistrict.name : (lookup.districtName || ''),
        post: lookup.area || '',
        place: lookup.talukName || lookup.area || '',
        city: lookup.area || lookup.talukName || '',
        area: lookup.area || ''
      }));

      // Clear any prior PIN error
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next.postalCode;
        return next;
      });

      showToast(`Location auto-resolved: ${lookup.area}, ${lookup.talukName ? lookup.talukName + ', ' : ''}${lookup.districtName}, ${lookup.stateName}`);
    } else {
      // Clear previously auto-populated location fields
      setFormData((prev) => ({
        ...prev,
        districtId: '',
        districtName: '',
        post: '',
        place: '',
        city: '',
        area: ''
      }));

      const errorMsg = 'PIN Code not found in Location Setup. Please import the PIN Code data or verify the PIN Code.';
      setFormErrors((prev) => ({
        ...prev,
        postalCode: errorMsg
      }));
      showToast(errorMsg, 'error');
    }
  };

  // Helper to compute age from Date of Birth
  const calculateAge = (dob) => {
    if (!dob) return '';
    const iso = toISODate(dob) || dob;
    const birth = new Date(iso);
    const now = new Date();
    if (isNaN(birth.getTime())) return '';
    let years = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
      years--;
    }
    return years >= 0 ? String(years) : '';
  };

  const handleDobChange = (e) => {
    const dob = e.target.value;
    const age = calculateAge(dob);
    setFormData((prev) => ({ ...prev, birthDate: dob, age }));
    if (formErrors.birthDate) {
      setFormErrors((prev) => ({ ...prev, birthDate: '' }));
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setFormData((prev) => ({ ...prev, photoUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMembershipTypeSelect = (typeId) => {
    const tObj = membershipTypes.find((mt) => mt.id === typeId);
    const price = tObj?.currentPrice || tObj?.price || tObj?.fee || 1000;
    setFormData((prev) => ({
      ...prev,
      membershipTypeId: typeId,
      membershipType: tObj ? tObj.name : '',
      amount: prev.amount ? prev.amount : String(price)
    }));
    if (formErrors.membershipTypeId) {
      setFormErrors((prev) => ({ ...prev, membershipTypeId: '' }));
    }
  };

  // ----------------------------------------------------
  // ADD / EDIT FORM HANDLERS
  // ----------------------------------------------------
  const handleOpenAddModal = () => {
    setFormModalMode('add');
    setEditingMember(null);
    setActiveFormSection('membershipDetails');

    const firstActiveType = activeMembershipTypes[0];
    const defaultPrice = firstActiveType?.currentPrice || firstActiveType?.price || 1000;

    setFormData({
      ...initialFormState,
      membershipTypeId: firstActiveType ? firstActiveType.id : '',
      membershipType: firstActiveType ? firstActiveType.name : '',
      amount: String(defaultPrice),
      gothra: gothras[0] || 'Vishwamitra',
      appliedOnBehalfOf: 'Self',
      magazineNeeded: 'YES'
    });
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (member) => {
    setFormModalMode('edit');
    setEditingMember(member);
    setActiveFormSection('membershipDetails');

    const matchedType = membershipTypes.find(
      (mt) => mt.id === member.membershipTypeId || mt.name === member.membershipType
    );

    setFormData({
      membershipTypeCategory: member.membershipTypeCategory || 'Only Havyaka Mahasabha Membership',
      membershipTypeId: matchedType ? matchedType.id : member.membershipTypeId || '',
      membershipType: matchedType ? matchedType.name : member.membershipType || '',

      photoUrl: member.photoUrl || '',

      name: member.fullName || member.name || '',
      fatherHusbandName: member.fatherHusbandName || '',
      mobileCountryCode: member.mobileCountryCode || member.countryCode || member.phone_country_code || '+91',
      mobileCountryIso: member.mobileCountryIso || member.countryIso || 'IN',
      mobile: member.mobile || member.mobileNumber || member.phone_number || '',
      whatsappCountryCode: member.whatsappCountryCode || member.whatsapp_country_code || '+91',
      whatsappCountryIso: member.whatsappCountryIso || 'IN',
      whatsappNumber: member.whatsappNumber || member.whatsapp_number || (member.isWhatsAppSameAsMobile ? (member.mobile || member.mobileNumber || '') : ''),
      email: member.email || '',
      birthDate: member.birthDate || '',
      age: member.age || calculateAge(member.birthDate),

      gothra: member.gothra || '',
      gender: member.gender || 'Male',
      bloodGroup: member.bloodGroup || '',
      aadharNumber: member.aadharNumber || '',
      address: member.addressLine || member.address || '',
      postalCode: member.postalCode || '',
      nativePlace: member.nativePlace || member.nativeDetails || '',
      appliedOnBehalfOf: member.appliedOnBehalfOf || 'Self',
      qualification: member.qualification || '',
      employment: member.employment || member.profession || '',
      magazineNeeded: member.magazineNeeded || (member.magazineRemarks?.toLowerCase().includes('no') ? 'NO' : 'YES'),

      referredMembershipNo: member.referredMembershipNo || '',
      referredMembershipName: member.referredMembershipName || '',
      familyMembershipNo: member.familyMembershipNo || '',
      familyMembershipName: member.familyMembershipName || '',

      paymentMode: member.paymentMode || 'Cash',
      bankAccount: member.bankAccount || '',
      amount: String(member.amount || matchedType?.currentPrice || 1000),
      receiptDate: member.receiptDate || new Date().toISOString().split('T')[0],
      transactionId: member.transactionId || '',
      transactionDate: member.transactionDate || '',
      paymentRemarks: member.paymentRemarks || member.remarks || ''
    });
    setFormErrors({});
    setIsWhatsAppSameAsMobile(
      Boolean(member.isWhatsAppSameAsMobile) ||
      (Boolean(member.mobile) && (member.mobile === member.whatsappNumber || member.mobile === member.whatsapp_number))
    );
    setIsFormModalOpen(true);
  };

  const handleMobileCountryChange = ({ dialCode, countryIso }) => {
    setFormData((prev) => ({
      ...prev,
      mobileCountryCode: dialCode,
      mobileCountryIso: countryIso,
      ...(isWhatsAppSameAsMobile ? { whatsappCountryCode: dialCode, whatsappCountryIso: countryIso } : {})
    }));
    if (formErrors.mobile) {
      setFormErrors((prev) => ({ ...prev, mobile: '' }));
    }
  };

  const handleWhatsAppCountryChange = ({ dialCode, countryIso }) => {
    setFormData((prev) => ({
      ...prev,
      whatsappCountryCode: dialCode,
      whatsappCountryIso: countryIso
    }));
    if (formErrors.whatsappNumber) {
      setFormErrors((prev) => ({ ...prev, whatsappNumber: '' }));
    }
  };

  const handleMobileChange = (val) => {
    let cleanVal = val.replace(/[^\d]/g, '');
    const dialDigits = (formData.mobileCountryCode || '').replace(/\D/g, '');
    if (dialDigits && cleanVal.startsWith(dialDigits) && cleanVal.length > dialDigits.length + 5) {
      cleanVal = cleanVal.slice(dialDigits.length);
    }

    setFormData((prev) => ({
      ...prev,
      mobile: cleanVal,
      ...(isWhatsAppSameAsMobile ? { whatsappNumber: cleanVal } : {})
    }));
    if (formErrors.mobile) setFormErrors((prev) => ({ ...prev, mobile: '' }));
    if (isWhatsAppSameAsMobile && formErrors.whatsappNumber) {
      setFormErrors((prev) => ({ ...prev, whatsappNumber: '' }));
    }
  };

  const handleWhatsAppChange = (val) => {
    let cleanVal = val.replace(/[^\d]/g, '');
    const dialDigits = (formData.whatsappCountryCode || '').replace(/\D/g, '');
    if (dialDigits && cleanVal.startsWith(dialDigits) && cleanVal.length > dialDigits.length + 5) {
      cleanVal = cleanVal.slice(dialDigits.length);
    }

    setFormData((prev) => ({
      ...prev,
      whatsappNumber: cleanVal
    }));
    if (formErrors.whatsappNumber) setFormErrors((prev) => ({ ...prev, whatsappNumber: '' }));
  };

  const handleWhatsAppSameAsMobileToggle = (checked) => {
    setIsWhatsAppSameAsMobile(checked);
    setFormData((prev) => ({
      ...prev,
      whatsappCountryCode: checked ? prev.mobileCountryCode : prev.whatsappCountryCode,
      whatsappCountryIso: checked ? prev.mobileCountryIso : prev.whatsappCountryIso,
      whatsappNumber: checked ? prev.mobile : ''
    }));
    if (formErrors.whatsappNumber) {
      setFormErrors((prev) => ({ ...prev, whatsappNumber: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    const cleanName = formData.name.trim();
    const cleanFather = formData.fatherHusbandName.trim();
    const cleanEmail = formData.email.trim();
    const cleanAadhar = formData.aadharNumber.trim();
    const cleanAddress = formData.address.trim();
    const cleanPin = formData.postalCode.trim();

    if (!formData.membershipTypeId) {
      errors.membershipTypeId = 'Please select a Havyaka Membership Type';
    }

    if (!cleanName) {
      errors.name = 'New Member Name is required';
    }

    if (!cleanFather) {
      errors.fatherHusbandName = 'Father / Husband Name is required';
    }

    // International Mobile Validation
    const mobileValidation = validateInternationalPhone(
      formData.mobile,
      formData.mobileCountryIso || 'IN',
      formData.mobileCountryCode || '+91'
    );
    if (!mobileValidation.isValid) {
      errors.mobile = mobileValidation.errorMsg;
    }

    // International WhatsApp Validation (optional unless non-empty)
    if (formData.whatsappNumber && formData.whatsappNumber.trim()) {
      const whatsappValidation = validateInternationalPhone(
        formData.whatsappNumber,
        formData.whatsappCountryIso || 'IN',
        formData.whatsappCountryCode || '+91'
      );
      if (!whatsappValidation.isValid) {
        errors.whatsappNumber = whatsappValidation.errorMsg;
      }
    }

    if (!cleanEmail) {
      errors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.birthDate) {
      errors.birthDate = 'Date of Birth is required';
    }

    if (!formData.gothra) {
      errors.gothra = 'Please select Gotra';
    }

    if (!formData.gender) {
      errors.gender = 'Please select Gender';
    }

    if (!cleanAadhar) {
      errors.aadharNumber = 'Aadhar Number is required';
    } else if (!/^\d{12}$/.test(cleanAadhar.replace(/\s/g, ''))) {
      errors.aadharNumber = 'Aadhar must be a 12-digit number';
    }

    if (!cleanAddress) {
      errors.address = 'Communication Address is required';
    }

    if (!cleanPin) {
      errors.postalCode = 'PIN Code is required';
    } else if (!/^\d{6}$/.test(cleanPin)) {
      errors.postalCode = 'PIN Code must be 6 numeric digits';
    }

    if (!formData.appliedOnBehalfOf) {
      errors.appliedOnBehalfOf = 'Please select applying behalf';
    }

    if (!formData.qualification) {
      errors.qualification = 'Please select Qualification';
    }

    if (!formData.magazineNeeded) {
      errors.magazineNeeded = 'Please select YES/NO for Magazine';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveMember = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      showToast('Please fix the required fields marked with *.', 'error');
      // If errors are on membership details tab, switch to it
      setActiveFormSection('membershipDetails');
      return;
    }

    const selectedTypeObj = membershipTypes.find((mt) => mt.id === formData.membershipTypeId);

    const pinLoc = lookupLocationByPin(formData.postalCode.trim());

    if (formModalMode === 'add') {
      const nextNum = (members.length + 101).toString();
      const newMember = {
        id: `MEM-${nextNum}`,
        membershipNumber: nextNum,
        fullName: formData.name.trim(),
        name: formData.name.trim(),
        fatherHusbandName: formData.fatherHusbandName.trim(),
        membershipName: formData.name.trim(),
        addressLine: formData.address.trim(),
        address: formData.address.trim(),
        mobile: formData.mobile.trim(),
        mobileNumber: formData.mobile.trim(),
        email: formData.email.trim(),
        birthDate: formData.birthDate,
        age: formData.age || calculateAge(formData.birthDate),
        photoUrl: formData.photoUrl,

        gothra: formData.gothra,
        gender: formData.gender,
        bloodGroup: formData.bloodGroup,
        aadharNumber: formData.aadharNumber.trim(),
        postalCode: formData.postalCode.trim(),
        locality: pinLoc.found ? pinLoc.area : '',
        postOffice: pinLoc.found ? pinLoc.area : '',
        place: pinLoc.found ? (pinLoc.area || pinLoc.talukName) : '',
        city: pinLoc.found ? (pinLoc.area || pinLoc.talukName) : '',
        taluk: pinLoc.found ? pinLoc.talukName : '',
        talukName: pinLoc.found ? pinLoc.talukName : '',
        district: pinLoc.found ? pinLoc.districtName : '',
        districtName: pinLoc.found ? pinLoc.districtName : '',
        state: pinLoc.found ? (pinLoc.stateName || 'Karnataka') : 'Karnataka',
        stateName: pinLoc.found ? (pinLoc.stateName || 'Karnataka') : 'Karnataka',
        nativePlace: formData.nativePlace.trim(),
        nativeDetails: formData.nativePlace.trim(),
        appliedOnBehalfOf: formData.appliedOnBehalfOf,
        qualification: formData.qualification,
        employment: formData.employment.trim(),
        profession: formData.employment.trim(),
        magazineNeeded: formData.magazineNeeded,
        magazineRemarks: formData.magazineNeeded === 'YES' ? 'Monthly Magazine' : 'No Magazine',

        membershipTypeCategory: formData.membershipTypeCategory,
        membershipTypeId: selectedTypeObj ? selectedTypeObj.id : formData.membershipTypeId,
        membershipType: selectedTypeObj ? selectedTypeObj.name : formData.membershipType,
        amount: Number(formData.amount) || selectedTypeObj?.currentPrice || 1000,

        referredMembershipNo: formData.referredMembershipNo.trim(),
        referredMembershipName: formData.referredMembershipName.trim(),
        familyMembershipNo: formData.familyMembershipNo.trim(),
        familyMembershipName: formData.familyMembershipName.trim(),

        paymentMode: formData.paymentMode,
        bankAccount: formData.bankAccount,
        receiptDate: formData.receiptDate,
        transactionId: formData.transactionId.trim(),
        transactionDate: formData.transactionDate,
        paymentRemarks: formData.paymentRemarks.trim(),

        status: 'Active',
        createdDate: new Date().toISOString().split('T')[0],
        registrationType: 'Offline'
      };

      persistMembers([newMember, ...members]);
      showToast(`Member "${newMember.fullName}" (#${newMember.membershipNumber}) registered successfully.`);
    } else {
      const updated = members.map((m) =>
        m.id === editingMember.id
          ? {
            ...m,
            fullName: formData.name.trim(),
            name: formData.name.trim(),
            fatherHusbandName: formData.fatherHusbandName.trim(),
            membershipName: formData.name.trim(),
            addressLine: formData.address.trim(),
            address: formData.address.trim(),
            countryCode: formData.mobileCountryCode,
            countryIso: formData.mobileCountryIso,
            mobileCountryCode: formData.mobileCountryCode,
            mobileCountryIso: formData.mobileCountryIso,
            mobile: formData.mobile.trim(),
            mobileNumber: formData.mobile.trim(),
            phone_country_code: formData.mobileCountryCode,
            phone_number: formData.mobile.trim(),
            phoneNumber: formData.mobile.trim(),
            fullMobile: `${formData.mobileCountryCode} ${formData.mobile.trim()}`,

            whatsappCountryCode: formData.whatsappCountryCode,
            whatsappCountryIso: formData.whatsappCountryIso,
            whatsappNumber: (formData.whatsappNumber || '').trim(),
            whatsapp_country_code: formData.whatsappCountryCode,
            whatsapp_number: (formData.whatsappNumber || '').trim(),
            whatsAppNumber: (formData.whatsappNumber || '').trim(),
            fullWhatsApp: formData.whatsappNumber.trim() ? `${formData.whatsappCountryCode} ${formData.whatsappNumber.trim()}` : '',
            isWhatsAppSameAsMobile: isWhatsAppSameAsMobile,
            email: formData.email.trim(),
            birthDate: formData.birthDate,
            age: formData.age || calculateAge(formData.birthDate),
            photoUrl: formData.photoUrl || m.photoUrl,

            gothra: formData.gothra,
            gender: formData.gender,
            bloodGroup: formData.bloodGroup,
            aadharNumber: formData.aadharNumber.trim(),
            postalCode: formData.postalCode.trim(),
            locality: pinLoc.found ? pinLoc.area : (m.locality || ''),
            postOffice: pinLoc.found ? pinLoc.area : (m.postOffice || ''),
            place: pinLoc.found ? (pinLoc.area || pinLoc.talukName) : (m.place || ''),
            city: pinLoc.found ? (pinLoc.area || pinLoc.talukName) : (m.city || ''),
            taluk: pinLoc.found ? pinLoc.talukName : (m.taluk || ''),
            talukName: pinLoc.found ? pinLoc.talukName : (m.talukName || ''),
            district: pinLoc.found ? pinLoc.districtName : (m.district || ''),
            districtName: pinLoc.found ? pinLoc.districtName : (m.districtName || ''),
            state: pinLoc.found ? (pinLoc.stateName || 'Karnataka') : (m.state || 'Karnataka'),
            stateName: pinLoc.found ? (pinLoc.stateName || 'Karnataka') : (m.stateName || 'Karnataka'),
            nativePlace: formData.nativePlace.trim(),
            nativeDetails: formData.nativePlace.trim(),
            appliedOnBehalfOf: formData.appliedOnBehalfOf,
            qualification: formData.qualification,
            employment: formData.employment.trim(),
            profession: formData.employment.trim(),
            magazineNeeded: formData.magazineNeeded,
            magazineRemarks: formData.magazineNeeded === 'YES' ? 'Monthly Magazine' : 'No Magazine',

            membershipTypeCategory: formData.membershipTypeCategory,
            membershipTypeId: selectedTypeObj ? selectedTypeObj.id : m.membershipTypeId,
            membershipType: selectedTypeObj ? selectedTypeObj.name : m.membershipType,
            amount: Number(formData.amount) || m.amount,

            referredMembershipNo: formData.referredMembershipNo.trim(),
            referredMembershipName: formData.referredMembershipName.trim(),
            familyMembershipNo: formData.familyMembershipNo.trim(),
            familyMembershipName: formData.familyMembershipName.trim(),

            paymentMode: formData.paymentMode,
            bankAccount: formData.bankAccount,
            receiptDate: formData.receiptDate,
            transactionId: formData.transactionId.trim(),
            transactionDate: formData.transactionDate,
            paymentRemarks: formData.paymentRemarks.trim()
          }
          : m
      );

      persistMembers(updated);
      showToast(`Member "${formData.name}" updated successfully.`);
    }

    setIsFormModalOpen(false);
  };

  // ----------------------------------------------------
  // STATUS & DELETE HANDLERS
  // ----------------------------------------------------
  const handleConfirmStatusToggle = () => {
    if (!statusDialog) return;
    const { member, nextStatus } = statusDialog;

    const updated = members.map((m) => (m.id === member.id ? { ...m, status: nextStatus } : m));
    persistMembers(updated);
    showToast(`Member "${member.fullName || member.name}" set to ${nextStatus}.`);
    setStatusDialog(null);
  };

  const handleConfirmDelete = () => {
    if (!deleteDialog) return;
    const updated = members.filter((m) => m.id !== deleteDialog.id);
    persistMembers(updated);

    // Remove from selection if selected
    if (selectedMemberIds.has(deleteDialog.id)) {
      const next = new Set(selectedMemberIds);
      next.delete(deleteDialog.id);
      setSelectedMemberIds(next);
    }

    showToast('Delete request sent successfully.');
    setDeleteDialog(null);
  };

  // ----------------------------------------------------
  // LABEL PREVIEW ITEMS & PRINT TRIGGER
  // ----------------------------------------------------
  const selectedMembersForLabels = useMemo(() => {
    return members.filter((m) => selectedMemberIds.has(m.id));
  }, [members, selectedMemberIds]);

  const handleTriggerPrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* ---------------------------------------------------- */}
      {/* HEADER, SEARCH & FILTERS SECTION                     */}
      {/* ---------------------------------------------------- */}
      <SearchFilterBar
        breadcrumb={
          <nav className="flex items-center gap-2 text-sm text-[#863221] font-medium mb-1">
            <Link to="/dashboard" className="hover:text-[#510601] transition-colors">
              Dashboard
            </Link>
            <ChevronRight className="w-4 h-4 text-[#863221]/50" />
            <span className="text-[#863221]">Membership</span>
            <ChevronRight className="w-4 h-4 text-[#863221]/50" />
            <span className="text-[#180200] font-semibold">Membership List</span>
          </nav>
        }
        title={<h1 className="text-2xl font-bold text-[#180200] tracking-tight">Membership List</h1>}
        searchQuery={searchQuery}
        onSearchChange={(val) => {
          setSearchQuery(val);
          setCurrentPage(1);
        }}
        searchPlaceholder="Search..."
        activeFiltersCount={
          (typeFilter !== 'ALL' ? 1 : 0) +
          (statusFilter !== 'ALL' ? 1 : 0) +
          (stateFilter !== 'ALL' ? 1 : 0) +
          (districtFilter !== 'ALL' ? 1 : 0)
        }
        onResetFilters={handleClearFilters}
        rightSlot={
          <button
            type="button"
            onClick={() => navigate('/dashboard/membership/register')}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#510601] hover:bg-[#863221] text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-sm cursor-pointer hover:shadow-md shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Membership</span>
          </button>
        }
      >
        {/* 1. Membership Type Filter */}
        <FilterSelect
          value={typeFilter}
          onChange={(val) => {
            setTypeFilter(val);
            setCurrentPage(1);
          }}
          options={[
            { value: 'ALL', label: 'All Membership Types' },
            ...membershipTypes.map((mt) => ({ value: mt.name, label: mt.name })),
            { value: 'None', label: 'None / Not Yet Reached' }
          ]}
          widthClass="w-full sm:w-56"
        />

        {/* 2. Status Filter */}
        <FilterSelect
          value={statusFilter}
          onChange={(val) => {
            setStatusFilter(val);
            setCurrentPage(1);
          }}
          options={[
            { value: 'ALL', label: 'All Status' },
            { value: 'Active', label: 'Active' },
            { value: 'Inactive', label: 'Inactive' }
          ]}
          widthClass="w-full sm:w-36"
        />

        {/* 3. State Filter */}
        <FilterSelect
          value={stateFilter}
          onChange={(val) => {
            setStateFilter(val);
            setDistrictFilter('ALL');
            setCurrentPage(1);
          }}
          options={[
            { value: 'ALL', label: 'All States' },
            ...states.map((s) => ({ value: s.name, label: s.name }))
          ]}
          widthClass="w-full sm:w-44"
        />

        {/* 4. District Filter */}
        <FilterSelect
          value={districtFilter}
          onChange={(val) => {
            setDistrictFilter(val);
            setCurrentPage(1);
          }}
          options={[
            { value: 'ALL', label: 'All Districts' },
            ...tableFilterDistricts.map((d) => ({ value: d.name, label: d.name }))
          ]}
          widthClass="w-full sm:w-48"
        />
      </SearchFilterBar>

      {/* ---------------------------------------------------- */}
      {/* MEMBERSHIP TABLE                                     */}
      {/* ---------------------------------------------------- */}
      <div className="bg-white rounded-2xl border border-[#E8DFD8] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-[#FAF7F2] border-b border-[#E8DFD8] text-[#863221] font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Membership No. & Name</th>
                <th className="py-3 px-4">Contact Number</th>
                <th className="py-3 px-4">Membership Type</th>
                <th className="py-3 px-4">District / Location</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8DFD8]">
              {paginatedMembers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-[#863221]">
                    <div className="flex flex-col items-center justify-center">
                      <AlertCircle className="w-8 h-8 text-[#863221]/40 mb-2" />
                      <p className="font-semibold text-sm text-[#180200]">No members found</p>
                      <p className="text-xs text-[#863221] mt-1">
                        Try adjusting your search criteria or register a new member.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedMembers.map((m) => {
                  const isSelected = selectedMemberIds.has(m.id);
                  const displayStatus = m.status === 'Approved' ? 'Active' : m.status || 'Active';

                  return (
                    <tr
                      key={m.id}
                      className="hover:bg-[#FAF7F2]/40 transition-colors"
                    >
                      {/* Membership No. & Name */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {m.membershipNumber && (
                            <span className="font-mono font-bold text-xs text-[#510601] bg-[#FAF7F2] px-1.5 py-0.5 rounded border border-[#E8DFD8]">
                              #{m.membershipNumber}
                            </span>
                          )}
                          <span className="font-bold text-[#180200] text-sm">
                            {m.fullName || m.name}
                          </span>
                        </div>
                        {m.gothra && (
                          <div className="text-[11px] text-[#863221] mt-0.5">
                            Gotra: <span className="font-medium text-[#180200]">{m.gothra}</span>
                          </div>
                        )}
                      </td>

                      {/* Contact Info (Mobile & Email) */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 font-mono font-medium text-xs text-[#180200]">
                          <Phone className="w-3 h-3 text-[#863221]/70 shrink-0" />
                          <span>{m.mobile || m.mobileNumber || '—'}</span>
                        </div>
                        {m.email && (
                          <div className="flex items-center gap-1.5 text-[11px] text-[#863221] mt-0.5 truncate max-w-[180px]">
                            <Mail className="w-3 h-3 text-[#863221]/70 shrink-0" />
                            <span className="truncate">{m.email}</span>
                          </div>
                        )}
                      </td>

                      {/* Membership Type (Dynamically Calculated from Cumulative Receipts & Master) */}
                      <td className="py-3 px-4">
                        {(() => {
                          const memStatus = calculateMemberMembershipStatus(m, receipts, membershipTypes);
                          const membershipTypeName = memStatus.currentMembershipType || m.membershipType || m.type || 'Poshaka';
                          return (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#510601]/10 text-[#510601] border border-[#510601]/20">
                              <Award className="w-3.5 h-3.5 shrink-0" />
                              <span>{membershipTypeName}</span>
                            </span>
                          );
                        })()}
                      </td>

                      {/* District / Location */}
                      <td className="py-3 px-4 text-[#863221]">
                        {(() => {
                          const pinLookup = m.postalCode ? lookupLocationByPin(m.postalCode) : null;
                          const districtText =
                            m.districtName ||
                            m.district ||
                            (pinLookup?.found ? pinLookup.districtName : '') ||
                            m.stateName ||
                            m.state ||
                            '—';
                          const talukText =
                            m.talukName ||
                            m.taluk ||
                            (pinLookup?.found ? pinLookup.talukName : '');
                          const localityText =
                            m.locality ||
                            m.city ||
                            m.place ||
                            (pinLookup?.found ? pinLookup.area : '');

                          const locationParts = [];
                          if (localityText && localityText !== talukText && localityText !== districtText) {
                            locationParts.push(localityText);
                          }
                          if (talukText && talukText !== districtText && !locationParts.includes(talukText)) {
                            locationParts.push(talukText);
                          }
                          const locationSubText = locationParts.join(', ') || talukText || localityText || '';

                          return (
                            <>
                              <div className="font-medium text-[#180200] text-xs">
                                {districtText}
                              </div>
                              <div
                                className="text-[11px] text-[#863221]/80 mt-0.5 truncate max-w-[180px]"
                                title={`${locationSubText} ${m.postalCode ? `(${m.postalCode})` : ''}`.trim()}
                              >
                                {locationSubText ? `${locationSubText} ` : ''}
                                {m.postalCode ? `(${m.postalCode})` : ''}
                              </div>
                            </>
                          );
                        })()}
                      </td>

                      {/* Action Buttons: View, Edit, Delete */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setViewingMember(m)}
                            className="p-1.5 text-[#863221] hover:text-[#510601] hover:bg-[#FAF7F2] rounded-lg transition-colors cursor-pointer"
                            title="View Full Profile"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              navigate('/dashboard/membership/edit', {
                                state: {
                                  member: m,
                                  membershipNumber: m.membershipNumber,
                                  mode: 'edit',
                                  returnPath: '/dashboard/membership/list'
                                }
                              })
                            }
                            className="p-1.5 text-amber-700 hover:text-amber-900 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit Member"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteDialog(m)}
                            className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Member"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Section */}
        {filteredMembers.length > 0 && (
          <div className="p-4 border-t border-[#E8DFD8] bg-[#FAF7F2]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#863221]">
            <div className="flex items-center gap-2">
              <span>Showing</span>
              <span className="font-bold text-[#180200]">
                {Math.min((currentPage - 1) * pageSize + 1, filteredMembers.length)}
              </span>
              <span>to</span>
              <span className="font-bold text-[#180200]">
                {Math.min(currentPage * pageSize, filteredMembers.length)}
              </span>
              <span>of</span>
              <span className="font-bold text-[#180200]">{filteredMembers.length}</span>
              <span>members</span>
            </div>

            <div className="flex items-center gap-4 self-end sm:self-auto">
              <div className="flex items-center gap-1.5">
                <span>Rows per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="py-1 px-2 text-xs bg-white border border-[#E8DFD8] rounded focus:outline-none focus:border-[#510601]"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 rounded-lg bg-white border border-[#E8DFD8] disabled:opacity-40 hover:bg-[#FAF7F2] transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-2 font-bold text-[#180200]">
                  {currentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="p-1.5 rounded-lg bg-white border border-[#E8DFD8] disabled:opacity-40 hover:bg-[#FAF7F2] transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ==================================================== */}
      {/* MODAL 1: ADD / EDIT MEMBERSHIP FORM MODAL            */}
      {/* ==================================================== */}
      <Modal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)}>
        <div
          className="bg-white rounded-lg max-w-4xl w-full border border-[#E8DFD8] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 pt-5 pb-2">
            <div className="flex items-center justify-between pb-2 border-b-2 border-[#8C1801]">
              <h2 className="text-xl font-normal text-[#180200]">
                {formModalMode === 'add' ? 'New Membership Form' : 'Edit Membership Form'}
              </h2>
              <button
                type="button"
                onClick={() => setIsFormModalOpen(false)}
                className="text-[#863221]/60 hover:text-[#180200] p-1 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-1.5 mt-3">
              <button
                type="button"
                onClick={() => setActiveFormSection('membershipDetails')}
                className={`px-4 py-2 text-xs font-semibold rounded-t-md border transition-all cursor-pointer ${activeFormSection === 'membershipDetails'
                    ? 'bg-[#510601] text-white border-[#510601]'
                    : 'bg-white text-[#510601] border-[#D1D5DB] hover:bg-[#FAF7F2]'
                  }`}
              >
                Membership Details
              </button>
              <button
                type="button"
                onClick={() => setActiveFormSection('paymentInfo')}
                className={`px-4 py-2 text-xs font-semibold rounded-t-md border transition-all cursor-pointer ${activeFormSection === 'paymentInfo'
                    ? 'bg-[#510601] text-white border-[#510601]'
                    : 'bg-white text-[#510601] border-[#D1D5DB] hover:bg-[#FAF7F2]'
                  }`}
              >
                Payment Information
              </button>
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSaveMember}>
            <div className="px-6 py-4 max-h-[75vh] overflow-y-auto space-y-4">
              {/* TAB 1: MEMBERSHIP DETAILS */}
              {activeFormSection === 'membershipDetails' && (
                <div className="space-y-4">
                  {/* Top Row: Membership Type & Select Havyaka Membership Type */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-[#374151] mb-1 font-medium">
                        Membership Type:
                      </label>
                      <select
                        value={formData.membershipTypeCategory}
                        onChange={(e) =>
                          setFormData({ ...formData, membershipTypeCategory: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-[#F9FAFB] border border-[#D1D5DB] rounded text-sm text-[#1F2937] focus:outline-none focus:border-[#510601]"
                      >
                        <option value="Only Havyaka Mahasabha Membership">
                          Only Havyaka Mahasabha Membership
                        </option>
                        <option value="Havyaka Mahasabha Membership & Mangalya Registration">
                          Havyaka Mahasabha Membership & Mangalya Registration
                        </option>
                      </select>

                    </div>

                    <div>
                      <label className="block text-sm text-[#374151] mb-1 font-medium">
                        Select Havyaka Membership Type: <span className="text-red-600">*</span>
                      </label>
                      <select
                        value={formData.membershipTypeId}
                        onChange={(e) => handleMembershipTypeSelect(e.target.value)}
                        className={`w-full px-3 py-2 bg-[#F9FAFB] border rounded text-sm text-[#1F2937] focus:outline-none focus:border-[#510601] ${formErrors.membershipTypeId ? 'border-red-500' : 'border-[#D1D5DB]'
                          }`}
                      >
                        <option value="">Select a Havyaka membership type</option>
                        {activeMembershipTypes.map((mt) => (
                          <option key={mt.id} value={mt.id}>
                            {mt.name} (Rs. {mt.currentPrice?.toLocaleString('en-IN') || mt.price || mt.fee})
                          </option>
                        ))}
                      </select>
                      {formErrors.membershipTypeId && (
                        <p className="text-[11px] text-red-600 mt-0.5">{formErrors.membershipTypeId}</p>
                      )}
                    </div>
                  </div>

                  {/* Red separator bar */}
                  <div className="border-b border-[#8C1801] my-2" />

                  {/* Photo upload + Basic Details (2 columns right) */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                    {/* Left: Photo Upload */}
                    <div className="md:col-span-3 flex flex-col items-center">
                      <div className="w-full h-44 border border-[#D1D5DB] bg-[#F9FAFB] flex flex-col items-center justify-center relative overflow-hidden rounded">
                        {formData.photoUrl ? (
                          <img
                            src={formData.photoUrl}
                            alt="Member Photo"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-[#9CA3AF] flex flex-col items-center justify-center p-4 text-center">
                            <User className="w-12 h-12 stroke-[1.2] text-[#9CA3AF]" />
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full mt-2 py-1.5 px-3 bg-[#4B5563] hover:bg-[#374151] text-white text-xs font-medium rounded text-center transition-colors cursor-pointer"
                      >
                        Select Image
                      </button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageSelect}
                        accept="image/*"
                        className="hidden"
                      />
                    </div>

                    {/* Right: Member Name, Father/Husband Name, Mobile, Email, DOB, Age */}
                    <div className="md:col-span-9 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {/* New Member Name */}
                      <div>
                        <label className="block text-sm text-[#374151] mb-1 font-medium">
                          New Member Name: <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => {
                            setFormData({ ...formData, name: e.target.value });
                            if (formErrors.name) setFormErrors({ ...formErrors, name: '' });
                          }}
                          className={`w-full px-3 py-2 bg-[#F9FAFB] border rounded text-sm text-[#1F2937] focus:outline-none focus:border-[#510601] ${formErrors.name ? 'border-red-500' : 'border-[#D1D5DB]'
                            }`}
                        />
                        {formErrors.name && (
                          <p className="text-[11px] text-red-600 mt-0.5">{formErrors.name}</p>
                        )}
                      </div>

                      {/* Father / Husband Name */}
                      <div>
                        <label className="block text-sm text-[#374151] mb-1 font-medium">
                          Father / Husband Name: <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.fatherHusbandName}
                          onChange={(e) => {
                            setFormData({ ...formData, fatherHusbandName: e.target.value });
                            if (formErrors.fatherHusbandName)
                              setFormErrors({ ...formErrors, fatherHusbandName: '' });
                          }}
                          className={`w-full px-3 py-2 bg-[#F9FAFB] border rounded text-sm text-[#1F2937] focus:outline-none focus:border-[#510601] ${formErrors.fatherHusbandName ? 'border-red-500' : 'border-[#D1D5DB]'
                            }`}
                        />
                        {formErrors.fatherHusbandName && (
                          <p className="text-[11px] text-red-600 mt-0.5">
                            {formErrors.fatherHusbandName}
                          </p>
                        )}
                      </div>

                      {/* Mobile / Phone Number */}
                      <div>
                        <label className="block text-sm text-[#374151] mb-1 font-medium">
                          Mobile / Phone Number: <span className="text-red-600">*</span>
                        </label>
                        <div className="flex gap-2">
                          <div className="w-28 shrink-0">
                            <CountryCodeSelect
                              value={formData.mobileCountryCode}
                              countryIso={formData.mobileCountryIso}
                              onChange={handleMobileCountryChange}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <input
                              type="tel"
                              value={formData.mobile}
                              onChange={(e) => handleMobileChange(e.target.value)}
                              placeholder="Phone number without country code"
                              className={`w-full px-3 py-2 bg-[#F9FAFB] border rounded text-sm text-[#1F2937] focus:outline-none focus:border-[#510601] ${formErrors.mobile ? 'border-red-500' : 'border-[#D1D5DB]'
                                }`}
                            />
                          </div>
                        </div>
                        {formErrors.mobile && (
                          <p className="text-[11px] text-red-600 mt-0.5">{formErrors.mobile}</p>
                        )}
                      </div>

                      {/* WhatsApp Number */}
                      <div>
                        <label className="block text-sm text-[#374151] mb-1 font-medium">
                          WhatsApp Number:
                        </label>
                        <div className="flex gap-2">
                          <div className="w-28 shrink-0">
                            <CountryCodeSelect
                              value={formData.whatsappCountryCode}
                              countryIso={formData.whatsappCountryIso}
                              onChange={handleWhatsAppCountryChange}
                              disabled={isWhatsAppSameAsMobile}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <input
                              type="tel"
                              value={formData.whatsappNumber}
                              onChange={(e) => handleWhatsAppChange(e.target.value)}
                              placeholder="WhatsApp number without country code"
                              readOnly={isWhatsAppSameAsMobile}
                              className={`w-full px-3 py-2 border rounded text-sm text-[#1F2937] focus:outline-none focus:border-[#510601] ${isWhatsAppSameAsMobile
                                  ? 'bg-stone-100 text-stone-600 border-[#D1D5DB] cursor-not-allowed'
                                  : 'bg-[#F9FAFB] border-[#D1D5DB]'
                                } ${formErrors.whatsappNumber ? 'border-red-500' : ''}`}
                            />
                          </div>
                        </div>
                        {formErrors.whatsappNumber && (
                          <p className="text-[11px] text-red-600 mt-0.5">{formErrors.whatsappNumber}</p>
                        )}
                        <label className="flex items-center gap-2 mt-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={isWhatsAppSameAsMobile}
                            onChange={(e) => handleWhatsAppSameAsMobileToggle(e.target.checked)}
                            className="w-4 h-4 rounded text-[#510601] focus:ring-[#510601] border-gray-300 accent-[#510601] cursor-pointer"
                          />
                          <span className="text-xs text-[#374151] font-medium">
                            WhatsApp number is same as mobile/phone number
                          </span>
                        </label>
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-sm text-[#374151] mb-1 font-medium">
                          Email: <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => {
                            setFormData({ ...formData, email: e.target.value });
                            if (formErrors.email) setFormErrors({ ...formErrors, email: '' });
                          }}
                          className={`w-full px-3 py-2 bg-[#F9FAFB] border rounded text-sm text-[#1F2937] focus:outline-none focus:border-[#510601] ${formErrors.email ? 'border-red-500' : 'border-[#D1D5DB]'
                            }`}
                        />
                        {formErrors.email && (
                          <p className="text-[11px] text-red-600 mt-0.5">{formErrors.email}</p>
                        )}
                      </div>

                      {/* Date of Birth */}
                      <div>
                        <label className="block text-sm text-[#374151] mb-1 font-medium">
                          Date of Birth: <span className="text-red-600">*</span>
                        </label>
                        <DateInput
                          value={formData.birthDate}
                          onChange={handleDobChange}
                          name="birthDate"
                          className={`w-full px-3 py-2 bg-[#F9FAFB] border rounded text-sm text-[#1F2937] focus:outline-none focus:border-[#510601] ${formErrors.birthDate ? 'border-red-500' : 'border-[#D1D5DB]'
                            }`}
                        />
                        {formErrors.birthDate && (
                          <p className="text-[11px] text-red-600 mt-0.5">{formErrors.birthDate}</p>
                        )}
                      </div>

                      {/* Age */}
                      <div>
                        <label className="block text-sm text-[#374151] mb-1 font-medium">Age:</label>
                        <input
                          type="text"
                          value={formData.age}
                          onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                          placeholder="Auto-calculated or enter age"
                          className="w-full px-3 py-2 bg-[#F9FAFB] border border-[#D1D5DB] rounded text-sm text-[#1F2937] focus:outline-none focus:border-[#510601]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 3-Column Grid Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
                    {/* Row 1: Gothra, Gender, Blood Group */}
                    <div>
                      <label className="block text-sm text-[#374151] mb-1 font-medium">
                        Gothra: <span className="text-red-600">*</span>
                      </label>
                      <select
                        value={formData.gothra}
                        onChange={(e) => {
                          setFormData({ ...formData, gothra: e.target.value });
                          if (formErrors.gothra) setFormErrors({ ...formErrors, gothra: '' });
                        }}
                        className={`w-full px-3 py-2 bg-[#F9FAFB] border rounded text-sm text-[#1F2937] focus:outline-none focus:border-[#510601] ${formErrors.gothra ? 'border-red-500' : 'border-[#D1D5DB]'
                          }`}
                      >
                        <option value="">Select Gotra</option>
                        {gothras.map((g) => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        ))}
                      </select>
                      {formErrors.gothra && (
                        <p className="text-[11px] text-red-600 mt-0.5">{formErrors.gothra}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm text-[#374151] mb-1 font-medium">
                        Gender: <span className="text-red-600">*</span>
                      </label>
                      <select
                        value={formData.gender}
                        onChange={(e) => {
                          setFormData({ ...formData, gender: e.target.value });
                          if (formErrors.gender) setFormErrors({ ...formErrors, gender: '' });
                        }}
                        className={`w-full px-3 py-2 bg-[#F9FAFB] border rounded text-sm text-[#1F2937] focus:outline-none focus:border-[#510601] ${formErrors.gender ? 'border-red-500' : 'border-[#D1D5DB]'
                          }`}
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                      {formErrors.gender && (
                        <p className="text-[11px] text-red-600 mt-0.5">{formErrors.gender}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm text-[#374151] mb-1 font-medium">
                        Blood Group:
                      </label>
                      <select
                        value={formData.bloodGroup}
                        onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                        className="w-full px-3 py-2 bg-[#F9FAFB] border border-[#D1D5DB] rounded text-sm text-[#1F2937] focus:outline-none focus:border-[#510601]"
                      >
                        <option value="">Select Blood Group</option>
                        {BLOOD_GROUPS.map((bg) => (
                          <option key={bg} value={bg}>
                            {bg}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Row 2: Aadhar Number, Communication Address, Pin Code */}
                    <div>
                      <label className="block text-sm text-[#374151] mb-1 font-medium">
                        Aadhar Number: <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        maxLength={12}
                        value={formData.aadharNumber}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          setFormData({ ...formData, aadharNumber: val });
                          if (formErrors.aadharNumber)
                            setFormErrors({ ...formErrors, aadharNumber: '' });
                        }}
                        placeholder="12 digit Aadhar Number"
                        className={`w-full px-3 py-2 bg-[#F9FAFB] border rounded text-sm text-[#1F2937] focus:outline-none focus:border-[#510601] ${formErrors.aadharNumber ? 'border-red-500' : 'border-[#D1D5DB]'
                          }`}
                      />
                      {formErrors.aadharNumber && (
                        <p className="text-[11px] text-red-600 mt-0.5">{formErrors.aadharNumber}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm text-[#374151] mb-1 font-medium">
                        Communication Address: <span className="text-red-600">*</span>
                      </label>
                      <textarea
                        rows={2}
                        value={formData.address}
                        onChange={(e) => {
                          setFormData({ ...formData, address: e.target.value });
                          if (formErrors.address) setFormErrors({ ...formErrors, address: '' });
                        }}
                        className={`w-full px-3 py-2 bg-[#F9FAFB] border rounded text-sm text-[#1F2937] focus:outline-none focus:border-[#510601] ${formErrors.address ? 'border-red-500' : 'border-[#D1D5DB]'
                          }`}
                      />
                      {formErrors.address && (
                        <p className="text-[11px] text-red-600 mt-0.5">{formErrors.address}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm text-[#374151] mb-1 font-medium">
                        Pin Code: <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        value={formData.postalCode}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          setFormData({ ...formData, postalCode: val });
                          if (formErrors.postalCode) setFormErrors({ ...formErrors, postalCode: '' });
                        }}
                        placeholder="6 digit PIN Code"
                        className={`w-full px-3 py-2 bg-[#F9FAFB] border rounded text-sm text-[#1F2937] focus:outline-none focus:border-[#510601] ${formErrors.postalCode ? 'border-red-500' : 'border-[#D1D5DB]'
                          }`}
                      />
                      {formErrors.postalCode && (
                        <p className="text-[11px] text-red-600 mt-0.5">{formErrors.postalCode}</p>
                      )}
                    </div>

                    {/* Row 3: Native Place, Applying behalf of, Qualification */}
                    <div>
                      <label className="block text-sm text-[#374151] mb-1 font-medium">
                        Native Place:
                      </label>
                      <input
                        type="text"
                        value={formData.nativePlace}
                        onChange={(e) => setFormData({ ...formData, nativePlace: e.target.value })}
                        placeholder="Village :: Taluk :: District"
                        className="w-full px-3 py-2 bg-[#F9FAFB] border border-[#D1D5DB] rounded text-sm text-[#1F2937] focus:outline-none focus:border-[#510601]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-[#374151] mb-1 font-medium">
                        Applying this Membership on behalf of: <span className="text-red-600">*</span>
                      </label>
                      <select
                        value={formData.appliedOnBehalfOf}
                        onChange={(e) => {
                          setFormData({ ...formData, appliedOnBehalfOf: e.target.value });
                          if (formErrors.appliedOnBehalfOf)
                            setFormErrors({ ...formErrors, appliedOnBehalfOf: '' });
                        }}
                        className={`w-full px-3 py-2 bg-[#F9FAFB] border rounded text-sm text-[#1F2937] focus:outline-none focus:border-[#510601] ${formErrors.appliedOnBehalfOf ? 'border-red-500' : 'border-[#D1D5DB]'
                          }`}
                      >
                        {BEHALF_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                      {formErrors.appliedOnBehalfOf && (
                        <p className="text-[11px] text-red-600 mt-0.5">
                          {formErrors.appliedOnBehalfOf}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm text-[#374151] mb-1 font-medium">
                        Qualification: <span className="text-red-600">*</span>
                      </label>
                      <SearchableFormSelect
                        value={formData.qualification}
                        onChange={(val) => {
                          setFormData({ ...formData, qualification: val });
                          if (formErrors.qualification)
                            setFormErrors({ ...formErrors, qualification: '' });
                        }}
                        options={QUALIFICATIONS_LIST}
                        placeholder="Select Qualification"
                        searchPlaceholder="Search qualification..."
                        hasError={Boolean(formErrors.qualification)}
                        maxHeightClass="max-h-52"
                      />
                      {formErrors.qualification && (
                        <p className="text-[11px] text-red-600 mt-0.5">{formErrors.qualification}</p>
                      )}
                    </div>

                    {/* Row 4: Employment, Do you need Havyaka Magazine */}
                    <div>
                      <label className="block text-sm text-[#374151] mb-1 font-medium">
                        Employment:
                      </label>
                      <input
                        type="text"
                        value={formData.employment}
                        onChange={(e) => setFormData({ ...formData, employment: e.target.value })}
                        placeholder="e.g. Agriculture, Software Engineer"
                        className="w-full px-3 py-2 bg-[#F9FAFB] border border-[#D1D5DB] rounded text-sm text-[#1F2937] focus:outline-none focus:border-[#510601]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-[#374151] mb-1 font-medium">
                        Do you need Havyaka Magazine Every month? <span className="text-red-600">*</span>
                      </label>
                      <select
                        value={formData.magazineNeeded}
                        onChange={(e) => {
                          setFormData({ ...formData, magazineNeeded: e.target.value });
                          if (formErrors.magazineNeeded)
                            setFormErrors({ ...formErrors, magazineNeeded: '' });
                        }}
                        className={`w-full px-3 py-2 bg-[#F9FAFB] border rounded text-sm text-[#1F2937] focus:outline-none focus:border-[#510601] ${formErrors.magazineNeeded ? 'border-red-500' : 'border-[#D1D5DB]'
                          }`}
                      >
                        <option value="">Select YES/NO</option>
                        <option value="YES">YES</option>
                        <option value="NO">NO</option>
                      </select>
                      {formErrors.magazineNeeded && (
                        <p className="text-[11px] text-red-600 mt-0.5">{formErrors.magazineNeeded}</p>
                      )}
                    </div>
                  </div>

                  {/* Section: Membership Referred By */}
                  <div className="pt-2">
                    <h3 className="text-sm font-semibold text-[#8C1801] mb-2">
                      Membership Referred By:
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="flex items-center gap-1.5 text-sm text-[#374151] mb-1 font-medium">
                          <span>Membership Number:</span>
                          <span
                            className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-amber-400 text-black text-[9px] font-bold cursor-pointer"
                            title="Referral membership number"
                          >
                            i
                          </span>
                        </label>
                        <input
                          type="text"
                          value={formData.referredMembershipNo}
                          onChange={(e) =>
                            setFormData({ ...formData, referredMembershipNo: e.target.value })
                          }
                          className="w-full px-3 py-2 bg-[#F9FAFB] border border-[#D1D5DB] rounded text-sm text-[#1F2937] focus:outline-none focus:border-[#510601]"
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-[#374151] mb-1 font-medium">
                          Membership Name:
                        </label>
                        <input
                          type="text"
                          value={formData.referredMembershipName}
                          onChange={(e) =>
                            setFormData({ ...formData, referredMembershipName: e.target.value })
                          }
                          className="w-full px-3 py-2 bg-[#F9FAFB] border border-[#D1D5DB] rounded text-sm text-[#1F2937] focus:outline-none focus:border-[#510601]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section: Mahasabha Membership Details in Family */}
                  <div className="pt-2">
                    <h3 className="text-sm font-semibold text-[#8C1801] mb-2">
                      Mahasabha Membership Details in Family:
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="flex items-center gap-1.5 text-sm text-[#374151] mb-1 font-medium">
                          <span>Membership Number:</span>
                          <span
                            className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-amber-400 text-black text-[9px] font-bold cursor-pointer"
                            title="Family member membership number"
                          >
                            i
                          </span>
                        </label>
                        <input
                          type="text"
                          value={formData.familyMembershipNo}
                          onChange={(e) =>
                            setFormData({ ...formData, familyMembershipNo: e.target.value })
                          }
                          className="w-full px-3 py-2 bg-[#F9FAFB] border border-[#D1D5DB] rounded text-sm text-[#1F2937] focus:outline-none focus:border-[#510601]"
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-[#374151] mb-1 font-medium">
                          Membership Name:
                        </label>
                        <input
                          type="text"
                          value={formData.familyMembershipName}
                          onChange={(e) =>
                            setFormData({ ...formData, familyMembershipName: e.target.value })
                          }
                          className="w-full px-3 py-2 bg-[#F9FAFB] border border-[#D1D5DB] rounded text-sm text-[#1F2937] focus:outline-none focus:border-[#510601]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Next button */}
                  <div className="flex justify-end pt-3">
                    <button
                      type="button"
                      onClick={() => setActiveFormSection('paymentInfo')}
                      className="px-6 py-2 bg-[#510601] hover:bg-[#8C1801] text-white font-bold text-sm rounded shadow transition-colors cursor-pointer"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: PAYMENT INFORMATION */}
              {activeFormSection === 'paymentInfo' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Payment Mode */}
                    <div>
                      <label className="block text-sm text-[#374151] mb-1 font-medium">
                        Payment Mode: <span className="text-red-600">*</span>
                      </label>
                      <select
                        value={formData.paymentMode}
                        onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
                        className="w-full px-3 py-2 bg-[#F9FAFB] border border-[#D1D5DB] rounded text-sm text-[#1F2937] focus:outline-none focus:border-[#510601]"
                      >
                        {paymentModes.map((mode) => (
                          <option key={mode} value={mode}>
                            {mode}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Bank Account / Name */}
                    <div>
                      <label className="block text-sm text-[#374151] mb-1 font-medium">
                        Bank Account / Name:
                      </label>
                      <input
                        type="text"
                        value={formData.bankAccount}
                        onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                        placeholder="e.g. Canara Bank, SBI"
                        className="w-full px-3 py-2 bg-[#F9FAFB] border border-[#D1D5DB] rounded text-sm text-[#1F2937] focus:outline-none focus:border-[#510601]"
                      />
                    </div>

                    {/* Amount */}
                    <div>
                      <label className="block text-sm text-[#374151] mb-1 font-medium">
                        Amount (Rs.): <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formData.amount}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^\d.]/g, '');
                          setFormData({ ...formData, amount: val });
                        }}
                        onWheel={(e) => e.target.blur()}
                        placeholder="Membership fee amount"
                        className="w-full px-3 py-2 bg-[#F9FAFB] border border-[#D1D5DB] rounded text-sm font-semibold text-[#1F2937] focus:outline-none focus:border-[#510601]"
                      />
                    </div>

                    {/* Receipt Date */}
                    <div>
                      <label className="block text-sm text-[#374151] mb-1 font-medium">
                        Receipt Date: <span className="text-red-600">*</span>
                      </label>
                      <DateInput
                        value={formData.receiptDate}
                        onChange={(e) => setFormData({ ...formData, receiptDate: e.target.value })}
                        name="receiptDate"
                        className="w-full px-3 py-2 bg-[#F9FAFB] border border-[#D1D5DB] rounded text-sm text-[#1F2937] focus:outline-none focus:border-[#510601]"
                      />
                    </div>

                    {/* Transaction ID / Cheque No */}
                    <div>
                      <label className="block text-sm text-[#374151] mb-1 font-medium">
                        Transaction ID / Cheque No.:
                      </label>
                      <input
                        type="text"
                        value={formData.transactionId}
                        onChange={(e) =>
                          setFormData({ ...formData, transactionId: e.target.value })
                        }
                        placeholder="e.g. UTR / CHQ-10492"
                        className="w-full px-3 py-2 bg-[#F9FAFB] border border-[#D1D5DB] rounded text-sm text-[#1F2937] focus:outline-none focus:border-[#510601]"
                      />
                    </div>

                    {/* Transaction Date */}
                    <div>
                      <label className="block text-sm text-[#374151] mb-1 font-medium">
                        Transaction Date:
                      </label>
                      <DateInput
                        value={formData.transactionDate}
                        onChange={(e) =>
                          setFormData({ ...formData, transactionDate: e.target.value })
                        }
                        name="transactionDate"
                        className="w-full px-3 py-2 bg-[#F9FAFB] border border-[#D1D5DB] rounded text-sm text-[#1F2937] focus:outline-none focus:border-[#510601]"
                      />
                    </div>

                    {/* Payment Remarks */}
                    <div className="md:col-span-2">
                      <label className="block text-sm text-[#374151] mb-1 font-medium">
                        Payment Received Details / Remarks:
                      </label>
                      <textarea
                        rows={2}
                        value={formData.paymentRemarks}
                        onChange={(e) =>
                          setFormData({ ...formData, paymentRemarks: e.target.value })
                        }
                        placeholder="Additional payment notes..."
                        className="w-full px-3 py-2 bg-[#F9FAFB] border border-[#D1D5DB] rounded text-sm text-[#1F2937] focus:outline-none focus:border-[#510601]"
                      />
                    </div>
                  </div>

                  {/* Footer buttons on tab 2 */}
                  <div className="flex items-center justify-between pt-4 border-t border-[#E8DFD8]">
                    <button
                      type="button"
                      onClick={() => setActiveFormSection('membershipDetails')}
                      className="px-4 py-2 border border-[#D1D5DB] text-[#374151] hover:bg-gray-100 text-xs font-semibold rounded transition-colors cursor-pointer"
                    >
                      Previous
                    </button>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setIsFormModalOpen(false)}
                        className="px-4 py-2 border border-[#D1D5DB] text-[#374151] hover:bg-gray-100 text-xs font-semibold rounded transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 bg-[#510601] hover:bg-[#8C1801] text-white font-bold text-xs rounded shadow transition-colors cursor-pointer"
                      >
                        {formModalMode === 'add' ? 'Submit Membership' : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>
      </Modal>

      {/* ==================================================== */}
      {/* MODAL 2: VIEW MEMBER DETAILS (MATCHING REFERENCE UI)   */}
      {/* ==================================================== */}
      <Modal isOpen={Boolean(viewingMember)} onClose={() => setViewingMember(null)}>
        {viewingMember && (() => {
          const matchedReceipt = findMatchingReceiptForMember(viewingMember);
          const appNo = viewingMember.membershipNumber || viewingMember.registrationNumber || viewingMember.applicationNo || viewingMember.id || '—';
          const memberName = viewingMember.membershipName || viewingMember.fullName || viewingMember.name || '—';
          const memTypeCategory = viewingMember.membershipTypeCategory || viewingMember.category || 'Havyaka & Mangalya';
          const havyakaMemType = viewingMember.membershipType || viewingMember.type || 'Poshaka';
          const memBelongsTo = viewingMember.appliedOnBehalfOf || viewingMember.membershipBelongsTo || 'Self';
          const fatherHusband = viewingMember.fatherHusbandName || viewingMember.fatherName || viewingMember.guardianName || '—';
          const mobileNo = viewingMember.contactNumber || viewingMember.mobile || viewingMember.mobileNumber || viewingMember.phoneNumber || viewingMember.phone || '—';

          const rawDob = viewingMember.birthDate || viewingMember.dob || viewingMember.dateOfBirth;
          const dobFormatted = rawDob ? formatDate(rawDob) : '—';
          const ageVal = viewingMember.age || (rawDob ? calculateAge(rawDob) : null);
          const dobDisplay = rawDob ? (ageVal ? `${dobFormatted} (Age: ${ageVal})` : dobFormatted) : '—';

          const genderVal = viewingMember.gender || '—';
          const aadharNo = viewingMember.aadharNumber || viewingMember.aadhar_no || viewingMember.aadhaarNo || '—';

          const addressParts = [
            viewingMember.addressLine || viewingMember.address,
            viewingMember.locality || viewingMember.place,
            viewingMember.talukName || viewingMember.taluk,
            viewingMember.districtName || viewingMember.district
          ].filter(Boolean);
          const fullAddress = addressParts.length > 0 ? addressParts.join(', ') : (viewingMember.address || viewingMember.addressLine || '—');

          const pincodeVal = viewingMember.postalCode || viewingMember.pinCode || viewingMember.pincode || '—';
          const nativePlaceVal = viewingMember.nativePlace || viewingMember.nativeDetails || '—';
          const qualificationVal = viewingMember.qualification || '—';
          const employmentVal = viewingMember.employment || viewingMember.profession || '—';
          const magazineVal = viewingMember.magazineNeeded || (viewingMember.monthlyMagazine !== undefined ? viewingMember.monthlyMagazine : (viewingMember.magazineRemarks || 'YES'));

          const refReceiptNo = matchedReceipt?.receiptNumber || viewingMember.assignedReceiptNumber || viewingMember.transactionId || viewingMember.receiptNumber || '—';
          const refDate = matchedReceipt?.receiptDate ? formatDate(matchedReceipt.receiptDate) : (viewingMember.receiptDate ? formatDate(viewingMember.receiptDate) : (viewingMember.transactionDate ? formatDate(viewingMember.transactionDate) : '—'));
          const refAmount = matchedReceipt?.amount !== undefined ? matchedReceipt.amount : (viewingMember.amount !== undefined ? viewingMember.amount : '—');
          const refPaymentSource = matchedReceipt?.paymentMode ? `${matchedReceipt.paymentMode}${matchedReceipt.bankAccount ? ` - ${matchedReceipt.bankAccount}` : ''}` : (viewingMember.paymentMode ? `${viewingMember.paymentMode}${viewingMember.bankAccount ? ` - ${viewingMember.bankAccount}` : ''}` : '—');
          const refPaymentDesc = matchedReceipt?.description || viewingMember.paymentRemarks || viewingMember.description || '—';

          return (
            <div
              className="bg-white rounded-xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Red Header Bar */}
              <div className="flex items-center justify-between bg-[#E53935] px-5 py-2.5 text-white">
                <div className="flex items-center gap-3">
                  <h3 className="font-bold text-base text-white tracking-wide">
                    Membership Details
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      const m = viewingMember;
                      setViewingMember(null);
                      navigate('/dashboard/membership/edit', {
                        state: {
                          member: m,
                          membershipNumber: m.membershipNumber,
                          mode: 'edit',
                          returnPath: '/dashboard/membership/list'
                        }
                      });
                    }}
                    className="bg-white text-stone-700 hover:bg-stone-100 text-xs font-semibold px-2.5 py-1 rounded border border-stone-300 transition-colors cursor-pointer"
                  >
                    Edit Membership
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setViewingMember(null)}
                  className="text-white hover:text-white/80 transition-colors p-1 rounded cursor-pointer"
                  title="Close"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto max-h-[78vh] space-y-6 text-xs sm:text-[13px] text-stone-800">
                {/* Photo Top Center */}
                <div className="flex justify-center">
                  <div className="w-36 h-44 bg-stone-100 rounded-lg overflow-hidden border border-stone-300 shadow-sm flex items-center justify-center">
                    {viewingMember.photoUrl || viewingMember.photo || viewingMember.image || viewingMember.avatar ? (
                      <img
                        src={viewingMember.photoUrl || viewingMember.photo || viewingMember.image || viewingMember.avatar}
                        alt={memberName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-amber-50 to-stone-200 text-stone-400">
                        <User className="w-14 h-14 text-stone-400/80 mb-1" />
                        <span className="text-[11px] font-medium text-stone-500">No Photo</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Main Details Table / Grid */}
                <div className="max-w-2xl mx-auto space-y-2 leading-relaxed">
                  <div className="grid grid-cols-12 gap-2 py-0.5">
                    <span className="col-span-5 font-bold text-stone-800">Application No.:</span>
                    <span className="col-span-7 text-stone-700 font-mono">{appNo}</span>
                  </div>

                  <div className="grid grid-cols-12 gap-2 py-0.5">
                    <span className="col-span-5 font-bold text-stone-800">Membership Name:</span>
                    <span className="col-span-7 text-stone-800 font-semibold">{memberName}</span>
                  </div>

                  <div className="grid grid-cols-12 gap-2 py-0.5">
                    <span className="col-span-5 font-bold text-stone-800">Membership Type:</span>
                    <span className="col-span-7 text-stone-700">{memTypeCategory}</span>
                  </div>

                  <div className="grid grid-cols-12 gap-2 py-0.5">
                    <span className="col-span-5 font-bold text-stone-800">Havyaka Membership Type:</span>
                    <span className="col-span-7 text-stone-700">{havyakaMemType}</span>
                  </div>

                  <div className="grid grid-cols-12 gap-2 py-0.5">
                    <span className="col-span-5 font-bold text-stone-800">Membership belongs to:</span>
                    <span className="col-span-7 text-stone-700">{memBelongsTo}</span>
                  </div>

                  <div className="grid grid-cols-12 gap-2 py-0.5">
                    <span className="col-span-5 font-bold text-stone-800">Father/Husband Name:</span>
                    <span className="col-span-7 text-stone-700">{fatherHusband}</span>
                  </div>

                  <div className="grid grid-cols-12 gap-2 py-0.5">
                    <span className="col-span-5 font-bold text-stone-800">Mobile No.:</span>
                    <span className="col-span-7 text-stone-700 font-mono">{mobileNo}</span>
                  </div>

                  <div className="grid grid-cols-12 gap-2 py-0.5">
                    <span className="col-span-5 font-bold text-stone-800">Date Of Birth:</span>
                    <span className="col-span-7 text-stone-700 font-mono">{dobDisplay}</span>
                  </div>

                  <div className="grid grid-cols-12 gap-2 py-0.5">
                    <span className="col-span-5 font-bold text-stone-800">Gender:</span>
                    <span className="col-span-7 text-stone-700">{genderVal}</span>
                  </div>

                  <div className="grid grid-cols-12 gap-2 py-0.5">
                    <span className="col-span-5 font-bold text-stone-800">aadhar_no :</span>
                    <span className="col-span-7 text-stone-700 font-mono">{aadharNo}</span>
                  </div>

                  <div className="grid grid-cols-12 gap-2 py-0.5">
                    <span className="col-span-5 font-bold text-stone-800">Address:</span>
                    <span className="col-span-7 text-stone-700">{fullAddress}</span>
                  </div>

                  <div className="grid grid-cols-12 gap-2 py-0.5">
                    <span className="col-span-5 font-bold text-stone-800">Pincode:</span>
                    <span className="col-span-7 text-stone-700 font-mono">{pincodeVal}</span>
                  </div>

                  <div className="grid grid-cols-12 gap-2 py-0.5">
                    <span className="col-span-5 font-bold text-stone-800">Native Place:</span>
                    <span className="col-span-7 text-stone-700">{nativePlaceVal}</span>
                  </div>

                  <div className="grid grid-cols-12 gap-2 py-0.5">
                    <span className="col-span-5 font-bold text-stone-800">Qualification:</span>
                    <span className="col-span-7 text-stone-700">{qualificationVal}</span>
                  </div>

                  <div className="grid grid-cols-12 gap-2 py-0.5">
                    <span className="col-span-5 font-bold text-stone-800">Employment:</span>
                    <span className="col-span-7 text-stone-700">{employmentVal}</span>
                  </div>

                  <div className="grid grid-cols-12 gap-2 py-0.5">
                    <span className="col-span-5 font-bold text-stone-800">Monthly Havyaka Magazine:</span>
                    <span className="col-span-7 text-stone-700">{magazineVal}</span>
                  </div>
                </div>

                {/* Sub-sections: Membership Referred By & Family Membership Details */}
                <div className="max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                  {/* Left: Membership Referred By */}
                  <div className="space-y-1.5">
                    <h4 className="font-bold text-xs uppercase tracking-wide text-[#7C3AED]">
                      Membership Reffered By
                    </h4>
                    <div className="flex items-baseline gap-2">
                      <span className="font-bold text-stone-800 text-xs">Membership Number:</span>
                      <span className="text-stone-700 font-mono text-xs">{viewingMember.referredMembershipNo || '—'}</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-bold text-stone-800 text-xs">Membership Name:</span>
                      <span className="text-stone-700 text-xs">{viewingMember.referredMembershipName || '—'}</span>
                    </div>
                  </div>

                  {/* Right: Family Membership Details */}
                  <div className="space-y-1.5">
                    <h4 className="font-bold text-xs uppercase tracking-wide text-[#7C3AED]">
                      Family Membership Details
                    </h4>
                    <div className="flex items-baseline gap-2">
                      <span className="font-bold text-stone-800 text-xs">Membership Number:</span>
                      <span className="text-stone-700 font-mono text-xs">{viewingMember.familyMembershipNo || '—'}</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-bold text-stone-800 text-xs">Membership Name:</span>
                      <span className="text-stone-700 text-xs">{viewingMember.familyMembershipName || '—'}</span>
                    </div>
                  </div>
                </div>

                {/* PAYMENT INFORMATION */}
                <div className="max-w-2xl mx-auto space-y-2 pt-2 border-t border-stone-200">
                  <h4 className="font-bold text-xs uppercase tracking-wide text-[#7C3AED] mb-2">
                    PAYMENT INFORMATION
                  </h4>

                  <div className="grid grid-cols-12 gap-2 py-0.5">
                    <span className="col-span-6 font-bold text-stone-800">Receipt/Cheque/DD/Online Transfer Reference/UTR Number:</span>
                    <span className="col-span-6 text-stone-700 font-mono">{refReceiptNo}</span>
                  </div>

                  <div className="grid grid-cols-12 gap-2 py-0.5">
                    <span className="col-span-6 font-bold text-stone-800">Date:</span>
                    <span className="col-span-6 text-stone-700 font-mono">{refDate}</span>
                  </div>

                  <div className="grid grid-cols-12 gap-2 py-0.5">
                    <span className="col-span-6 font-bold text-stone-800">Amount:</span>
                    <span className="col-span-6 text-stone-700 font-mono">{refAmount}</span>
                  </div>

                  <div className="grid grid-cols-12 gap-2 py-0.5">
                    <span className="col-span-6 font-bold text-stone-800">Payment Source:</span>
                    <span className="col-span-6 text-stone-700">{refPaymentSource}</span>
                  </div>

                  <div className="grid grid-cols-12 gap-2 py-0.5">
                    <span className="col-span-6 font-bold text-stone-800">Payment Description:</span>
                    <span className="col-span-6 text-stone-700">{refPaymentDesc}</span>
                  </div>
                </div>
              </div>

              {/* Footer with Red Delete button */}
              <div className="p-3.5 border-t border-stone-200 bg-white flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => {
                    const m = viewingMember;
                    setViewingMember(null);
                    setDeleteDialog(m);
                  }}
                  className="px-4 py-1.5 bg-[#E53935] hover:bg-[#D32F2F] text-white text-xs font-bold rounded shadow-xs transition-colors cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* ==================================================== */}
      {/* MODAL 3: LABEL PREVIEW & PRINT INTERFACE             */}
      {/* ==================================================== */}
      <Modal isOpen={isLabelPreviewOpen} onClose={() => setIsLabelPreviewOpen(false)}>
        <div
          className="bg-white rounded-2xl max-w-4xl w-full border border-[#E8DFD8] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8DFD8] bg-[#FAF7F2] print:hidden no-print">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#510601]/10 text-[#510601]">
                <Printer className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#180200]">
                  Print-Oriented Address Label Preview
                </h3>
                <p className="text-xs text-[#863221]">
                  {selectedMembersForLabels.length} address label{selectedMembersForLabels.length !== 1 ? 's' : ''} ready for dispatch printing. Fixed physical aspect ratio.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsLabelPreviewOpen(false)}
              className="text-[#863221]/60 hover:text-[#180200] p-1.5 rounded-lg hover:bg-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Printable Label Grid Container */}
          <div className="flex-1 overflow-y-auto p-6 bg-stone-100/60 print:bg-white print:p-0" ref={printContainerRef}>
            {/* Top Print Notice */}
            <div className="mb-4 flex items-center gap-2.5 bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs text-amber-900 print:hidden no-print">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-700" />
              <span>
                Physical 2-column sticker sheet format (3.5" x 2.25" / ~89mm x 57mm). Optimized for standard A4 / label printers without overflowing.
              </span>
            </div>

            {/* Labels Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:grid-cols-2 print:gap-4">
              {selectedMembersForLabels.map((m) => (
                <div
                  key={m.id}
                  className="printable-label-card bg-white rounded-xl border-2 border-dashed border-stone-300 p-4 shadow-sm relative flex flex-col justify-between"
                  style={{
                    minHeight: '190px',
                    maxWidth: '380px',
                    margin: '0 auto',
                    width: '100%'
                  }}
                >
                  {/* Organization Top Banner */}
                  <div className="border-b border-[#E8DFD8] pb-1.5 mb-2 flex items-center justify-between">
                    <span className="font-bold text-[10px] tracking-wider text-[#510601] uppercase">
                      Akhila Havyaka Mahasabha
                    </span>
                    <span className="font-mono text-[10px] font-bold bg-[#FAF7F2] text-[#510601] px-1.5 py-0.5 rounded border border-[#E8DFD8]">
                      #{m.membershipNumber || m.id}
                    </span>
                  </div>

                  {/* Recipient Details */}
                  <div className="space-y-1 text-xs">
                    <div className="font-bold text-sm text-[#180200] leading-snug">
                      To: {m.fullName || m.name}
                    </div>
                    <div className="text-[#180200] leading-tight line-clamp-2">
                      {m.addressLine || m.address || '—'}
                    </div>
                    <div className="text-[#863221] text-[11px] font-medium leading-tight">
                      {m.talukName || m.post ? `${m.talukName || m.post}, ` : ''}
                      {m.districtName || ''}{m.stateName ? `, ${m.stateName}` : ''}
                    </div>
                    <div className="font-mono font-bold text-xs text-[#510601] pt-0.5">
                      PIN: {m.postalCode || '—'}
                    </div>
                  </div>

                  {/* Label Footer */}
                  <div className="border-t border-[#E8DFD8] pt-1.5 mt-2 flex items-center justify-between text-[10px] text-[#863221]">
                    <span className="font-mono">
                      Mob: {m.mobile || m.mobileNumber || '—'}
                    </span>
                    <span className="px-1.5 py-0.5 bg-[#FAF7F2] text-[#510601] font-semibold rounded border border-[#E8DFD8]">
                      {m.membershipType || 'Member'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-[#E8DFD8] bg-[#FAF7F2] print:hidden no-print">
            <span className="text-xs text-[#863221]">
              Showing {selectedMembersForLabels.length} printable label cards
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsLabelPreviewOpen(false)}
                className="py-2.5 px-4 border border-[#E8DFD8] text-[#863221] hover:text-[#180200] hover:bg-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Close Preview
              </button>
              <button
                type="button"
                onClick={handleTriggerPrint}
                className="flex items-center gap-1.5 py-2.5 px-5 bg-[#510601] hover:bg-[#863221] text-white text-xs font-bold rounded-xl shadow-sm transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Labels</span>
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* ==================================================== */}
      {/* MODAL 4: STATUS TOGGLE CONFIRMATION                  */}
      {/* ==================================================== */}
      <Modal isOpen={Boolean(statusDialog)} onClose={() => setStatusDialog(null)}>
        {statusDialog && (
          <div
            className="bg-white rounded-2xl max-w-sm w-full border border-[#E8DFD8] shadow-2xl p-6 text-center animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3.5 ${statusDialog.nextStatus === 'Inactive'
                ? 'bg-red-100 text-[#ED4636]'
                : 'bg-[#3D705C]/10 text-[#3D705C]'
                }`}
            >
              {statusDialog.nextStatus === 'Inactive' ? (
                <AlertTriangle className="w-7 h-7" />
              ) : (
                <CheckCircle2 className="w-7 h-7" />
              )}
            </div>

            <h3 className="text-base font-bold text-[#180200]">
              {statusDialog.nextStatus === 'Inactive' ? 'Deactivate' : 'Activate'} Member?
            </h3>
            <p className="text-xs text-[#863221] mt-1.5 leading-relaxed">
              Are you sure you want to mark{' '}
              <strong className="text-[#180200]">
                {statusDialog.member.fullName || statusDialog.member.name}
              </strong>{' '}
              as <span className="font-bold">{statusDialog.nextStatus}</span>?
            </p>

            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setStatusDialog(null)}
                className="w-full py-2.5 px-4 border border-[#E8DFD8] text-[#863221] hover:text-[#180200] hover:bg-[#FAF7F2] text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmStatusToggle}
                className={`w-full py-2.5 px-4 text-white text-xs font-bold rounded-xl shadow-sm transition-colors cursor-pointer ${statusDialog.nextStatus === 'Inactive'
                  ? 'bg-[#ED4636] hover:bg-[#C93324]'
                  : 'bg-[#3D705C] hover:bg-[#2F5747]'
                  }`}
              >
                {statusDialog.nextStatus === 'Inactive' ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ==================================================== */}
      {/* MODAL 5: DELETE CONFIRMATION                         */}
      {/* ==================================================== */}
      <Modal isOpen={Boolean(deleteDialog)} onClose={() => setDeleteDialog(null)}>
        {deleteDialog && (
          <div
            className="bg-white rounded-2xl max-w-md w-full border border-[#E8DFD8] shadow-2xl p-6 text-center animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 rounded-full bg-red-100 text-[#ED4636] flex items-center justify-center mx-auto mb-3.5">
              <Trash2 className="w-7 h-7" />
            </div>

            <h3 className="text-lg font-bold text-[#180200]">Delete Membership</h3>
            <p className="text-sm font-semibold text-[#510601] mt-2">
              Are you sure you want to delete this membership?
            </p>
            <p className="text-xs text-[#863221] mt-1.5 leading-relaxed bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E8DFD8]">
              <strong className="text-[#180200]">
                {deleteDialog.fullName || deleteDialog.name}
              </strong>{' '}
              <span className="font-mono text-[#510601] font-bold">
                (#{deleteDialog.membershipNumber || deleteDialog.id})
              </span>
            </p>

            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteDialog(null)}
                className="w-full py-2.5 px-4 border border-[#E8DFD8] text-[#863221] hover:text-[#180200] hover:bg-[#FAF7F2] text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                No / Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="w-full py-2.5 px-4 bg-[#ED4636] hover:bg-[#C93324] text-white text-xs font-bold rounded-xl shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Yes / Delete</span>
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ==================================================== */}
      {/* FLOATING TOAST NOTIFICATION                          */}
      {/* ==================================================== */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in-up">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border text-sm font-medium ${toastMessage.type === 'error'
              ? 'bg-red-50 text-red-800 border-red-200'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
              }`}
          >
            {toastMessage.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-red-600" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            )}
            <span>{toastMessage.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
