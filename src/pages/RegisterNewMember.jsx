import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import {
  User,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  Phone,
  Calendar,
  Building,
  MapPin,
  Save,
  ArrowLeft,
  Tag
} from 'lucide-react';
import {
  getStoredMembers,
  saveStoredMembers,
  getStoredUnapprovedMembers,
  saveStoredUnapprovedMembers,
  getStoredMembershipTypes,
  getStoredStates,
  getStoredDistricts,
  getStoredTaluks,
  getStoredPostalCodes,
  lookupLocationByPin,
  searchPostalLocations,
  getStoredGothras,
  getActivePaymentModes,
  findMatchingReceiptForMember
} from '../utils/receiptStore';
import CountryCodeSelect from '../components/CountryCodeSelect';
import SearchableFormSelect from '../components/SearchableFormSelect';
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

const NAME_TITLES = ['SRI.', 'MS.'];

export default function RegisterNewMember() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  // Mode detection: Edit mode vs View mode vs Add/Register mode
  const isEditMode = Boolean(
    location.pathname.includes('/edit') ||
    location.state?.mode === 'edit'
  );

  const isViewMode = Boolean(
    !isEditMode && (
      location.pathname.includes('/view') ||
      location.state?.mode === 'view' ||
      location.state?.viewingMember ||
      params.id
    )
  );

  const returnPath =
    location.state?.returnPath ||
    ((location.pathname.includes('/view') || location.pathname.includes('/edit')) && (location.state?.from === 'receipt-entry' || location.state?.fromReceiptEntry)
      ? '/dashboard/receipts/entry'
      : '/dashboard/membership/list');

  // ----------------------------------------------------
  // MASTER STORES
  // ----------------------------------------------------
  const [members, setMembers] = useState(getStoredMembers());
  const [membershipTypes, setMembershipTypes] = useState(getStoredMembershipTypes());
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

  // Resolve target member for View / Edit Mode
  const targetMember = useMemo(() => {
    if (location.state?.member) return location.state.member;
    if (location.state?.viewingMember) return location.state.viewingMember;
    if (location.state?.editingMember) return location.state.editingMember;
    const targetId = params.id || location.state?.membershipNumber || location.state?.memberId || location.state?.registrationNumber;
    if (targetId) {
      const allMembers = getStoredMembers();
      const unapproved = getStoredUnapprovedMembers();
      return (
        allMembers.find(
          (m) =>
            (m.membershipNumber && String(m.membershipNumber).trim().toLowerCase() === String(targetId).trim().toLowerCase()) ||
            String(m.id || '').trim().toLowerCase() === String(targetId).trim().toLowerCase() ||
            (m.registrationNumber && String(m.registrationNumber).trim().toLowerCase() === String(targetId).trim().toLowerCase())
        ) ||
        unapproved.find(
          (m) =>
            (m.membershipNumber && String(m.membershipNumber).trim().toLowerCase() === String(targetId).trim().toLowerCase()) ||
            String(m.id || '').trim().toLowerCase() === String(targetId).trim().toLowerCase() ||
            (m.registrationNumber && String(m.registrationNumber).trim().toLowerCase() === String(targetId).trim().toLowerCase())
        ) || null
      );
    }
    return null;
  }, [location.state, params.id, members]);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState(null);
  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Form tab: 'membershipDetails' | 'paymentInfo'
  const [activeFormSection, setActiveFormSection] = useState('membershipDetails');
  const fileInputRef = useRef(null);
  const pinWrapperRef = useRef(null);

  // Active membership types available for new registrations
  const activeMembershipTypes = useMemo(() => {
    return membershipTypes.filter((mt) => mt.status === 'Active');
  }, [membershipTypes]);

  const initialFormState = {
    // Top dropdowns
    membershipTypeCategory: 'Only Havyaka Mahasabha Membership',
    membershipTypeId: '',
    membershipType: '',

    // Photo
    photoUrl: '',

    // Personal / Basic Info
    nameTitle: 'SRI.',
    name: '',
    fatherHusbandName: '',
    mobileCountryCode: '+91',
    mobileCountryIso: 'IN',
    mobile: '',
    whatsappCountryCode: '+91',
    whatsappCountryIso: 'IN',
    whatsappNumber: '',
    birthDate: '',
    age: '',

    // Details Grid
    gothra: '',
    gender: 'Male',
    bloodGroup: '',
    aadharNumber: '',
    address: '',
    postalCode: '',
    locality: '',
    taluk: '',
    district: '',
    state: 'Karnataka',
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

  // PIN code autocomplete suggestions
  const [pinSuggestions, setPinSuggestions] = useState([]);
  const [isPinSuggestionsOpen, setIsPinSuggestionsOpen] = useState(false);

  // Click outside listener for PIN suggestion dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (pinWrapperRef.current && !pinWrapperRef.current.contains(e.target)) {
        setIsPinSuggestionsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Initialize first active membership type and default price (only in add mode)
  useEffect(() => {
    if (!isViewMode && !isEditMode && activeMembershipTypes.length > 0 && !formData.membershipTypeId) {
      const firstActiveType = activeMembershipTypes[0];
      const defaultPrice = firstActiveType?.currentPrice || firstActiveType?.price || 1000;
      setFormData((prev) => ({
        ...prev,
        membershipTypeId: firstActiveType.id,
        membershipType: firstActiveType.name,
        amount: prev.amount || String(defaultPrice)
      }));
    }
  }, [activeMembershipTypes, isViewMode, isEditMode]);

  // Load member record when viewing or editing an existing member
  useEffect(() => {
    if (targetMember) {
      setFormData({
        membershipTypeCategory: targetMember.membershipTypeCategory || 'Only Havyaka Mahasabha Membership',
        membershipTypeId: targetMember.membershipTypeId || '',
        membershipType: targetMember.membershipType || '',
        photoUrl: targetMember.photoUrl || '',
        nameTitle: targetMember.nameTitle || (targetMember.gender === 'Female' ? 'MS.' : 'SRI.'),
        name: targetMember.rawName || targetMember.name || targetMember.fullName || '',
        fatherHusbandName: targetMember.fatherHusbandName || '',
        mobileCountryCode: targetMember.mobileCountryCode || targetMember.phone_country_code || '+91',
        mobileCountryIso: targetMember.mobileCountryIso || 'IN',
        mobile: targetMember.mobile || targetMember.mobileNumber || targetMember.contactNumber || targetMember.phoneNumber || '',
        whatsappCountryCode: targetMember.whatsappCountryCode || targetMember.whatsapp_country_code || '+91',
        whatsappCountryIso: targetMember.whatsappCountryIso || 'IN',
        whatsappNumber: targetMember.whatsappNumber || targetMember.whatsAppNumber || targetMember.whatsapp_number || '',
        birthDate: targetMember.birthDate || '',
        age: targetMember.age ? String(targetMember.age) : '',
        gothra: targetMember.gothra || targetMember.gotra || '',
        gender: targetMember.gender || 'Male',
        bloodGroup: targetMember.bloodGroup || '',
        aadharNumber: targetMember.aadharNumber || '',
        address: targetMember.address || targetMember.addressLine || '',
        postalCode: targetMember.postalCode || targetMember.pinCode || targetMember.pincode || targetMember.pin || '',
        locality: targetMember.locality || targetMember.postOffice || targetMember.post || '',
        taluk: targetMember.taluk || targetMember.talukName || '',
        district: targetMember.district || targetMember.districtName || '',
        state: targetMember.state || targetMember.stateName || 'Karnataka',
        nativePlace: targetMember.nativePlace || targetMember.nativeDetails || '',
        appliedOnBehalfOf: targetMember.appliedOnBehalfOf || 'Self',
        qualification: targetMember.qualification || '',
        employment: targetMember.employment || targetMember.profession || '',
        magazineNeeded: targetMember.magazineNeeded || 'YES',
        referredMembershipNo: targetMember.referredMembershipNo || '',
        referredMembershipName: targetMember.referredMembershipName || '',
        familyMembershipNo: targetMember.familyMembershipNo || '',
        familyMembershipName: targetMember.familyMembershipName || '',
        paymentMode: targetMember.paymentMode || 'Cash',
        bankAccount: targetMember.bankAccount || '',
        amount: targetMember.amount ? String(targetMember.amount) : '',
        receiptDate: targetMember.receiptDate || targetMember.createdDate || targetMember.registrationDate || new Date().toISOString().split('T')[0],
        transactionId: targetMember.transactionId || '',
        transactionDate: targetMember.transactionDate || '',
        paymentRemarks: targetMember.paymentRemarks || ''
      });
      setIsWhatsAppSameAsMobile(Boolean(targetMember.isWhatsAppSameAsMobile));
    }
  }, [targetMember]);

  // Maximum allowed Date of Birth (must be at least 18 years old dynamically)
  const maxAllowedDobDate = useMemo(() => {
    const today = new Date();
    const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    const y = maxDate.getFullYear();
    const m = String(maxDate.getMonth() + 1).padStart(2, '0');
    const d = String(maxDate.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, []);

  // Safe and robust parser for complete Date of Birth (YYYY-MM-DD or DD-MM-YYYY)
  const parseDobToDate = (dob) => {
    if (!dob) return null;
    if (dob instanceof Date && !isNaN(dob.getTime())) return dob;
    if (typeof dob !== 'string') return null;
    const trimmed = dob.trim();
    if (!trimmed) return null;

    // Strict YYYY-MM-DD (e.g. standard HTML5 date input format)
    const ymdMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (ymdMatch) {
      const y = parseInt(ymdMatch[1], 10);
      const m = parseInt(ymdMatch[2], 10) - 1;
      const d = parseInt(ymdMatch[3], 10);
      const dateObj = new Date(y, m, d);
      if (dateObj.getFullYear() === y && dateObj.getMonth() === m && dateObj.getDate() === d) {
        return dateObj;
      }
      return null;
    }

    // Strict DD-MM-YYYY or DD/MM/YYYY
    const dmyMatch = trimmed.match(/^(\d{2})[-/](\d{2})[-/](\d{4})$/);
    if (dmyMatch) {
      const d = parseInt(dmyMatch[1], 10);
      const m = parseInt(dmyMatch[2], 10) - 1;
      const y = parseInt(dmyMatch[3], 10);
      const dateObj = new Date(y, m, d);
      if (dateObj.getFullYear() === y && dateObj.getMonth() === m && dateObj.getDate() === d) {
        return dateObj;
      }
      return null;
    }

    return null;
  };

  // Helper to compute exact age from a complete and valid Date of Birth
  const calculateAge = (dob, referenceDate = new Date()) => {
    const birthDate = parseDobToDate(dob);
    if (!birthDate) return '';

    const today = referenceDate instanceof Date ? referenceDate : new Date(referenceDate);
    if (isNaN(today.getTime())) return '';

    let years = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      years--;
    }

    if (years < 0) return '';
    return String(years);
  };

  const handleDobChange = (e) => {
    const dob = e.target.value;
    const parsedDate = parseDobToDate(dob);
    const ageStr = calculateAge(dob);
    const numAge = parseInt(ageStr, 10);

    setFormData((prev) => ({ ...prev, birthDate: dob, age: ageStr }));

    if (!dob) {
      setFormErrors((prev) => ({ ...prev, birthDate: '' }));
      return;
    }

    if (!parsedDate) {
      setFormErrors((prev) => ({ ...prev, birthDate: 'Please enter a valid Date of Birth' }));
      return;
    }

    const now = new Date();
    if (parsedDate > now) {
      setFormErrors((prev) => ({ ...prev, birthDate: 'Date of Birth cannot be in the future' }));
      return;
    }

    if (isNaN(numAge) || numAge < 18) {
      setFormErrors((prev) => ({ ...prev, birthDate: 'Member must be at least 18 years old.' }));
      return;
    }

    if (formErrors.birthDate) {
      setFormErrors((prev) => ({ ...prev, birthDate: '' }));
    }
  };

  const handleTitleChange = (title) => {
    setFormData((prev) => {
      let gender = prev.gender;
      if (title === 'SRI.') {
        gender = 'Male';
      } else if (title === 'MS.') {
        gender = 'Female';
      }
      return { ...prev, nameTitle: title, gender };
    });
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
      amount: String(price)
    }));
    if (formErrors.membershipTypeId) {
      setFormErrors((prev) => ({ ...prev, membershipTypeId: '' }));
    }
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
    // Strip duplicate country dial digits if user pasted with dial code
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

  const handlePinChange = (val) => {
    const cleanVal = val.replace(/\D/g, '').slice(0, 6);
    setFormData((prev) => ({
      ...prev,
      postalCode: cleanVal
    }));
    if (formErrors.postalCode) setFormErrors((prev) => ({ ...prev, postalCode: '' }));

    if (cleanVal.length >= 2) {
      const results = searchPostalLocations(cleanVal, 20);
      setPinSuggestions(results);
      setIsPinSuggestionsOpen(results.length > 0);
    } else {
      setPinSuggestions([]);
      setIsPinSuggestionsOpen(false);
    }

    if (cleanVal.length === 6) {
      const matchInfo = lookupLocationByPin(cleanVal);
      if (matchInfo.found) {
        setFormData((prev) => ({
          ...prev,
          locality: prev.locality || matchInfo.area || '',
          taluk: matchInfo.talukName || '',
          district: matchInfo.districtName || '',
          state: matchInfo.stateName || 'Karnataka'
        }));
      }
    }
  };

  const handleSelectPostalSuggestion = (item) => {
    setFormData((prev) => ({
      ...prev,
      postalCode: item.postalCode,
      locality: item.area || '',
      taluk: item.talukName || '',
      district: item.districtName || '',
      state: item.stateName || 'Karnataka'
    }));
    setPinSuggestions([]);
    setIsPinSuggestionsOpen(false);
    if (formErrors.postalCode) setFormErrors((prev) => ({ ...prev, postalCode: '' }));
  };

  const validateForm = () => {
    const errors = {};
    const cleanName = formData.name.trim();
    const cleanFather = formData.fatherHusbandName.trim();
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

    if (!formData.birthDate) {
      errors.birthDate = 'Date of Birth is required';
    } else {
      const parsedDob = parseDobToDate(formData.birthDate);
      if (!parsedDob) {
        errors.birthDate = 'Please enter a valid Date of Birth';
      } else {
        const now = new Date();
        if (parsedDob > now) {
          errors.birthDate = 'Date of Birth cannot be in the future';
        } else {
          const exactAge = parseInt(calculateAge(formData.birthDate), 10);
          if (isNaN(exactAge) || exactAge < 18) {
            errors.birthDate = 'Member must be at least 18 years old.';
          }
        }
      }
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
      setActiveFormSection('membershipDetails');
      return;
    }

    if (isEditMode && targetMember) {
      const selectedTypeObj = membershipTypes.find((mt) => mt.id === formData.membershipTypeId);
      const formattedName = `${formData.nameTitle ? formData.nameTitle + ' ' : ''}${formData.name.trim()}`.trim();

      const updatedMember = {
        ...targetMember,
        nameTitle: formData.nameTitle || 'SRI.',
        rawName: formData.name.trim(),
        fullName: formattedName,
        name: formattedName,
        fatherHusbandName: formData.fatherHusbandName.trim(),
        membershipName: formattedName,
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
        birthDate: formData.birthDate,
        age: formData.age || calculateAge(formData.birthDate),
        photoUrl: formData.photoUrl,

        gothra: formData.gothra,
        gender: formData.gender,
        bloodGroup: formData.bloodGroup,
        aadharNumber: formData.aadharNumber.trim(),
        postalCode: formData.postalCode.trim(),
        locality: (formData.locality || '').trim(),
        postOffice: (formData.locality || '').trim(),
        place: (formData.locality || formData.taluk || '').trim(),
        city: (formData.locality || formData.taluk || '').trim(),
        taluk: (formData.taluk || '').trim(),
        talukName: (formData.taluk || '').trim(),
        district: (formData.district || '').trim(),
        districtName: (formData.district || '').trim(),
        state: (formData.state || 'Karnataka').trim(),
        stateName: (formData.state || 'Karnataka').trim(),
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
        amount: Number(formData.amount) || selectedTypeObj?.currentPrice || targetMember.amount || 1000,

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
      };

      // Check if updating in approved members or unapproved members
      const currentUnapproved = getStoredUnapprovedMembers();
      const isUnapproved = currentUnapproved.some(
        (u) => (targetMember.id && u.id === targetMember.id) || (targetMember.membershipNumber && u.membershipNumber === targetMember.membershipNumber)
      );

      if (isUnapproved) {
        const updatedUnapprovedList = currentUnapproved.map((u) => {
          if ((targetMember.id && u.id === targetMember.id) || (targetMember.membershipNumber && u.membershipNumber === targetMember.membershipNumber)) {
            return updatedMember;
          }
          return u;
        });
        saveStoredUnapprovedMembers(updatedUnapprovedList);
      } else {
        const updatedMembersList = members.map((m) => {
          if (
            (targetMember.id && m.id === targetMember.id) ||
            (targetMember.membershipNumber && m.membershipNumber === targetMember.membershipNumber)
          ) {
            return updatedMember;
          }
          return m;
        });
        persistMembers(updatedMembersList);
      }

      showToast(`Member "${updatedMember.fullName}" (#${updatedMember.membershipNumber || targetMember.id}) updated successfully.`);

      setTimeout(() => {
        navigate(returnPath);
      }, 700);
      return;
    }

    const unapprovedList = getStoredUnapprovedMembers();
    const selectedTypeObj = membershipTypes.find((mt) => mt.id === formData.membershipTypeId);
    const formattedName = `${formData.nameTitle ? formData.nameTitle + ' ' : ''}${formData.name.trim()}`.trim();
    const todayStr = new Date().toISOString().split('T')[0];

    // Guaranteed unique, stable member ID
    const uniqueId = `MEM-UNAPP-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // Calculate next sequential registration number
    const allMembers = [...getStoredMembers(), ...unapprovedList];
    let maxRegSeq = 0;
    allMembers.forEach((m) => {
      const match = String(m.registrationNumber || '').match(/REG-\d{4}-(\d+)/);
      if (match) {
        const seq = parseInt(match[1], 10);
        if (!isNaN(seq) && seq > maxRegSeq) maxRegSeq = seq;
      }
    });
    const currentYear = new Date().getFullYear();
    const newRegNumber = `REG-${currentYear}-${String(maxRegSeq + 1).padStart(3, '0')}`;

    const newMember = {
      id: uniqueId,
      registrationNumber: newRegNumber,
      membershipNumber: '', // Strictly Not Assigned until officially approved
      nameTitle: formData.nameTitle || 'SRI.',
      rawName: formData.name.trim(),
      fullName: formattedName,
      name: formattedName,
      fatherHusbandName: formData.fatherHusbandName.trim(),
      membershipName: formattedName,
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
      birthDate: formData.birthDate,
      age: formData.age || calculateAge(formData.birthDate),
      photoUrl: formData.photoUrl,

      gothra: formData.gothra,
      gender: formData.gender,
      bloodGroup: formData.bloodGroup,
      aadharNumber: formData.aadharNumber.trim(),
      postalCode: formData.postalCode.trim(),
      locality: (formData.locality || '').trim(),
      postOffice: (formData.locality || '').trim(),
      place: (formData.locality || formData.taluk || '').trim(),
      city: (formData.locality || formData.taluk || '').trim(),
      taluk: (formData.taluk || '').trim(),
      talukName: (formData.taluk || '').trim(),
      district: (formData.district || '').trim(),
      districtName: (formData.district || '').trim(),
      state: (formData.state || 'Karnataka').trim(),
      stateName: (formData.state || 'Karnataka').trim(),
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
      receiptDate: formData.receiptDate || todayStr,
      transactionId: formData.transactionId.trim(),
      transactionDate: formData.transactionDate,
      paymentRemarks: formData.paymentRemarks.trim(),

      status: 'Unapproved',
      approvalStatus: 'Unapproved',
      receiptStatus: 'Unassigned',
      assignedReceiptNumber: '',
      registrationSource: 'Offline',
      registrationType: 'Offline',
      createdDate: todayStr,
      registrationDate: todayStr
    };

    saveStoredUnapprovedMembers([newMember, ...unapprovedList]);
    showToast(`Member "${newMember.fullName}" (${newRegNumber}) registered and added to Unapproved Members.`);

    setTimeout(() => {
      navigate('/dashboard/membership/unapproved');
    }, 800);
  };

  return (
    <div className="max-w-[1240px] mx-auto space-y-6">
      {/* Toast notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium flex items-center gap-2 animate-in slide-in-from-bottom-5 duration-300 ${toastMessage.type === 'error'
            ? 'bg-red-50 border-red-200 text-red-800'
            : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}
        >
          {toastMessage.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          )}
          <span>{toastMessage.message}</span>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* BREADCRUMB & HEADER                                  */}
      {/* ---------------------------------------------------- */}
      <div>
        <nav className="flex items-center gap-2 text-sm text-[#863221] font-medium mb-2">
          <Link to="/dashboard" className="hover:text-[#510601] transition-colors">
            Dashboard
          </Link>
          <ChevronRight className="w-4 h-4 text-[#863221]/50" />
          {returnPath.includes('receipt') ? (
            <>
              <Link to="/dashboard/receipts/entry" className="hover:text-[#510601] transition-colors">
                Receipt Entry
              </Link>
              <ChevronRight className="w-4 h-4 text-[#863221]/50" />
              <span className="text-[#180200] font-semibold">View Member Details</span>
            </>
          ) : (
            <>
              <Link to="/dashboard/membership/list" className="hover:text-[#510601] transition-colors">
                Membership
              </Link>
              <ChevronRight className="w-4 h-4 text-[#863221]/50" />
              <span className="text-[#180200] font-semibold">
                {isViewMode ? 'View Member Details' : isEditMode ? 'Edit Member Details' : 'Register New Member'}
              </span>
            </>
          )}
        </nav>
        <div className="flex items-center justify-between gap-4 w-full">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#180200] tracking-tight flex items-center gap-3">
              <span>{isViewMode ? 'View Member Details' : isEditMode ? 'Edit Member Details' : 'Register New Member'}</span>
              {(isViewMode || isEditMode) && targetMember?.registrationNumber && (
                <span className="font-mono text-sm font-bold bg-[#FAF7F2] text-[#510601] px-3 py-1 rounded-xl border border-[#E8DFD8]" title="Registration Number">
                  {targetMember.registrationNumber}
                </span>
              )}
              {(isViewMode || isEditMode) && targetMember?.membershipNumber && targetMember.membershipNumber !== 'Not Assigned' && targetMember.approvalStatus === 'Approved' && (
                <span className="font-mono text-sm font-bold bg-emerald-50 text-emerald-800 px-3 py-1 rounded-xl border border-emerald-200" title="Membership Number">
                  #{targetMember.membershipNumber}
                </span>
              )}
            </h1>
          </div>
          <button
            type="button"
            onClick={() => navigate(returnPath)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-[#FAF7F2] text-[#510601] border border-[#E8DFD8] text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-xs cursor-pointer shrink-0"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>{returnPath.includes('receipt') ? 'Back to Receipt Entry' : returnPath.includes('unapproved') ? 'Back to Unapproved Members' : 'Back to Membership List'}</span>
          </button>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* FORM CARD CONTAINER                                  */}
      {/* ---------------------------------------------------- */}
      <div className="w-full bg-white rounded-2xl border border-[#E8DFD8] shadow-sm overflow-hidden">
        {/* Form Top Bar with Tabs */}
        <div className="px-6 sm:px-8 pt-6 sm:pt-7 pb-3 border-b border-[#E8DFD8]">
          <div className="flex items-center justify-between pb-3 border-b-2 border-[#8C1801]">
            <h2 className="text-xl sm:text-2xl font-bold text-[#180200]">
              {isViewMode
                ? `Membership Details: ${formData.name || targetMember?.fullName || 'Member Record'}`
                : isEditMode
                ? `Edit Membership: ${formData.name || targetMember?.fullName || 'Member Record'}`
                : 'New Membership Form'}
            </h2>
            <span className="text-xs sm:text-sm text-[#863221] font-medium">
              {isViewMode ? (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                  targetMember?.status === 'Unapproved' || targetMember?.approvalStatus === 'Unapproved'
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}>
                  {targetMember?.status === 'Unapproved' || targetMember?.approvalStatus === 'Unapproved' ? 'Unapproved' : (targetMember?.status || targetMember?.approvalStatus || 'Active Member')}
                </span>
              ) : (
                '* Required fields'
              )}
            </span>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-4">
            <button
              type="button"
              onClick={() => setActiveFormSection('membershipDetails')}
              className={`px-6 py-2.5 text-xs sm:text-sm font-bold rounded-t-lg border-t border-x transition-all cursor-pointer ${activeFormSection === 'membershipDetails'
                ? 'bg-[#510601] text-white border-[#510601] shadow-xs'
                : 'bg-[#FAF7F2] text-[#510601] border-[#E8DFD8] hover:bg-white'
                }`}
            >
              Membership Details
            </button>
            <button
              type="button"
              onClick={() => setActiveFormSection('paymentInfo')}
              className={`px-6 py-2.5 text-xs sm:text-sm font-bold rounded-t-lg border-t border-x transition-all cursor-pointer ${activeFormSection === 'paymentInfo'
                ? 'bg-[#510601] text-white border-[#510601] shadow-xs'
                : 'bg-[#FAF7F2] text-[#510601] border-[#E8DFD8] hover:bg-white'
                }`}
            >
              Payment Information
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSaveMember}>
          <div className="px-6 sm:px-8 py-6 sm:py-7 space-y-6">
            {/* TAB 1: MEMBERSHIP DETAILS */}
            {activeFormSection === 'membershipDetails' && (
              <div className="space-y-6">
                <fieldset disabled={isViewMode} className="space-y-6 disabled:opacity-95">
                {/* Top Row: Membership Type & Select Havyaka Membership Type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm text-[#3D140C] mb-1.5 font-semibold">
                      Membership Type:
                    </label>
                    <select
                      value={formData.membershipTypeCategory}
                      onChange={(e) =>
                        setFormData({ ...formData, membershipTypeCategory: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 bg-[#FAF7F2] hover:bg-[#FDFBF7] focus:bg-white border border-[#DFD5CC] hover:border-[#8C1801]/60 rounded-lg text-sm text-[#180200] focus:outline-none focus:border-[#510601] focus:ring-2 focus:ring-[#510601]/20 transition-all cursor-pointer shadow-2xs"
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
                    <label className="block text-sm text-[#3D140C] mb-1.5 font-semibold">
                      Select Havyaka Membership Type: <span className="text-red-600">*</span>
                    </label>
                    <select
                      value={formData.membershipTypeId}
                      onChange={(e) => handleMembershipTypeSelect(e.target.value)}
                      className={`w-full px-3.5 py-2.5 bg-[#FAF7F2] hover:bg-[#FDFBF7] focus:bg-white border rounded-lg text-sm text-[#180200] focus:outline-none focus:border-[#510601] focus:ring-2 focus:ring-[#510601]/20 transition-all cursor-pointer shadow-2xs ${formErrors.membershipTypeId ? 'border-red-500 ring-2 ring-red-500/20' : 'border-[#DFD5CC] hover:border-[#8C1801]/60'
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
                      <p className="text-[11px] text-red-600 mt-1">{formErrors.membershipTypeId}</p>
                    )}
                  </div>
                </div>

                {/* Red separator bar */}
                <div className="border-b border-[#8C1801]/30 my-2" />

                {/* Photo upload + Basic Details */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                  {/* Left: Passport Size Photo Upload */}
                  <div className="md:col-span-3 flex flex-col items-center justify-center p-1">
                    <div className="w-32 sm:w-36 h-40 sm:h-44 border-2 border-dashed border-[#DFD5CC] bg-[#FAF7F2] flex flex-col items-center justify-center relative overflow-hidden rounded-lg shadow-2xs hover:border-[#8C1801]/50 transition-colors">
                      {formData.photoUrl ? (
                        <img
                          src={formData.photoUrl}
                          alt="Member Photo"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-[#863221]/60 flex flex-col items-center justify-center p-3 text-center">
                          <User className="w-10 h-10 stroke-[1.2] text-[#863221]/50" />
                          <span className="text-[10px] text-[#863221]/70 mt-1.5 font-semibold">Passport Photo</span>
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-2.5 py-1.5 px-4 bg-[#510601] hover:bg-[#8C1801] text-white text-xs font-semibold rounded-md text-center shadow-xs transition-colors cursor-pointer inline-flex items-center justify-center"
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

                  {/* Right: Member Name, Father/Husband Name, Mobile, WhatsApp, DOB, Age */}
                  <div className="md:col-span-9 grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* New Member Name */}
                    <div>
                      <label className="block text-sm text-[#3D140C] mb-1.5 font-semibold">
                        New Member Name: <span className="text-red-600">*</span>
                      </label>
                      <div className="flex gap-2">
                        <div className="w-24 shrink-0">
                          <select
                            value={formData.nameTitle}
                            onChange={(e) => handleTitleChange(e.target.value)}
                            className="w-full px-2.5 py-2.5 bg-[#FAF7F2] hover:bg-[#FDFBF7] focus:bg-white border border-[#DFD5CC] hover:border-[#8C1801]/60 rounded-lg text-sm font-bold text-[#510601] focus:outline-none focus:border-[#510601] focus:ring-2 focus:ring-[#510601]/20 cursor-pointer shadow-2xs transition-all"
                          >
                            {NAME_TITLES.map((t) => (
                              <option key={t} value={t}>
                                {t}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex-1 min-w-0">
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => {
                              setFormData({ ...formData, name: e.target.value });
                              if (formErrors.name) setFormErrors({ ...formErrors, name: '' });
                            }}
                            placeholder="Enter member name"
                            className={`w-full px-3.5 py-2.5 bg-[#FAF7F2] hover:bg-[#FDFBF7] focus:bg-white border rounded-lg text-sm text-[#180200] placeholder:text-[#9E8B7F] focus:outline-none focus:border-[#510601] focus:ring-2 focus:ring-[#510601]/20 shadow-2xs transition-all ${formErrors.name ? 'border-red-500 ring-2 ring-red-500/20' : 'border-[#DFD5CC] hover:border-[#8C1801]/60'
                              }`}
                          />
                        </div>
                      </div>
                      {formErrors.name && (
                        <p className="text-[11px] text-red-600 mt-1">{formErrors.name}</p>
                      )}
                    </div>

                    {/* Father / Husband Name */}
                    <div>
                      <label className="block text-sm text-[#3D140C] mb-1.5 font-semibold">
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
                        placeholder="Father / Husband Name"
                        className={`w-full px-3.5 py-2.5 bg-[#FAF7F2] hover:bg-[#FDFBF7] focus:bg-white border rounded-lg text-sm text-[#180200] placeholder:text-[#9E8B7F] focus:outline-none focus:border-[#510601] focus:ring-2 focus:ring-[#510601]/20 shadow-2xs transition-all ${formErrors.fatherHusbandName ? 'border-red-500 ring-2 ring-red-500/20' : 'border-[#DFD5CC] hover:border-[#8C1801]/60'
                          }`}
                      />
                      {formErrors.fatherHusbandName && (
                        <p className="text-[11px] text-red-600 mt-1">
                          {formErrors.fatherHusbandName}
                        </p>
                      )}
                    </div>

                    {/* Mobile / Phone Number */}
                    <div>
                      <label className="block text-sm text-[#3D140C] mb-1.5 font-semibold">
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
                            className={`w-full px-3.5 py-2.5 bg-[#FAF7F2] hover:bg-[#FDFBF7] focus:bg-white border rounded-lg text-sm text-[#180200] placeholder:text-[#9E8B7F] focus:outline-none focus:border-[#510601] focus:ring-2 focus:ring-[#510601]/20 shadow-2xs transition-all ${formErrors.mobile ? 'border-red-500 ring-2 ring-red-500/20' : 'border-[#DFD5CC] hover:border-[#8C1801]/60'
                              }`}
                          />
                        </div>
                      </div>
                      {formErrors.mobile && (
                        <p className="text-[11px] text-red-600 mt-1">{formErrors.mobile}</p>
                      )}
                    </div>

                    {/* WhatsApp Number */}
                    <div>
                      <label className="block text-sm text-[#3D140C] mb-1.5 font-semibold">
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
                            className={`w-full px-3.5 py-2.5 border rounded-lg text-sm text-[#180200] placeholder:text-[#9E8B7F] focus:outline-none focus:border-[#510601] focus:ring-2 focus:ring-[#510601]/20 shadow-2xs transition-all ${isWhatsAppSameAsMobile
                              ? 'bg-stone-100 text-stone-500 border-[#DFD5CC] cursor-not-allowed'
                              : 'bg-[#FAF7F2] hover:bg-[#FDFBF7] focus:bg-white border-[#DFD5CC] hover:border-[#8C1801]/60'
                              } ${formErrors.whatsappNumber ? 'border-red-500 ring-2 ring-red-500/20' : ''}`}
                          />
                        </div>
                      </div>
                      {formErrors.whatsappNumber && (
                        <p className="text-[11px] text-red-600 mt-1">{formErrors.whatsappNumber}</p>
                      )}
                      <label className="flex items-center gap-2 mt-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isWhatsAppSameAsMobile}
                          onChange={(e) => handleWhatsAppSameAsMobileToggle(e.target.checked)}
                          className="w-4 h-4 rounded text-[#510601] focus:ring-[#510601] border-[#DFD5CC] accent-[#510601] cursor-pointer"
                        />
                        <span className="text-xs text-[#3D140C] font-medium">
                          WhatsApp number is same as mobile/phone number
                        </span>
                      </label>
                    </div>

                    {/* Date of Birth */}
                    <div>
                      <label className="block text-sm text-[#3D140C] mb-1.5 font-semibold">
                        Date of Birth: <span className="text-red-600">*</span>
                      </label>
                      <DateInput
                        disabled={isViewMode}
                        max={maxAllowedDobDate}
                        value={formData.birthDate}
                        onChange={handleDobChange}
                        name="birthDate"
                        className={`w-full px-3.5 py-2.5 bg-[#FAF7F2] hover:bg-[#FDFBF7] focus:bg-white border rounded-lg text-sm text-[#180200] focus:outline-none focus:border-[#510601] focus:ring-2 focus:ring-[#510601]/20 shadow-2xs transition-all ${formErrors.birthDate ? 'border-red-500 ring-2 ring-red-500/20' : 'border-[#DFD5CC] hover:border-[#8C1801]/60'
                          }`}
                      />
                      {formErrors.birthDate && (
                        <p className="text-[11px] text-red-600 mt-1 font-medium">{formErrors.birthDate}</p>
                      )}
                    </div>

                    {/* Age */}
                    <div>
                      <label className="block text-sm text-[#3D140C] mb-1.5 font-semibold">Age:</label>
                      <input
                        type="text"
                        readOnly
                        value={formData.age}
                        placeholder="Auto-calculated from DOB"
                        className="w-full px-3.5 py-2.5 bg-[#F5EFEB] border border-[#DFD5CC] rounded-lg text-sm font-semibold text-[#510601] placeholder:text-[#9E8B7F] placeholder:font-normal focus:outline-none cursor-default shadow-2xs transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* 2-Column Grid Fields: Community, Identity & Address Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2 border-t border-[#DFD5CC]">
                  {/* Gothra */}
                  <div>
                    <label className="block text-sm text-[#3D140C] mb-1.5 font-semibold">
                      Gothra: <span className="text-red-600">*</span>
                    </label>
                    <select
                      value={formData.gothra}
                      onChange={(e) => {
                        setFormData({ ...formData, gothra: e.target.value });
                        if (formErrors.gothra) setFormErrors({ ...formErrors, gothra: '' });
                      }}
                      className={`w-full px-3.5 py-2.5 bg-[#FAF7F2] hover:bg-[#FDFBF7] focus:bg-white border rounded-lg text-sm text-[#180200] focus:outline-none focus:border-[#510601] focus:ring-2 focus:ring-[#510601]/20 shadow-2xs transition-all cursor-pointer ${formErrors.gothra ? 'border-red-500 ring-2 ring-red-500/20' : 'border-[#DFD5CC] hover:border-[#8C1801]/60'
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
                      <p className="text-[11px] text-red-600 mt-1">{formErrors.gothra}</p>
                    )}
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-sm text-[#3D140C] mb-1.5 font-semibold">
                      Gender: <span className="text-red-600">*</span>
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) => {
                        setFormData({ ...formData, gender: e.target.value });
                        if (formErrors.gender) setFormErrors({ ...formErrors, gender: '' });
                      }}
                      className={`w-full px-3.5 py-2.5 bg-[#FAF7F2] hover:bg-[#FDFBF7] focus:bg-white border rounded-lg text-sm text-[#180200] focus:outline-none focus:border-[#510601] focus:ring-2 focus:ring-[#510601]/20 shadow-2xs transition-all cursor-pointer ${formErrors.gender ? 'border-red-500 ring-2 ring-red-500/20' : 'border-[#DFD5CC] hover:border-[#8C1801]/60'
                        }`}
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                    {formErrors.gender && (
                      <p className="text-[11px] text-red-600 mt-1">{formErrors.gender}</p>
                    )}
                  </div>

                  {/* Blood Group */}
                  <div>
                    <label className="block text-sm text-[#3D140C] mb-1.5 font-semibold">
                      Blood Group:
                    </label>
                    <select
                      value={formData.bloodGroup}
                      onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#FAF7F2] hover:bg-[#FDFBF7] focus:bg-white border border-[#DFD5CC] hover:border-[#8C1801]/60 rounded-lg text-sm text-[#180200] focus:outline-none focus:border-[#510601] focus:ring-2 focus:ring-[#510601]/20 shadow-2xs transition-all cursor-pointer"
                    >
                      <option value="">Select Blood Group</option>
                      {BLOOD_GROUPS.map((bg) => (
                        <option key={bg} value={bg}>
                          {bg}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Aadhar Number */}
                  <div>
                    <label className="block text-sm text-[#3D140C] mb-1.5 font-semibold">
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
                      className={`w-full px-3.5 py-2.5 bg-[#FAF7F2] hover:bg-[#FDFBF7] focus:bg-white border rounded-lg text-sm text-[#180200] placeholder:text-[#9E8B7F] focus:outline-none focus:border-[#510601] focus:ring-2 focus:ring-[#510601]/20 shadow-2xs transition-all ${formErrors.aadharNumber ? 'border-red-500 ring-2 ring-red-500/20' : 'border-[#DFD5CC] hover:border-[#8C1801]/60'
                        }`}
                    />
                    {formErrors.aadharNumber && (
                      <p className="text-[11px] text-red-600 mt-1">{formErrors.aadharNumber}</p>
                    )}
                  </div>

                  {/* Communication Address */}
                  <div>
                    <label className="block text-sm text-[#3D140C] mb-1.5 font-semibold">
                      Communication Address: <span className="text-red-600">*</span>
                    </label>
                    <textarea
                      rows={2}
                      value={formData.address}
                      onChange={(e) => {
                        setFormData({ ...formData, address: e.target.value });
                        if (formErrors.address) setFormErrors({ ...formErrors, address: '' });
                      }}
                      placeholder="House / Flat / Street address"
                      className={`w-full px-3.5 py-2.5 bg-[#FAF7F2] hover:bg-[#FDFBF7] focus:bg-white border rounded-lg text-sm text-[#180200] placeholder:text-[#9E8B7F] focus:outline-none focus:border-[#510601] focus:ring-2 focus:ring-[#510601]/20 shadow-2xs transition-all ${formErrors.address ? 'border-red-500 ring-2 ring-red-500/20' : 'border-[#DFD5CC] hover:border-[#8C1801]/60'
                        }`}
                    />
                    {formErrors.address && (
                      <p className="text-[11px] text-red-600 mt-1">{formErrors.address}</p>
                    )}
                  </div>

                  {/* Pin Code with Autocomplete */}
                  <div className="relative" ref={pinWrapperRef}>
                    <label className="block text-sm text-[#3D140C] mb-1.5 font-semibold">
                      Pin Code: <span className="text-red-600">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        maxLength={6}
                        value={formData.postalCode}
                        onChange={(e) => handlePinChange(e.target.value)}
                        onFocus={() => {
                          if (formData.postalCode && formData.postalCode.length >= 2) {
                            const results = searchPostalLocations(formData.postalCode, 20);
                            setPinSuggestions(results);
                            setIsPinSuggestionsOpen(results.length > 0);
                          }
                        }}
                        placeholder="6 digit PIN Code (e.g. 576222)"
                        className={`w-full px-3.5 py-2.5 bg-[#FAF7F2] hover:bg-[#FDFBF7] focus:bg-white border rounded-lg text-sm font-mono text-[#180200] placeholder:text-[#9E8B7F] placeholder:font-sans focus:outline-none focus:border-[#510601] focus:ring-2 focus:ring-[#510601]/20 shadow-2xs transition-all ${
                          formErrors.postalCode ? 'border-red-500 ring-2 ring-red-500/20' : 'border-[#DFD5CC] hover:border-[#8C1801]/60'
                        }`}
                      />
                    </div>
                    {formErrors.postalCode && (
                      <p className="text-[11px] text-red-600 mt-1">{formErrors.postalCode}</p>
                    )}

                    {/* Autocomplete Suggestions Dropdown */}
                    {isPinSuggestionsOpen && pinSuggestions.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-[#DFD5CC] rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto divide-y divide-stone-100">
                        {pinSuggestions.map((item, idx) => (
                          <button
                            key={`${item.postalCode}-${item.area}-${idx}`}
                            type="button"
                            onClick={() => handleSelectPostalSuggestion(item)}
                            className="w-full px-3.5 py-2.5 text-left hover:bg-[#FAF7F2] transition-colors flex items-center justify-between group cursor-pointer"
                          >
                            <div className="min-w-0 pr-2">
                              <span className="font-semibold text-sm text-[#180200] group-hover:text-[#510601]">
                                {item.area} — {item.postalCode}
                              </span>
                              <div className="text-xs text-stone-500 truncate">
                                Taluk: <span className="font-medium text-stone-700">{item.talukName || '—'}</span> &bull; District: <span className="font-medium text-stone-700">{item.districtName || '—'}</span>
                              </div>
                            </div>
                            <span className="shrink-0 text-xs font-mono font-bold text-[#8C1801] bg-[#FAF7F2] px-2 py-0.5 rounded border border-[#DFD5CC]">
                              {item.postalCode}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Post Office / Locality */}
                  <div>
                    <label className="block text-sm text-[#3D140C] mb-1.5 font-semibold">
                      Post Office / Locality:
                    </label>
                    <input
                      type="text"
                      value={formData.locality}
                      onChange={(e) => setFormData({ ...formData, locality: e.target.value })}
                      placeholder="Post Office / Locality name"
                      className="w-full px-3.5 py-2.5 bg-[#FAF7F2] hover:bg-[#FDFBF7] focus:bg-white border border-[#DFD5CC] hover:border-[#8C1801]/60 rounded-lg text-sm text-[#180200] placeholder:text-[#9E8B7F] focus:outline-none focus:border-[#510601] focus:ring-2 focus:ring-[#510601]/20 shadow-2xs transition-all"
                    />
                    {(formData.taluk || formData.district) && (
                      <p className="text-xs text-stone-600 mt-1 flex items-center gap-1.5 font-medium">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                        Taluk: <span className="text-[#510601] font-semibold">{formData.taluk || '—'}</span> &bull; District: <span className="text-[#510601] font-semibold">{formData.district || '—'}</span>
                      </p>
                    )}
                  </div>

                  {/* Native Place */}
                  <div>
                    <label className="block text-sm text-[#3D140C] mb-1.5 font-semibold">
                      Native Place:
                    </label>
                    <input
                      type="text"
                      value={formData.nativePlace}
                      onChange={(e) => setFormData({ ...formData, nativePlace: e.target.value })}
                      placeholder="Village :: Taluk :: District"
                      className="w-full px-3.5 py-2.5 bg-[#FAF7F2] hover:bg-[#FDFBF7] focus:bg-white border border-[#DFD5CC] hover:border-[#8C1801]/60 rounded-lg text-sm text-[#180200] placeholder:text-[#9E8B7F] focus:outline-none focus:border-[#510601] focus:ring-2 focus:ring-[#510601]/20 shadow-2xs transition-all"
                    />
                  </div>

                  {/* Applying this Membership on behalf of */}
                  <div>
                    <label className="block text-sm text-[#3D140C] mb-1.5 font-semibold">
                      Applying this Membership on behalf of: <span className="text-red-600">*</span>
                    </label>
                    <select
                      value={formData.appliedOnBehalfOf}
                      onChange={(e) => {
                        setFormData({ ...formData, appliedOnBehalfOf: e.target.value });
                        if (formErrors.appliedOnBehalfOf)
                          setFormErrors({ ...formErrors, appliedOnBehalfOf: '' });
                      }}
                      className={`w-full px-3.5 py-2.5 bg-[#FAF7F2] hover:bg-[#FDFBF7] focus:bg-white border rounded-lg text-sm text-[#180200] focus:outline-none focus:border-[#510601] focus:ring-2 focus:ring-[#510601]/20 shadow-2xs transition-all cursor-pointer ${formErrors.appliedOnBehalfOf ? 'border-red-500 ring-2 ring-red-500/20' : 'border-[#DFD5CC] hover:border-[#8C1801]/60'
                        }`}
                    >
                      {BEHALF_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                    {formErrors.appliedOnBehalfOf && (
                      <p className="text-[11px] text-red-600 mt-1">
                        {formErrors.appliedOnBehalfOf}
                      </p>
                    )}
                  </div>

                  {/* Qualification */}
                  <div>
                    <label className="block text-sm text-[#3D140C] mb-1.5 font-semibold">
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
                      <p className="text-[11px] text-red-600 mt-1">{formErrors.qualification}</p>
                    )}
                  </div>

                  {/* Employment */}
                  <div>
                    <label className="block text-sm text-[#3D140C] mb-1.5 font-semibold">
                      Employment:
                    </label>
                    <input
                      type="text"
                      value={formData.employment}
                      onChange={(e) => setFormData({ ...formData, employment: e.target.value })}
                      placeholder="e.g. Agriculture, Software Engineer"
                      className="w-full px-3.5 py-2.5 bg-[#FAF7F2] hover:bg-[#FDFBF7] focus:bg-white border border-[#DFD5CC] hover:border-[#8C1801]/60 rounded-lg text-sm text-[#180200] placeholder:text-[#9E8B7F] focus:outline-none focus:border-[#510601] focus:ring-2 focus:ring-[#510601]/20 shadow-2xs transition-all"
                    />
                  </div>

                  {/* Magazine Needed */}
                  <div>
                    <label className="block text-sm text-[#3D140C] mb-1.5 font-semibold">
                      Do you need Havyaka Magazine Every month? <span className="text-red-600">*</span>
                    </label>
                    <select
                      value={formData.magazineNeeded}
                      onChange={(e) => {
                        setFormData({ ...formData, magazineNeeded: e.target.value });
                        if (formErrors.magazineNeeded)
                          setFormErrors({ ...formErrors, magazineNeeded: '' });
                      }}
                      className={`w-full px-3.5 py-2.5 bg-[#FAF7F2] hover:bg-[#FDFBF7] focus:bg-white border rounded-lg text-sm text-[#180200] focus:outline-none focus:border-[#510601] focus:ring-2 focus:ring-[#510601]/20 shadow-2xs transition-all cursor-pointer ${formErrors.magazineNeeded ? 'border-red-500 ring-2 ring-red-500/20' : 'border-[#DFD5CC] hover:border-[#8C1801]/60'
                        }`}
                    >
                      <option value="">Select YES/NO</option>
                      <option value="YES">YES</option>
                      <option value="NO">NO</option>
                    </select>
                    {formErrors.magazineNeeded && (
                      <p className="text-[11px] text-red-600 mt-1">{formErrors.magazineNeeded}</p>
                    )}
                  </div>
                </div>

                {/* Section: Membership Referred By */}
                <div className="pt-3 border-t border-[#DFD5CC]">
                  <h3 className="text-sm font-bold text-[#8C1801] mb-2">
                    Membership Referred By:
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="flex items-center gap-1.5 text-sm text-[#3D140C] mb-1.5 font-semibold">
                        <span>Membership Number:</span>
                        <span
                          className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-[#FFC107] text-[#180200] text-[9px] font-bold cursor-pointer"
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
                        placeholder="Referral membership number"
                        className="w-full px-3.5 py-2.5 bg-[#FAF7F2] hover:bg-[#FDFBF7] focus:bg-white border border-[#DFD5CC] hover:border-[#8C1801]/60 rounded-lg text-sm text-[#180200] placeholder:text-[#9E8B7F] focus:outline-none focus:border-[#510601] focus:ring-2 focus:ring-[#510601]/20 shadow-2xs transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-[#3D140C] mb-1.5 font-semibold">
                        Membership Name:
                      </label>
                      <input
                        type="text"
                        value={formData.referredMembershipName}
                        onChange={(e) =>
                          setFormData({ ...formData, referredMembershipName: e.target.value })
                        }
                        placeholder="Referral member name"
                        className="w-full px-3.5 py-2.5 bg-[#FAF7F2] hover:bg-[#FDFBF7] focus:bg-white border border-[#DFD5CC] hover:border-[#8C1801]/60 rounded-lg text-sm text-[#180200] placeholder:text-[#9E8B7F] focus:outline-none focus:border-[#510601] focus:ring-2 focus:ring-[#510601]/20 shadow-2xs transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Section: Mahasabha Membership Details in Family */}
                <div className="pt-3 border-t border-[#DFD5CC]">
                  <h3 className="text-sm font-bold text-[#8C1801] mb-2">
                    Mahasabha Membership Details in Family:
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="flex items-center gap-1.5 text-sm text-[#3D140C] mb-1.5 font-semibold">
                        <span>Membership Number:</span>
                        <span
                          className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-[#FFC107] text-[#180200] text-[9px] font-bold cursor-pointer"
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
                        placeholder="Family membership number"
                        className="w-full px-3.5 py-2.5 bg-[#FAF7F2] hover:bg-[#FDFBF7] focus:bg-white border border-[#DFD5CC] hover:border-[#8C1801]/60 rounded-lg text-sm text-[#180200] placeholder:text-[#9E8B7F] focus:outline-none focus:border-[#510601] focus:ring-2 focus:ring-[#510601]/20 shadow-2xs transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-[#3D140C] mb-1.5 font-semibold">
                        Membership Name:
                      </label>
                      <input
                        type="text"
                        value={formData.familyMembershipName}
                        onChange={(e) =>
                          setFormData({ ...formData, familyMembershipName: e.target.value })
                        }
                        placeholder="Family member name"
                        className="w-full px-3.5 py-2.5 bg-[#FAF7F2] hover:bg-[#FDFBF7] focus:bg-white border border-[#DFD5CC] hover:border-[#8C1801]/60 rounded-lg text-sm text-[#180200] placeholder:text-[#9E8B7F] focus:outline-none focus:border-[#510601] focus:ring-2 focus:ring-[#510601]/20 shadow-2xs transition-all"
                      />
                    </div>
                  </div>
                </div>
                </fieldset>

                {/* Next / Save buttons on Tab 1 */}
                <div className="flex items-center justify-between pt-5 border-t border-[#DFD5CC]">
                  <button
                    type="button"
                    onClick={() => navigate(returnPath)}
                    className="px-5 py-2.5 border border-[#DFD5CC] hover:border-[#8C1801]/50 text-[#510601] bg-white hover:bg-[#FAF7F2] text-sm font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>{isViewMode ? 'Back' : 'Cancel'}</span>
                  </button>
                  <div className="flex items-center gap-3">
                    {isEditMode && (
                      <button
                        type="submit"
                        className="px-5 py-2.5 bg-[#510601] hover:bg-[#8C1801] text-white font-bold text-sm rounded-lg shadow-sm transition-colors cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <Save className="w-4 h-4" />
                        <span>Update Member</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setActiveFormSection('paymentInfo')}
                      className="px-6 py-2.5 bg-[#510601] hover:bg-[#8C1801] text-white font-bold text-sm rounded-lg shadow-sm transition-colors cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <span>Next: Payment Information</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: PAYMENT INFORMATION */}
            {activeFormSection === 'paymentInfo' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Payment Mode */}
                  <div>
                    <label className="block text-sm text-[#3D140C] mb-1.5 font-semibold">
                      Payment Mode: {!isViewMode && <span className="text-red-600">*</span>}
                    </label>
                    <select
                      disabled={isViewMode}
                      value={formData.paymentMode}
                      onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#FAF7F2] hover:bg-[#FDFBF7] focus:bg-white border border-[#DFD5CC] hover:border-[#8C1801]/60 rounded-lg text-sm text-[#180200] focus:outline-none focus:border-[#510601] focus:ring-2 focus:ring-[#510601]/20 shadow-2xs transition-all cursor-pointer disabled:opacity-90 disabled:cursor-not-allowed"
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
                    <label className="block text-sm text-[#3D140C] mb-1.5 font-semibold">
                      Bank Account / Name:
                    </label>
                    <input
                      type="text"
                      disabled={isViewMode}
                      value={formData.bankAccount}
                      onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                      placeholder="e.g. Canara Bank, SBI"
                      className="w-full px-3.5 py-2.5 bg-[#FAF7F2] hover:bg-[#FDFBF7] focus:bg-white border border-[#DFD5CC] hover:border-[#8C1801]/60 rounded-lg text-sm text-[#180200] placeholder:text-[#9E8B7F] focus:outline-none focus:border-[#510601] focus:ring-2 focus:ring-[#510601]/20 shadow-2xs transition-all disabled:opacity-90 disabled:cursor-not-allowed"
                    />
                  </div>

                  {/* Amount */}
                  <div>
                    <label className="block text-sm text-[#3D140C] mb-1.5 font-semibold">
                      Amount (Rs.): {!isViewMode && <span className="text-red-600">*</span>}
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      disabled={isViewMode}
                      value={formData.amount}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^\d.]/g, '');
                        setFormData({ ...formData, amount: val });
                      }}
                      onWheel={(e) => e.target.blur()}
                      placeholder="Membership fee amount"
                      className="w-full px-3.5 py-2.5 bg-[#FAF7F2] hover:bg-[#FDFBF7] focus:bg-white border border-[#DFD5CC] hover:border-[#8C1801]/60 rounded-lg text-sm font-semibold text-[#180200] placeholder:text-[#9E8B7F] focus:outline-none focus:border-[#510601] focus:ring-2 focus:ring-[#510601]/20 shadow-2xs transition-all disabled:opacity-90 disabled:cursor-not-allowed"
                    />
                  </div>

                  {/* Receipt Date */}
                  <div>
                    <label className="block text-sm text-[#3D140C] mb-1.5 font-semibold">
                      Receipt Date: {!isViewMode && <span className="text-red-600">*</span>}
                    </label>
                    <DateInput
                      disabled={isViewMode}
                      value={formData.receiptDate}
                      onChange={(e) => setFormData({ ...formData, receiptDate: e.target.value })}
                      name="receiptDate"
                      className="w-full px-3.5 py-2.5 bg-[#FAF7F2] hover:bg-[#FDFBF7] focus:bg-white border border-[#DFD5CC] hover:border-[#8C1801]/60 rounded-lg text-sm text-[#180200] focus:outline-none focus:border-[#510601] focus:ring-2 focus:ring-[#510601]/20 shadow-2xs transition-all disabled:opacity-90 disabled:cursor-not-allowed"
                    />
                  </div>

                  {/* Transaction ID / Cheque No */}
                  <div>
                    <label className="block text-sm text-[#3D140C] mb-1.5 font-semibold">
                      Transaction ID / Cheque No.:
                    </label>
                    <input
                      type="text"
                      disabled={isViewMode}
                      value={formData.transactionId}
                      onChange={(e) =>
                        setFormData({ ...formData, transactionId: e.target.value })
                      }
                      placeholder="e.g. UTR / CHQ-10492"
                      className="w-full px-3.5 py-2.5 bg-[#FAF7F2] hover:bg-[#FDFBF7] focus:bg-white border border-[#DFD5CC] hover:border-[#8C1801]/60 rounded-lg text-sm text-[#180200] placeholder:text-[#9E8B7F] focus:outline-none focus:border-[#510601] focus:ring-2 focus:ring-[#510601]/20 shadow-2xs transition-all disabled:opacity-90 disabled:cursor-not-allowed"
                    />
                  </div>

                  {/* Transaction Date */}
                  <div>
                    <label className="block text-sm text-[#3D140C] mb-1.5 font-semibold">
                      Transaction Date:
                    </label>
                    <DateInput
                      disabled={isViewMode}
                      value={formData.transactionDate}
                      onChange={(e) =>
                        setFormData({ ...formData, transactionDate: e.target.value })
                      }
                      name="transactionDate"
                      className="w-full px-3.5 py-2.5 bg-[#FAF7F2] hover:bg-[#FDFBF7] focus:bg-white border border-[#DFD5CC] hover:border-[#8C1801]/60 rounded-lg text-sm text-[#180200] focus:outline-none focus:border-[#510601] focus:ring-2 focus:ring-[#510601]/20 shadow-2xs transition-all disabled:opacity-90 disabled:cursor-not-allowed"
                    />
                  </div>

                  {/* Receipt Number (if assigned or in view mode) */}
                  {(isViewMode || targetMember?.assignedReceiptNumber || targetMember?.receiptNumber) && (
                    <div className="md:col-span-2">
                      <label className="block text-sm text-[#3D140C] mb-1.5 font-semibold">
                        Receipt Number:
                      </label>
                      <input
                        type="text"
                        disabled
                        value={targetMember?.assignedReceiptNumber || targetMember?.receiptNumber || 'Not Assigned'}
                        className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#DFD5CC] rounded-lg text-sm font-mono font-bold text-[#510601] shadow-2xs cursor-default"
                      />
                    </div>
                  )}

                  {/* Payment Remarks */}
                  <div className="md:col-span-2">
                    <label className="block text-sm text-[#3D140C] mb-1.5 font-semibold">
                      Payment Received Details / Remarks:
                    </label>
                    <textarea
                      rows={2}
                      disabled={isViewMode}
                      value={formData.paymentRemarks}
                      onChange={(e) =>
                        setFormData({ ...formData, paymentRemarks: e.target.value })
                      }
                      placeholder="Additional payment notes..."
                      className="w-full px-3.5 py-2.5 bg-[#FAF7F2] hover:bg-[#FDFBF7] focus:bg-white border border-[#DFD5CC] hover:border-[#8C1801]/60 rounded-lg text-sm text-[#180200] placeholder:text-[#9E8B7F] focus:outline-none focus:border-[#510601] focus:ring-2 focus:ring-[#510601]/20 shadow-2xs transition-all disabled:opacity-90 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Footer buttons on tab 2 */}
                <div className="flex items-center justify-between pt-5 border-t border-[#DFD5CC]">
                  <button
                    type="button"
                    onClick={() => setActiveFormSection('membershipDetails')}
                    className="px-5 py-2.5 border border-[#DFD5CC] text-[#3D140C] hover:bg-[#FAF7F2] text-xs sm:text-sm font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>
                  <div className="flex items-center gap-3">
                    {isViewMode ? (
                      <button
                        type="button"
                        onClick={() => navigate(returnPath)}
                        className="px-5 py-2.5 border border-[#DFD5CC] text-[#3D140C] hover:bg-[#FAF7F2] text-xs sm:text-sm font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Back</span>
                      </button>
                    ) : (
                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-[#510601] hover:bg-[#8C1801] text-white font-bold text-xs sm:text-sm rounded-lg shadow-sm transition-colors cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <Save className="w-4 h-4" />
                        <span>{isEditMode ? 'Update Member' : 'Register Member'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
