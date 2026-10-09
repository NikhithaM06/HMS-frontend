import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Modal from '../components/Modal';
import {
  Plus,
  Search,
  Trash2,
  Eye,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  X,
  AlertCircle,
  AlertTriangle,
  RefreshCw,
  SlidersHorizontal,
  Power
} from 'lucide-react';
import {
  getStoredPaymentModeConfigs,
  saveStoredPaymentModeConfigs,
  getStoredReceipts,
  formatPaymentModeLabel
} from '../utils/receiptStore';

export default function BankDetailsManagement() {
  // Master state
  const [paymentConfigs, setPaymentConfigs] = useState(getStoredPaymentModeConfigs());
  const [receipts, setReceipts] = useState(getStoredReceipts());

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'Active' | 'Inactive'

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addFormData, setAddFormData] = useState({
    paymentMode: '',
    status: 'Active'
  });
  const [formErrors, setFormErrors] = useState({});

  // View Details Modal State
  const [viewingItem, setViewingItem] = useState(null);

  // Delete Dialog State
  const [deleteTargetItem, setDeleteTargetItem] = useState(null);
  const [isDeleteWarningOpen, setIsDeleteWarningOpen] = useState(false); // Used when mode is referenced by receipts
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false); // Used when mode can be safely deleted

  // Status Toggle Confirmation Dialog State
  const [statusDialog, setStatusDialog] = useState(null); // { item, newStatus }

  // Toast / Feedback State
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const loadLatestData = () => {
    setPaymentConfigs(getStoredPaymentModeConfigs());
    setReceipts(getStoredReceipts());
  };

  useEffect(() => {
    loadLatestData();
    const handleUpdate = () => loadLatestData();
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('hms_payment_modes_updated', handleUpdate);
    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('hms_payment_modes_updated', handleUpdate);
    };
  }, []);

  const persistConfigs = (updatedList) => {
    setPaymentConfigs(updatedList);
    saveStoredPaymentModeConfigs(updatedList);
  };

  // Receipts count per payment mode
  const usageCountMap = useMemo(() => {
    const map = {};
    receipts.forEach((r) => {
      const mode = (r.paymentMode || '').trim().toLowerCase();
      const bank = (r.bankAccount || '').trim().toLowerCase();
      if (mode) {
        map[mode] = (map[mode] || 0) + 1;
      }
      if (bank && bank !== mode) {
        map[bank] = (map[bank] || 0) + 1;
      }
    });
    return map;
  }, [receipts]);

  const getModeUsageCount = (modeName) => {
    if (!modeName) return 0;
    const key = modeName.trim().toLowerCase();
    return usageCountMap[key] || 0;
  };

  // ----------------------------------------------------
  // SEARCH & FILTERING
  // ----------------------------------------------------
  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
    setCurrentPage(1);
  };

  const hasActiveFilters = searchQuery !== '' || statusFilter !== 'ALL';

  const filteredData = useMemo(() => {
    return paymentConfigs.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const mode = (item.paymentMode || '').toLowerCase();

      const matchSearch = !q || mode.includes(q);

      const matchStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'Active' && (item.status || 'Active') === 'Active') ||
        (statusFilter === 'Inactive' && item.status === 'Inactive');

      return matchSearch && matchStatus;
    });
  }, [paymentConfigs, searchQuery, statusFilter]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  // ----------------------------------------------------
  // ADD MODAL HANDLERS
  // ----------------------------------------------------
  const openAddModal = () => {
    setAddFormData({
      paymentMode: '',
      status: 'Active'
    });
    setFormErrors({});
    setIsAddModalOpen(true);
  };

  const validateAddForm = () => {
    const errors = {};
    const modeName = (addFormData.paymentMode || '').trim();

    if (!modeName) {
      errors.paymentMode = 'Payment Mode name is required.';
    } else {
      const isDuplicate = paymentConfigs.some(
        (cfg) => (cfg.paymentMode || '').trim().toLowerCase() === modeName.toLowerCase()
      );
      if (isDuplicate) {
        errors.paymentMode = `Payment Mode "${modeName}" already exists.`;
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSavePaymentMode = (e) => {
    e.preventDefault();
    if (!validateAddForm()) return;

    const modeName = addFormData.paymentMode.trim();
    const newConfig = {
      id: `PM-${Date.now()}`,
      paymentMode: modeName,
      status: addFormData.status || 'Active',
      createdAt: new Date().toISOString()
    };

    const updated = [...paymentConfigs, newConfig];
    persistConfigs(updated);
    showToast(`Payment Mode "${modeName}" added successfully.`);
    setIsAddModalOpen(false);
  };

  // ----------------------------------------------------
  // STATUS TOGGLE CONFIRMATION
  // ----------------------------------------------------
  const handleToggleStatusClick = (item) => {
    const currentStatus = item.status || 'Active';
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    setStatusDialog({ item, newStatus });
  };

  const confirmStatusToggle = () => {
    if (!statusDialog) return;
    const { item, newStatus } = statusDialog;

    const updated = paymentConfigs.map((cfg) => {
      if (cfg.id === item.id) {
        return {
          ...cfg,
          status: newStatus,
          updatedAt: new Date().toISOString()
        };
      }
      return cfg;
    });

    persistConfigs(updated);
    showToast(
      `"${item.paymentMode}" status changed to ${newStatus}.${
        newStatus === 'Inactive'
          ? ' It is now hidden from new Receipt Entry dropdowns.'
          : ' It is now available for new Receipt Entry dropdowns.'
      }`
    );
    setStatusDialog(null);
  };

  // ----------------------------------------------------
  // DELETE HANDLERS
  // ----------------------------------------------------
  const handleDeleteClick = (item) => {
    const usageCount = getModeUsageCount(item.paymentMode);
    if (usageCount > 0) {
      // Used in historical receipts -> show warning & suggest deactivation
      setDeleteTargetItem(item);
      setIsDeleteWarningOpen(true);
    } else {
      // Safe to delete with confirmation
      setDeleteTargetItem(item);
      setIsDeleteConfirmOpen(true);
    }
  };

  const confirmDelete = () => {
    if (!deleteTargetItem) return;

    const updated = paymentConfigs.filter((cfg) => cfg.id !== deleteTargetItem.id);
    persistConfigs(updated);
    showToast(`Payment Mode "${deleteTargetItem.paymentMode}" has been deleted.`);
    setIsDeleteConfirmOpen(false);
    setDeleteTargetItem(null);
  };

  const handleDeactivateFromWarning = () => {
    if (!deleteTargetItem) return;

    const updated = paymentConfigs.map((cfg) => {
      if (cfg.id === deleteTargetItem.id) {
        return {
          ...cfg,
          status: 'Inactive',
          updatedAt: new Date().toISOString()
        };
      }
      return cfg;
    });

    persistConfigs(updated);
    showToast(`Payment Mode "${deleteTargetItem.paymentMode}" has been deactivated.`);
    setIsDeleteWarningOpen(false);
    setDeleteTargetItem(null);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium ${
              toastMessage.type === 'error'
                ? 'bg-red-50 border-red-200 text-red-800'
                : 'bg-[#FAF7F2] border-[#8C1801]/30 text-[#180200]'
            }`}
          >
            {toastMessage.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-[#3D705C] shrink-0" />
            )}
            <span>{toastMessage.message}</span>
            <button
              onClick={() => setToastMessage(null)}
              className="ml-2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Breadcrumbs & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E8DFD8] pb-5">
        <div>
          <nav className="flex items-center gap-2 text-xs font-semibold text-[#863221] uppercase tracking-wider mb-1.5">
            <Link to="/dashboard" className="hover:text-[#510601] transition-colors">
              Dashboard
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#863221]/50" />
            <span>Masters</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#863221]/50" />
            <span className="text-[#180200]">Payment Mode Setup</span>
          </nav>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#180200] tracking-tight font-serif">
              Payment Mode Setup
            </h1>
            <p className="text-xs text-[#863221] mt-1">
              Configure available payment modes for receipt generation.
            </p>
          </div>
        </div>

        {/* Action Button: Add Payment Mode */}
        <button
          onClick={openAddModal}
          id="btn-add-payment-mode"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#510601] hover:bg-[#3D0400] active:bg-[#200200] text-white text-sm font-bold rounded-xl shadow-sm hover:shadow transition-all duration-200 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Payment Mode</span>
        </button>
      </div>

      {/* Main Table Card Container */}
      <div className="bg-white border border-[#E8DFD8] rounded-2xl shadow-sm overflow-hidden">
        {/* Search & Filter Header Bar */}
        <div className="p-4 sm:p-5 border-b border-[#E8DFD8] bg-[#FAF7F2]/40 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#863221]/60 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by Payment Mode..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-4 py-2 bg-white border border-[#E8DFD8] focus:border-[#510601] focus:ring-1 focus:ring-[#510601] rounded-xl text-xs sm:text-sm text-[#180200] placeholder-[#863221]/40 focus:outline-none transition-all shadow-2xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2 shrink-0">
              <label className="text-xs font-bold text-[#863221] whitespace-nowrap">
                Status:
              </label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 bg-white border border-[#E8DFD8] focus:border-[#510601] focus:ring-1 focus:ring-[#510601] rounded-xl text-xs font-semibold text-[#180200] focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            {/* Clear Filter Button */}
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#863221] hover:text-[#510601] hover:bg-[#FAF7F2] rounded-xl border border-dashed border-[#E8DFD8] transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>

          <div className="text-xs font-semibold text-[#863221] self-end sm:self-auto">
            Showing <span className="text-[#180200] font-bold">{filteredData.length}</span> payment modes
          </div>
        </div>

        {/* Configurations Table: ONLY 3 Columns (Payment Mode, Status, Actions) */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E8DFD8] bg-[#FAF7F2] text-[11px] font-bold text-[#863221] uppercase tracking-wider">
                <th className="py-3.5 px-4 sm:px-6">Payment Mode</th>
                <th className="py-3.5 px-4 sm:px-6 text-center">Status</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8DFD8] text-xs sm:text-sm text-[#180200]">
              {paginatedData.length > 0 ? (
                paginatedData.map((config) => {
                  const isActive = (config.status || 'Active') === 'Active';

                  return (
                    <tr
                      key={config.id || config.paymentMode}
                      className="hover:bg-[#FAF7F2]/60 transition-colors group"
                    >
                      {/* Column 1: Payment Mode */}
                      <td className="py-4 px-4 sm:px-6 font-medium">
                        <span className="font-bold text-[#180200] text-sm font-serif">
                          {config.paymentMode}
                        </span>
                      </td>

                      {/* Column 2: Status */}
                      <td className="py-4 px-4 sm:px-6 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleStatusClick(config)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                          }`}
                          title={`Click to change status to ${isActive ? 'Inactive' : 'Active'}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isActive ? 'bg-emerald-500' : 'bg-gray-400'
                            }`}
                          />
                          <span>{isActive ? 'Active' : 'Inactive'}</span>
                        </button>
                      </td>

                      {/* Column 3: Actions (View | Delete) */}
                      <td className="py-4 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* View Button */}
                          <button
                            type="button"
                            onClick={() => setViewingItem(config)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-[#510601] hover:bg-[#FAF7F2] hover:text-[#3D0400] border border-[#E8DFD8] rounded-lg transition-colors cursor-pointer"
                            title="View Payment Mode Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </button>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => handleDeleteClick(config)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 hover:text-red-800 border border-red-200 rounded-lg transition-colors cursor-pointer"
                            title="Delete Payment Mode"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={3} className="py-12 px-6 text-center text-gray-500">
                    <div className="max-w-xs mx-auto flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-[#FAF7F2] border border-[#E8DFD8] flex items-center justify-center text-[#863221] mb-3">
                        <SlidersHorizontal className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-bold text-[#180200] mb-1">
                        No Payment Modes Found
                      </h4>
                      <p className="text-xs text-[#863221]/70 mb-4">
                        {hasActiveFilters
                          ? 'No payment modes match your current search and filter criteria.'
                          : 'No payment modes have been configured yet.'}
                      </p>
                      {hasActiveFilters ? (
                        <button
                          onClick={handleClearFilters}
                          className="px-4 py-2 bg-white border border-[#E8DFD8] text-xs font-semibold text-[#510601] rounded-xl hover:bg-[#FAF7F2] transition-colors cursor-pointer"
                        >
                          Clear Filters
                        </button>
                      ) : (
                        <button
                          onClick={openAddModal}
                          className="px-4 py-2 bg-[#510601] text-white text-xs font-bold rounded-xl hover:bg-[#3D0400] transition-colors cursor-pointer"
                        >
                          + Add Payment Mode
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {filteredData.length > 0 && (
          <div className="p-4 border-t border-[#E8DFD8] bg-[#FAF7F2]/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#863221]">
            <div className="flex items-center gap-2">
              <span>Show</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 bg-white border border-[#E8DFD8] rounded-lg text-xs font-semibold text-[#180200] focus:outline-none cursor-pointer"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span>per page</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span>
                Page <span className="font-bold text-[#180200]">{currentPage}</span> of{' '}
                <span className="font-bold text-[#180200]">{totalPages}</span>
              </span>

              <div className="flex items-center gap-1 ml-2">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 rounded-lg border border-[#E8DFD8] bg-white text-[#180200] hover:bg-[#FAF7F2] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="p-1.5 rounded-lg border border-[#E8DFD8] bg-white text-[#180200] hover:bg-[#FAF7F2] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ====================================================================== */}
      {/* MODAL 1: ADD PAYMENT MODE */}
      {/* ====================================================================== */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        className="p-4"
      >
        <div className="bg-white rounded-2xl shadow-xl border border-[#E8DFD8] w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="px-6 py-4 border-b border-[#E8DFD8] bg-[#FAF7F2] flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-[#180200] font-serif">
                Add Payment Mode
              </h3>
              <p className="text-xs text-[#863221]">
                Enter the payment mode name for receipt generation.
              </p>
            </div>
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSavePaymentMode} className="p-6 space-y-4">
            {/* Field: Payment Mode Name */}
            <div>
              <label className="block text-xs font-bold text-[#180200] uppercase tracking-wider mb-1.5">
                Payment Mode <span className="text-[#ED4636]">*</span>
              </label>
              <input
                type="text"
                name="paymentMode"
                value={addFormData.paymentMode}
                onChange={(e) => {
                  setAddFormData({ ...addFormData, paymentMode: e.target.value });
                  if (formErrors.paymentMode) {
                    setFormErrors({ ...formErrors, paymentMode: '' });
                  }
                }}
                placeholder="e.g. Cash, KBL 1075, SBI, CANARA BANK, HDFC"
                autoFocus
                className="w-full px-3.5 py-2.5 bg-white border border-[#E8DFD8] focus:border-[#510601] focus:ring-1 focus:ring-[#510601] rounded-xl text-sm font-medium text-[#180200] placeholder-[#863221]/40 focus:outline-none shadow-2xs"
              />
              {formErrors.paymentMode && (
                <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{formErrors.paymentMode}</span>
                </p>
              )}
            </div>

            {/* Field: Status */}
            <div>
              <label className="block text-xs font-bold text-[#180200] uppercase tracking-wider mb-1.5">
                Initial Status
              </label>
              <select
                name="status"
                value={addFormData.status}
                onChange={(e) => setAddFormData({ ...addFormData, status: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-[#E8DFD8] focus:border-[#510601] focus:ring-1 focus:ring-[#510601] rounded-xl text-sm font-semibold text-[#180200] focus:outline-none cursor-pointer"
              >
                <option value="Active">Active (Available in Receipt Entry)</option>
                <option value="Inactive">Inactive (Disabled for new receipts)</option>
              </select>
            </div>

            {/* Modal Buttons */}
            <div className="pt-4 border-t border-[#E8DFD8] flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2.5 border border-[#E8DFD8] hover:bg-[#FAF7F2] text-sm font-semibold text-[#863221] rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#510601] hover:bg-[#3D0400] text-white text-sm font-bold rounded-xl shadow-sm hover:shadow transition-all duration-200 cursor-pointer"
              >
                Save Payment Mode
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* ====================================================================== */}
      {/* MODAL 2: VIEW PAYMENT MODE DETAILS (READ-ONLY) */}
      {/* ====================================================================== */}
      <Modal
        isOpen={!!viewingItem}
        onClose={() => setViewingItem(null)}
        className="p-4"
      >
        {viewingItem && (
          <div className="bg-white rounded-2xl shadow-xl border border-[#E8DFD8] w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-[#E8DFD8] bg-[#FAF7F2] flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#180200] font-serif">
                  Payment Mode Details
                </h3>
                <p className="text-xs text-[#863221]">
                  Payment Mode Master record
                </p>
              </div>
              <button
                onClick={() => setViewingItem(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Details Content */}
            <div className="p-6 space-y-4">
              <div className="bg-[#FAF7F2] border border-[#E8DFD8] rounded-xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-[#863221] uppercase tracking-wider block">
                    Payment Mode
                  </span>
                  <span className="text-xl font-black text-[#180200] font-serif">
                    {viewingItem.paymentMode}
                  </span>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                    (viewingItem.status || 'Active') === 'Active'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-gray-100 text-gray-600 border-gray-200'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      (viewingItem.status || 'Active') === 'Active'
                        ? 'bg-emerald-500'
                        : 'bg-gray-400'
                    }`}
                  />
                  <span>{viewingItem.status || 'Active'}</span>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-white border border-[#E8DFD8] rounded-xl">
                  <span className="text-[10px] font-bold text-[#863221] uppercase tracking-wider block mb-0.5">
                    Receipt Usage
                  </span>
                  <span className="text-sm font-bold text-[#180200] block mt-0.5">
                    {getModeUsageCount(viewingItem.paymentMode)}{' '}
                    {getModeUsageCount(viewingItem.paymentMode) === 1 ? 'receipt' : 'receipts'}
                  </span>
                </div>

                <div className="p-3 bg-white border border-[#E8DFD8] rounded-xl">
                  <span className="text-[10px] font-bold text-[#863221] uppercase tracking-wider block mb-0.5">
                    Receipt Dropdown
                  </span>
                  <span className="text-sm font-semibold text-[#510601] block mt-0.5">
                    {(viewingItem.status || 'Active') === 'Active' ? 'Available' : 'Hidden'}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-[#E8DFD8] bg-[#FAF7F2] flex items-center justify-end gap-2.5">
              <button
                onClick={() => setViewingItem(null)}
                className="px-5 py-2 bg-[#510601] hover:bg-[#3D0400] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-2xs"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ====================================================================== */}
      {/* MODAL 3: STATUS TOGGLE CONFIRMATION */}
      {/* ====================================================================== */}
      <Modal
        isOpen={!!statusDialog}
        onClose={() => setStatusDialog(null)}
        className="p-4"
      >
        {statusDialog && (
          <div className="bg-white rounded-2xl shadow-xl border border-[#E8DFD8] w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 text-center">
              <div
                className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center mb-3 ${
                  statusDialog.newStatus === 'Active'
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'bg-amber-50 text-amber-600'
                }`}
              >
                {statusDialog.newStatus === 'Active' ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : (
                  <Power className="w-6 h-6" />
                )}
              </div>
              <h4 className="text-base font-bold text-[#180200] font-serif mb-1">
                Change Status to {statusDialog.newStatus}?
              </h4>
              <p className="text-xs text-[#863221] leading-relaxed">
                {statusDialog.newStatus === 'Inactive'
                  ? `Setting "${statusDialog.item.paymentMode}" to Inactive will hide it from the Payment Mode dropdown for new receipts. All existing historical receipts using this payment mode remain intact.`
                  : `Setting "${statusDialog.item.paymentMode}" to Active will make it immediately available for selection in new receipts.`}
              </p>
            </div>
            <div className="p-4 border-t border-[#E8DFD8] bg-[#FAF7F2] flex items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={() => setStatusDialog(null)}
                className="px-4 py-2 border border-[#E8DFD8] text-xs font-semibold text-[#863221] hover:bg-white rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmStatusToggle}
                className={`px-5 py-2 text-xs font-bold text-white rounded-xl shadow-sm transition-colors cursor-pointer ${
                  statusDialog.newStatus === 'Active'
                    ? 'bg-emerald-700 hover:bg-emerald-800'
                    : 'bg-[#510601] hover:bg-[#3D0400]'
                }`}
              >
                Confirm {statusDialog.newStatus}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ====================================================================== */}
      {/* MODAL 4: DELETE BLOCKED WARNING (USED IN RECEIPTS) */}
      {/* ====================================================================== */}
      <Modal
        isOpen={isDeleteWarningOpen}
        onClose={() => setIsDeleteWarningOpen(false)}
        className="p-4"
      >
        {deleteTargetItem && (
          <div className="bg-white rounded-2xl shadow-xl border border-[#E8DFD8] w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center mb-3 bg-amber-50 text-amber-600 border border-amber-200">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-[#180200] font-serif mb-2">
                Cannot Delete Payment Mode
              </h4>
              <div className="p-3.5 bg-[#FAF7F2] rounded-xl border border-[#E8DFD8] mb-4 text-left">
                <p className="text-xs font-semibold text-[#180200] mb-1">
                  Payment Mode: <span className="font-bold text-[#510601]">{deleteTargetItem.paymentMode}</span>
                </p>
                <p className="text-xs text-[#863221]">
                  This payment mode is already used in receipt records ({getModeUsageCount(deleteTargetItem.paymentMode)} {getModeUsageCount(deleteTargetItem.paymentMode) === 1 ? 'receipt' : 'receipts'}) and cannot be deleted. You can deactivate it instead.
                </p>
              </div>
              <p className="text-xs text-[#863221]/80">
                Deactivating it will hide it from future receipt entries without affecting historical receipts.
              </p>
            </div>

            <div className="p-4 border-t border-[#E8DFD8] bg-[#FAF7F2] flex items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={() => setIsDeleteWarningOpen(false)}
                className="px-4 py-2 border border-[#E8DFD8] text-xs font-semibold text-[#863221] hover:bg-white rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
              {(deleteTargetItem.status || 'Active') === 'Active' && (
                <button
                  type="button"
                  onClick={handleDeactivateFromWarning}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#510601] hover:bg-[#3D0400] rounded-xl shadow-sm transition-colors cursor-pointer"
                >
                  Deactivate Instead
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* ====================================================================== */}
      {/* MODAL 5: CONFIRM PERMANENT DELETE (WHEN NOT USED IN RECEIPTS) */}
      {/* ====================================================================== */}
      <Modal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        className="p-4"
      >
        {deleteTargetItem && (
          <div className="bg-white rounded-2xl shadow-xl border border-[#E8DFD8] w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 text-center">
              <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center mb-3 bg-red-50 text-red-600 border border-red-100">
                <Trash2 className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-[#180200] font-serif mb-1">
                Delete Payment Mode?
              </h4>
              <p className="text-xs text-[#863221] leading-relaxed">
                Are you sure you want to delete payment mode <strong className="text-[#180200]">"{deleteTargetItem.paymentMode}"</strong>? This action cannot be undone.
              </p>
            </div>
            <div className="p-4 border-t border-[#E8DFD8] bg-[#FAF7F2] flex items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="px-4 py-2 border border-[#E8DFD8] text-xs font-semibold text-[#863221] hover:bg-white rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-5 py-2 text-xs font-bold text-white bg-red-700 hover:bg-red-800 rounded-xl shadow-sm transition-colors cursor-pointer"
              >
                Delete Payment Mode
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
