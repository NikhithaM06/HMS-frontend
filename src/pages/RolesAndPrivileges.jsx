import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Modal from '../components/Modal';
import {
  Shield,
  ShieldCheck,
  Plus,
  Search,
  Edit3,
  Trash2,
  Eye,
  Power,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  X,
  AlertCircle,
  AlertTriangle,
  RefreshCw,
  Users,
  Key,
  CheckSquare,
  Square,
  Lock,
  Calendar,
  Layers,
  FileText
} from 'lucide-react';
import { allPrivileges, allPrivilegeIds, initialRoles } from '../data/rolesData';
import { formatDate } from '../utils/dateUtils';

export default function RolesAndPrivileges() {
  // Master state
  const [roles, setRoles] = useState(initialRoles);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Add / Edit Role Modal State
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [editingRole, setEditingRole] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'Active'
  });
  const [formErrors, setFormErrors] = useState({});

  // Configure Privileges Modal State
  const [privilegeTargetRole, setPrivilegeTargetRole] = useState(null);
  const [selectedPrivileges, setSelectedPrivileges] = useState([]);
  const [privilegeSearch, setPrivilegeSearch] = useState('');

  // View Details Modal State
  const [viewingRole, setViewingRole] = useState(null);

  // Delete Confirmation State
  const [deleteTargetRole, setDeleteTargetRole] = useState(null);

  // Status Toggle Confirmation State
  const [statusDialog, setStatusDialog] = useState(null); // { role, newStatus }

  // Toast / Feedback Modal State
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // ----------------------------------------------------
  // SYSTEM ROLE HELPER
  // ----------------------------------------------------
  const isSystemRole = (role) => {
    if (!role) return false;
    return Boolean(
      role.isSystem ||
      role.is_all_access ||
      role.code === 'super_admin' ||
      role.rank_level === 1 ||
      role.id === 1 ||
      String(role.id) === '1'
    );
  };

  // ----------------------------------------------------
  // SUMMARY METRICS
  // Helper for active status check (supports boolean and string)
  const isRoleActive = (role) => {
    if (!role) return false;
    return typeof role.status === 'boolean' ? role.status : role.status === 'Active';
  };

  // ----------------------------------------------------
  // SUMMARY METRICS
  // ----------------------------------------------------
  const summaryStats = useMemo(() => {
    const total = roles.length;
    const active = roles.filter(r => isRoleActive(r)).length;
    const inactive = roles.filter(r => !isRoleActive(r)).length;
    const totalAssignedUsers = roles.reduce((acc, r) => acc + (r.usersCount || 0), 0);
    return { total, active, inactive, totalAssignedUsers };
  }, [roles]);

  // ----------------------------------------------------
  // SEARCH & FILTERING
  // ----------------------------------------------------
  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
    setCurrentPage(1);
  };

  const hasActiveFilters = searchQuery !== '' || statusFilter !== 'ALL';

  const filteredRoles = useMemo(() => {
    return roles.filter((role) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        role.name.toLowerCase().includes(q) ||
        (role.code && role.code.toLowerCase().includes(q)) ||
        (role.description && role.description.toLowerCase().includes(q));

      const active = isRoleActive(role);
      const matchStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'Active' && active) ||
        (statusFilter === 'Inactive' && !active) ||
        (statusFilter === 'true' && active) ||
        (statusFilter === 'false' && !active);

      return matchSearch && matchStatus;
    });
  }, [roles, searchQuery, statusFilter]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredRoles.length / pageSize) || 1;
  const paginatedRoles = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRoles.slice(start, start + pageSize);
  }, [filteredRoles, currentPage, pageSize]);

  // ----------------------------------------------------
  // ADD / EDIT ROLE LOGIC
  // ----------------------------------------------------
  const openAddModal = () => {
    setModalMode('add');
    setEditingRole(null);
    setFormData({
      name: '',
      description: '',
      status: true
    });
    setFormErrors({});
    setIsAddEditOpen(true);
  };

  const openEditModal = (role) => {
    if (isSystemRole(role)) {
      showToast('System roles cannot be edited.', 'error');
      return;
    }
    setModalMode('edit');
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description || '',
      status: isRoleActive(role)
    });
    setFormErrors({});
    setIsAddEditOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    if (name === 'status') {
      const boolVal = value === 'true' || value === true || value === 'Active';
      setFormData(prev => ({ ...prev, status: boolVal }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateRoleForm = () => {
    const errors = {};
    const name = formData.name?.trim();

    if (!name) {
      errors.name = 'Role Name is required';
    } else {
      const isDuplicate = roles.some(
        r => (r.id !== editingRole?.id && String(r.id) !== String(editingRole?.id)) &&
          r.name.toLowerCase() === name.toLowerCase()
      );
      if (isDuplicate) {
        errors.name = 'A role with this name already exists.';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveRole = (e) => {
    e.preventDefault();
    if (!validateRoleForm()) return;

    const today = new Date().toISOString().split('T')[0];
    const isAct = typeof formData.status === 'boolean' ? formData.status : formData.status === 'Active' || formData.status === 'true';

    if (modalMode === 'add') {
      const newId = roles.length > 0 ? Math.max(...roles.map(r => Number(r.id) || 0)) + 1 : 1;
      const slugCode = formData.name.toLowerCase().trim().replace(/\s+/g, '_');
      const newRole = {
        id: newId,
        name: formData.name.trim(),
        code: slugCode,
        description: formData.description.trim(),
        rank_level: 99,
        is_all_access: false,
        usersCount: 0,
        status: isAct,
        createdAt: today,
        updatedAt: today,
        isSystem: false,
        permission_codes: ['dashboard_view'],
        privileges: ['dashboard_view'] // Default base privilege
      };

      setRoles(prev => [newRole, ...prev]);
      showToast(`Role "${newRole.name}" created successfully.`);
    } else {
      if (isSystemRole(editingRole)) return;
      setRoles(prev => prev.map(r => (r.id === editingRole.id || String(r.id) === String(editingRole.id)) ? {
        ...r,
        name: formData.name.trim(),
        description: formData.description.trim(),
        status: isAct,
        updatedAt: today
      } : r));

      showToast(`Role "${formData.name.trim()}" updated successfully.`);
    }

    setIsAddEditOpen(false);
  };

  // ----------------------------------------------------
  // CONFIGURE PRIVILEGES LOGIC
  // ----------------------------------------------------
  const openPrivilegeModal = (role) => {
    setPrivilegeTargetRole(role);
    if (isSystemRole(role)) {
      setSelectedPrivileges([...allPrivilegeIds]);
    } else {
      const initialCodes = role.permission_codes || role.privileges || [];
      setSelectedPrivileges([...initialCodes]);
    }
    setPrivilegeSearch('');
  };

  const handleTogglePrivilege = (privId) => {
    if (isSystemRole(privilegeTargetRole)) return;
    setSelectedPrivileges(prev =>
      prev.includes(privId) ? prev.filter(id => id !== privId) : [...prev, privId]
    );
  };

  const handleToggleModulePrivileges = (modulePrivilegeIds) => {
    if (isSystemRole(privilegeTargetRole)) return;
    const allSelected = modulePrivilegeIds.every(id => selectedPrivileges.includes(id));
    if (allSelected) {
      // Deselect all in module
      setSelectedPrivileges(prev => prev.filter(id => !modulePrivilegeIds.includes(id)));
    } else {
      // Select all in module
      setSelectedPrivileges(prev => Array.from(new Set([...prev, ...modulePrivilegeIds])));
    }
  };

  const handleMasterToggleAll = () => {
    if (isSystemRole(privilegeTargetRole)) return;
    if (selectedPrivileges.length === allPrivilegeIds.length) {
      // Deselect all
      setSelectedPrivileges([]);
    } else {
      // Select all
      setSelectedPrivileges([...allPrivilegeIds]);
    }
  };

  const handleSavePrivileges = () => {
    if (!privilegeTargetRole || isSystemRole(privilegeTargetRole)) return;
    const today = new Date().toISOString().split('T')[0];

    setRoles(prev => prev.map(r => (r.id === privilegeTargetRole.id || String(r.id) === String(privilegeTargetRole.id)) ? {
      ...r,
      permission_codes: selectedPrivileges,
      privileges: selectedPrivileges,
      updatedAt: today
    } : r));

    // Update viewing modal if open
    if (viewingRole && (viewingRole.id === privilegeTargetRole.id || String(viewingRole.id) === String(privilegeTargetRole.id))) {
      setViewingRole(prev => ({
        ...prev,
        permission_codes: selectedPrivileges,
        privileges: selectedPrivileges,
        updatedAt: today
      }));
    }

    showToast(`Privileges updated successfully for "${privilegeTargetRole.name}".`);
    setPrivilegeTargetRole(null);
  };

  // Filtered privilege groups based on inner search
  const filteredPrivilegeGroups = useMemo(() => {
    if (!privilegeSearch.trim()) return allPrivileges;
    const q = privilegeSearch.toLowerCase();

    return allPrivileges.map(group => {
      const matchModule = group.module.toLowerCase().includes(q);
      const filteredPrivs = group.privileges.filter(p =>
        matchModule ||
        p.name.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q))
      );
      return {
        ...group,
        privileges: filteredPrivs
      };
    }).filter(group => group.privileges.length > 0);
  }, [privilegeSearch]);

  // ----------------------------------------------------
  // ACTIVATE / DEACTIVATE LOGIC (BOOLEAN STATE INVERSION)
  // ----------------------------------------------------
  const promptToggleStatus = (role) => {
    if (isSystemRole(role)) {
      showToast('System roles cannot be deactivated.', 'error');
      return;
    }
    const active = isRoleActive(role);
    setStatusDialog({
      role,
      newStatus: !active
    });
  };

  const handleConfirmStatusToggle = () => {
    if (!statusDialog || isSystemRole(statusDialog.role)) return;
    const { role, newStatus } = statusDialog;
    const today = new Date().toISOString().split('T')[0];

    setRoles(prev => prev.map(r => (r.id === role.id || String(r.id) === String(role.id)) ? {
      ...r,
      status: newStatus,
      updatedAt: today
    } : r));

    if (viewingRole && (viewingRole.id === role.id || String(viewingRole.id) === String(role.id))) {
      setViewingRole(prev => ({ ...prev, status: newStatus, updatedAt: today }));
    }

    showToast(`Role "${role.name}" is now ${newStatus ? 'Active' : 'Inactive'}.`);
    setStatusDialog(null);
  };

  // ----------------------------------------------------
  // DELETE LOGIC (WITH USER COUNT RESTRICTION & SYSTEM ROLE PROTECTION)
  // ----------------------------------------------------
  const confirmDeleteRole = () => {
    if (!deleteTargetRole || isSystemRole(deleteTargetRole) || (deleteTargetRole.usersCount || 0) > 0) return;

    setRoles(prev => prev.filter(r => r.id !== deleteTargetRole.id && String(r.id) !== String(deleteTargetRole.id)));
    showToast(`Role "${deleteTargetRole.name}" deleted successfully.`);
    setDeleteTargetRole(null);
  };

  return (
    <div className="space-y-6">

      {/* Centered Success / Feedback Toast Popup Modal */}
      <Modal
        isOpen={Boolean(toastMessage)}
        onClose={() => setToastMessage(null)}
      >
        {toastMessage && (
          <div
            className="bg-white rounded-2xl max-w-sm w-full border border-[#E8DFD8] shadow-2xl p-6 text-center animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3.5 ${toastMessage.type === 'error' ? 'bg-red-100 text-[#ED4636]' : 'bg-[#3D705C]/10 text-[#3D705C]'
              }`}>
              {toastMessage.type === 'error' ? (
                <AlertCircle className="w-7 h-7" />
              ) : (
                <CheckCircle2 className="w-7 h-7" />
              )}
            </div>

            <h3 className="text-lg font-bold text-[#180200]">
              {toastMessage.type === 'error' ? 'Notice' : 'Success'}
            </h3>
            <p className="text-xs text-[#863221] mt-1.5 leading-relaxed font-medium">
              {toastMessage.message}
            </p>

            <div className="mt-5">
              <button
                type="button"
                onClick={() => setToastMessage(null)}
                className="w-full py-2.5 px-4 bg-[#510601] hover:bg-[#8C1801] active:bg-[#180200] text-white text-xs font-semibold rounded-xl shadow-sm transition-colors cursor-pointer"
              >
                Continue
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Breadcrumb & Header */}
      <div>
        <nav className="flex items-center gap-1.5 text-xs text-[#863221] mb-2 font-medium">
          <Link to="/dashboard" className="hover:text-[#510601] transition-colors">Dashboard</Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#863221]/50" />
          <span>User Management</span>
          <ChevronRight className="w-3.5 h-3.5 text-[#863221]/50" />
          <span className="text-[#510601] font-semibold">Roles & Privileges</span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#180200] tracking-tight">
              User Roles & Privileges
            </h1>
          </div>

          <button
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#510601] hover:bg-[#8C1801] active:bg-[#180200] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm hover:shadow transition-all cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Role</span>
          </button>
        </div>
      </div>

      {/* Main Content Card: Search/Filter + Table */}
      <div className="bg-white rounded-2xl border border-[#E8DFD8] shadow-[0_4px_12px_-2px_rgba(24,2,0,0.04)] overflow-hidden">

        {/* Search & Filters */}
        <div className="p-4 sm:p-6 border-b border-[#E8DFD8] bg-[#FAF7F2]/30">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">

            {/* Search Field */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#863221]/50" />
              <input
                type="text"
                placeholder="Search by role name or description..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="w-full pl-10 pr-9 py-2 bg-white border border-[#E8DFD8] rounded-xl text-sm text-[#180200] placeholder-[#863221]/40 focus:outline-none focus:border-[#510601] focus:ring-1 focus:ring-[#510601] shadow-sm transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => { setSearchQuery(''); setCurrentPage(1); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Controls */}
            <div className="flex items-center gap-2.5">
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                className="py-2 px-3.5 bg-white border border-[#E8DFD8] rounded-xl text-sm text-[#180200] focus:outline-none focus:border-[#510601] focus:ring-1 focus:ring-[#510601] shadow-sm cursor-pointer"
              >
                <option value="ALL">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>

              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="px-3.5 py-2 text-xs font-semibold text-[#ED4636] hover:bg-red-50 rounded-xl border border-red-200 transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer"
                  title="Clear all filters"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Clear Filters</span>
                </button>
              )}
            </div>

          </div>
        </div>

        {/* Roles Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[760px]">
            <thead>
              <tr className="bg-[#FAF7F2] border-b border-[#E8DFD8] text-xs font-semibold text-[#863221] uppercase tracking-wider">
                <th className="px-6 py-3.5">Role Name</th>
                <th className="px-6 py-3.5">Description</th>
                <th className="px-6 py-3.5 text-center">Users Count</th>
                <th className="px-6 py-3.5 text-center">Privileges</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Created Date</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8DFD8] text-sm">
              {paginatedRoles.length > 0 ? (
                paginatedRoles.map((role) => {
                  const privCount = (role.permission_codes || role.privileges) ? (role.permission_codes || role.privileges).length : 0;
                  const isSys = isSystemRole(role);
                  const isFullAdmin = isSys || privCount === allPrivilegeIds.length;
                  const isActive = isRoleActive(role);
                  const isDeleteDisabled = isSys || (role.usersCount || 0) > 0;

                  return (
                    <tr key={role.id} className="hover:bg-[#FAF7F2]/50 transition-colors group">
                      <td className="px-6 py-4 font-bold text-[#180200]">
                        <div className="flex items-center gap-2">
                          <span>{role.name}</span>
                          {isSys && (
                            <span className="px-2 py-0.5 bg-[#FFC107]/20 border border-[#FFC107]/40 text-[#863221] text-[10px] font-bold rounded-md">
                              System
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-[#180200]/80 max-w-xs truncate" title={role.description}>
                        {role.description || '—'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#FAF7F2] border border-[#E8DFD8] rounded-lg text-xs font-semibold text-[#180200]">
                          <Users className="w-3.5 h-3.5 text-[#863221]" />
                          {role.usersCount} {role.usersCount === 1 ? 'User' : 'Users'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => openPrivilegeModal(role)}
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-[#FAF7F2] border border-[#E8DFD8] hover:border-[#510601] text-[#510601] rounded-full text-xs font-semibold shadow-2xs transition-all cursor-pointer group-hover:shadow-xs"
                          title={isSys ? "View System Privileges (Read-Only)" : "Configure access permissions"}
                        >
                          <Key className="w-3.5 h-3.5 text-[#863221]" />
                          <span>
                            {isFullAdmin ? 'All Access (32/32)' : `${privCount} Privileges`}
                          </span>
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          disabled={isSys}
                          onClick={() => !isSys && promptToggleStatus(role)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold transition-all ${
                            isSys
                              ? 'bg-[#3D705C]/10 text-[#3D705C] border border-[#3D705C]/20 cursor-not-allowed opacity-80'
                              : isActive
                                ? 'bg-[#3D705C]/10 text-[#3D705C] border border-[#3D705C]/20 hover:bg-[#3D705C]/20 cursor-pointer hover:opacity-80 active:scale-95'
                                : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200 cursor-pointer hover:opacity-80 active:scale-95'
                          }`}
                          title={isSys ? 'System role is permanently Active' : (isActive ? 'Click to deactivate role' : 'Click to activate role')}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-[#3D705C]' : 'bg-gray-400'}`} />
                          {isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-xs text-[#863221]/80 font-medium">
                        {formatDate(role.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Configure Privileges (Shield Icon) */}
                          <button
                            disabled={isSys}
                            onClick={() => !isSys && openPrivilegeModal(role)}
                            className={`p-1.5 rounded-lg border transition-all ${
                              isSys
                                ? 'text-gray-300 border-transparent cursor-not-allowed opacity-40'
                                : 'text-[#863221] hover:text-[#510601] hover:bg-[#FAF7F2] border-transparent hover:border-[#E8DFD8] cursor-pointer'
                            }`}
                            title={isSys ? "System role privileges are permanent and cannot be modified" : "Configure Privileges"}
                          >
                            <ShieldCheck className="w-4 h-4" />
                          </button>

                          {/* View Details */}
                          <button
                            onClick={() => setViewingRole(role)}
                            className="p-1.5 text-[#863221] hover:text-[#510601] hover:bg-[#FAF7F2] rounded-lg border border-transparent hover:border-[#E8DFD8] transition-all cursor-pointer"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Edit Role */}
                          <button
                            disabled={isSys}
                            onClick={() => !isSys && openEditModal(role)}
                            className={`p-1.5 rounded-lg border transition-all ${
                              isSys
                                ? 'text-gray-300 border-transparent cursor-not-allowed opacity-40'
                                : 'text-[#863221] hover:text-[#510601] hover:bg-[#FAF7F2] border-transparent hover:border-[#E8DFD8] cursor-pointer'
                            }`}
                            title={isSys ? "System role cannot be edited" : "Edit Role"}
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* Delete Role (Only included if role is deletable) */}
                          {!isDeleteDisabled && (
                            <button
                              onClick={() => setDeleteTargetRole(role)}
                              className="p-1.5 text-[#863221] hover:text-[#ED4636] hover:bg-red-50 rounded-lg border border-transparent hover:border-red-100 transition-all cursor-pointer"
                              title="Delete Role"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-[#863221]">
                    <div className="w-12 h-12 rounded-full bg-[#FAF7F2] text-[#863221]/60 flex items-center justify-center mx-auto mb-3">
                      <Shield className="w-6 h-6" />
                    </div>
                    <p className="font-semibold text-sm text-[#180200]">No user roles found</p>
                    <p className="text-xs text-[#863221]/70 mt-1 max-w-sm mx-auto">
                      {hasActiveFilters
                        ? "Try changing your search or filter criteria."
                        : "No roles defined yet. Click below to add your first user role."}
                    </p>
                    <div className="mt-4 flex justify-center gap-2">
                      {hasActiveFilters ? (
                        <button
                          onClick={handleClearFilters}
                          className="px-4 py-2 bg-white border border-[#E8DFD8] hover:border-[#510601] text-xs font-semibold rounded-xl text-[#510601] transition-colors cursor-pointer"
                        >
                          Clear Filters
                        </button>
                      ) : (
                        <button
                          onClick={openAddModal}
                          className="px-4 py-2 bg-[#510601] hover:bg-[#8C1801] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                        >
                          Add Role
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Section */}
        <div className="px-4 sm:px-6 py-4 border-t border-[#E8DFD8] bg-[#FAF7F2]/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-xs text-[#863221] font-medium">
            <span>
              Showing {filteredRoles.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{' '}
              {Math.min(currentPage * pageSize, filteredRoles.length)} of {filteredRoles.length} entries
            </span>
            <span className="text-[#863221]/40">•</span>
            <div className="flex items-center gap-1.5">
              <span>Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                className="bg-white border border-[#E8DFD8] rounded-lg px-2 py-1 text-xs text-[#180200] focus:outline-none focus:border-[#510601]"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-[#E8DFD8] bg-white text-[#863221] hover:border-[#510601] hover:text-[#510601] disabled:opacity-40 disabled:hover:border-[#E8DFD8] disabled:hover:text-[#863221] transition-all cursor-pointer disabled:cursor-not-allowed"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
              .map((pageNum, idx, arr) => {
                const prevPageNum = arr[idx - 1];
                const showEllipsis = prevPageNum && pageNum - prevPageNum > 1;

                return (
                  <React.Fragment key={pageNum}>
                    {showEllipsis && <span className="px-1 text-xs text-[#863221]/50">...</span>}
                    <button
                      onClick={() => setCurrentPage(pageNum)}
                      className={`min-w-[32px] h-8 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${currentPage === pageNum
                        ? 'bg-[#510601] text-white shadow-sm'
                        : 'bg-white border border-[#E8DFD8] text-[#863221] hover:border-[#510601] hover:text-[#510601]'
                        }`}
                    >
                      {pageNum}
                    </button>
                  </React.Fragment>
                );
              })}

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-1.5 rounded-lg border border-[#E8DFD8] bg-white text-[#863221] hover:border-[#510601] hover:text-[#510601] disabled:opacity-40 disabled:hover:border-[#E8DFD8] disabled:hover:text-[#863221] transition-all cursor-pointer disabled:cursor-not-allowed"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* ============================================================ */}
      {/* ADD / EDIT ROLE MODAL                                        */}
      {/* ============================================================ */}
      <Modal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
      >
        <div
          className="bg-white rounded-2xl max-w-md w-full border border-[#E8DFD8] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8DFD8] bg-[#FAF7F2]">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#510601]/10 text-[#510601]">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#180200]">
                  {modalMode === 'add' ? 'Add User Role' : 'Edit User Role'}
                </h3>
                <p className="text-xs text-[#863221]">
                  {modalMode === 'add' ? 'Define a new role and establish privilege defaults.' : 'Update role title, description, and status.'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsAddEditOpen(false)}
              className="text-[#863221]/60 hover:text-[#180200] p-1.5 rounded-lg hover:bg-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSaveRole} className="p-6 space-y-4">

            {/* Role Name */}
            <div>
              <label className="block text-xs font-bold text-[#180200] uppercase tracking-wider mb-1.5">
                Role Name <span className="text-[#ED4636]">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                placeholder="e.g. Membership Auditor"
                className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm font-semibold text-[#180200] placeholder-[#863221]/40 focus:outline-none transition-colors ${formErrors.name
                  ? 'border-[#ED4636] ring-1 ring-[#ED4636]/30 bg-red-50/20'
                  : 'border-[#E8DFD8] focus:border-[#510601] focus:ring-1 focus:ring-[#510601]'
                  }`}
              />
              {formErrors.name && (
                <p className="text-xs text-[#ED4636] mt-1 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {formErrors.name}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-[#180200] uppercase tracking-wider mb-1.5">
                Description
              </label>
              <textarea
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleFormChange}
                placeholder="Describe the scope, responsibilities, and permissions for this role..."
                className="w-full px-3.5 py-2.5 bg-white border border-[#E8DFD8] rounded-xl text-xs text-[#180200] placeholder-[#863221]/40 focus:outline-none focus:border-[#510601] focus:ring-1 focus:ring-[#510601] transition-colors resize-none"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-bold text-[#180200] uppercase tracking-wider mb-1.5">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleFormChange}
                className="w-full px-3.5 py-2.5 bg-white border border-[#E8DFD8] rounded-xl text-sm text-[#180200] focus:outline-none focus:border-[#510601] focus:ring-1 focus:ring-[#510601] cursor-pointer"
              >
                <option value="Active">Active (Assignable to users)</option>
                <option value="Inactive">Inactive (Suspended)</option>
              </select>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E8DFD8]">
              <button
                type="button"
                onClick={() => setIsAddEditOpen(false)}
                className="px-4 py-2.5 border border-[#E8DFD8] text-[#863221] hover:text-[#180200] hover:bg-[#FAF7F2] text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#510601] hover:bg-[#8C1801] active:bg-[#180200] text-white text-xs font-semibold rounded-xl shadow-sm hover:shadow transition-all cursor-pointer"
              >
                {modalMode === 'add' ? 'Save Role' : 'Update Role'}
              </button>
            </div>

          </form>
        </div>
      </Modal>

      {/* ============================================================ */}
      {/* CONFIGURE PRIVILEGES MODAL                                   */}
      {/* ============================================================ */}
      <Modal
        isOpen={Boolean(privilegeTargetRole)}
        onClose={() => setPrivilegeTargetRole(null)}
      >
        {privilegeTargetRole && (() => {
          const isSysTarget = isSystemRole(privilegeTargetRole);
          return (
            <div
              className="bg-white rounded-2xl max-w-4xl w-full border border-[#E8DFD8] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-[#E8DFD8] bg-[#FAF7F2] shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-[#510601]/10 text-[#510601]">
                      <Key className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base sm:text-lg font-bold text-[#180200]">
                          Configure Privileges – {privilegeTargetRole.name}
                        </h3>
                        {isSysTarget && (
                          <span className="px-2 py-0.5 bg-[#FFC107]/20 border border-[#FFC107]/40 text-[#863221] text-[10px] font-bold rounded-md">
                            System Role (Read-Only)
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#863221]">
                        {isSysTarget
                          ? 'Super Admin / System roles maintain permanent full-access across all modules.'
                          : 'Select the specific modules and permissions assigned to this user role.'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setPrivilegeTargetRole(null)}
                    className="text-[#863221]/60 hover:text-[#180200] p-1.5 rounded-lg hover:bg-white transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* System Role Notice Banner */}
                {isSysTarget && (
                  <div className="mt-3 px-3.5 py-2 bg-[#FFC107]/15 border border-[#FFC107]/40 rounded-xl text-xs text-[#863221] flex items-center gap-2">
                    <Lock className="w-4 h-4 text-[#863221] shrink-0" />
                    <span className="font-semibold">System role privileges are permanent and cannot be modified.</span>
                  </div>
                )}

                {/* Quick Filter & Master Toggle Toolbar */}
                <div className="mt-4 pt-3 border-t border-[#E8DFD8] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#863221]/50" />
                    <input
                      type="text"
                      placeholder="Search privileges or modules..."
                      value={privilegeSearch}
                      onChange={(e) => setPrivilegeSearch(e.target.value)}
                      className="w-full pl-9 pr-8 py-1.5 bg-white border border-[#E8DFD8] rounded-lg text-xs text-[#180200] placeholder-[#863221]/40 focus:outline-none focus:border-[#510601]"
                    />
                    {privilegeSearch && (
                      <button
                        onClick={() => setPrivilegeSearch('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-xs font-semibold text-[#863221]">
                      <span className="text-[#510601] font-bold">
                        {isSysTarget ? allPrivilegeIds.length : selectedPrivileges.length}
                      </span> of {allPrivilegeIds.length} Assigned
                    </div>

                    {!isSysTarget && (
                      <button
                        type="button"
                        onClick={handleMasterToggleAll}
                        className="px-3 py-1.5 bg-white border border-[#E8DFD8] hover:border-[#510601] text-xs font-semibold text-[#510601] rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                      >
                        {selectedPrivileges.length === allPrivilegeIds.length ? 'Deselect All' : 'Select All Privileges'}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Scrollable Privilege Categories Grid */}
              <div className="p-6 overflow-y-auto space-y-6">
                {filteredPrivilegeGroups.length > 0 ? (
                  filteredPrivilegeGroups.map((group) => {
                    const groupPrivIds = group.privileges.map(p => p.id);
                    const selectedInGroup = isSysTarget
                      ? groupPrivIds
                      : groupPrivIds.filter(id => selectedPrivileges.includes(id));
                    const isAllInGroupSelected = selectedInGroup.length === groupPrivIds.length && groupPrivIds.length > 0;

                    return (
                      <div
                        key={group.id}
                        className="bg-white rounded-xl border border-[#E8DFD8] shadow-2xs overflow-hidden transition-all hover:border-[#863221]/40"
                      >
                        {/* Module Header Bar */}
                        <div className="px-4 py-3 bg-[#FAF7F2] border-b border-[#E8DFD8] flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <Layers className="w-4 h-4 text-[#863221]" />
                            <div>
                              <span className="text-xs font-bold text-[#180200] uppercase tracking-wide">
                                {group.module}
                              </span>
                              <span className="text-[11px] text-[#863221]/70 ml-2 hidden sm:inline">
                                {group.description}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                              isAllInGroupSelected
                                ? 'bg-[#3D705C]/15 text-[#3D705C]'
                                : selectedInGroup.length > 0
                                  ? 'bg-[#FFC107]/20 text-[#863221]'
                                  : 'bg-gray-100 text-gray-500'
                            }`}>
                              {selectedInGroup.length} / {groupPrivIds.length}
                            </span>

                            {!isSysTarget && (
                              <button
                                type="button"
                                onClick={() => handleToggleModulePrivileges(groupPrivIds)}
                                className="text-xs font-semibold text-[#510601] hover:underline cursor-pointer flex items-center gap-1"
                              >
                                {isAllInGroupSelected ? 'Deselect Module' : 'Select All'}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Privileges Checkboxes Grid */}
                        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {group.privileges.map((priv) => {
                            const isChecked = isSysTarget || selectedPrivileges.includes(priv.id);

                            return (
                              <div
                                key={priv.id}
                                onClick={() => !isSysTarget && handleTogglePrivilege(priv.id)}
                                className={`p-3 rounded-xl border transition-all select-none flex items-start gap-2.5 ${
                                  isSysTarget
                                    ? 'bg-[#FAF7F2]/60 border-[#E8DFD8] cursor-not-allowed opacity-90'
                                    : isChecked
                                      ? 'bg-[#510601]/5 border-[#510601]/40 shadow-2xs cursor-pointer'
                                      : 'bg-white border-[#E8DFD8] hover:border-[#863221]/30 hover:bg-[#FAF7F2]/40 cursor-pointer'
                                }`}
                              >
                                <div className="pt-0.5 shrink-0">
                                  {isChecked ? (
                                    <CheckSquare className={`w-4 h-4 ${isSysTarget ? 'text-[#863221]' : 'text-[#510601]'}`} />
                                  ) : (
                                    <Square className="w-4 h-4 text-[#863221]/40" />
                                  )}
                                </div>
                                <div>
                                  <p className={`text-xs font-semibold leading-snug ${
                                    isChecked
                                      ? (isSysTarget ? 'text-[#863221]' : 'text-[#510601]')
                                      : 'text-[#180200]'
                                  }`}>
                                    {priv.name}
                                  </p>
                                  <p className="text-[11px] text-[#863221]/70 mt-0.5 leading-relaxed">
                                    {priv.description}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-12 text-center text-[#863221]">
                    <p className="text-sm font-semibold">No privileges match "{privilegeSearch}"</p>
                    <button
                      onClick={() => setPrivilegeSearch('')}
                      className="text-xs text-[#510601] hover:underline mt-1 font-medium"
                    >
                      Clear Search
                    </button>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-[#E8DFD8] bg-[#FAF7F2] shrink-0">
                <button
                  type="button"
                  onClick={() => setPrivilegeTargetRole(null)}
                  className="px-4 py-2 border border-[#E8DFD8] text-[#863221] hover:text-[#180200] hover:bg-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  {isSysTarget ? 'Close' : 'Cancel'}
                </button>

                {!isSysTarget && (
                  <button
                    type="button"
                    onClick={handleSavePrivileges}
                    className="px-5 py-2 bg-[#510601] hover:bg-[#8C1801] active:bg-[#180200] text-white text-xs font-semibold rounded-xl shadow-sm hover:shadow transition-all cursor-pointer"
                  >
                    Save Privileges
                  </button>
                )}
              </div>

            </div>
          );
        })()}
      </Modal>

      {/* ============================================================ */}
      {/* VIEW DETAILS MODAL                                           */}
      {/* ============================================================ */}
      <Modal
        isOpen={Boolean(viewingRole)}
        onClose={() => setViewingRole(null)}
      >
        {viewingRole && (
          <div
            className="bg-white rounded-2xl max-w-lg w-full border border-[#E8DFD8] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8DFD8] bg-[#FAF7F2]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#510601]/10 text-[#510601]">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#180200]">Role Details</h3>
                  <p className="text-xs text-[#863221]">ID: {viewingRole.id}</p>
                </div>
              </div>
              <button
                onClick={() => setViewingRole(null)}
                className="text-[#863221]/60 hover:text-[#180200] p-1.5 rounded-lg hover:bg-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-4 text-sm">
              <div className="bg-[#FAF7F2]/60 rounded-xl p-4 border border-[#E8DFD8] flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-[#863221]">Role Name</p>
                  <p className="text-xl font-bold text-[#180200] mt-0.5">{viewingRole.name}</p>
                </div>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${viewingRole.status === 'Active'
                  ? 'bg-[#3D705C]/10 text-[#3D705C] border border-[#3D705C]/20'
                  : 'bg-gray-100 text-gray-600 border border-gray-200'
                  }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${viewingRole.status === 'Active' ? 'bg-[#3D705C]' : 'bg-gray-400'}`} />
                  {viewingRole.status}
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-xs text-[#863221] font-semibold uppercase">Description</p>
                  <p className="text-xs text-[#180200] mt-0.5 leading-relaxed bg-gray-50/50 p-2.5 rounded-lg border border-[#E8DFD8]">
                    {viewingRole.description || 'No description provided.'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E8DFD8]">
                    <p className="text-[#863221] font-semibold uppercase">Assigned Users</p>
                    <p className="text-base font-bold text-[#180200] mt-0.5">{viewingRole.usersCount} Users</p>
                  </div>

                  <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E8DFD8]">
                    <p className="text-[#863221] font-semibold uppercase">Assigned Privileges</p>
                    <p className="text-base font-bold text-[#510601] mt-0.5">
                      {viewingRole.privileges ? viewingRole.privileges.length : 0} of {allPrivilegeIds.length}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs text-[#863221]">
                  <div>
                    <span className="font-semibold">Created Date:</span> {formatDate(viewingRole.createdAt)}
                  </div>
                  <div>
                    <span className="font-semibold">Last Updated:</span> {formatDate(viewingRole.updatedAt)}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#E8DFD8]">
                <button
                  type="button"
                  onClick={() => setViewingRole(null)}
                  className="px-4 py-2 border border-[#E8DFD8] text-[#863221] hover:bg-[#FAF7F2] text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const r = viewingRole;
                    setViewingRole(null);
                    openPrivilegeModal(r);
                  }}
                  className="px-4 py-2 bg-[#510601] hover:bg-[#8C1801] text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>Configure Privileges</span>
                </button>
              </div>

            </div>
          </div>
        )}
      </Modal>

      {/* ============================================================ */}
      {/* DELETE CONFIRMATION MODAL WITH PROTECTION                    */}
      {/* ============================================================ */}
      <Modal
        isOpen={Boolean(deleteTargetRole)}
        onClose={() => setDeleteTargetRole(null)}
      >
        {deleteTargetRole && (
          <div
            className="bg-white rounded-2xl max-w-sm w-full border border-[#E8DFD8] shadow-2xl p-6 text-center animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {deleteTargetRole.usersCount > 0 || deleteTargetRole.isSystem || deleteTargetRole.is_all_access || deleteTargetRole.rank_level === 1 ? (
              <>
                <div className="w-14 h-14 rounded-full bg-amber-100 text-[#EE6A00] flex items-center justify-center mx-auto mb-3.5">
                  <Lock className="w-7 h-7" />
                </div>

                <h3 className="text-lg font-bold text-[#180200]">
                  Cannot Delete Role
                </h3>
                <p className="text-xs text-[#863221] mt-2 leading-relaxed">
                  {(deleteTargetRole.isSystem || deleteTargetRole.is_all_access || deleteTargetRole.rank_level === 1) ? (
                    <>
                      <strong>{deleteTargetRole.name}</strong> is a core system role with all-access permissions and cannot be deleted.
                    </>
                  ) : (
                    <>
                      This role is currently assigned to <strong className="text-[#180200]">{deleteTargetRole.usersCount} users</strong> and cannot be deleted. Please reassign those users before deleting the role.
                    </>
                  )}
                </p>

                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => setDeleteTargetRole(null)}
                    className="w-full py-2.5 px-4 bg-[#510601] hover:bg-[#8C1801] text-white text-xs font-semibold rounded-xl shadow-sm transition-colors cursor-pointer"
                  >
                    Understood
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="w-14 h-14 rounded-full bg-red-100 text-[#ED4636] flex items-center justify-center mx-auto mb-3.5">
                  <Trash2 className="w-7 h-7" />
                </div>

                <h3 className="text-lg font-bold text-[#180200]">
                  Delete Role?
                </h3>
                <p className="text-xs text-[#863221] mt-1.5 leading-relaxed">
                  Are you sure you want to delete role <strong className="text-[#180200]">{deleteTargetRole.name}</strong>? This action cannot be undone.
                </p>

                <div className="mt-6 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setDeleteTargetRole(null)}
                    className="w-full py-2.5 px-4 border border-[#E8DFD8] text-[#863221] hover:text-[#180200] hover:bg-[#FAF7F2] text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={confirmDeleteRole}
                    className="w-full py-2.5 px-4 bg-[#ED4636] hover:bg-[#C93324] text-white text-xs font-semibold rounded-xl shadow-sm transition-colors cursor-pointer"
                  >
                    Delete Role
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>

      {/* ============================================================ */}
      {/* ACTIVATE / DEACTIVATE CONFIRMATION MODAL                     */}
      {/* ============================================================ */}
      <Modal
        isOpen={Boolean(statusDialog)}
        onClose={() => setStatusDialog(null)}
      >
        {statusDialog && (() => {
          const isTargetDeactivate = statusDialog.newStatus === false || statusDialog.newStatus === 'Inactive';
          return (
            <div
              className="bg-white rounded-2xl max-w-sm w-full border border-[#E8DFD8] shadow-2xl p-6 text-center animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3.5 ${
                isTargetDeactivate ? 'bg-red-100 text-[#ED4636]' : 'bg-[#3D705C]/10 text-[#3D705C]'
              }`}>
                {isTargetDeactivate ? (
                  <AlertTriangle className="w-7 h-7" />
                ) : (
                  <CheckCircle2 className="w-7 h-7" />
                )}
              </div>

              <h3 className="text-lg font-bold text-[#180200]">
                {isTargetDeactivate ? 'Deactivate Role?' : 'Activate Role?'}
              </h3>
              <p className="text-xs text-[#863221] mt-1.5 leading-relaxed">
                {isTargetDeactivate ? (
                  <>
                    Are you sure you want to deactivate <strong className="text-[#180200]">{statusDialog.role.name}</strong>? Inactive roles cannot be assigned to new user accounts.
                  </>
                ) : (
                  <>
                    Are you sure you want to activate <strong className="text-[#180200]">{statusDialog.role.name}</strong>? It will become available for assignment to user accounts.
                  </>
                )}
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
                  className={`w-full py-2.5 px-4 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors cursor-pointer ${
                    isTargetDeactivate
                      ? 'bg-[#ED4636] hover:bg-[#C93324]'
                      : 'bg-[#3D705C] hover:bg-[#2F5647]'
                  }`}
                >
                  {isTargetDeactivate ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          );
        })()}
      </Modal>

    </div>
  );
}
