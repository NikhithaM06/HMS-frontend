import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Modal from '../components/Modal';
import SearchFilterBar from '../components/SearchFilterBar';
import FilterSelect from '../components/FilterSelect';
import {
  UserCheck,
  User,
  Search,
  Eye,
  CheckCircle2,
  X,
  AlertCircle,
  AlertTriangle,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Layers,
  Check,
  Filter,
  RefreshCw,
  Award,
  Clock,
  FileText,
  Link as LinkIcon,
  ChevronRight,
  ChevronLeft,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import {
  getStoredUnapprovedMembers,
  saveStoredUnapprovedMembers,
  getStoredMembers,
  saveStoredMembers,
  getStoredMembershipTypes,
  getStoredStates,
  getStoredDistricts,
  lookupLocationByPin,
  getStoredReceipts,
  findMatchingReceiptForMember,
  isMemberReceiptAssigned
} from '../utils/receiptStore';
import { formatDate, formatDateTime } from '../utils/dateUtils';

export default function UnapprovedMembership() {
  const navigate = useNavigate();

  // ----------------------------------------------------
  // DATA STORES
  // ----------------------------------------------------
  const [unapprovedMembers, setUnapprovedMembers] = useState(getStoredUnapprovedMembers());
  const [membershipTypes] = useState(getStoredMembershipTypes());
  const [states] = useState(getStoredStates());
  const [districts] = useState(getStoredDistricts());

  useEffect(() => {
    const handleUpdate = () => {
      setUnapprovedMembers(getStoredUnapprovedMembers());
    };
    handleUpdate();
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('hms_unapproved_members_updated', handleUpdate);
    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('hms_unapproved_members_updated', handleUpdate);
    };
  }, []);

  const persistUnapproved = (updated) => {
    setUnapprovedMembers(updated);
    saveStoredUnapprovedMembers(updated);
  };

  // Toast feedback
  const [toastMessage, setToastMessage] = useState(null);
  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // ----------------------------------------------------
  // SEARCH & FILTER STATE
  // ----------------------------------------------------
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [stateFilter, setStateFilter] = useState('ALL');
  const [districtFilter, setDistrictFilter] = useState('ALL');
  const [receiptStatusFilter, setReceiptStatusFilter] = useState('ALL');

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Row Selection
  const [selectedIds, setSelectedIds] = useState(new Set());

  // ----------------------------------------------------
  // MODAL STATES
  // ----------------------------------------------------
  // 1. View Profile Popup Modal
  const [viewingMember, setViewingMember] = useState(null);

  // Dynamic receipt lookup for Viewing Member to ensure real saved receipt data is always displayed
  const viewingReceiptData = useMemo(() => {
    if (!viewingMember) return null;
    const allReceipts = getStoredReceipts();
    return findMatchingReceiptForMember(viewingMember, allReceipts);
  }, [viewingMember]);

  // Districts for dropdown filter
  const filterDistricts = useMemo(() => {
    if (stateFilter === 'ALL') return districts;
    const st = states.find((s) => s.name.toLowerCase() === stateFilter.toLowerCase());
    return st ? districts.filter((d) => d.stateId === st.id) : districts;
  }, [districts, states, stateFilter]);

  // ----------------------------------------------------
  // FILTERING LOGIC
  // ----------------------------------------------------
  const filteredList = useMemo(() => {
    return unapprovedMembers.filter((m) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const name = (m.fullName || m.name || '').toLowerCase();
        const mob = (m.mobile || m.mobileNumber || '').toLowerCase();
        const em = (m.email || '').toLowerCase();
        const dist = (m.districtName || '').toLowerCase();
        const id = (m.id || '').toLowerCase();

        if (
          !name.includes(q) &&
          !mob.includes(q) &&
          !em.includes(q) &&
          !dist.includes(q) &&
          !id.includes(q)
        ) {
          return false;
        }
      }

      // Membership Type Filter
      if (typeFilter !== 'ALL') {
        const mType = (m.membershipType || '').toLowerCase();
        if (mType !== typeFilter.toLowerCase()) return false;
      }

      // State Filter
      if (stateFilter !== 'ALL') {
        if ((m.stateName || '').toLowerCase() !== stateFilter.toLowerCase()) return false;
      }

      // District Filter
      if (districtFilter !== 'ALL') {
        if ((m.districtName || '').toLowerCase() !== districtFilter.toLowerCase()) return false;
      }

      // Receipt Status Filter
      if (receiptStatusFilter !== 'ALL') {
        const isAssigned = isMemberReceiptAssigned(m);
        const currentStatus = isAssigned ? 'Assigned' : 'Unassigned';
        if (currentStatus !== receiptStatusFilter) return false;
      }

      return true;
    });
  }, [
    unapprovedMembers,
    searchQuery,
    typeFilter,
    stateFilter,
    districtFilter,
    receiptStatusFilter
  ]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredList.length / pageSize));
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredList.slice(start, start + pageSize);
  }, [filteredList, currentPage, pageSize]);

  // Checkbox helpers
  const isAllPaginatedSelected = useMemo(() => {
    if (paginatedList.length === 0) return false;
    return paginatedList.every((m) => selectedIds.has(m.id));
  }, [paginatedList, selectedIds]);

  const handleToggleSelectAll = () => {
    const next = new Set(selectedIds);
    if (isAllPaginatedSelected) {
      paginatedList.forEach((m) => next.delete(m.id));
    } else {
      paginatedList.forEach((m) => next.add(m.id));
    }
    setSelectedIds(next);
  };

  const handleToggleSelectRow = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setTypeFilter('ALL');
    setStateFilter('ALL');
    setDistrictFilter('ALL');
    setReceiptStatusFilter('ALL');
    setCurrentPage(1);
  };

  // Metric counts
  const countOnline = unapprovedMembers.filter(
    (m) => (m.registrationSource || m.registrationType || 'Online').toLowerCase() === 'online'
  ).length;
  const countOffline = unapprovedMembers.filter(
    (m) => (m.registrationSource || m.registrationType || '').toLowerCase() === 'offline'
  ).length;

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
            <span className="text-[#180200] font-semibold">Unapproved Membership</span>
          </nav>
        }
        title={<h1 className="text-2xl font-bold text-[#180200] tracking-tight">Unapproved Membership</h1>}
        searchQuery={searchQuery}
        onSearchChange={(val) => {
          setSearchQuery(val);
          setCurrentPage(1);
        }}
        searchPlaceholder="Search..."
        activeFiltersCount={
          (typeFilter !== 'ALL' ? 1 : 0) +
          (stateFilter !== 'ALL' ? 1 : 0) +
          (districtFilter !== 'ALL' ? 1 : 0) +
          (receiptStatusFilter !== 'ALL' ? 1 : 0)
        }
        onResetFilters={handleClearFilters}
        rightSlot={
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-white border border-[#E8DFD8] text-xs font-semibold text-[#863221] shadow-2xs flex items-center gap-1.5 shrink-0">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>{countOnline} Online Applicant{countOnline === 1 ? '' : 's'}</span>
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-[#FAF7F2] border border-[#510601]/20 text-xs font-bold text-[#510601] shadow-2xs flex items-center gap-1.5 shrink-0">
              <User className="w-3.5 h-3.5 text-[#510601]" />
              <span>{countOffline} Offline Applicant{countOffline === 1 ? '' : 's'}</span>
            </span>
          </div>
        }
      >
        {/* 1. Membership Type */}
        <FilterSelect
          value={typeFilter}
          onChange={(val) => {
            setTypeFilter(val);
            setCurrentPage(1);
          }}
          options={[
            { value: 'ALL', label: 'All Membership Types' },
            ...membershipTypes.map((mt) => ({ value: mt.name, label: mt.name }))
          ]}
          widthClass="w-full sm:w-48"
        />

        {/* 2. Receipt Status */}
        <FilterSelect
          value={receiptStatusFilter}
          onChange={(val) => {
            setReceiptStatusFilter(val);
            setCurrentPage(1);
          }}
          options={[
            { value: 'ALL', label: 'All Receipt Status' },
            { value: 'Unassigned', label: 'Unassigned' },
            { value: 'Assigned', label: 'Assigned' }
          ]}
          widthClass="w-full sm:w-40"
        />

        {/* 3. State */}
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

        {/* 4. District */}
        <FilterSelect
          value={districtFilter}
          onChange={(val) => {
            setDistrictFilter(val);
            setCurrentPage(1);
          }}
          options={[
            { value: 'ALL', label: 'All Districts' },
            ...filterDistricts.map((d) => ({ value: d.name, label: d.name }))
          ]}
          widthClass="w-full sm:w-48"
        />
      </SearchFilterBar>

      {/* ---------------------------------------------------- */}
      {/* UNAPPROVED MEMBERSHIP TABLE                          */}
      {/* ---------------------------------------------------- */}
      <div className="bg-white rounded-2xl border border-[#E8DFD8] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-[#FAF7F2] border-b border-[#E8DFD8] text-[#863221] font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={isAllPaginatedSelected}
                    onChange={handleToggleSelectAll}
                    className="w-4 h-4 rounded border-[#E8DFD8] text-[#510601] focus:ring-[#510601] cursor-pointer accent-[#510601]"
                    title="Select All on page"
                  />
                </th>
                <th className="py-3 px-4">Applicant Name</th>
                <th className="py-3 px-4">Contact Details</th>
                <th className="py-3 px-4">District & Location</th>
                <th className="py-3 px-4">Reg Date</th>
                <th className="py-3 px-4 text-center">Receipt Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8DFD8]">
              {paginatedList.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-[#863221]">
                    <div className="flex flex-col items-center justify-center">
                      <CheckCircle2 className="w-8 h-8 text-[#3D705C]/50 mb-2" />
                      <p className="font-semibold text-sm text-[#180200]">No unapproved memberships</p>

                    </div>
                  </td>
                </tr>
              ) : (
                paginatedList.map((m) => {
                  const isSelected = selectedIds.has(m.id);
                  const matchedReceipt = findMatchingReceiptForMember(m);
                  const receiptNo = m.assignedReceiptNumber || m.receiptNumber || matchedReceipt?.receiptNumber;
                  const isAssigned = isMemberReceiptAssigned(m) || Boolean(receiptNo);

                  return (
                    <tr
                      key={m.id}
                      className={`transition-colors ${isSelected ? 'bg-[#FAF7F2]/80' : 'hover:bg-[#FAF7F2]/40'
                        }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectRow(m.id)}
                          className="w-4 h-4 rounded border-[#E8DFD8] text-[#510601] focus:ring-[#510601] cursor-pointer accent-[#510601]"
                        />
                      </td>

                      {/* Name & Source */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#180200] text-sm">{m.fullName || m.name}</span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${(m.registrationSource || m.registrationType || 'Online').toLowerCase() === 'offline'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                              }`}
                          >
                            {m.registrationSource || m.registrationType || 'Online'}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#863221] mt-0.5 font-mono">
                          Reg No: {m.registrationNumber || m.id}
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-mono font-medium text-xs text-[#180200]">
                          <Phone className="w-3 h-3 text-[#863221]/70 shrink-0" />
                          <span>{m.mobile || m.mobileNumber || '—'}</span>
                        </div>
                        {m.email && (
                          <div className="flex items-center gap-1.5 text-[11px] text-[#863221] mt-0.5 truncate max-w-[160px]">
                            <Mail className="w-3 h-3 text-[#863221]/70 shrink-0" />
                            <span className="truncate">{m.email}</span>
                          </div>
                        )}
                      </td>

                      {/* District & Location */}
                      <td className="py-3.5 px-4 text-[#863221]">
                        {(() => {
                          const pinLookup = m.postalCode ? lookupLocationByPin(m.postalCode) : null;
                          const districtText = m.districtName || m.district || (pinLookup?.found ? pinLookup.districtName : '') || '—';
                          const locParts = [
                            m.locality || m.talukName || m.taluk || m.place || (pinLookup?.found ? pinLookup.talukName : ''),
                            m.postalCode || m.pinCode ? `(${m.postalCode || m.pinCode})` : ''
                          ].filter(Boolean).join(' ');
                          return (
                            <>
                              <div className="font-semibold text-[#180200] text-xs">
                                {districtText}
                              </div>
                              {locParts && (
                                <div className="text-[11px] text-[#863221]/80 mt-0.5 truncate max-w-[180px]">
                                  {locParts}
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </td>

                      {/* Registration Date */}
                      <td className="py-3.5 px-4 font-mono text-xs text-[#180200]">
                        {formatDate(m.registrationDate)}
                      </td>

                      {/* Receipt Status Badge */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${isAssigned
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                            }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${isAssigned ? 'bg-emerald-600' : 'bg-amber-500'
                              }`}
                          />
                          <span>{isAssigned ? 'Assigned' : 'Unassigned'}</span>
                        </span>
                        {receiptNo && (
                          <div className="text-[10px] font-mono text-[#510601] font-bold mt-0.5">
                            #{String(receiptNo).replace(/^#/, '')}
                          </div>
                        )}
                      </td>

                      {/* Actions: Assign to Receipt (when pending) & View Profile (always) */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2 flex-wrap sm:flex-nowrap">
                          {!isAssigned && (
                            <button
                              type="button"
                              onClick={() => navigate('/dashboard/receipts/entry', { state: { selectedMember: m, isAssignmentFlow: true, mode: 'assign' } })}
                              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 h-8 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer shrink-0 bg-[#510601] hover:bg-[#8C1801] active:bg-[#180200] text-white hover:shadow"
                              title="Open Receipt Entry and assign receipt to this applicant"
                            >
                              <FileText className="w-3.5 h-3.5 shrink-0" />
                              <span>Assign to Receipt</span>
                            </button>
                          )}

                          {/* View Action (Always shown, opens Profile in Popup Modal) */}
                          <button
                            type="button"
                            onClick={() => setViewingMember(m)}
                            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 h-8 bg-white hover:bg-[#FAF7F2] text-[#510601] hover:text-[#180200] text-xs font-bold rounded-xl border border-[#E8DFD8] hover:border-[#510601] shadow-sm transition-all cursor-pointer shrink-0"
                            title="View Full Profile in Popup"
                          >
                            <Eye className="w-3.5 h-3.5 shrink-0 text-[#863221]" />
                            <span>View</span>
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
        {filteredList.length > 0 && (
          <div className="p-4 border-t border-[#E8DFD8] bg-[#FAF7F2]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#863221]">
            <div className="flex items-center gap-2">
              <span>Showing</span>
              <span className="font-bold text-[#180200]">
                {Math.min((currentPage - 1) * pageSize + 1, filteredList.length)}
              </span>
              <span>to</span>
              <span className="font-bold text-[#180200]">
                {Math.min(currentPage * pageSize, filteredList.length)}
              </span>
              <span>of</span>
              <span className="font-bold text-[#180200]">{filteredList.length}</span>
              <span>unapproved applications</span>
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
      {/* MODAL 1: MEMBER PROFILE VIEW POPUP                   */}
      {/* ==================================================== */}
      <Modal isOpen={Boolean(viewingMember)} onClose={() => setViewingMember(null)}>
        {viewingMember && (
          <div
            className="bg-white rounded-3xl max-w-2xl w-full border border-[#E8DFD8] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#E8DFD8] bg-[#FAF7F2] px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#510601]/10 text-[#510601]">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#180200]">
                    Unapproved Member Profile
                  </h3>
                  <p className="text-xs text-[#863221] font-mono">
                    Registration No: {viewingMember.registrationNumber || viewingMember.id || '—'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingMember(null)}
                className="text-[#863221]/60 hover:text-[#180200] p-1.5 rounded-lg hover:bg-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 text-xs sm:text-sm max-h-[72vh] overflow-y-auto">
              {/* SECTION 1: PROFILE DETAILS */}
              <div className="space-y-2">
                <h4 className="text-xs sm:text-sm font-bold text-[#1D4ED8] tracking-wide uppercase">
                  Profile Details:
                </h4>
                <div className="bg-[#FAF7F2] p-3.5 rounded-xl border border-[#E8DFD8] grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[#863221] font-semibold block">Registration Number:</span>
                    <strong className="font-mono text-[#510601]">{viewingMember.registrationNumber || viewingMember.id || '—'}</strong>
                  </div>
                  <div>
                    <span className="text-[#863221] font-semibold block">Registration Date:</span>
                    <strong className="text-[#180200] font-mono">{formatDate(viewingMember.registrationDate || viewingMember.createdDate)}</strong>
                  </div>
                  <div>
                    <span className="text-[#863221] font-semibold block">Membership Number:</span>
                    <strong className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block mt-0.5 font-mono">
                      {viewingMember.membershipNumber ? viewingMember.membershipNumber : 'Not Assigned'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[#863221] font-semibold block">Membership Type:</span>
                    <strong className="text-[#510601]">{viewingMember.membershipType || viewingMember.membershipTypeCategory || '—'}</strong>
                  </div>
                  <div>
                    <span className="text-[#863221] font-semibold block">Registration Source:</span>
                    <span className="font-medium text-[#180200]">{viewingMember.registrationSource || viewingMember.registrationType || 'Offline'}</span>
                  </div>
                </div>
              </div>

              {/* SECTION 2: BASIC INFORMATION */}
              <div className="space-y-2">
                <h4 className="text-xs sm:text-sm font-bold text-[#1D4ED8] tracking-wide uppercase">
                  Basic Information:
                </h4>
                <div className="space-y-2.5 text-xs text-[#180200]">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2.5 border-b border-[#E8DFD8]">
                    <div>
                      <span className="text-[#863221] font-semibold block">Name:</span>
                      <strong className="text-sm text-[#180200]">{viewingMember.fullName || viewingMember.name || '—'} {viewingMember.gender ? `(${viewingMember.gender})` : ''}</strong>
                    </div>
                    <div>
                      <span className="text-[#863221] font-semibold block">Father / Husband Name:</span>
                      <strong className="text-[#180200]">{viewingMember.fatherHusbandName || '—'}</strong>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2.5 border-b border-[#E8DFD8]">
                    <div>
                      <span className="text-[#863221] font-semibold block">Date of Birth & Age:</span>
                      <span className="text-[#180200]">{formatDate(viewingMember.birthDate)} {viewingMember.age ? `(Age: ${viewingMember.age})` : ''}</span>
                    </div>
                    <div>
                      <span className="text-[#863221] font-semibold block">Mobile / Contact Number:</span>
                      <strong className="font-mono text-[#180200]">{viewingMember.mobile || viewingMember.mobileNumber || viewingMember.contactNumber || '—'}</strong>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pb-2.5 border-b border-[#E8DFD8]">
                    <div>
                      <span className="text-[#863221] font-semibold block">Gothra:</span>
                      <span className="text-[#180200] font-medium">{viewingMember.gothra || viewingMember.gotra || '—'}</span>
                    </div>
                    <div>
                      <span className="text-[#863221] font-semibold block">Blood Group:</span>
                      <strong className="text-[#510601]">{viewingMember.bloodGroup || '—'}</strong>
                    </div>
                    <div>
                      <span className="text-[#863221] font-semibold block">Aadhar Number:</span>
                      <span className="font-mono text-[#180200]">{viewingMember.aadharNumber || '—'}</span>
                    </div>
                  </div>

                  <div className="pb-2.5 border-b border-[#E8DFD8]">
                    <span className="text-[#863221] font-semibold block">Communication Address:</span>
                    <p className="text-[#180200] mt-0.5 leading-relaxed">
                      {[
                        viewingMember.address || viewingMember.addressLine,
                        viewingMember.locality || viewingMember.postOffice,
                        viewingMember.talukName || viewingMember.taluk,
                        viewingMember.districtName || viewingMember.district,
                        viewingMember.stateName || viewingMember.state || 'Karnataka',
                        viewingMember.postalCode ? `PIN: ${viewingMember.postalCode}` : ''
                      ].filter(Boolean).join(', ') || '—'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <span className="text-[#863221] font-semibold block">Qualification:</span>
                      <span className="text-[#180200]">{viewingMember.qualification || '—'}</span>
                    </div>
                    <div>
                      <span className="text-[#863221] font-semibold block">Employment / Profession:</span>
                      <span className="text-[#180200]">{viewingMember.employment || viewingMember.profession || '—'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 3: PAYMENT / RECEIPT INFORMATION */}
              <div className="space-y-2">
                <h4 className="text-xs sm:text-sm font-bold text-[#1D4ED8] tracking-wide uppercase">
                  Payment / Receipt Information:
                </h4>
                <div className="bg-[#FAF7F2] p-3.5 rounded-xl border border-[#E8DFD8] grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[#863221] font-semibold block">Receipt Status:</span>
                    {(() => {
                      const isAssigned =
                        viewingReceiptData?.status === 'Assigned' ||
                        viewingReceiptData?.receiptStatus === 'Assigned' ||
                        viewingMember.receiptStatus === 'Assigned' ||
                        Boolean(viewingMember.assignedReceiptNumber);
                      return (
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold mt-0.5 ${isAssigned
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isAssigned ? 'bg-emerald-600' : 'bg-amber-400'}`} />
                          <span>{isAssigned ? 'Assigned' : 'Unassigned'}</span>
                        </span>
                      );
                    })()}
                  </div>
                  <div>
                    <span className="text-[#863221] font-semibold block">Receipt Number:</span>
                    <strong className="font-mono text-[#510601]">
                      {viewingReceiptData?.receiptNumber || viewingMember.assignedReceiptNumber || viewingMember.receiptNumber
                        ? `#${viewingReceiptData?.receiptNumber || viewingMember.assignedReceiptNumber || viewingMember.receiptNumber}`
                        : 'Not Assigned'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[#863221] font-semibold block">Receipt Date:</span>
                    <span className="font-mono text-[#180200]">
                      {formatDate(viewingReceiptData?.receiptDate || viewingMember.receiptDate || viewingMember.createdDate)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#863221] font-semibold block">Amount:</span>
                    <strong className="text-[#510601]">
                      Rs. {Number(viewingReceiptData?.amount !== undefined ? viewingReceiptData.amount : (viewingMember.amount || 0)).toLocaleString('en-IN')}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[#863221] font-semibold block">Payment Mode:</span>
                    <span className="text-[#180200] font-medium">
                      {viewingReceiptData?.paymentMode || viewingMember.paymentMode || 'Cash'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#863221] font-semibold block">Bank Account / Details:</span>
                    <span className="text-[#180200]">
                      {viewingReceiptData?.bankAccount || viewingReceiptData?.bankName || viewingMember.bankAccount || viewingMember.bankName || '—'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#863221] font-semibold block">Transaction ID / Cheque No:</span>
                    <span className="font-mono text-[#180200]">
                      {viewingReceiptData?.transactionId || viewingMember.transactionId || '—'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#863221] font-semibold block">Transaction Date:</span>
                    <span className="font-mono text-[#180200]">
                      {formatDate(viewingReceiptData?.transactionDate || viewingMember.transactionDate) || '—'}
                    </span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-[#863221] font-semibold block">Payment Received Details / Remarks:</span>
                    <span className="text-[#180200]">
                      {viewingReceiptData?.description || viewingReceiptData?.paymentReceivedDetails || viewingMember.paymentRemarks || viewingMember.description || viewingMember.paymentReceivedDetails || '—'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#E8DFD8] bg-[#FAF7F2]/60 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setViewingMember(null)}
                className="px-4 py-2 bg-white border border-[#E8DFD8] hover:border-[#863221] text-xs font-semibold text-[#863221] rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                {/* If Not Assigned: allow going to receipt entry */}
                {!(viewingMember.receiptStatus === 'Assigned' || Boolean(viewingMember.assignedReceiptNumber)) && (
                  <button
                    type="button"
                    onClick={() => {
                      const m = viewingMember;
                      setViewingMember(null);
                      navigate('/dashboard/receipts/entry', { state: { selectedMember: m, isAssignmentFlow: true, mode: 'assign' } });
                    }}
                    className="px-4 py-2 bg-[#510601] hover:bg-[#8C1801] text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Assign to Receipt</span>
                  </button>
                )}
              </div>
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
              : toastMessage.type === 'info'
                ? 'bg-amber-50 text-amber-900 border-amber-200'
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
