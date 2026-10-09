import { initialMembers } from '../data/membersData.js';
import { initialLabelList } from '../data/labelListData.js';
import { initialMembershipTypes } from '../data/membershipTypeData.js';
import { initialReceiptTypes, initialParticulars } from '../data/receiptTypeData.js';
import { PAYMENT_MODES, GOTHRA_MASTER } from '../data/mastersData.js';
import { initialUnapprovedMembers } from '../data/unapprovedMembersData.js';
import { initialStates, initialDistricts, initialTaluks } from '../data/locationData.js';
import { initialPostalCodes } from '../data/postalCodeData.js';
import { initialBankDetails, BANK_PAYMENT_MODE_OPTIONS } from '../data/bankDetailsData.js';
import {
  initialPaymentModeConfigs,
  AVAILABLE_PAYMENT_MODES,
  AVAILABLE_PAYMENT_TYPES,
  AVAILABLE_BANK_ACCOUNTS,
  formatPaymentModeLabel
} from '../data/paymentModeData.js';

export {
  ORGANISATION_TYPES,
  DEFAULT_ORGANISATION_SETTINGS,
  getStoredOrganisationSettings,
  saveStoredOrganisationSettings,
  getActiveOrganisationName
} from './organisationStore.js';

export {
  initialBankDetails,
  BANK_PAYMENT_MODE_OPTIONS,
  initialPaymentModeConfigs,
  AVAILABLE_PAYMENT_MODES,
  AVAILABLE_PAYMENT_TYPES,
  AVAILABLE_BANK_ACCOUNTS,
  formatPaymentModeLabel,
  initialParticulars
};

const STORAGE_KEYS = {
  RECEIPTS: 'hms_receipts_v4',
  MEMBERS: 'hms_members_v3',
  UNAPPROVED_MEMBERS: 'hms_unapproved_members_v4',
  LABEL_LIST: 'hms_label_list_v2',
  MEMBERSHIP_TYPES: 'hms_membership_types_v1',
  STATES: 'hms_states_v1',
  DISTRICTS: 'hms_districts_v1',
  TALUKS: 'hms_taluks_v1',
  POSTAL_CODES: 'hms_postal_codes_v1',
  RECEIPT_TYPES: 'hms_receipt_types_v2',
  PAYMENT_MODES: 'hms_payment_modes_v1',
  GOTHRAS: 'hms_gothras_v2',
  BANK_DETAILS: 'hms_bank_details_v1',
  PAYMENT_MODE_CONFIGS: 'hms_payment_modes_v6',
  UNAPPROVED_RENEWALS: 'hms_unapproved_renewals_v3'
};

// ======================================================================
// UNAPPROVED RENEWAL PAYMENT STORE
// ======================================================================
export const initialUnapprovedRenewals = [];

export const getStoredUnapprovedRenewals = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.UNAPPROVED_RENEWALS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Failed to parse renewals from storage', e);
  }
  return [];
};

export const saveStoredUnapprovedRenewals = (renewals) => {
  try {
    localStorage.setItem(STORAGE_KEYS.UNAPPROVED_RENEWALS, JSON.stringify(renewals));
  } catch (e) {
    console.error('Failed to save renewals to storage', e);
  }
};

// ======================================================================
// CONSTANTS FOR NEW RECEIPT ENTRY FLOW
// ======================================================================
export const PARTICULARS_OPTIONS = [
  'Membership',
  'Scholarship',
  'Donation',
  'Hostel Payment',
  'Function Deposit',
  'Cultural Events',
  'Others'
];

export const RECEIPT_PAYMENT_MODES = [
  'KBL 1075',
  'KBL1541',
  'SBI',
  'CANARA BANK'
];

export const BANKS_LIST = [
  'State Bank of India',
  'Karnataka Bank',
  'Canara Bank',
  'HDFC Bank',
  'ICICI Bank',
  'Union Bank of India',
  'Bank of Baroda',
  'Punjab National Bank',
  'Axis Bank',
  'Kotak Mahindra Bank',
  'Others'
];

// ======================================================================
// UNAPPROVED MEMBERS STORE
// ======================================================================
export const getStoredUnapprovedMembers = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.UNAPPROVED_MEMBERS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.map((m) => {
          const isAssigned = m.receiptStatus === 'Assigned' || Boolean(m.assignedReceiptNumber && String(m.assignedReceiptNumber).trim() !== '');
          if (!isAssigned) {
            return {
              ...m,
              receiptStatus: 'Unassigned',
              assignedReceiptNumber: '',
              receiptNumber: ''
            };
          }
          return {
            ...m,
            receiptStatus: 'Assigned'
          };
        });
      }
    }
  } catch (e) {
    console.error('Failed to parse unapproved members from storage', e);
  }
  return initialUnapprovedMembers;
};

export const saveStoredUnapprovedMembers = (members) => {
  try {
    localStorage.setItem(STORAGE_KEYS.UNAPPROVED_MEMBERS, JSON.stringify(members));
  } catch (e) {
    console.error('Failed to save unapproved members to storage', e);
  }
};

export const isMemberReceiptAssigned = (member) => {
  if (!member) return false;
  if (member.receiptStatus === 'Assigned') return true;
  if (member.assignedReceiptNumber && String(member.assignedReceiptNumber).trim() !== '') return true;
  if (member.receiptNumber && String(member.receiptNumber).trim() !== '') return true;
  const receipt = findMatchingReceiptForMember(member);
  if (receipt && receipt.receiptNumber) return true;
  return false;
};

// ======================================================================
// RECEIPT STORE (FOR RECEIPT TRACKING & RECEIPT ENTRY FLOW)
// ======================================================================
export const initialReceipts = [];

export const isReceiptUnmapped = (receipt) => {
  if (!receipt) return false;
  if (receipt.isUnmapped === true) return true;
  if (receipt.status === 'Unassigned' || receipt.status === 'Unmapped') return true;
  const hasMember = Boolean(receipt.memberId || (receipt.membershipNo && String(receipt.membershipNo).trim() !== ''));
  if (!hasMember) {
    const name = String(receipt.name || '').trim().toLowerCase();
    if (!name || name === 'unassigned' || name === 'unmapped' || name === 'unassigned / unmapped') {
      return true;
    }
  }
  return false;
};

export const getStoredReceipts = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.RECEIPTS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        // Strict exclusion: NEVER allow receipts of unapproved or assigned members into Receipt Tracking
        const unapproved = getStoredUnapprovedMembers();
        const unapprovedIds = new Set(unapproved.map((u) => String(u.id || '').toLowerCase()));
        const unapprovedRegs = new Set(unapproved.map((u) => String(u.registrationNumber || '').toLowerCase()));
        const unapprovedReceiptNos = new Set();
        const unapprovedMobiles = new Set();
        const unapprovedNames = new Set();

        unapproved.forEach((u) => {
          if (u.assignedReceiptNumber) {
            unapprovedReceiptNos.add(String(u.assignedReceiptNumber).toLowerCase().replace(/^#/, ''));
          }
          if (u.receiptNumber) {
            unapprovedReceiptNos.add(String(u.receiptNumber).toLowerCase().replace(/^#/, ''));
          }
          const mob = String(u.mobile || u.mobileNumber || u.contactNumber || u.phone || '').trim().replace(/\D/g, '');
          if (mob && mob.length >= 10) {
            unapprovedMobiles.add(mob.slice(-10));
          }
          const name = String(u.fullName || u.name || '').trim().toLowerCase();
          if (name) {
            unapprovedNames.add(name);
          }
        });

        return parsed.filter((r) => {
          // Exclude assigned receipts
          if (r.status === 'Assigned' || r.receiptStatus === 'Assigned' || r.mappingStatus === 'Assigned') return false;

          // Exclude by unapproved member ID or reg
          if (r.memberId && unapprovedIds.has(String(r.memberId).toLowerCase())) return false;
          if (r.registrationNumber && unapprovedRegs.has(String(r.registrationNumber).toLowerCase())) return false;

          // Exclude by receipt number
          const rNum = String(r.receiptNumber || '').toLowerCase().replace(/^#/, '');
          if (rNum && unapprovedReceiptNos.has(rNum)) return false;

          // Exclude by mobile matching an unapproved member with assigned receipt
          const rMob = String(r.mobile || '').trim().replace(/\D/g, '');
          if (rMob && rMob.length >= 10 && unapprovedMobiles.has(rMob.slice(-10))) {
            const memberWithMob = unapproved.find((u) => {
              const uMob = String(u.mobile || u.mobileNumber || u.contactNumber || '').trim().replace(/\D/g, '');
              return uMob.slice(-10) === rMob.slice(-10);
            });
            if (memberWithMob && (memberWithMob.assignedReceiptNumber || memberWithMob.receiptStatus === 'Assigned')) {
              return false;
            }
          }

          // Exclude by name matching an unapproved member with assigned receipt
          const rName = String(r.name || '').trim().toLowerCase();
          if (rName && unapprovedNames.has(rName)) {
            const memberWithName = unapproved.find((u) => String(u.fullName || u.name || '').trim().toLowerCase() === rName);
            if (memberWithName && (memberWithName.assignedReceiptNumber || memberWithName.receiptStatus === 'Assigned')) {
              return false;
            }
          }

          return true;
        });
      }
    }
  } catch (e) {
    console.error('Failed to parse receipts from storage', e);
  }
  return [];
};

export const saveStoredReceipts = (receipts) => {
  try {
    localStorage.setItem(STORAGE_KEYS.RECEIPTS, JSON.stringify(receipts));
  } catch (e) {
    console.error('Failed to save receipts to storage', e);
  }
};

export const findMatchingReceiptForMember = (member, customReceipts = null) => {
  if (!member) return null;
  const receipts = customReceipts || getStoredReceipts();

  const memId = String(member.id || '').trim().toLowerCase();
  const regNo = String(member.registrationNumber || '').trim().toLowerCase();
  const memNo = String(member.membershipNumber || '').trim().toLowerCase();
  const mob = String(member.mobile || member.mobileNumber || member.contactNumber || member.phone || '').trim().replace(/\D/g, '');
  const name = String(member.fullName || member.name || '').trim().toLowerCase();
  const receiptNum = String(member.assignedReceiptNumber || member.receiptNumber || '').trim().toLowerCase();

  // 1. Match by explicit receiptNumber
  if (receiptNum) {
    const byNum = receipts.find((r) => String(r.receiptNumber || '').trim().toLowerCase() === receiptNum);
    if (byNum) return byNum;
  }

  // 2. Match by memberId
  if (memId) {
    const byId = receipts.find((r) => r.memberId && String(r.memberId).trim().toLowerCase() === memId);
    if (byId) return byId;
  }

  // 3. Match by registrationNumber or membershipNo
  if (regNo || memNo) {
    const byReg = receipts.find((r) => {
      const rMemNo = String(r.membershipNo || '').trim().toLowerCase();
      const rRegNo = String(r.registrationNumber || '').trim().toLowerCase();
      return (regNo && (rRegNo === regNo || rMemNo === regNo)) || (memNo && rMemNo === memNo);
    });
    if (byReg) return byReg;
  }

  // 4. Match by 10-digit mobile number
  if (mob && mob.length >= 10) {
    const last10 = mob.slice(-10);
    const byMob = receipts.find((r) => {
      const rMob = String(r.mobile || '').trim().replace(/\D/g, '');
      return rMob && rMob.slice(-10) === last10;
    });
    if (byMob) return byMob;
  }

  // 5. Match by exact payee name (if name length > 3)
  if (name && name.length > 3) {
    const byName = receipts.find((r) => {
      const rName = String(r.name || '').trim().toLowerCase();
      return rName && rName === name;
    });
    if (byName) return byName;
  }

  return null;
};

export const saveNewReceipt = (receiptData) => {
  const rawSaved = localStorage.getItem(STORAGE_KEYS.RECEIPTS);
  let allStoredReceipts = [];
  try {
    allStoredReceipts = rawSaved ? JSON.parse(rawSaved) : [];
    if (!Array.isArray(allStoredReceipts)) allStoredReceipts = [];
  } catch (_) {
    allStoredReceipts = [];
  }

  const today = new Date().toISOString().split('T')[0];
  const targetReceiptNo = String(receiptData.receiptNumber || '').trim().replace(/^#/, '');
  const unapprovedMembers = getStoredUnapprovedMembers();
  const registeredMembers = getStoredMembers();

  // Distinguish flow strictly: Assignment Flow vs Normal Standalone Receipt
  const isAssignmentFlow = Boolean(
    receiptData.isAssignmentFlow ||
    (receiptData.memberId && (receiptData.status === 'Assigned' || receiptData.receiptStatus === 'Assigned'))
  );

  let matchedUnapproved = null;
  if (isAssignmentFlow) {
    if (receiptData.memberId) {
      const cleanId = String(receiptData.memberId).trim().toLowerCase();
      matchedUnapproved = unapprovedMembers.find((u) => u.id && String(u.id).trim().toLowerCase() === cleanId);
    }
    if (!matchedUnapproved && receiptData.registrationNumber) {
      const cleanReg = String(receiptData.registrationNumber).trim().toLowerCase();
      matchedUnapproved = unapprovedMembers.find((u) => u.registrationNumber && String(u.registrationNumber).trim().toLowerCase() === cleanReg);
    }
    if (!matchedUnapproved && receiptData.membershipNo) {
      const cleanMemNo = String(receiptData.membershipNo).trim().toLowerCase();
      matchedUnapproved = unapprovedMembers.find((u) => (u.membershipNumber && String(u.membershipNumber).trim().toLowerCase() === cleanMemNo) || (u.id && String(u.id).trim().toLowerCase() === cleanMemNo));
    }
  }

  let matchedRegistered = null;
  if (isAssignmentFlow) {
    if (receiptData.memberId) {
      const cleanId = String(receiptData.memberId).trim().toLowerCase();
      matchedRegistered = registeredMembers.find((m) => m.id && String(m.id).trim().toLowerCase() === cleanId);
    }
    if (!matchedRegistered && receiptData.membershipNo) {
      const cleanMemNo = String(receiptData.membershipNo).trim().toLowerCase();
      matchedRegistered = registeredMembers.find((m) => m.membershipNumber && String(m.membershipNumber).trim().toLowerCase() === cleanMemNo);
    }
  }

  const targetMemberObj = matchedUnapproved || matchedRegistered;
  const targetMemberId = receiptData.memberId || (targetMemberObj ? targetMemberObj.id : null);
  const targetMemberName = receiptData.name || (targetMemberObj ? (targetMemberObj.fullName || targetMemberObj.name) : '');
  const targetMemberNo = receiptData.membershipNo || (targetMemberObj ? (targetMemberObj.membershipNumber || targetMemberObj.registrationNumber || targetMemberObj.id) : '');
  const targetRegNo = receiptData.registrationNumber || (targetMemberObj ? (targetMemberObj.registrationNumber || targetMemberObj.id) : '');

  const newReceiptId = `REC-${Date.now()}`;
  const newReceipt = {
    id: newReceiptId,
    receiptNumber: targetReceiptNo,
    receiptDate: receiptData.receiptDate || today,
    name: String(targetMemberName || receiptData.name || '').trim(),
    panNo: String(receiptData.panNo || (targetMemberObj ? targetMemberObj.panNo : '') || '').trim(),
    membershipNo: String(targetMemberNo || '').trim(),
    registrationNumber: String(targetRegNo || (matchedUnapproved ? matchedUnapproved.registrationNumber : '')).trim(),
    mobile: String(receiptData.mobile || (targetMemberObj ? (targetMemberObj.mobile || targetMemberObj.contactNumber || targetMemberObj.phone) : '') || '').trim(),
    particulars: receiptData.particulars || 'Membership',
    donationSubType: receiptData.donationSubType || '',
    othersDescription: receiptData.othersDescription || '',
    donationDetails: receiptData.donationDetails || receiptData.donationSubType || receiptData.paymentReceivedDetails || '',
    paymentReceivedDetails: receiptData.paymentReceivedDetails || receiptData.donationDetails || receiptData.donationSubType || '',
    amount: Number(receiptData.amount) || 0,
    paymentMode: receiptData.paymentMode || 'Cash',
    bankAccount: receiptData.bankAccount || receiptData.bankName || '',
    bankName: receiptData.bankName || receiptData.bankAccount || '',
    transactionId: String(receiptData.transactionId || '').trim(),
    transactionDate: receiptData.transactionDate || '',
    description: String(receiptData.description || '').trim(),
    memberId: isAssignmentFlow ? (targetMemberId || null) : null,
    membershipType: receiptData.membershipType || (targetMemberObj ? (targetMemberObj.membershipType || targetMemberObj.membershipTypeCategory) : ''),
    status: isAssignmentFlow ? 'Assigned' : 'Active',
    receiptStatus: isAssignmentFlow ? 'Assigned' : 'Active',
    mappingStatus: isAssignmentFlow ? 'Assigned' : 'Unmapped',
    linkedAt: isAssignmentFlow ? new Date().toISOString() : null,
    createdAt: new Date().toISOString()
  };

  if (isAssignmentFlow) {
    // 1. Update ONLY the single targeted unapproved member record
    const updatedUnapproved = unapprovedMembers.map((m) => {
      const isTarget = Boolean(
        (targetMemberId && m.id && String(m.id).trim().toLowerCase() === String(targetMemberId).trim().toLowerCase()) ||
        (matchedUnapproved && m.id && String(m.id).trim().toLowerCase() === String(matchedUnapproved.id).trim().toLowerCase())
      );

      if (isTarget) {
        const existingHistory = Array.isArray(m.receiptsHistory) ? m.receiptsHistory : [];
        const filteredHistory = existingHistory.filter((r) => r.id !== newReceipt.id && r.receiptNumber !== newReceipt.receiptNumber);
        const updatedHistory = [...filteredHistory, newReceipt];

        return {
          ...m,
          receiptStatus: 'Assigned',
          status: 'Unapproved',
          approvalStatus: 'Unapproved',
          assignedReceiptNumber: newReceipt.receiptNumber,
          receiptNumber: newReceipt.receiptNumber,
          receiptId: newReceipt.id,
          receiptDate: newReceipt.receiptDate,
          panNo: newReceipt.panNo || m.panNo || '',
          amount: newReceipt.amount,
          paidAmount: newReceipt.amount,
          paymentMode: newReceipt.paymentMode,
          bankAccount: newReceipt.bankAccount || newReceipt.bankName || m.bankAccount || '',
          bankName: newReceipt.bankName || newReceipt.bankAccount || m.bankName || '',
          transactionId: newReceipt.transactionId || m.transactionId || '',
          transactionDate: newReceipt.transactionDate || m.transactionDate || '',
          paymentRemarks: newReceipt.description || newReceipt.paymentReceivedDetails || m.paymentRemarks || '',
          hasReceiptAssigned: true,
          mappingStatus: 'Assigned',
          latestReceipt: newReceipt,
          receiptsHistory: updatedHistory,
          paymentHistory: updatedHistory
        };
      }
      return m;
    });
    saveStoredUnapprovedMembers(updatedUnapproved);

    // 2. Also update registered members store ONLY if this targeted member was in registered members
    if (registeredMembers.length > 0 && (targetMemberId || matchedRegistered)) {
      const updatedRegistered = registeredMembers.map((m) => {
        const isTarget = Boolean(
          (targetMemberId && m.id && String(m.id).trim().toLowerCase() === String(targetMemberId).trim().toLowerCase()) ||
          (matchedRegistered && m.id && String(m.id).trim().toLowerCase() === String(matchedRegistered.id).trim().toLowerCase())
        );

        if (isTarget) {
          const existingHistory = Array.isArray(m.receiptsHistory) ? m.receiptsHistory : [];
          const filteredHistory = existingHistory.filter((r) => r.id !== newReceipt.id && r.receiptNumber !== newReceipt.receiptNumber);
          const updatedHistory = [...filteredHistory, newReceipt];

          return {
            ...m,
            assignedReceiptNumber: newReceipt.receiptNumber,
            receiptNumber: newReceipt.receiptNumber,
            receiptId: newReceipt.id,
            receiptDate: newReceipt.receiptDate,
            panNo: newReceipt.panNo || m.panNo || '',
            amount: newReceipt.amount,
            paidAmount: (Number(m.paidAmount || 0) + Number(newReceipt.amount)),
            paymentMode: newReceipt.paymentMode,
            bankAccount: newReceipt.bankAccount || newReceipt.bankName || m.bankAccount || '',
            bankName: newReceipt.bankName || newReceipt.bankAccount || m.bankName || '',
            transactionId: newReceipt.transactionId || m.transactionId || '',
            transactionDate: newReceipt.transactionDate || m.transactionDate || '',
            paymentRemarks: newReceipt.description || newReceipt.paymentReceivedDetails || m.paymentRemarks || '',
            hasReceiptAssigned: true,
            receiptStatus: 'Assigned',
            latestReceipt: newReceipt,
            receiptsHistory: updatedHistory,
            paymentHistory: updatedHistory
          };
        }
        return m;
      });
      saveStoredMembers(updatedRegistered);
    }

    // 3. ABSOLUTELY PURGE/REMOVE from Receipt Tracking storage (STORAGE_KEYS.RECEIPTS)
    const filteredReceipts = allStoredReceipts.filter((r) => {
      const rNum = String(r.receiptNumber || '').toLowerCase().replace(/^#/, '');
      if (rNum === targetReceiptNo.toLowerCase()) return false;
      if (targetMemberId && r.memberId && String(r.memberId).toLowerCase() === String(targetMemberId).toLowerCase()) return false;
      if (r.status === 'Assigned' || r.receiptStatus === 'Assigned') return false;
      return true;
    });
    saveStoredReceipts(filteredReceipts);
  } else {
    // Standalone receipt (not assigned to an unapproved member) -> saved into Receipt Tracking
    const existingIndex = allStoredReceipts.findIndex(
      (r) => String(r.receiptNumber || '').trim().toLowerCase().replace(/^#/, '') === targetReceiptNo.toLowerCase()
    );

    if (existingIndex >= 0) {
      const updatedReceipts = [...allStoredReceipts];
      updatedReceipts[existingIndex] = { ...allStoredReceipts[existingIndex], ...newReceipt };
      saveStoredReceipts(updatedReceipts);
    } else {
      saveStoredReceipts([newReceipt, ...allStoredReceipts]);
    }
  }

  return newReceipt;
};

export const updateStoredReceipt = (receiptId, updatedData) => {
  const receipts = getStoredReceipts();
  let updatedTarget = null;

  const updatedReceipts = receipts.map((r) => {
    if (r.id === receiptId || r.receiptNumber === receiptId) {
      updatedTarget = {
        ...r,
        ...updatedData,
        amount: Number(updatedData.amount !== undefined ? updatedData.amount : r.amount) || 0,
        updatedAt: new Date().toISOString()
      };
      return updatedTarget;
    }
    return r;
  });

  if (updatedTarget) {
    saveStoredReceipts(updatedReceipts);

    // If member linked and receiptNumber updated, sync unapproved member
    if (updatedTarget.memberId) {
      const unapprovedMembers = getStoredUnapprovedMembers();
      const updatedUnapproved = unapprovedMembers.map((m) => {
        if (m.id === updatedTarget.memberId) {
          return {
            ...m,
            assignedReceiptNumber: updatedTarget.receiptNumber,
            receiptId: updatedTarget.id
          };
        }
        return m;
      });
      saveStoredUnapprovedMembers(updatedUnapproved);
    }
  }

  return updatedTarget;
};

export const deleteStoredReceipt = (receiptId) => {
  const receipts = getStoredReceipts();
  const target = receipts.find((r) => r.id === receiptId || r.receiptNumber === receiptId);

  if (!target) return false;

  const updatedReceipts = receipts.filter((r) => r.id !== target.id && r.receiptNumber !== target.receiptNumber);
  saveStoredReceipts(updatedReceipts);

  // If linked to an unapproved member, reset that member's receiptStatus to 'Pending'
  if (target.memberId) {
    const unapprovedMembers = getStoredUnapprovedMembers();
    const updatedUnapproved = unapprovedMembers.map((m) => {
      if (m.id === target.memberId || m.assignedReceiptNumber === target.receiptNumber || m.receiptId === target.id) {
        return {
          ...m,
          receiptStatus: 'Pending',
          assignedReceiptNumber: '',
          receiptId: '',
          mappingStatus: 'Unmapped'
        };
      }
      return m;
    });
    saveStoredUnapprovedMembers(updatedUnapproved);
  }

  return true;
};

export const mapReceiptToMember = (receiptId, member) => {
  if (!member) return null;
  const receipts = getStoredReceipts();
  let mappedReceipt = null;

  const updatedReceipts = receipts.map((r) => {
    if (r.id === receiptId || r.receiptNumber === receiptId) {
      mappedReceipt = {
        ...r,
        memberId: member.id,
        name: member.fullName || member.name || r.name,
        membershipNo: member.membershipNumber || member.id || r.membershipNo || '',
        mobile: member.mobile || member.mobileNumber || r.mobile || '',
        membershipType: member.membershipType || r.membershipType || '',
        status: 'Assigned',
        isUnmapped: false,
        mappingStatus: 'Assigned',
        mappedAt: new Date().toISOString()
      };
      return mappedReceipt;
    }
    return r;
  });

  if (mappedReceipt) {
    saveStoredReceipts(updatedReceipts);

    // Update unapproved member record if this member is in unapproved list
    const unapprovedMembers = getStoredUnapprovedMembers();
    const updatedUnapproved = unapprovedMembers.map((m) => {
      if (m.id === member.id) {
        return {
          ...m,
          mappingStatus: 'Mapped',
          receiptStatus: 'Assigned',
          assignedReceiptNumber: mappedReceipt.receiptNumber,
          receiptId: mappedReceipt.id,
          receiptDate: mappedReceipt.receiptDate
          // Strictly keep approvalStatus: 'Unapproved'!
        };
      }
      return m;
    });
    saveStoredUnapprovedMembers(updatedUnapproved);
  }

  return mappedReceipt;
};

// ======================================================================
// MEMBERS STORE
// ======================================================================
export const getStoredMembers = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.MEMBERS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Failed to parse members from storage', e);
  }
  return initialMembers;
};

export const saveStoredMembers = (members) => {
  try {
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
  } catch (e) {
    console.error('Failed to save members to storage', e);
  }
};

// ======================================================================
// LABEL LIST STORE
// ======================================================================
export const getStoredLabelList = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.LABEL_LIST);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Failed to parse label list from storage', e);
  }
  return [];
};

export const saveStoredLabelList = (list) => {
  try {
    localStorage.setItem(STORAGE_KEYS.LABEL_LIST, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to save label list to storage', e);
  }
};

// ======================================================================
// MEMBERSHIP TYPES STORE
// ======================================================================
export const getStoredMembershipTypes = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.MEMBERSHIP_TYPES);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const removedNames = new Set(['patron', 'life member', 'donor']);
        const cleaned = parsed.filter(p => !removedNames.has((p.name || '').toLowerCase().trim()));
        const existingNames = new Set(cleaned.map(p => (p.name || '').toLowerCase().trim()));
        let hasChanges = cleaned.length !== parsed.length;
        const merged = [...cleaned];
        initialMembershipTypes.forEach(initType => {
          if (!existingNames.has((initType.name || '').toLowerCase().trim())) {
            merged.push(initType);
            hasChanges = true;
          }
        });
        if (hasChanges) {
          localStorage.setItem(STORAGE_KEYS.MEMBERSHIP_TYPES, JSON.stringify(merged));
        }
        return merged;
      }
    }
  } catch (e) {
    console.error('Failed to parse membership types from storage', e);
  }
  return initialMembershipTypes;
};

export const saveStoredMembershipTypes = (types) => {
  try {
    localStorage.setItem(STORAGE_KEYS.MEMBERSHIP_TYPES, JSON.stringify(types));
  } catch (e) {
    console.error('Failed to save membership types to storage', e);
  }
};

// ======================================================================
// CUMULATIVE MEMBERSHIP CALCULATION ENGINE
// Single Source of Truth: Masters -> Membership Types (getStoredMembershipTypes)
// ======================================================================
export const calculateMemberMembershipStatus = (
  memberOrIdentifier,
  customReceipts = null,
  customMembershipTypes = null
) => {
  const receipts = customReceipts || getStoredReceipts();
  const membershipTypes = customMembershipTypes || getStoredMembershipTypes();

  // Resolve member identifiers
  let memberId = null;
  let memberNo = null;
  let memberMobile = null;
  let memberName = null;
  let memberPan = null;
  let fallbackAmount = 0;

  if (typeof memberOrIdentifier === 'string') {
    memberId = memberOrIdentifier;
  } else if (memberOrIdentifier && typeof memberOrIdentifier === 'object') {
    memberId = memberOrIdentifier.id || null;
    memberNo =
      memberOrIdentifier.membershipNumber ||
      memberOrIdentifier.registrationNumber ||
      memberOrIdentifier.membershipNo ||
      null;
    memberMobile =
      memberOrIdentifier.mobile ||
      memberOrIdentifier.mobileNumber ||
      memberOrIdentifier.contactNumber ||
      memberOrIdentifier.phone ||
      null;
    memberName =
      memberOrIdentifier.fullName ||
      memberOrIdentifier.name ||
      memberOrIdentifier.membershipName ||
      null;
    memberPan = memberOrIdentifier.panNo || memberOrIdentifier.pan || null;
    fallbackAmount = Number(memberOrIdentifier.amount || memberOrIdentifier.paidAmount) || 0;
  }

  const normName = memberName ? memberName.trim().toLowerCase() : '';
  const normMobile = memberMobile ? String(memberMobile).trim().replace(/\D/g, '') : '';
  const normNo = memberNo ? String(memberNo).trim().toLowerCase() : '';
  const normId = memberId ? String(memberId).trim().toLowerCase() : '';

  // Find all individual receipts linked to this member
  const allMatchingReceipts = receipts.filter((r) => {
    // Direct Member ID match
    if (memberId && r.memberId && String(r.memberId).trim().toLowerCase() === normId) {
      return true;
    }

    // Membership Number / Reg Number match
    const rNo = String(r.membershipNo || '').trim().toLowerCase();
    if (rNo) {
      if (normNo && (rNo === normNo || normNo.includes(rNo) || rNo.includes(normNo))) return true;
      if (normId && rNo === normId) return true;
    }

    // Mobile Number match
    const rMobile = String(r.mobile || '').trim().replace(/\D/g, '');
    if (normMobile && rMobile && (normMobile === rMobile || normMobile.endsWith(rMobile) || rMobile.endsWith(normMobile))) {
      return true;
    }

    // Full Name match (exact normalized match)
    const rName = String(r.name || '').trim().toLowerCase();
    if (normName && rName && normName === rName) {
      return true;
    }

    return false;
  });

  // A. membershipReceipts (Particulars === 'Membership') -> Drives milestone logic
  const matchingReceipts = allMatchingReceipts.filter(
    (r) => String(r.particulars || '').trim().toLowerCase() === 'membership'
  );

  // B. otherReceipts (Particulars !== 'Membership') -> Donations, Hostel, Scholarship, etc.
  const otherReceipts = allMatchingReceipts.filter(
    (r) => String(r.particulars || '').trim().toLowerCase() !== 'membership'
  );

  // Calculate cumulative total paid from all individual membership receipts
  const receiptsTotal = matchingReceipts.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

  // Calculate total other contributions (Donations, etc.)
  const totalOtherPaid = otherReceipts.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

  // If there are recorded membership receipts, use their sum. Otherwise fallback to member's initial seed amount
  const totalMembershipPaid = matchingReceipts.length > 0 ? receiptsTotal : fallbackAmount;

  // Active Membership Types sorted ascending by configured milestone price
  const activeTypes = membershipTypes
    .filter((mt) => (mt.status || 'Active') === 'Active')
    .map((mt) => ({
      ...mt,
      milestonePrice: Number(
        mt.currentPrice !== undefined
          ? mt.currentPrice
          : mt.price !== undefined
          ? mt.price
          : mt.fee !== undefined
          ? mt.fee
          : 0
      )
    }))
    .sort((a, b) => a.milestonePrice - b.milestonePrice);

  let currentMembershipType = (typeof memberOrIdentifier === 'object' && memberOrIdentifier && (memberOrIdentifier.membershipType || memberOrIdentifier.type)) || 'Poshaka';
  let currentMilestoneAmount = 0;
  let nextMilestoneType = null;
  let nextMilestoneAmount = null;
  let remainingAmount = 0;

  if (activeTypes.length > 0) {
    // Find all milestones reached (where milestonePrice <= totalMembershipPaid)
    const reachedTypes = activeTypes.filter((mt) => totalMembershipPaid >= mt.milestonePrice);

    if (reachedTypes.length > 0) {
      // Highest milestone reached
      const highestReached = reachedTypes[reachedTypes.length - 1];
      currentMembershipType = highestReached.name;
      currentMilestoneAmount = highestReached.milestonePrice;

      // Next higher milestone
      const higherTypes = activeTypes.filter((mt) => mt.milestonePrice > highestReached.milestonePrice);
      if (higherTypes.length > 0) {
        const nextType = higherTypes[0];
        nextMilestoneType = nextType.name;
        nextMilestoneAmount = nextType.milestonePrice;
        remainingAmount = Math.max(0, nextMilestoneAmount - totalMembershipPaid);
      } else {
        nextMilestoneType = null;
        nextMilestoneAmount = null;
        remainingAmount = 0;
      }
    } else {
      // Below the lowest configured milestone - fallback to assigned member type if present, or Poshaka
      const assignedType = (typeof memberOrIdentifier === 'object' && memberOrIdentifier)
        ? (memberOrIdentifier.membershipType || memberOrIdentifier.type)
        : null;

      currentMembershipType = assignedType && assignedType !== 'None' && assignedType !== 'Not Yet Reached'
        ? assignedType
        : 'Poshaka';

      const lowestType = activeTypes[0];
      nextMilestoneType = lowestType?.name || null;
      nextMilestoneAmount = lowestType?.milestonePrice || null;
      remainingAmount = Math.max(0, (nextMilestoneAmount || 0) - totalMembershipPaid);
    }
  }

  const isMilestoneReached = currentMembershipType !== 'None' && currentMembershipType !== 'Not Yet Reached';

  return {
    totalMembershipPaid,
    currentMembershipType,
    isMilestoneReached,
    currentMilestoneAmount,
    nextMilestoneType,
    nextMilestoneAmount,
    remainingAmount,
    receipts: matchingReceipts,
    membershipReceipts: matchingReceipts,
    receiptCount: matchingReceipts.length,
    otherReceipts,
    totalOtherPaid,
    allReceipts: allMatchingReceipts
  };
};

// ======================================================================
// LOCATION MASTERS STORE
// ======================================================================
export const getStoredStates = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.STATES);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Enforce Karnataka and Kerala strictly
        const allowed = parsed.filter(s => ['karnataka', 'kerala'].includes((s.name || '').toLowerCase().trim()));
        if (allowed.length > 0) return allowed;
      }
    }
  } catch (e) {
    console.error('Failed to parse states from storage', e);
  }
  return initialStates;
};

export const saveStoredStates = (states) => {
  try {
    localStorage.setItem(STORAGE_KEYS.STATES, JSON.stringify(states));
  } catch (e) {
    console.error('Failed to save states to storage', e);
  }
};

export const getStoredDistricts = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.DISTRICTS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Ensure all baseline districts are present
        const existingNames = new Set(parsed.map((d) => (d.name || '').toLowerCase().trim()));
        const missing = initialDistricts.filter(
          (d) => !existingNames.has((d.name || '').toLowerCase().trim())
        );
        if (missing.length > 0) {
          const merged = [...parsed, ...missing];
          try {
            localStorage.setItem(STORAGE_KEYS.DISTRICTS, JSON.stringify(merged));
          } catch (_) {}
          return merged;
        }
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to parse districts from storage', e);
  }
  return initialDistricts;
};

export const saveStoredDistricts = (districts) => {
  try {
    localStorage.setItem(STORAGE_KEYS.DISTRICTS, JSON.stringify(districts));
  } catch (e) {
    console.error('Failed to save districts to storage', e);
  }
};

export const getStoredTaluks = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.TALUKS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Ensure all baseline taluks are present
        const existingKeys = new Set(
          parsed.map((t) => (t.name || '').toLowerCase().trim() + '_' + (t.districtId || ''))
        );
        const missing = initialTaluks.filter(
          (t) => !existingKeys.has((t.name || '').toLowerCase().trim() + '_' + (t.districtId || ''))
        );
        if (missing.length > 0) {
          const merged = [...parsed, ...missing];
          try {
            localStorage.setItem(STORAGE_KEYS.TALUKS, JSON.stringify(merged));
          } catch (_) {}
          return merged;
        }
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to parse taluks from storage', e);
  }
  return initialTaluks;
};

export const saveStoredTaluks = (taluks) => {
  try {
    localStorage.setItem(STORAGE_KEYS.TALUKS, JSON.stringify(taluks));
  } catch (e) {
    console.error('Failed to save taluks to storage', e);
  }
};

export const getStoredPostalCodes = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.POSTAL_CODES);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Ensure any new baseline postal directory records are available
        const existingKeys = new Set(
          parsed.map((p) => String(p.postalCode || '').trim() + '_' + (p.area || '').toLowerCase().trim())
        );
        const missing = initialPostalCodes.filter(
          (p) => !existingKeys.has(String(p.postalCode || '').trim() + '_' + (p.area || '').toLowerCase().trim())
        );
        if (missing.length > 0) {
          const merged = [...parsed, ...missing];
          try {
            localStorage.setItem(STORAGE_KEYS.POSTAL_CODES, JSON.stringify(merged));
          } catch (_) {}
          return merged;
        }
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to parse postal codes from storage', e);
  }
  return initialPostalCodes;
};

export const saveStoredPostalCodes = (postalCodes) => {
  try {
    localStorage.setItem(STORAGE_KEYS.POSTAL_CODES, JSON.stringify(postalCodes));
  } catch (e) {
    console.error('Failed to save postal codes to storage', e);
  }
};

export const lookupLocationByPin = (pinCode) => {
  if (!pinCode || typeof pinCode !== 'string') return { found: false, matches: [] };
  const cleanPin = pinCode.trim();
  if (cleanPin.length !== 6 || !/^\d{6}$/.test(cleanPin)) {
    return { found: false, matches: [] };
  }

  const allPostalCodes = getStoredPostalCodes();
  const matches = allPostalCodes.filter(
    (item) => String(item.postalCode || '').trim() === cleanPin
  );

  if (matches.length === 0) {
    return { found: false, matches: [] };
  }

  const primaryMatch = matches.find((m) => m.status === 'Active' || m.status === 'Mapped') || matches[0];

  return {
    found: true,
    pinCode: primaryMatch.postalCode,
    area: primaryMatch.area,
    talukName: primaryMatch.talukName,
    talukId: primaryMatch.talukId,
    districtName: primaryMatch.districtName,
    districtId: primaryMatch.districtId,
    stateName: primaryMatch.stateName,
    stateId: primaryMatch.stateId,
    status: primaryMatch.status,
    allAreas: matches.map((m) => m.area),
    matches
  };
};

export const searchPostalLocations = (query, limit = 25) => {
  if (!query || typeof query !== 'string') return [];
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const allPostalCodes = getStoredPostalCodes();
  const activeItems = allPostalCodes.filter(
    (item) => !item.status || item.status === 'Active' || item.status === 'Mapped'
  );

  const results = [];
  for (const item of activeItems) {
    const pin = String(item.postalCode || '').toLowerCase();
    const area = String(item.area || '').toLowerCase();
    const taluk = String(item.talukName || '').toLowerCase();
    const dist = String(item.districtName || '').toLowerCase();

    let score = 0;
    if (pin === q) {
      score = 200;
    } else if (pin.startsWith(q)) {
      score = 150 - (pin.length - q.length);
    } else if (pin.includes(q)) {
      score = 80;
    } else if (area.startsWith(q)) {
      score = 120;
    } else if (area.includes(q)) {
      score = 70;
    } else if (taluk.startsWith(q)) {
      score = 60;
    } else if (taluk.includes(q) || dist.includes(q)) {
      score = 40;
    }

    if (score > 0) {
      results.push({ item, score });
    }
  }

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, limit).map((r) => r.item);
};

export const getStoredParticulars = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.RECEIPT_TYPES);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Merge missing default particulars if any
        const existingNames = new Set(parsed.map(p => (p.name || '').toLowerCase().trim()));
        let hasChanges = false;
        const merged = [...parsed];
        initialParticulars.forEach(initP => {
          if (!existingNames.has((initP.name || '').toLowerCase().trim())) {
            merged.push(initP);
            hasChanges = true;
          }
        });
        // Also check if Donation exists and ensure its default sub-types exist if none or empty
        const donationItem = merged.find(p => (p.name || '').toLowerCase().trim() === 'donation');
        if (donationItem) {
          const initDonation = initialParticulars.find(p => p.name === 'Donation');
          if (initDonation && (!donationItem.subTypes || donationItem.subTypes.length === 0)) {
            donationItem.subTypes = initDonation.subTypes;
            hasChanges = true;
          }
        }
        if (hasChanges) {
          try {
            localStorage.setItem(STORAGE_KEYS.RECEIPT_TYPES, JSON.stringify(merged));
          } catch (_) {}
        }
        return merged;
      }
    }
  } catch (e) {
    console.error('Failed to parse particulars from storage', e);
  }
  return initialParticulars;
};

export const saveStoredParticulars = (particulars) => {
  try {
    localStorage.setItem(STORAGE_KEYS.RECEIPT_TYPES, JSON.stringify(particulars));
  } catch (e) {
    console.error('Failed to save particulars to storage', e);
  }
};

// Aliases for backward compatibility
export const getStoredReceiptTypes = getStoredParticulars;
export const saveStoredReceiptTypes = saveStoredParticulars;

export const getActiveParticulars = () => {
  const all = getStoredParticulars();
  return all.filter(p => (p.status || 'Active') === 'Active');
};

export const getActiveParticularSubTypes = (particularName) => {
  if (!particularName) return [];
  const all = getStoredParticulars();
  const found = all.find(p => (p.name || '').toLowerCase().trim() === String(particularName).toLowerCase().trim());
  if (!found || !found.subTypes) return [];
  return found.subTypes.filter(st => (st.status || 'Active') === 'Active');
};

export const getStoredPaymentModes = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.PAYMENT_MODES);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to parse payment modes from storage', e);
  }
  return PAYMENT_MODES;
};

export const saveStoredPaymentModes = (modes) => {
  try {
    localStorage.setItem(STORAGE_KEYS.PAYMENT_MODES, JSON.stringify(modes));
  } catch (e) {
    console.error('Failed to save payment modes to storage', e);
  }
};

export const getStoredGothras = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.GOTHRAS);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to parse gothras from storage', e);
  }
  return GOTHRA_MASTER;
};

export const saveStoredGothras = (gothras) => {
  try {
    localStorage.setItem(STORAGE_KEYS.GOTHRAS, JSON.stringify(gothras));
  } catch (e) {
    console.error('Failed to save gothras to storage', e);
  }
};

export const addMemberToLabelQueue = (memberId) => {
  if (!memberId) return false;
  const currentList = getStoredLabelList();
  const alreadyExists = currentList.some((item) => item.memberId === memberId);
  if (!alreadyExists) {
    const today = new Date().toISOString().split('T')[0];
    const newItem = {
      id: `LBL-${String(Date.now()).slice(-4)}`,
      memberId,
      addedDate: today,
      addedBy: 'Admin User'
    };
    const updated = [newItem, ...currentList];
    saveStoredLabelList(updated);
    return true;
  }
  return false;
};

// ======================================================================
// PAYMENT MODE CONFIGURATION STORE
// ======================================================================
export const getStoredPaymentModeConfigs = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.PAYMENT_MODE_CONFIGS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Ensure initial payment modes exist
        const existingKeys = new Set(
          parsed.map((c) => (c.paymentMode || '').trim().toLowerCase())
        );
        let hasChanges = false;
        const merged = [...parsed];

        initialPaymentModeConfigs.forEach((initCfg) => {
          const key = (initCfg.paymentMode || '').trim().toLowerCase();
          if (!existingKeys.has(key)) {
            merged.push(initCfg);
            hasChanges = true;
          }
        });

        if (hasChanges) {
          try {
            localStorage.setItem(STORAGE_KEYS.PAYMENT_MODE_CONFIGS, JSON.stringify(merged));
          } catch (_) {}
        }
        return merged;
      }
    }
  } catch (e) {
    console.error('Failed to parse payment mode configs from storage', e);
  }
  return initialPaymentModeConfigs;
};

export const saveStoredPaymentModeConfigs = (configs) => {
  try {
    localStorage.setItem(STORAGE_KEYS.PAYMENT_MODE_CONFIGS, JSON.stringify(configs));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('hms_payment_modes_updated'));
    }
  } catch (e) {
    console.error('Failed to save payment mode configs to storage', e);
  }
};

export const getActivePaymentModeConfigs = () => {
  const allConfigs = getStoredPaymentModeConfigs();
  return allConfigs.filter((c) => (c.status || 'Active') === 'Active');
};

export const getActivePaymentModes = () => {
  const activeConfigs = getActivePaymentModeConfigs();
  if (activeConfigs.length === 0) {
    return initialPaymentModeConfigs.map((c) => c.paymentMode);
  }
  return activeConfigs.map((c) => c.paymentMode);
};

export const getAllPaymentModes = () => {
  const allConfigs = getStoredPaymentModeConfigs();
  return allConfigs.map((c) => c.paymentMode);
};

export const isPaymentModeOffline = (paymentModeLabel) => {
  if (!paymentModeLabel) return false;
  const str = String(paymentModeLabel).trim().toLowerCase();
  return str === 'cash' || str.startsWith('cash') || str.startsWith('cheque') || str.startsWith('dd');
};


// Legacy Bank Details Fallbacks for backward compatibility
export const getStoredBankDetails = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.BANK_DETAILS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to parse bank details from storage', e);
  }
  return initialBankDetails;
};

export const saveStoredBankDetails = (bankDetails) => {
  try {
    localStorage.setItem(STORAGE_KEYS.BANK_DETAILS, JSON.stringify(bankDetails));
  } catch (e) {
    console.error('Failed to save bank details to storage', e);
  }
};

export const getActiveBankDetails = () => {
  const allBanks = getStoredBankDetails();
  return allBanks.filter((bank) => (bank.status || 'Active') === 'Active');
};

// Re-export Financial Year Configuration & Utilities
export {
  getFinancialYear,
  getCurrentFinancialYear,
  getFinancialYearRange,
  getFinancialYearOptions,
  isDateInFinancialYear,
  getStoredActiveFinancialYear,
  saveStoredActiveFinancialYear
} from './financialYear';



