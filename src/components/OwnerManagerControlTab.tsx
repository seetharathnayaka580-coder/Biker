import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Crown,
  Shield,
  User,
  UserPlus,
  Users,
  Eye,
  EyeOff,
  Copy,
  Check,
  Search,
  Filter,
  KeyRound,
  Globe,
  Monitor,
  Smartphone,
  Laptop,
  Clock,
  MapPin,
  Bike,
  Trash2,
  Edit3,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Ban,
  Activity,
  Download,
  Info,
  Radio,
  Wifi,
  ShieldAlert,
  Calendar,
  Layers,
  ArrowUpDown,
  Navigation,
  LocateFixed,
  Crosshair,
} from 'lucide-react';
import { AuthSession, LoginLog, UserAccount, UserRole, VehicleDetails } from '../types';
import {
  createUserByOwnerOrManager,
  deleteUserAccountFromCloud,
  changeUserPasswordByOwner,
  updateUserBikeDetailsByOwner,
  toggleUserStatus,
  subscribeToUsers,
  subscribeToLoginLogs,
  clearAllLoginLogsFromCloud,
  syncLiveUserSessionToCloud,
} from '../lib/firebase';
import { fetchClientNetworkInfo, getExactGpsLocation, ClientNetworkInfo } from '../utils/ipTracker';
import { ALL_DISTRICTS, ALL_PROVINCES, SRI_LANKA_REGIONS } from '../data/sriLankaRegions';

interface OwnerManagerControlTabProps {
  authSession: AuthSession;
  vehicle: VehicleDetails;
}

export const OwnerManagerControlTab: React.FC<OwnerManagerControlTabProps> = ({
  authSession,
  vehicle,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'users' | 'create' | 'logs'>('users');

  // Real-time Firestore Users & Logs
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [loginLogs, setLoginLogs] = useState<LoginLog[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);

  // Live Sync Engine Tracking
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());
  const [isManualSyncing, setIsManualSyncing] = useState(false);
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [gpsNotification, setGpsNotification] = useState<string | null>(null);
  const [syncPulse, setSyncPulse] = useState(false);
  const [currentOwnerNetInfo, setCurrentOwnerNetInfo] = useState<ClientNetworkInfo | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'manager' | 'client'>('all');
  const [statusLogFilter, setStatusLogFilter] = useState<'all' | 'success' | 'failed'>('all');
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Detailed IP & Session Inspector Modal
  const [inspectingUser, setInspectingUser] = useState<UserAccount | null>(null);
  const [inspectingLog, setInspectingLog] = useState<LoginLog | null>(null);

  // Create User Form State
  const [newRole, setNewRole] = useState<UserRole>('client');
  const [newOwnerName, setNewOwnerName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newBikeNumber, setNewBikeNumber] = useState('');
  const [newProvince, setNewProvince] = useState('Western Province');
  const [newDistrict, setNewDistrict] = useState('Colombo');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(true);

  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Password Change Modal State
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [editNewPassword, setEditNewPassword] = useState('');
  const [editStatusMsg, setEditStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Bike Number & Assigned Details Edit Modal State
  const [editingBikeUser, setEditingBikeUser] = useState<UserAccount | null>(null);
  const [editBikePlate, setEditBikePlate] = useState('');
  const [editOwnerFullName, setEditOwnerFullName] = useState('');
  const [editBikeProvince, setEditBikeProvince] = useState('Western Province');
  const [editBikeDistrict, setEditBikeDistrict] = useState('Colombo');
  const [editBikeModel, setEditBikeModel] = useState('');
  const [editBikeStatusMsg, setEditBikeStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSavingBikeDetails, setIsSavingBikeDetails] = useState(false);

  // Delete User Confirmation Modal
  const [userToDelete, setUserToDelete] = useState<UserAccount | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch current owner's live network & IP on mount and sync to cloud
  useEffect(() => {
    fetchClientNetworkInfo().then((info) => {
      setCurrentOwnerNetInfo(info);
      if (authSession) {
        syncLiveUserSessionToCloud(authSession, info);
      }
    });
  }, [authSession]);

  // Subscribe to Users & Login Logs Real-Time
  useEffect(() => {
    setIsLoadingUsers(true);
    const unsubUsers = subscribeToUsers(
      (data) => {
        setUsers(data);
        setIsLoadingUsers(false);
        setLastSyncTime(new Date());
        triggerSyncPulse();
      },
      () => setIsLoadingUsers(false)
    );

    setIsLoadingLogs(true);
    const unsubLogs = subscribeToLoginLogs(
      (logs) => {
        setLoginLogs(logs);
        setIsLoadingLogs(false);
        setLastSyncTime(new Date());
        triggerSyncPulse();
      },
      () => setIsLoadingLogs(false)
    );

    return () => {
      unsubUsers();
      unsubLogs();
    };
  }, []);

  const triggerSyncPulse = () => {
    setSyncPulse(true);
    setTimeout(() => setSyncPulse(false), 1200);
  };

  // Manual Force Re-Sync Trigger
  const handleForceSync = async () => {
    setIsManualSyncing(true);
    try {
      const netInfo = await fetchClientNetworkInfo(true);
      setCurrentOwnerNetInfo(netInfo);
      if (authSession) {
        await syncLiveUserSessionToCloud(authSession, netInfo);
      }
      setLastSyncTime(new Date());
      triggerSyncPulse();
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch {
      // ignore
    } finally {
      setIsManualSyncing(false);
    }
  };

  // High Precision Real Device GPS Detection
  const handleDetectExactGpsLocation = async () => {
    setIsDetectingGps(true);
    setGpsNotification(null);

    try {
      const gpsResult = await getExactGpsLocation();
      if (gpsResult) {
        const updatedNet: ClientNetworkInfo = {
          ...(currentOwnerNetInfo || {
            ip: 'Connected (Online)',
            device: 'Mobile Device',
            userAgent: navigator.userAgent,
          }),
          city: gpsResult.city || currentOwnerNetInfo?.city,
          region: gpsResult.district || currentOwnerNetInfo?.region,
          latitude: gpsResult.latitude,
          longitude: gpsResult.longitude,
          isGpsPrecise: true,
        };
        setCurrentOwnerNetInfo(updatedNet);
        if (authSession) {
          await syncLiveUserSessionToCloud(authSession, updatedNet);
        }
        setGpsNotification(`📍 Exact GPS verified: ${gpsResult.formattedLocation}`);
        triggerSyncPulse();
      } else {
        setGpsNotification('GPS permission was denied or unavailable. IP-based location is active.');
      }
    } catch (err) {
      setGpsNotification('Unable to acquire device GPS. Using network location.');
    } finally {
      setIsDetectingGps(false);
      setTimeout(() => setGpsNotification(null), 5000);
    }
  };

  // Filter dynamic districts for create form
  const currentDistricts = useMemo(() => {
    const region = SRI_LANKA_REGIONS.find((r) => r.province === newProvince);
    return region ? region.districts : ALL_DISTRICTS;
  }, [newProvince]);

  const handleProvinceChange = (prov: string) => {
    setNewProvince(prov);
    const region = SRI_LANKA_REGIONS.find((r) => r.province === prov);
    if (region && region.districts.length > 0) {
      setNewDistrict(region.districts[0]);
    }
  };

  // Generate strong random password
  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789abcdefghijkmnopqrstuvwxyz';
    let pass = '';
    for (let i = 0; i < 8; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(pass);
  };

  // Copy helper
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Toggle Password visibility
  const togglePasswordVisibility = (username: string) => {
    setRevealedPasswords((prev) => ({
      ...prev,
      [username]: !prev[username],
    }));
  };

  // Handle Create User Submit
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    const normUser = newUsername.trim().toLowerCase().replace(/\s+/g, '');
    if (!normUser) {
      setFormError('Please provide a valid username.');
      return;
    }
    if (!newPassword.trim() || newPassword.trim().length < 3) {
      setFormError('Password must be at least 3 characters long.');
      return;
    }
    if (!newOwnerName.trim()) {
      setFormError('Please enter the full name.');
      return;
    }
    if (!newBikeNumber.trim()) {
      setFormError('Please provide a bike registration plate number.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createUserByOwnerOrManager({
        username: normUser,
        password: newPassword.trim(),
        ownerName: newOwnerName.trim(),
        bikeNumber: newBikeNumber.trim().toUpperCase(),
        district: newDistrict,
        province: newProvince,
        role: newRole,
        email: newEmail.trim() || undefined,
        phone: newPhone.trim() || undefined,
        createdBy: authSession.username || 'sachi',
      });

      setFormSuccess(
        `Account @${normUser} (${newRole.toUpperCase()}) created successfully! Password: ${newPassword.trim()}`
      );
      // Reset form
      setNewUsername('');
      setNewPassword('');
      setNewOwnerName('');
      setNewBikeNumber('');
      setNewPhone('');
      setNewEmail('');
    } catch (err: any) {
      setFormError(err.message || 'Failed to create account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Change Password Submit
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    if (!editNewPassword.trim() || editNewPassword.trim().length < 3) {
      setEditStatusMsg({ type: 'error', text: 'Password must be at least 3 characters.' });
      return;
    }

    try {
      await changeUserPasswordByOwner(editingUser.username, editNewPassword.trim());
      setEditStatusMsg({ type: 'success', text: `Password updated to: ${editNewPassword.trim()}` });
      setTimeout(() => {
        setEditingUser(null);
        setEditNewPassword('');
        setEditStatusMsg(null);
      }, 1500);
    } catch (err: any) {
      setEditStatusMsg({ type: 'error', text: err.message || 'Failed to update password.' });
    }
  };

  // Dynamic districts for Edit Bike Modal
  const editDistricts = useMemo(() => {
    const region = SRI_LANKA_REGIONS.find((r) => r.province === editBikeProvince);
    return region ? region.districts : ALL_DISTRICTS;
  }, [editBikeProvince]);

  const handleEditProvinceChange = (prov: string) => {
    setEditBikeProvince(prov);
    const region = SRI_LANKA_REGIONS.find((r) => r.province === prov);
    if (region && region.districts.length > 0) {
      setEditBikeDistrict(region.districts[0]);
    }
  };

  // Open Bike Edit Modal Helper
  const handleOpenBikeEdit = (user: UserAccount) => {
    setEditingBikeUser(user);
    setEditBikePlate(user.bikeNumber || '');
    setEditOwnerFullName(user.ownerName || '');
    setEditBikeProvince(user.province || 'Western Province');
    setEditBikeDistrict(user.district || 'Colombo');
    setEditBikeModel('');
    setEditBikeStatusMsg(null);
  };

  // Handle Update Bike Plate & Vehicle Details Submit
  const handleUpdateBikeDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBikeUser) return;
    if (!editBikePlate.trim()) {
      setEditBikeStatusMsg({ type: 'error', text: 'Please enter a valid bike registration number.' });
      return;
    }

    setIsSavingBikeDetails(true);
    setEditBikeStatusMsg(null);
    try {
      const cleanPlate = editBikePlate.trim().toUpperCase();
      await updateUserBikeDetailsByOwner(editingBikeUser.username, {
        bikeNumber: cleanPlate,
        ownerName: editOwnerFullName.trim() || editingBikeUser.ownerName,
        district: editBikeDistrict,
        province: editBikeProvince,
        model: editBikeModel.trim() || undefined,
      });

      setEditBikeStatusMsg({
        type: 'success',
        text: `Bike plate updated & synced to ${cleanPlate}!`,
      });
      triggerSyncPulse();
      setTimeout(() => {
        setEditingBikeUser(null);
        setEditBikeStatusMsg(null);
      }, 1500);
    } catch (err: any) {
      setEditBikeStatusMsg({ type: 'error', text: err.message || 'Failed to update bike details.' });
    } finally {
      setIsSavingBikeDetails(false);
    }
  };

  // Handle Delete User
  const handleConfirmDeleteUser = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    try {
      await deleteUserAccountFromCloud(userToDelete.username);
      setUserToDelete(null);
    } catch (err: any) {
      alert(err.message || 'Failed to delete account.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle Toggle User Status (Active/Suspended)
  const handleToggleStatus = async (user: UserAccount) => {
    try {
      await toggleUserStatus(user.username, user.status || 'active');
    } catch (err: any) {
      alert(err.message || 'Failed to toggle account status.');
    }
  };

  // Export Users & Audit Logs to CSV
  const handleExportCSV = () => {
    if (activeSubTab === 'logs') {
      const headers = ['ID', 'Username', 'Role', 'IP Address', 'Location', 'Device', 'Status', 'Timestamp', 'Bike Plate'];
      const rows = loginLogs.map((l) => [
        `"${l.id}"`,
        `"${l.username}"`,
        `"${l.role}"`,
        `"${l.ip}"`,
        `"${l.location || ''}"`,
        `"${(l.device || '').replace(/"/g, '""')}"`,
        `"${l.status}"`,
        `"${l.timestamp}"`,
        `"${l.bikeNumber || ''}"`,
      ]);
      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `bajaj_login_ip_logs_${new Date().toISOString().slice(0, 10)}.csv`);
      link.click();
    } else {
      const headers = ['Username', 'Full Name', 'Role', 'Password', 'Bike Number', 'District', 'Province', 'Last Login IP', 'Last Login Time', 'Status'];
      const rows = users.map((u) => [
        `"${u.username}"`,
        `"${u.ownerName}"`,
        `"${u.role}"`,
        `"${u.password || ''}"`,
        `"${u.bikeNumber || ''}"`,
        `"${u.district || ''}"`,
        `"${u.province || ''}"`,
        `"${u.lastLoginIp || ''}"`,
        `"${u.lastLoginAt || ''}"`,
        `"${u.status || 'active'}"`,
      ]);
      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `bajaj_user_accounts_${new Date().toISOString().slice(0, 10)}.csv`);
      link.click();
    }
  };

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.bikeNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.lastLoginIp && u.lastLoginIp.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (u.district && u.district.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchRole = roleFilter === 'all' || u.role === roleFilter;

      return matchSearch && matchRole;
    });
  }, [users, searchQuery, roleFilter]);

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    return loginLogs.filter((l) => {
      const matchSearch =
        !searchQuery ||
        l.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.ip.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (l.location && l.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (l.device && l.device.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (l.role && l.role.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (l.ownerName && l.ownerName.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchStatus = statusLogFilter === 'all' || l.status === statusLogFilter;

      return matchSearch && matchStatus;
    });
  }, [loginLogs, searchQuery, statusLogFilter]);

  // Statistics
  const stats = useMemo(() => {
    const clientsCount = users.filter((u) => u.role === 'client').length;
    const managersCount = users.filter((u) => u.role === 'manager').length;
    const adminsCount = users.filter((u) => u.role === 'admin').length;
    const totalLogs = loginLogs.length;
    const uniqueIps = new Set(loginLogs.map((l) => l.ip)).size;
    const recentLoginCount = loginLogs.filter((l) => {
      const diff = Date.now() - new Date(l.timestamp).getTime();
      return diff < 24 * 60 * 60 * 1000; // past 24 hrs
    }).length;

    return { clientsCount, managersCount, adminsCount, totalLogs, uniqueIps, recentLoginCount };
  }, [users, loginLogs]);

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* ============================================================== */}
      {/* 1. OWNER SACHI MASTER BRANDING & LIVE SYNC HEADER              */}
      {/* ============================================================== */}
      <div className="relative rounded-3xl p-5 sm:p-7 bg-gradient-to-r from-[#16120b] via-[#1f1911] to-[#120f09] border border-amber-500/40 shadow-2xl overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-yellow-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          {/* Brand Info */}
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 p-[2px] shadow-[0_0_25px_rgba(245,158,11,0.5)] shrink-0">
              <div className="w-full h-full bg-[#120e09] rounded-[14px] flex items-center justify-center">
                <Crown className="w-7 h-7 text-amber-300 fill-amber-300/30" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-display font-black tracking-wide text-white">
                  Owner Sachintha <span className="text-amber-400">Master Control</span>
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase bg-amber-400 text-zinc-950 shadow-md">
                  EXCLUSIVE OWNER PORTAL
                </span>
              </div>
              <p className="text-xs text-amber-200/80 mt-1 flex items-center gap-2">
                <span>Manage client & manager accounts · View real passwords · Live Firestore IP Auditing</span>
              </p>
            </div>
          </div>

          {/* Real-time Status & Force Sync Button Strip */}
          <div className="flex items-center gap-2.5 flex-wrap w-full lg:w-auto">
            {/* Live Firestore Sync Pill */}
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono transition-all ${
                syncPulse
                  ? 'bg-emerald-500/30 border-emerald-400 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                  : 'bg-[#181f18] border-emerald-500/40 text-emerald-300'
              }`}
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="font-bold">LIVE CLOUD SYNCED</span>
              <span className="text-[10px] text-emerald-400/80">
                ({lastSyncTime.toLocaleTimeString()})
              </span>
            </div>

            {/* Force Sync Action */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={handleForceSync}
              disabled={isManualSyncing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold font-mono transition-all cursor-pointer shadow-sm active:scale-95 disabled:opacity-50"
              title="Force re-sync and fetch latest network info"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isManualSyncing ? 'animate-spin text-amber-300' : ''}`} />
              <span>{isManualSyncing ? 'Syncing...' : 'Sync Now'}</span>
            </motion.button>

            {/* Detect Exact GPS Location Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={handleDetectExactGpsLocation}
              disabled={isDetectingGps}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 text-xs font-semibold font-mono transition-all cursor-pointer shadow-sm active:scale-95 disabled:opacity-50"
              title="Acquire exact device GPS coordinates (100% precision in Sri Lanka)"
            >
              <LocateFixed className={`w-3.5 h-3.5 ${isDetectingGps ? 'animate-spin text-sky-400' : 'text-sky-300'}`} />
              <span>{isDetectingGps ? 'Locating...' : '📍 Verify Exact GPS'}</span>
            </motion.button>

            {/* Export CSV */}
            <button
              type="button"
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-semibold font-mono transition-all cursor-pointer shadow-sm"
              title="Export records to CSV file"
            >
              <Download className="w-3.5 h-3.5 text-zinc-400" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* GPS Notification Toast if triggered */}
        {gpsNotification && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 p-3 rounded-2xl bg-sky-950/80 border border-sky-400/40 text-xs font-mono text-sky-200 flex items-center justify-between shadow-lg"
          >
            <div className="flex items-center gap-2">
              <Crosshair className="w-4 h-4 text-sky-400 shrink-0" />
              <span>{gpsNotification}</span>
            </div>
            <button
              type="button"
              onClick={() => setGpsNotification(null)}
              className="text-sky-400 hover:text-white px-2 py-0.5 rounded text-xs"
            >
              ✕
            </button>
          </motion.div>
        )}

        {/* Quick KPI Strip & Owner Connected IP Monitor */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2.5 mt-5 pt-4 border-t border-amber-500/20">
          <div className="bg-[#1a140d]/90 border border-amber-500/25 rounded-2xl p-2.5 shadow-inner">
            <div className="text-[10px] font-mono text-amber-300/70 uppercase">Clients (Owners)</div>
            <div className="text-xl font-black font-mono text-white mt-0.5">{stats.clientsCount}</div>
          </div>
          <div className="bg-[#1a140d]/90 border border-amber-500/25 rounded-2xl p-2.5 shadow-inner">
            <div className="text-[10px] font-mono text-amber-300/70 uppercase">Workshop Managers</div>
            <div className="text-xl font-black font-mono text-sky-400 mt-0.5">{stats.managersCount}</div>
          </div>
          <div className="bg-[#1a140d]/90 border border-amber-500/25 rounded-2xl p-2.5 shadow-inner">
            <div className="text-[10px] font-mono text-amber-300/70 uppercase">Total Login Logs</div>
            <div className="text-xl font-black font-mono text-emerald-400 mt-0.5">{stats.totalLogs}</div>
          </div>
          <div className="bg-[#1a140d]/90 border border-amber-500/25 rounded-2xl p-2.5 shadow-inner">
            <div className="text-[10px] font-mono text-amber-300/70 uppercase">Unique Tracked IPs</div>
            <div className="text-xl font-black font-mono text-amber-300 mt-0.5">{stats.uniqueIps}</div>
          </div>
          <div className="col-span-2 sm:col-span-4 lg:col-span-1 bg-[#121824]/90 border border-sky-500/30 rounded-2xl p-2.5 shadow-inner flex flex-col justify-center">
            <div className="text-[9px] font-mono text-sky-300/80 uppercase flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Globe className="w-3 h-3 text-sky-400" />
                <span>Owner Active IP</span>
              </span>
              {currentOwnerNetInfo?.isGpsPrecise && (
                <span className="text-[8px] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  GPS EXACT
                </span>
              )}
            </div>
            <div className="text-xs font-black font-mono text-white truncate mt-0.5 flex items-center justify-between">
              <span className="truncate mr-1">{currentOwnerNetInfo?.ip || 'Detecting...'}</span>
              {currentOwnerNetInfo?.ip && (
                <button
                  type="button"
                  onClick={() => handleCopy(currentOwnerNetInfo.ip, 'owner_curr_ip')}
                  className="text-sky-400 hover:text-white p-0.5 shrink-0"
                >
                  {copiedKey === 'owner_curr_ip' ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              )}
            </div>
            {currentOwnerNetInfo?.city && (
              <div className="text-[9px] text-zinc-400 font-sans truncate mt-0.5 flex items-center gap-1">
                <MapPin className="w-2.5 h-2.5 text-rose-400 shrink-0" />
                <span>{currentOwnerNetInfo.city}, {currentOwnerNetInfo.region || 'Sri Lanka'}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. SUB-NAVIGATION TABS (ACCOUNTS / CREATE / IP LOGS)             */}
      {/* ============================================================== */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-[#212738] pb-3">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-[#111520] rounded-2xl border border-[#232c3f]">
          <button
            type="button"
            onClick={() => setActiveSubTab('users')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'users'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-zinc-950 shadow-md shadow-amber-500/20 font-black'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Accounts & Passwords</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-black/30 font-black">
              {users.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveSubTab('create');
              setFormError(null);
              setFormSuccess(null);
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'create'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-zinc-950 shadow-md shadow-amber-500/20 font-black'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Create Manager / Client</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('logs')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'logs'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-zinc-950 shadow-md shadow-amber-500/20 font-black'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Login IPs & Activity</span>
            {loginLogs.length > 0 && (
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                {loginLogs.length}
              </span>
            )}
          </button>
        </div>

        {/* Search Bar */}
        {activeSubTab !== 'create' && (
          <div className="relative min-w-[260px]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={activeSubTab === 'users' ? 'Search username, IP, plate...' : 'Search IP address, user, device...'}
              className="w-full bg-[#131722] border border-[#263147] focus:border-amber-400 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-zinc-500 outline-none pr-8 font-mono"
            />
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* TAB 1: ACCOUNTS, PASSWORDS & CREDENTIALS DIRECTORY              */}
      {/* ============================================================== */}
      {activeSubTab === 'users' && (
        <div className="space-y-4">
          {/* Role Filter Tabs */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 p-1 bg-[#10131d] rounded-xl border border-[#21293a]">
              {(['all', 'admin', 'manager', 'client'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRoleFilter(r)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                    roleFilter === r
                      ? 'bg-zinc-700 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {r === 'all' ? 'All Roles' : `${r}s`}
                </button>
              ))}
            </div>

            <span className="text-xs text-zinc-400 font-mono">
              Showing <strong>{filteredUsers.length}</strong> of {users.length} registered accounts
            </span>
          </div>

          {/* Accounts Grid / List */}
          {isLoadingUsers ? (
            <div className="p-12 text-center text-zinc-400 flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-6 h-6 animate-spin text-amber-400" />
              <p className="text-xs font-mono">Loading real-time user database...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-[#10141e] border border-zinc-800 text-zinc-400 space-y-3">
              <Users className="w-10 h-10 mx-auto text-zinc-600" />
              <p className="text-sm font-semibold text-zinc-300">No accounts match your search or filter.</p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setRoleFilter('all');
                }}
                className="px-3.5 py-1.5 rounded-xl bg-zinc-800 text-xs text-white border border-zinc-700 hover:bg-zinc-700"
              >
                Clear Search Filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredUsers.map((user) => {
                const isMasterSachi = user.username.toLowerCase() === 'sachi';
                const isRevealed = revealedPasswords[user.username];
                const rawPassword = user.password || '••••••';
                const isSuspended = user.status === 'suspended';

                return (
                  <motion.div
                    key={user.username}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-3xl p-5 transition-all border relative overflow-hidden ${
                      isMasterSachi
                        ? 'bg-[#15120a]/95 border-amber-500/50 shadow-xl shadow-amber-950/20'
                        : isSuspended
                        ? 'bg-[#180f12]/90 border-red-500/30 opacity-75'
                        : user.role === 'manager'
                        ? 'bg-[#101624]/95 border-sky-500/30 shadow-lg'
                        : 'bg-[#111520]/95 border-[#232c3f] shadow-lg'
                    }`}
                  >
                    {/* Top Row: User Icon, Name, Role Badge, Status */}
                    <div className="flex items-start justify-between gap-3 mb-3.5">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 border ${
                            isMasterSachi
                              ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-sm'
                              : user.role === 'manager'
                              ? 'bg-sky-500/20 border-sky-400 text-sky-300'
                              : 'bg-zinc-800 border-zinc-700 text-zinc-300'
                          }`}
                        >
                          {isMasterSachi ? (
                            <Crown className="w-6 h-6 text-amber-400 fill-amber-400/30" />
                          ) : user.role === 'manager' ? (
                            <Shield className="w-6 h-6 text-sky-400" />
                          ) : (
                            <User className="w-6 h-6 text-zinc-400" />
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-base text-white">{user.ownerName}</h3>
                            {isMasterSachi && (
                              <span className="px-2 py-0.5 rounded text-[9px] font-black bg-amber-400 text-zinc-950 uppercase tracking-wider">
                                OWNER
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-mono text-zinc-400">@{user.username}</p>
                        </div>
                      </div>

                      {/* Role Pill */}
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border ${
                            user.role === 'admin'
                              ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                              : user.role === 'manager'
                              ? 'bg-sky-500/15 border-sky-500/30 text-sky-300'
                              : 'bg-zinc-800 border-zinc-700 text-zinc-300'
                          }`}
                        >
                          {user.role}
                        </span>

                        {isSuspended && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase bg-red-500/20 text-red-400 border border-red-500/30">
                            SUSPENDED
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Middle Section: PASSWORD REVEAL & COPY BOX */}
                    <div className="p-3.5 rounded-2xl bg-[#0b0e14] border border-[#1e2535] space-y-2 mb-3.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                          <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                          Client Password:
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility(user.username)}
                            className="text-zinc-400 hover:text-white px-2 py-0.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-[10px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            {isRevealed ? (
                              <>
                                <EyeOff className="w-3 h-3" /> Hide
                              </>
                            ) : (
                              <>
                                <Eye className="w-3 h-3" /> Reveal
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleCopy(rawPassword, `pass_${user.username}`)}
                            className="text-zinc-400 hover:text-white px-2 py-0.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-[10px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                            title="Copy password to clipboard"
                          >
                            {copiedKey === `pass_${user.username}` ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" /> Copied
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" /> Copy
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Password String Display */}
                      <div className="font-mono text-sm tracking-wider font-bold py-1.5 px-3 rounded-xl bg-[#141926] border border-[#273249] text-amber-300 flex items-center justify-between">
                        <span>{isRevealed ? rawPassword : '••••••••••••'}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingUser(user);
                            setEditNewPassword('');
                            setEditStatusMsg(null);
                          }}
                          className="text-[10px] text-zinc-400 hover:text-amber-300 font-sans font-semibold underline underline-offset-2 ml-2 cursor-pointer"
                        >
                          Change
                        </button>
                      </div>
                    </div>

                    {/* Bike Plate & Real Location */}
                    {(() => {
                      const displayLocation =
                        user.lastLoginLocation ||
                        (isMasterSachi && currentOwnerNetInfo?.city
                          ? `${currentOwnerNetInfo.city}, ${currentOwnerNetInfo.region || 'Sri Lanka'}`
                          : user.district
                          ? `${user.district}, ${user.province || 'Sri Lanka'}`
                          : 'Sri Lanka');

                      const displayIp =
                        user.lastLoginIp || (isMasterSachi ? currentOwnerNetInfo?.ip : null);

                      return (
                        <>
                          <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                            <div className="p-2.5 rounded-2xl bg-[#0e121a] border border-[#1c2333] flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 truncate">
                                <Bike className="w-4 h-4 text-amber-400 shrink-0" />
                                <div className="truncate">
                                  <div className="text-[9px] text-zinc-500 uppercase font-mono flex items-center gap-1">
                                    <span>Assigned Bike</span>
                                  </div>
                                  <div className="font-mono font-bold text-white text-xs truncate">
                                    {user.bikeNumber || 'N/A'}
                                  </div>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleOpenBikeEdit(user)}
                                className="text-[10px] text-amber-400 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 px-2 py-0.5 rounded-lg border border-amber-500/30 font-semibold cursor-pointer shrink-0 transition-colors"
                                title="Edit & Sync Bike Registration Number"
                              >
                                Edit
                              </button>
                            </div>

                            <div className="p-2.5 rounded-2xl bg-[#0e121a] border border-[#1c2333] flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
                              <div className="truncate">
                                <div className="text-[9px] text-zinc-500 uppercase font-mono flex items-center gap-1">
                                  <span>Live Location</span>
                                  {user.lastLoginLocation && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                                  )}
                                </div>
                                <div className="font-semibold text-zinc-200 text-xs truncate" title={displayLocation}>
                                  {displayLocation}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* LIVE IP SHOWCASE CARD SECTION */}
                          <div className="p-3 rounded-2xl bg-[#0a0d13] border border-sky-500/25 space-y-1.5 mb-3">
                            <div className="flex items-center justify-between text-[11px] font-mono">
                              <span className="text-sky-300 font-bold flex items-center gap-1.5">
                                <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                                <span>Client Login IP:</span>
                              </span>
                              <button
                                type="button"
                                onClick={() => setInspectingUser(user)}
                                className="text-[10px] text-sky-400 hover:text-sky-200 font-sans font-semibold underline underline-offset-2 flex items-center gap-1 cursor-pointer"
                              >
                                <span>Full IP Details</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </button>
                            </div>

                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 font-mono text-xs truncate">
                                <span className="text-zinc-200 font-bold bg-[#121724] px-2.5 py-1 rounded-lg border border-sky-500/30 truncate">
                                  {displayIp || 'No sign-in recorded'}
                                </span>
                                {displayLocation && (
                                  <span className="text-[10px] text-zinc-400 truncate hidden sm:inline">
                                    📍 {displayLocation}
                                  </span>
                                )}
                              </div>

                              {displayIp && (
                                <button
                                  type="button"
                                  onClick={() => handleCopy(displayIp, `ip_${user.username}`)}
                                  className="text-zinc-400 hover:text-white p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 cursor-pointer shrink-0 transition-colors"
                                  title="Copy IP address"
                                >
                                  {copiedKey === `ip_${user.username}` ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              )}
                            </div>

                            {user.lastLoginAt ? (
                              <div className="text-[10px] text-zinc-500 font-mono flex items-center gap-1 pt-0.5">
                                <Clock className="w-3 h-3 text-zinc-600" />
                                <span>Last online: {new Date(user.lastLoginAt).toLocaleString()}</span>
                              </div>
                            ) : isMasterSachi ? (
                              <div className="text-[10px] text-emerald-400/90 font-mono flex items-center gap-1 pt-0.5">
                                <Activity className="w-3 h-3 text-emerald-400" />
                                <span>Live Active Session</span>
                              </div>
                            ) : null}
                          </div>
                        </>
                      );
                    })()}

                    {/* Actions Row */}
                    {!isMasterSachi && (
                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#1a2130]">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(user)}
                          className={`text-xs px-3 py-1.5 rounded-xl border font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                            isSuspended
                              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25'
                              : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700'
                          }`}
                        >
                          <Ban className="w-3.5 h-3.5" />
                          <span>{isSuspended ? 'Reactivate' : 'Suspend'}</span>
                        </button>

                        <div className="flex items-center gap-2 flex-wrap justify-end">
                          <button
                            type="button"
                            onClick={() => handleOpenBikeEdit(user)}
                            className="text-xs px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold transition-all cursor-pointer flex items-center gap-1.5"
                            title="Edit and sync real bike number"
                          >
                            <Bike className="w-3.5 h-3.5 text-amber-400" />
                            <span>Edit Bike</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setEditingUser(user);
                              setEditNewPassword('');
                              setEditStatusMsg(null);
                            }}
                            className="text-xs px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 font-semibold transition-all cursor-pointer flex items-center gap-1.5"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                            <span>Edit Password</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setUserToDelete(user)}
                            className="p-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-all cursor-pointer"
                            title="Delete Account"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: CREATE NEW MANAGER / CLIENT USER FORM                   */}
      {/* ============================================================== */}
      {activeSubTab === 'create' && (
        <div className="max-w-2xl mx-auto rounded-3xl p-6 sm:p-8 bg-[#11141d]/95 border border-[#232c3f] shadow-2xl backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#1f2638]">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 p-[2px] shadow-md shrink-0">
              <div className="w-full h-full bg-[#12151f] rounded-[14px] flex items-center justify-center">
                <UserPlus className="w-6 h-6 text-amber-300" />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-display font-black text-white">Create New Manager or Client Account</h2>
              <p className="text-xs text-zinc-400">
                Grant login credentials, assign vehicle registration plate & location
              </p>
            </div>
          </div>

          {/* Feedback messages */}
          <AnimatePresence>
            {formError && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mb-5 p-3.5 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2"
              >
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{formError}</span>
              </motion.div>
            )}
            {formSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mb-5 p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{formSuccess}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleCreateUser} className="space-y-4">
            {/* Role Selection Tabs */}
            <div>
              <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
                Account Role & Permissions *
              </label>
              <div className="grid grid-cols-3 gap-2.5 p-1 bg-[#161a26] border border-[#283247] rounded-2xl">
                <button
                  type="button"
                  onClick={() => setNewRole('client')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
                    newRole === 'client'
                      ? 'bg-gradient-to-r from-zinc-700 to-zinc-800 text-white border border-zinc-600 shadow-md'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>Client (Bike Owner)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setNewRole('manager')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
                    newRole === 'manager'
                      ? 'bg-gradient-to-r from-sky-600 to-blue-700 text-white border border-sky-400 shadow-md'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  <span>Manager (Workshop)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setNewRole('admin')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
                    newRole === 'admin'
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-zinc-950 border border-amber-300 font-black shadow-md'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Crown className="w-4 h-4" />
                  <span>Admin (Full Access)</span>
                </button>
              </div>
            </div>

            {/* Full Name & Username */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                  Full Name / Owner Name *
                </label>
                <input
                  type="text"
                  value={newOwnerName}
                  onChange={(e) => setNewOwnerName(e.target.value)}
                  placeholder="e.g. Kasun Fernando"
                  className="w-full bg-[#161a26] border border-[#283247] focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-600 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                  Login Username *
                </label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                  placeholder="e.g. kasun2026"
                  className="w-full bg-[#161a26] border border-[#283247] focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono placeholder:text-zinc-600 outline-none"
                  required
                />
              </div>
            </div>

            {/* Password with Generator */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  Password *
                </label>
                <button
                  type="button"
                  onClick={generateRandomPassword}
                  className="text-[10px] text-amber-400 hover:text-amber-300 font-mono font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" /> Auto-Generate
                </button>
              </div>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter or generate password"
                  className="w-full bg-[#161a26] border border-[#283247] focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono placeholder:text-zinc-600 outline-none pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-200 p-1 cursor-pointer"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Bike Registration Number Plate */}
            <div>
              <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                Bike Registration Plate Number *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={newBikeNumber}
                  onChange={(e) => setNewBikeNumber(e.target.value.toUpperCase())}
                  placeholder="e.g. WP BKT-1374 or BGH-4592"
                  className="w-full bg-[#161a26] border border-[#283247] focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono uppercase tracking-wider placeholder:text-zinc-600 outline-none pr-10"
                  required
                />
                <Bike className="w-4 h-4 text-zinc-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Province & District */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                  Province *
                </label>
                <select
                  value={newProvince}
                  onChange={(e) => handleProvinceChange(e.target.value)}
                  className="w-full bg-[#161a26] border border-[#283247] focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-white outline-none cursor-pointer"
                >
                  {ALL_PROVINCES.map((p) => (
                    <option key={p} value={p} className="bg-[#11141c] text-white">
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                  District *
                </label>
                <select
                  value={newDistrict}
                  onChange={(e) => setNewDistrict(e.target.value)}
                  className="w-full bg-[#161a26] border border-[#283247] focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-white outline-none cursor-pointer"
                >
                  {currentDistricts.map((d) => (
                    <option key={d} value={d} className="bg-[#11141c] text-white">
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Optional Phone / Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                  Contact Phone / WhatsApp (Optional)
                </label>
                <input
                  type="text"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="e.g. +94 77 123 4567"
                  className="w-full bg-[#161a26] border border-[#283247] focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="e.g. client@gmail.com"
                  className="w-full bg-[#161a26] border border-[#283247] focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-600 outline-none"
                />
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-3 py-3.5 px-5 rounded-2xl font-display font-black text-sm tracking-wider text-zinc-950 uppercase bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-[0_4px_25px_rgba(245,158,11,0.45)] border border-yellow-200 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-zinc-950" />
                  <span>Creating Account & Bike Database...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 text-zinc-950" />
                  <span>Create {newRole.toUpperCase()} Account</span>
                </>
              )}
            </motion.button>
          </form>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: REAL-TIME LOGIN IP ADDRESSES & AUDIT LOGS               */}
      {/* ============================================================== */}
      {activeSubTab === 'logs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                Live Client & Manager Login Audit Log
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Real-time tracking of IP addresses, geographic locations, devices, and authentication outcomes
              </p>
            </div>

            {/* Log Status Filter Chips */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 p-1 bg-[#10131d] rounded-xl border border-[#21293a]">
                {(['all', 'success', 'failed'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatusLogFilter(s)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                      statusLogFilter === s
                        ? s === 'failed'
                          ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {s === 'all' ? 'All Statuses' : `${s}`}
                  </button>
                ))}
              </div>

              {loginLogs.length > 0 && (
                <button
                  type="button"
                  onClick={async () => {
                    if (globalThis.confirm('Clear all historical login audit logs?')) {
                      await clearAllLoginLogsFromCloud();
                    }
                  }}
                  className="text-xs text-red-400 hover:text-white px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear History</span>
                </button>
              )}
            </div>
          </div>

          {isLoadingLogs ? (
            <div className="p-12 text-center text-zinc-400 flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-6 h-6 animate-spin text-emerald-400" />
              <p className="text-xs font-mono">Loading IP activity records...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-[#10141e] border border-zinc-800 text-zinc-400 space-y-2">
              <Globe className="w-10 h-10 mx-auto text-zinc-600" />
              <p className="text-sm font-semibold text-zinc-300">No login attempts match current filter.</p>
              <p className="text-xs text-zinc-500">Every time a client or manager logs in, their IP will be captured here in real-time.</p>
            </div>
          ) : (
            <div className="rounded-3xl bg-[#10141e]/95 border border-[#21293c] overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#151a27] border-b border-[#242e42] text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">User / Account</th>
                      <th className="py-3 px-4">Client Login IP</th>
                      <th className="py-3 px-4">Geo Location</th>
                      <th className="py-3 px-4">Device & Browser</th>
                      <th className="py-3 px-4">Timestamp</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Inspect</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1b2233]">
                    {filteredLogs.map((log) => {
                      const isSuccess = log.status === 'success';
                      const formattedTime = new Date(log.timestamp).toLocaleString();

                      return (
                        <tr
                          key={log.id}
                          className="hover:bg-[#161c2b]/70 transition-colors font-mono"
                        >
                          {/* User / Role */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2.5">
                              <span
                                className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                                  isSuccess ? 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-red-400 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]'
                                }`}
                              />
                              <div>
                                <div className="font-bold text-white text-xs">
                                  {log.ownerName || log.username}
                                </div>
                                <div className="text-[10px] text-zinc-400 font-sans">
                                  @{log.username} ·{' '}
                                  <span className="uppercase text-amber-300/90 font-bold font-mono">
                                    {log.role}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* IP Address */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <span className="text-zinc-100 font-bold bg-[#0c0f16] px-2.5 py-1 rounded-lg border border-sky-500/30 text-xs shadow-inner">
                                {log.ip}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopy(log.ip, `ip_log_${log.id}`)}
                                className="text-zinc-500 hover:text-zinc-200 p-1 cursor-pointer"
                                title="Copy IP"
                              >
                                {copiedKey === `ip_log_${log.id}` ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </td>

                          {/* Location */}
                          <td className="py-3.5 px-4 text-zinc-300 font-sans">
                            <div className="flex items-center gap-1.5 text-xs">
                              <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                              <span>{log.location || 'Sri Lanka'}</span>
                            </div>
                          </td>

                          {/* Device / Browser */}
                          <td className="py-3.5 px-4 text-zinc-300 font-sans text-xs">
                            <div className="flex items-center gap-1.5">
                              {log.device?.toLowerCase().includes('android') || log.device?.toLowerCase().includes('ios') || log.device?.toLowerCase().includes('apple') ? (
                                <Smartphone className="w-4 h-4 text-sky-400 shrink-0" />
                              ) : (
                                <Monitor className="w-4 h-4 text-purple-400 shrink-0" />
                              )}
                              <span className="truncate max-w-[180px]" title={log.device || log.userAgent}>
                                {log.device || 'Web Browser'}
                              </span>
                            </div>
                          </td>

                          {/* Timestamp */}
                          <td className="py-3.5 px-4 text-zinc-400 text-[11px] whitespace-nowrap font-mono">
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3 h-3 text-zinc-500" />
                              <span>{formattedTime}</span>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4 text-center">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                isSuccess
                                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                                  : 'bg-red-500/15 border-red-500/30 text-red-400'
                              }`}
                            >
                              {log.status}
                            </span>
                          </td>

                          {/* Inspect Action */}
                          <td className="py-3.5 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => setInspectingLog(log)}
                              className="text-xs px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sky-300 border border-zinc-700 font-sans font-semibold transition-all cursor-pointer inline-flex items-center gap-1"
                            >
                              <Info className="w-3 h-3" />
                              <span>Details</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 1: CHANGE PASSWORD MODAL                                 */}
      {/* ============================================================== */}
      <AnimatePresence>
        {editingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-[#11141d] border border-amber-500/40 rounded-3xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <KeyRound className="w-5 h-5 text-amber-400" />
                  <h3 className="font-bold text-white text-base">
                    Change Password for @{editingUser.username}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="text-zinc-500 hover:text-white text-sm font-mono px-2 py-1 rounded bg-zinc-800"
                >
                  ✕
                </button>
              </div>

              <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-300">
                User: <strong>{editingUser.ownerName}</strong> ({editingUser.role.toUpperCase()})
                <br />
                Assigned Plate: <span className="font-mono text-amber-300">{editingUser.bikeNumber}</span>
              </div>

              {editStatusMsg && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    editStatusMsg.type === 'success'
                      ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                      : 'bg-red-500/15 border border-red-500/30 text-red-300'
                  }`}
                >
                  {editStatusMsg.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  )}
                  <span>{editStatusMsg.text}</span>
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    New Password
                  </label>
                  <input
                    type="text"
                    value={editNewPassword}
                    onChange={(e) => setEditNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full bg-[#161a26] border border-[#283247] focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono placeholder:text-zinc-600 outline-none"
                    autoFocus
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="px-4 py-2 rounded-xl bg-zinc-800 text-xs font-semibold text-zinc-300 hover:bg-zinc-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-zinc-950 text-xs font-bold hover:brightness-110 shadow-md"
                  >
                    Update Password
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================== */}
      {/* MODAL 1B: EDIT BIKE REGISTRATION NUMBER & LIVE SYNC            */}
      {/* ============================================================== */}
      <AnimatePresence>
        {editingBikeUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-[#11141d] border border-amber-500/40 rounded-3xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300">
                    <Bike className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">
                      Sync Real Bike Number
                    </h3>
                    <p className="text-[11px] text-zinc-400">
                      User: <span className="text-amber-300 font-mono">@{editingBikeUser.username}</span> ({editingBikeUser.role.toUpperCase()})
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingBikeUser(null);
                    setEditBikeStatusMsg(null);
                  }}
                  className="text-zinc-500 hover:text-white text-sm font-mono px-2 py-1 rounded-xl bg-zinc-800/80 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {editBikeStatusMsg && (
                <div
                  className={`p-3 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
                    editBikeStatusMsg.type === 'success'
                      ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                      : 'bg-rose-500/20 border border-rose-500/40 text-rose-300'
                  }`}
                >
                  {editBikeStatusMsg.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                  )}
                  <span>{editBikeStatusMsg.text}</span>
                </div>
              )}

              <form onSubmit={handleUpdateBikeDetails} className="space-y-3.5 text-xs">
                <div>
                  <label className="text-[11px] font-mono text-amber-300 mb-1 flex items-center justify-between">
                    <span>REAL BIKE REGISTRATION NO. / NUMBER PLATE *</span>
                    <span className="text-[10px] text-zinc-400 font-sans">e.g. WP BKT-1374, WP Bxx-xxxx</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editBikePlate}
                    onChange={(e) => setEditBikePlate(e.target.value.toUpperCase())}
                    placeholder="e.g. WP BKT-1374 or BKT-2001"
                    className="w-full bg-[#0a0d14] border border-amber-500/40 rounded-xl px-3.5 py-2.5 text-amber-200 font-mono font-bold text-sm tracking-wider focus:outline-none focus:border-amber-400"
                    autoFocus
                  />
                  <p className="text-[10px] text-zinc-400 mt-1">
                    Updates this user&apos;s assigned vehicle plate and instantly synchronizes across all cloud documents.
                  </p>
                </div>

                <div>
                  <label className="text-[11px] font-mono text-zinc-300 mb-1 block">
                    FULL OWNER / RIDER NAME
                  </label>
                  <input
                    type="text"
                    value={editOwnerFullName}
                    onChange={(e) => setEditOwnerFullName(e.target.value)}
                    placeholder="e.g. Chathura (Admin)"
                    className="w-full bg-[#0a0d14] border border-zinc-700 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-mono text-zinc-300 mb-1 block">PROVINCE</label>
                    <select
                      value={editBikeProvince}
                      onChange={(e) => handleEditProvinceChange(e.target.value)}
                      className="w-full bg-[#0a0d14] border border-zinc-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-400"
                    >
                      {ALL_PROVINCES.map((prov) => (
                        <option key={prov} value={prov}>
                          {prov}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-zinc-300 mb-1 block">DISTRICT</label>
                    <select
                      value={editBikeDistrict}
                      onChange={(e) => setEditBikeDistrict(e.target.value)}
                      className="w-full bg-[#0a0d14] border border-zinc-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-400"
                    >
                      {editDistricts.map((dist) => (
                        <option key={dist} value={dist}>
                          {dist}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingBikeUser(null);
                      setEditBikeStatusMsg(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingBikeDetails}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-zinc-950 text-xs font-bold hover:brightness-110 shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isSavingBikeDetails ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5" />
                    )}
                    <span>Save & Live Sync</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================== */}
      {/* MODAL 2: DETAILED USER IP & SESSION INSPECTOR                  */}
      {/* ============================================================== */}
      <AnimatePresence>
        {inspectingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-[#11141d] border border-sky-500/40 rounded-3xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <Globe className="w-5 h-5 text-sky-400" />
                  <div>
                    <h3 className="font-bold text-white text-base">
                      Network & IP Audit: @{inspectingUser.username}
                    </h3>
                    <p className="text-[11px] text-zinc-400">{inspectingUser.ownerName} ({inspectingUser.role.toUpperCase()})</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setInspectingUser(null)}
                  className="text-zinc-500 hover:text-white text-sm font-mono px-2.5 py-1 rounded-xl bg-zinc-800"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs">
                {/* IP Address Row */}
                <div className="p-3 rounded-2xl bg-[#141926] border border-[#273349] flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-zinc-400 uppercase font-mono">Last Recorded Public IP</div>
                    <div className="text-sm font-bold font-mono text-white mt-0.5">
                      {inspectingUser.lastLoginIp || 'No login recorded yet'}
                    </div>
                  </div>
                  {inspectingUser.lastLoginIp && (
                    <button
                      type="button"
                      onClick={() => handleCopy(inspectingUser.lastLoginIp!, 'modal_user_ip')}
                      className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-sky-300 font-mono text-xs flex items-center gap-1.5"
                    >
                      {copiedKey === 'modal_user_ip' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> Copy IP
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Geo Location & Device Details */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-2xl bg-[#0f131e] border border-zinc-800">
                    <div className="text-[10px] text-zinc-400 uppercase font-mono flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-rose-400" /> Location
                    </div>
                    <div className="font-bold text-white mt-1">
                      {inspectingUser.lastLoginLocation || inspectingUser.district || 'Sri Lanka'}
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#0f131e] border border-zinc-800">
                    <div className="text-[10px] text-zinc-400 uppercase font-mono flex items-center gap-1">
                      <Monitor className="w-3 h-3 text-purple-400" /> Device & Browser
                    </div>
                    <div className="font-bold text-white mt-1 truncate" title={inspectingUser.lastLoginDevice}>
                      {inspectingUser.lastLoginDevice || 'Web Browser'}
                    </div>
                  </div>
                </div>

                {/* Assigned Vehicle & Plain Password */}
                <div className="p-3 rounded-2xl bg-[#0f131e] border border-zinc-800 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-zinc-400 uppercase font-mono">Assigned Vehicle</div>
                    <div className="font-mono font-bold text-amber-300 text-xs">
                      {inspectingUser.bikeNumber}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-zinc-400 uppercase font-mono">Plain Password</div>
                    <div className="font-mono font-bold text-emerald-300 text-xs">
                      {inspectingUser.password || '••••••'}
                    </div>
                  </div>
                </div>

                {/* Google Maps Lookup Link */}
                {inspectingUser.lastLoginLocation && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      inspectingUser.lastLoginLocation + ', Sri Lanka'
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-4 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 font-semibold flex items-center justify-center gap-2 transition-all"
                  >
                    <Navigation className="w-4 h-4 text-sky-400" />
                    <span>View Geographic Region on Google Maps</span>
                  </a>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setInspectingUser(null)}
                  className="px-5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white cursor-pointer"
                >
                  Close Inspection
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================== */}
      {/* MODAL 3: AUDIT LOG ROW INSPECTOR                               */}
      {/* ============================================================== */}
      <AnimatePresence>
        {inspectingLog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-[#11141d] border border-emerald-500/40 rounded-3xl p-6 shadow-2xl space-y-4 font-mono text-xs"
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-bold text-white text-base">Login Log Details</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setInspectingLog(null)}
                  className="text-zinc-500 hover:text-white px-2 py-1 rounded bg-zinc-800"
                >
                  ✕
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#0b0e14] border border-[#1e2535] space-y-2 text-zinc-300">
                <div><span className="text-zinc-500">Log ID:</span> {inspectingLog.id}</div>
                <div><span className="text-zinc-500">User:</span> @{inspectingLog.username} ({inspectingLog.ownerName || inspectingLog.role})</div>
                <div><span className="text-zinc-500">Role:</span> <span className="uppercase text-amber-300 font-bold">{inspectingLog.role}</span></div>
                <div><span className="text-zinc-500">IP Address:</span> <span className="text-white font-bold">{inspectingLog.ip}</span></div>
                <div><span className="text-zinc-500">Location:</span> {inspectingLog.location || 'Sri Lanka'}</div>
                <div><span className="text-zinc-500">Device:</span> {inspectingLog.device || 'Unknown'}</div>
                <div><span className="text-zinc-500">User-Agent:</span> <span className="text-[10px] break-all text-zinc-400">{inspectingLog.userAgent || 'N/A'}</span></div>
                <div><span className="text-zinc-500">Status:</span> <span className={inspectingLog.status === 'success' ? 'text-emerald-400 font-bold uppercase' : 'text-red-400 font-bold uppercase'}>{inspectingLog.status}</span></div>
                <div><span className="text-zinc-500">Timestamp:</span> {new Date(inspectingLog.timestamp).toISOString()}</div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleCopy(JSON.stringify(inspectingLog, null, 2), 'raw_log_json')}
                  className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-sans font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedKey === 'raw_log_json' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied JSON
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy JSON
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setInspectingLog(null)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold text-xs cursor-pointer font-sans"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================== */}
      {/* MODAL 4: CONFIRM DELETE USER                                   */}
      {/* ============================================================== */}
      <AnimatePresence>
        {userToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-[#11141d] border border-red-500/40 rounded-3xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-3 text-red-400">
                <AlertTriangle className="w-6 h-6" />
                <h3 className="font-bold text-white text-base">Delete User Account</h3>
              </div>

              <p className="text-xs text-zinc-300">
                Are you sure you want to permanently delete account{' '}
                <strong className="text-white">@{userToDelete.username}</strong> ({userToDelete.ownerName})?
              </p>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setUserToDelete(null)}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-xs font-semibold text-zinc-300 hover:bg-zinc-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteUser}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-md disabled:opacity-50"
                >
                  {isDeleting ? 'Deleting...' : 'Yes, Delete Account'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
