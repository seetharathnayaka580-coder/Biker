import React, { useState, useMemo } from 'react';
import {
  DollarSign,
  TrendingUp,
  Plus,
  Search,
  Filter,
  Calendar,
  MapPin,
  FileText,
  Tag,
  Trash2,
  Edit2,
  CheckCircle,
  AlertCircle,
  Download,
  Printer,
  ChevronDown,
  ChevronUp,
  Sparkles,
  PieChart,
  BarChart3,
  Layers,
  Wrench,
  Droplets,
  Link as LinkIcon,
  ShieldCheck,
  CreditCard,
  Building2,
  X,
  Clock,
  Gauge,
  Info,
  Package,
} from 'lucide-react';
import { MaintenanceExpense, ExpenseCategory, ServiceRecord, VehicleDetails } from '../types';
import { fmtDate, fmtKm, fmtLkr, uid } from '../utils/formatters';

interface MaintenanceCostTabProps {
  expenses: MaintenanceExpense[];
  services: ServiceRecord[];
  odometer: number;
  serviceInterval: number;
  targets: number[];
  vehicle: VehicleDetails;
  isAdmin?: boolean;
  onAddExpense: (expense: MaintenanceExpense) => void;
  onUpdateExpense: (expense: MaintenanceExpense) => void;
  onDeleteExpense: (expenseId: string) => void;
  onOpenServiceTab?: () => void;
}

// Category visual metadata
export const CATEGORY_CONFIG: Record<
  ExpenseCategory,
  { label: string; color: string; bg: string; border: string; iconText: string }
> = {
  service: {
    label: 'Periodic Service',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    iconText: '🛠️',
  },
  oil_fluids: {
    label: 'Engine Oil & Fluids',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
    iconText: '🛢️',
  },
  spares_parts: {
    label: 'Spare Parts & Filters',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    iconText: '⚙️',
  },
  chain_sprocket: {
    label: 'Chain & Sprockets',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    iconText: '⛓️',
  },
  tyres_wheels: {
    label: 'Tyres & Wheels',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    iconText: '🛞',
  },
  wash_detail: {
    label: 'Washing & Detailing',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    iconText: '🧼',
  },
  electrical: {
    label: 'Electrical & Battery',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    iconText: '⚡',
  },
  labour_fee: {
    label: 'Workshop Labour',
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
    iconText: '🔧',
  },
  statutory: {
    label: 'License & Insurance',
    color: 'text-teal-400',
    bg: 'bg-teal-500/10',
    border: 'border-teal-500/30',
    iconText: '📄',
  },
  accessories: {
    label: 'Upgrades & Accessories',
    color: 'text-pink-400',
    bg: 'bg-pink-500/10',
    border: 'border-pink-500/30',
    iconText: '✨',
  },
};

const COMMON_VENDORS = [
  'M.V. Electronic & D.S. Motors (Matara)',
  'David Pieris Motor Company (DPMC Galle)',
  'David Pieris Authorised Workshop - Kandy',
  'David Pieris Authorised Dealer - Gampaha',
  'Southern Bajaj Specialist Garage (Matara)',
  'Speed Motors Spare Parts Hub',
  'Kurunegala MotoSpa Detailing',
  'AutoZone Lubes & Battery Center',
  'City Tyre Care & Wheel Alignment',
];

const QUICK_PRESETS: Array<{
  title: string;
  category: ExpenseCategory;
  defaultAmount: number;
  note: string;
}> = [
  {
    title: 'Engine Oil & Genuine Filter Change',
    category: 'oil_fluids',
    defaultAmount: 4200,
    note: 'Bajaj DTS-i 20W50 (1.15L) + OEM Oil filter & O-ring gasket',
  },
  {
    title: 'Motul C1 Cleaner & C2 Chain Lube',
    category: 'chain_sprocket',
    defaultAmount: 2850,
    note: 'DIY bi-weekly drive chain cleaning & lubrication maintenance',
  },
  {
    title: 'Front & Rear Brake Pads Replacement',
    category: 'spares_parts',
    defaultAmount: 4800,
    note: 'Genuine Bajaj sintered brake pads with caliper pin lube',
  },
  {
    title: 'Premium Foam Wash & Anti-Rust Detailing',
    category: 'wash_detail',
    defaultAmount: 1200,
    note: 'Full bike foam wash, underbody degrease, silencer protective coat',
  },
  {
    title: 'Annual Revenue License & Emission Test',
    category: 'statutory',
    defaultAmount: 4850,
    note: 'Vehicle revenue license sticker + green emission test certification',
  },
  {
    title: 'Drive Chain Slack Adjustment & Alignment',
    category: 'labour_fee',
    defaultAmount: 800,
    note: 'Chain slack calibrated to 25-35mm tolerance & wheel alignment',
  },
];

const OEM_PRICE_REFERENCE = [
  { part: 'Bajaj DTS-i 20W50 4T Engine Oil (1.15L)', interval: 'Every 2,500 - 3,000 km', estCost: '3,400 - 3,800 LKR' },
  { part: 'Genuine Bajaj Oil Filter + Gasket O-ring', interval: 'Every 2,500 km (Each oil change)', estCost: '650 - 850 LKR' },
  { part: 'Front Disc Brake Pads (Dual-Channel ABS)', interval: 'Inspect every 2,500 km (~10k-15k km)', estCost: '2,400 - 2,800 LKR' },
  { part: 'Rear Disc Brake Pads', interval: 'Inspect every 2,500 km (~12k-18k km)', estCost: '1,900 - 2,300 LKR' },
  { part: 'Drive Chain & Sprocket Set (O-Ring DID)', interval: '18,000 - 22,000 km', estCost: '9,500 - 12,000 LKR' },
  { part: 'Champion / NGK Spark Plug (Twin Spark)', interval: 'Inspect 5,000 km / Replace 10,000 km', estCost: '1,100 - 1,400 LKR' },
  { part: 'Air Filter Element', interval: 'Clean 2,500 km / Replace 10,000 km', estCost: '1,200 - 1,500 LKR' },
  { part: 'Authorised DPMC Periodic Service Labour', interval: 'Per routine service interval', estCost: '1,200 - 1,800 LKR' },
];

export const MaintenanceCostTab: React.FC<MaintenanceCostTabProps> = ({
  expenses = [],
  services = [],
  odometer,
  serviceInterval,
  targets,
  vehicle,
  isAdmin = true,
  onAddExpense,
  onUpdateExpense,
  onDeleteExpense,
  onOpenServiceTab,
}) => {
  // Filters & State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'>('date_desc');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<MaintenanceExpense | null>(null);
  const [showOemGuide, setShowOemGuide] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formCategory, setFormCategory] = useState<ExpenseCategory>('service');
  const [formDate, setFormDate] = useState(new Date().toISOString().slice(0, 10));
  const [formKm, setFormKm] = useState(odometer > 0 ? odometer.toString() : '');
  const [formVendor, setFormVendor] = useState('M.V. Electronic & D.S. Motors (Matara)');
  const [formInvoice, setFormInvoice] = useState('');
  const [formPaymentMethod, setFormPaymentMethod] = useState<'cash' | 'card' | 'online' | 'other'>('cash');
  const [formNote, setFormNote] = useState('');
  const [formError, setFormError] = useState('');

  // Track selected service view ('all' for side-by-side grid, or specific serviceId)
  const [selectedServiceId, setSelectedServiceId] = useState<string>('all');
  const [showAnalytics, setShowAnalytics] = useState<boolean>(true);

  // Unified items calculation:
  // Combine explicit expenses array. If an official service record exists with a cost and doesn't already have expenses matching serviceId, synthesize itemized or total expense views
  const unifiedExpenses: MaintenanceExpense[] = useMemo(() => {
    const list = [...expenses];
    // Check if any service with cost > 0 is missing from expenses
    services.forEach((svc) => {
      if (svc.cost && svc.cost > 0) {
        const hasExplicit = list.some((e) => e.serviceId === svc.id || (e.date === svc.date && e.amount === svc.cost));
        if (!hasExplicit) {
          if (svc.items && svc.items.length > 0) {
            svc.items.forEach((item, idx) => {
              list.push({
                id: `svc-${svc.id}-item-${idx}`,
                title: `${svc.label} - ${item.name}`,
                amount: item.amount,
                category: item.category || 'spares_parts',
                date: svc.date,
                km: svc.km,
                vendor: svc.dealer || 'Authorized Workshop',
                invoiceNo: `SVC-${svc.km}KM`,
                paymentMethod: 'cash',
                note: `Itemized service expense for ${svc.label}`,
                serviceId: svc.id,
              });
            });
          } else {
            list.push({
              id: `svc-cost-${svc.id}`,
              title: `${svc.label} (Official Record)`,
              amount: svc.cost,
              category: 'service',
              date: svc.date,
              km: svc.km,
              vendor: svc.dealer || 'Authorized Workshop',
              invoiceNo: `SVC-${svc.km}KM`,
              paymentMethod: 'cash',
              note: svc.note || 'Periodic routine service record',
              serviceId: svc.id,
            });
          }
        }
      }
    });
    return list;
  }, [expenses, services]);

  // Dedicated calculation for Itemized Service Breakdowns (Parts vs. Services)
  const itemizedServicesBreakdown = useMemo(() => {
    return services
      .filter((svc) => (svc.cost && svc.cost > 0) || (svc.items && svc.items.length > 0) || (svc.partsCost && svc.partsCost > 0))
      .map((svc) => {
        let items: Array<{ id: string; name: string; amount: number; category: ExpenseCategory }> = [];

        if (svc.items && svc.items.length > 0) {
          items = svc.items.map((it, idx) => ({
            id: it.id || `${svc.id}-item-${idx}`,
            name: it.name,
            amount: it.amount,
            category: it.category || 'spares_parts',
          }));
        } else {
          // Look up linked expenses in unifiedExpenses
          const linkedExp = unifiedExpenses.filter((e) => e.serviceId === svc.id);
          if (linkedExp.length > 0) {
            items = linkedExp.map((e) => ({
              id: e.id,
              name: e.title.replace(new RegExp(`^${svc.label}\\s*-\\s*`, 'i'), ''),
              amount: e.amount,
              category: e.category,
            }));
          } else {
            // Check if serviceFee or partsCost are set
            if (svc.serviceFee && svc.serviceFee > 0) {
              items.push({
                id: `${svc.id}-labour`,
                name: 'Workshop Service & Inspection Charge',
                amount: svc.serviceFee,
                category: 'labour_fee',
              });
            }
            if (svc.partsCost && svc.partsCost > 0) {
              items.push({
                id: `${svc.id}-parts`,
                name: 'Genuine Replacement Parts & Consumables',
                amount: svc.partsCost,
                category: 'spares_parts',
              });
            }
            if (items.length === 0 && svc.cost) {
              items.push({
                id: `${svc.id}-total`,
                name: 'Routine Periodic Service & Consumables',
                amount: svc.cost,
                category: 'service',
              });
            }
          }
        }

        // Helper to categorize work operations (e.g. Workshop labour, chain lubrication, wash, tuning)
        // versus specific physical parts (e.g. Engine oil, oil filter, spark plug, o-ring)
        const isServiceWork = (name: string, cat?: ExpenseCategory) => {
          if (cat === 'labour_fee' || cat === 'service' || cat === 'wash_detail') return true;
          const lower = name.toLowerCase();
          return (
            lower.includes('service charge') ||
            lower.includes('labour') ||
            lower.includes('labor') ||
            lower.includes('lubricat') ||
            lower.includes('clean') ||
            lower.includes('wash') ||
            lower.includes('servicing') ||
            lower.includes('inspection') ||
            lower.includes('adjust') ||
            lower.includes('bleed') ||
            lower.includes('tuning')
          );
        };

        const serviceItems = items.filter((it) => isServiceWork(it.name, it.category));
        const partsItems = items.filter((it) => !isServiceWork(it.name, it.category));

        const partsTotal =
          partsItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0) || svc.partsCost || 0;
        const labourTotal =
          serviceItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0) || svc.serviceFee || 0;
        const calculatedTotal =
          items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0) || svc.cost || (partsTotal + labourTotal);

        return {
          service: svc,
          items,
          partsItems,
          serviceItems,
          total: calculatedTotal,
          labourTotal,
          partsTotal,
        };
      });
  }, [services, unifiedExpenses]);

  // Aggregate Metrics
  const totalCost = useMemo(() => {
    return unifiedExpenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  }, [unifiedExpenses]);

  const costPerKm = useMemo(() => {
    if (odometer <= 0 || totalCost <= 0) return 0;
    return totalCost / odometer;
  }, [totalCost, odometer]);

  const routineServiceExpenses = useMemo(() => {
    return unifiedExpenses.filter((e) => e.category === 'service' || !!e.serviceId);
  }, [unifiedExpenses]);

  const avgServiceCost = useMemo(() => {
    if (routineServiceExpenses.length === 0) return 4600; // estimated default for N160
    const sum = routineServiceExpenses.reduce((acc, curr) => acc + curr.amount, 0);
    return Math.round(sum / routineServiceExpenses.length);
  }, [routineServiceExpenses]);

  // Next service cost projection (Oil + Filter + Consumables + Labour)
  const nextServiceProjectedBudget = useMemo(() => {
    // Standard N160 routine service cost projection
    return 4850;
  }, []);

  // Category breakdown metrics
  const categoryBreakdown = useMemo(() => {
    const breakdown: Record<ExpenseCategory, { amount: number; count: number }> = {
      service: { amount: 0, count: 0 },
      oil_fluids: { amount: 0, count: 0 },
      spares_parts: { amount: 0, count: 0 },
      chain_sprocket: { amount: 0, count: 0 },
      tyres_wheels: { amount: 0, count: 0 },
      wash_detail: { amount: 0, count: 0 },
      electrical: { amount: 0, count: 0 },
      labour_fee: { amount: 0, count: 0 },
      statutory: { amount: 0, count: 0 },
      accessories: { amount: 0, count: 0 },
    };

    unifiedExpenses.forEach((item) => {
      const cat = item.category in breakdown ? item.category : 'service';
      breakdown[cat].amount += item.amount;
      breakdown[cat].count += 1;
    });

    return Object.entries(breakdown)
      .map(([key, val]) => ({
        category: key as ExpenseCategory,
        amount: val.amount,
        count: val.count,
        percentage: totalCost > 0 ? (val.amount / totalCost) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [unifiedExpenses, totalCost]);

  // Monthly breakdown for visual bar chart
  const monthlyData = useMemo(() => {
    const map: Record<string, { label: string; amount: number; count: number }> = {};
    unifiedExpenses.forEach((item) => {
      if (!item.date) return;
      const monthKey = item.date.slice(0, 7); // YYYY-MM
      if (!map[monthKey]) {
        const dt = new Date(item.date + 'T00:00:00');
        const monthName = isNaN(dt.getTime())
          ? monthKey
          : dt.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' });
        map[monthKey] = { label: monthName, amount: 0, count: 0 };
      }
      map[monthKey].amount += item.amount;
      map[monthKey].count += 1;
    });

    const sortedMonths = Object.keys(map).sort();
    const result = sortedMonths.map((m) => ({
      key: m,
      label: map[m].label,
      amount: map[m].amount,
      count: map[m].count,
    }));

    const maxVal = Math.max(...result.map((r) => r.amount), 1);
    return { list: result, maxVal };
  }, [unifiedExpenses]);

  // Filtered & Sorted Expenses
  const filteredExpenses = useMemo(() => {
    return unifiedExpenses
      .filter((item) => {
        const matchSearch =
          searchTerm.trim() === '' ||
          item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.vendor && item.vendor.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (item.invoiceNo && item.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (item.note && item.note.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (item.km !== undefined && item.km !== null && item.km.toString().includes(searchTerm));

        const matchCat = selectedCategory === 'all' || item.category === selectedCategory;
        return matchSearch && matchCat;
      })
      .sort((a, b) => {
        if (sortBy === 'date_desc') return b.date.localeCompare(a.date);
        if (sortBy === 'date_asc') return a.date.localeCompare(b.date);
        if (sortBy === 'amount_desc') return b.amount - a.amount;
        if (sortBy === 'amount_asc') return a.amount - b.amount;
        return 0;
      });
  }, [unifiedExpenses, searchTerm, selectedCategory, sortBy]);

  // Open Modal for Create or Edit
  const openAddModal = (preset?: typeof QUICK_PRESETS[0]) => {
    setEditingExpense(null);
    setFormError('');
    if (preset) {
      setFormTitle(preset.title);
      setFormCategory(preset.category);
      setFormAmount(preset.defaultAmount.toString());
      setFormNote(preset.note);
    } else {
      setFormTitle('');
      setFormCategory('service');
      setFormAmount('');
      setFormNote('');
    }
    setFormDate(new Date().toISOString().slice(0, 10));
    setFormKm(odometer > 0 ? odometer.toString() : '');
    setFormVendor('M.V. Electronic & D.S. Motors (Matara)');
    setFormInvoice('');
    setFormPaymentMethod('cash');
    setShowAddModal(true);
  };

  const openEditModal = (expense: MaintenanceExpense) => {
    setEditingExpense(expense);
    setFormError('');
    setFormTitle(expense.title);
    setFormAmount(expense.amount.toString());
    setFormCategory(expense.category);
    setFormDate(expense.date);
    setFormKm(expense.km !== undefined && expense.km !== null ? expense.km.toString() : '');
    setFormVendor(expense.vendor || '');
    setFormInvoice(expense.invoiceNo || '');
    setFormPaymentMethod(expense.paymentMethod || 'cash');
    setFormNote(expense.note || '');
    setShowAddModal(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setFormError('Please enter an expense title.');
      return;
    }
    const numAmount = parseFloat(formAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setFormError('Please enter a valid amount in LKR.');
      return;
    }

    const expensePayload: MaintenanceExpense = {
      id: editingExpense ? editingExpense.id : uid('exp'),
      title: formTitle.trim(),
      amount: Math.round(numAmount),
      category: formCategory,
      date: formDate || new Date().toISOString().slice(0, 10),
      km: formKm.trim() ? parseInt(formKm, 10) : null,
      vendor: formVendor.trim(),
      invoiceNo: formInvoice.trim(),
      paymentMethod: formPaymentMethod,
      note: formNote.trim(),
      serviceId: editingExpense?.serviceId,
      updatedAt: new Date().toISOString(),
    };

    if (editingExpense) {
      onUpdateExpense(expensePayload);
    } else {
      onAddExpense({
        ...expensePayload,
        createdAt: new Date().toISOString(),
      });
    }

    setShowAddModal(false);
  };

  // Export CSV
  const handleExportCsv = () => {
    if (unifiedExpenses.length === 0) return;
    const headers = ['ID', 'Date', 'Title', 'Category', 'Amount (LKR)', 'Odometer (KM)', 'Vendor', 'Invoice No', 'Payment Method', 'Notes'];
    const rows = unifiedExpenses.map((exp) => [
      `"${exp.id}"`,
      `"${exp.date}"`,
      `"${exp.title.replace(/"/g, '""')}"`,
      `"${CATEGORY_CONFIG[exp.category]?.label || exp.category}"`,
      exp.amount,
      exp.km ?? '',
      `"${(exp.vendor || '').replace(/"/g, '""')}"`,
      `"${(exp.invoiceNo || '').replace(/"/g, '""')}"`,
      `"${exp.paymentMethod || 'cash'}"`,
      `"${(exp.note || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `bajaj_n160_${vehicle.regNo || 'BKT-1374'}_maintenance_costs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Card */}
      <div className="bg-[#0d1117] border border-[#1a2333] rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-emerald-500/10 via-teal-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.25)] shrink-0">
              <DollarSign className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="font-display font-black text-xl sm:text-2xl text-white tracking-wide">
                  Maintenance Cost Management
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  LKR Currency
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700">
                  {vehicle.regNo || 'BKT-1374'} · Pulsar N160
                </span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl leading-relaxed">
                Track, budget, and analyze periodic routine service expenditures, genuine Bajaj spare parts, lubricants, and overall ownership running cost per kilometer.
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap w-full lg:w-auto">
            {isAdmin && (
              <button
                type="button"
                onClick={() => openAddModal()}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-zinc-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-900/40 transition-all cursor-pointer active:scale-95"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                Log Expense
              </button>
            )}

            <button
              type="button"
              onClick={handleExportCsv}
              disabled={unifiedExpenses.length === 0}
              className="px-3.5 py-2.5 rounded-xl bg-[#141a24] hover:bg-[#1c2433] text-zinc-200 border border-[#222d40] text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              title="Download CSV statement of all maintenance costs"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>Export CSV</span>
            </button>

            <button
              type="button"
              onClick={() => setShowOemGuide(!showOemGuide)}
              className="px-3.5 py-2.5 rounded-xl bg-[#141a24] hover:bg-[#1c2433] text-zinc-200 border border-[#222d40] text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Info className="w-4 h-4 text-amber-400" />
              <span>OEM Price Guide</span>
              {showOemGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Pulsar N160 Sri Lanka OEM Parts Price Reference Drawer */}
        {showOemGuide && (
          <div className="mt-5 pt-5 border-t border-[#1a2333] animate-fadeIn">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                <Sparkles className="w-4 h-4" />
                <span>Bajaj Pulsar N160 Official Spare Parts Price Reference (Sri Lanka)</span>
              </div>
              <span className="text-[11px] text-zinc-400">David Pieris Authorised Workshop Reference</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {OEM_PRICE_REFERENCE.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-[#101520] border border-[#1d2738] rounded-xl p-3 flex flex-col justify-between text-xs"
                >
                  <div>
                    <div className="font-semibold text-zinc-200 text-[11px] leading-snug">{item.part}</div>
                    <div className="text-[10px] text-zinc-400 mt-0.5">{item.interval}</div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-[#18202e] flex items-center justify-between font-mono">
                    <span className="text-[10px] text-zinc-500 uppercase">Est. Price:</span>
                    <span className="text-emerald-400 font-bold text-[11px]">{item.estCost}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* KPI Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Spend */}
        <div className="bg-[#0d1117] border border-[#1a2333] rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Total Spend</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono font-black text-2xl sm:text-3xl text-white tracking-tight">
            {fmtLkr(totalCost)}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-2">
            <span className="text-emerald-400 font-semibold">{unifiedExpenses.length} entries</span>
            <span>logged across life of bike</span>
          </div>
        </div>

        {/* Card 2: Cost Per KM */}
        <div className="bg-[#0d1117] border border-[#1a2333] rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Running Cost / KM</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Gauge className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono font-black text-2xl sm:text-3xl text-cyan-400 tracking-tight">
            {costPerKm > 0 ? `Rs. ${costPerKm.toFixed(2)}` : 'Rs. 0.00'}
            <span className="text-xs font-normal text-zinc-400 ml-1">/ km</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-2">
            <span className="text-cyan-400 font-semibold">{fmtKm(odometer)}</span>
            <span>total distance tracked</span>
          </div>
        </div>

        {/* Card 3: Average Service Cost */}
        <div className="bg-[#0d1117] border border-[#1a2333] rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Avg. Routine Service</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono font-black text-2xl sm:text-3xl text-amber-300 tracking-tight">
            {fmtLkr(avgServiceCost)}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-2">
            <span className="text-amber-400 font-semibold">{routineServiceExpenses.length} periodic services</span>
            <span>completed</span>
          </div>
        </div>

        {/* Card 4: Next Service Budget */}
        <div className="bg-[#0d1117] border border-[#1a2333] rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Next Service Target</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono font-black text-2xl sm:text-3xl text-purple-300 tracking-tight">
            {fmtLkr(nextServiceProjectedBudget)}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-2">
            <span>Projected budget for</span>
            <span className="text-purple-400 font-semibold">{fmtKm(targets[0] || 7688)}</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SERVICE-BY-SERVICE PARTS & LABOUR BREAKDOWN (COMPACT & SIMPLE VIEW)       */}
      {/* ========================================================================= */}
      <div className="bg-[#0d1117] border border-[#1a2333] rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        {/* Top Header & Service Switcher */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-[#1a2333]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)] shrink-0">
              <Package className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-display font-bold text-base sm:text-lg text-white tracking-wide">
                  Service-by-Service Parts & Cost Breakdown
                </h2>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                  Parts vs. Services
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Clearly itemizes individual replacement parts and fluids separately from workshop labour & services
              </p>
            </div>
          </div>

          {/* Quick Service Selection Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 scrollbar-thin">
            <button
              type="button"
              onClick={() => setSelectedServiceId('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedServiceId === 'all'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 font-bold shadow-md shadow-amber-950/40'
                  : 'bg-[#121824] text-zinc-400 hover:text-white border border-[#1e2738]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>All Services View</span>
              <span className="text-[10px] opacity-75">({itemizedServicesBreakdown.length})</span>
            </button>

            {itemizedServicesBreakdown.map(({ service }) => (
              <button
                key={service.id}
                type="button"
                onClick={() => setSelectedServiceId(service.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  selectedServiceId === service.id
                    ? 'bg-cyan-500 text-zinc-950 font-bold shadow-md shadow-cyan-950/40'
                    : 'bg-[#121824] text-zinc-400 hover:text-white border border-[#1e2738]'
                }`}
              >
                <span>{service.label}</span>
                <span className="font-mono text-[10px] opacity-75">({fmtKm(service.km)})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Section: All Services Side-by-Side OR Single Service Detailed View */}
        {selectedServiceId === 'all' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
            {itemizedServicesBreakdown.map((item) => {
              const { service, partsItems, serviceItems, total, partsTotal, labourTotal } = item;
              return (
                <div
                  key={service.id}
                  className="bg-[#101520] border border-[#1a2333] hover:border-[#2b3a52] rounded-2xl p-4 flex flex-col justify-between transition-all duration-200 group relative shadow-md"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-display font-bold text-sm text-white">{service.label}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                            {fmtKm(service.km)}
                          </span>
                        </div>
                        <div className="text-[11px] text-zinc-400 mt-0.5 flex items-center gap-1.5">
                          <Calendar className="w-3 h-3 text-zinc-500" />
                          <span>{fmtDate(service.date)}</span>
                          <span className="text-zinc-600">·</span>
                          <span className="truncate max-w-[110px]">{service.dealer || 'Authorized Workshop'}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-zinc-400 block uppercase font-mono">Total Cost</span>
                        <span className="font-mono font-black text-emerald-400 text-base">{fmtLkr(total)}</span>
                      </div>
                    </div>

                    {/* Quick Subtotal Badges */}
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="bg-[#141c2b] border border-[#1f2c42] rounded-xl p-2 flex flex-col">
                        <span className="text-[10px] font-semibold text-zinc-400 flex items-center gap-1">
                          <Package className="w-3 h-3 text-cyan-400" />
                          Parts Cost
                        </span>
                        <span className="font-mono font-bold text-cyan-300 text-xs mt-0.5">
                          {fmtLkr(partsTotal)}
                        </span>
                      </div>

                      <div className="bg-[#1c1824] border border-[#30233b] rounded-xl p-2 flex flex-col">
                        <span className="text-[10px] font-semibold text-zinc-400 flex items-center gap-1">
                          <Wrench className="w-3 h-3 text-amber-400" />
                          Service / Labour
                        </span>
                        <span className="font-mono font-bold text-amber-300 text-xs mt-0.5">
                          {fmtLkr(labourTotal)}
                        </span>
                      </div>
                    </div>

                    {/* Section 1: Specific Parts & Fluids */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-[11px] font-bold text-cyan-400 mb-1.5 pb-1 border-b border-[#1a2333]">
                        <span className="flex items-center gap-1">
                          <Package className="w-3 h-3" />
                          Parts & Fluids Used
                        </span>
                        <span className="font-mono text-[10px] text-cyan-300/80">{fmtLkr(partsTotal)}</span>
                      </div>

                      <div className="space-y-1.5">
                        {partsItems.length === 0 ? (
                          <div className="text-[11px] text-zinc-500 italic py-1">No separate parts billed</div>
                        ) : (
                          partsItems.map((part) => (
                            <div
                              key={part.id}
                              className="flex items-center justify-between text-xs py-1.5 px-2 rounded-lg bg-[#0c1017] border border-[#161d2a]"
                            >
                              <span className="text-zinc-200 text-[11px] font-medium truncate pr-2" title={part.name}>
                                {part.name}
                              </span>
                              <span className="font-mono font-bold text-cyan-300 text-[11px] shrink-0">
                                {fmtLkr(part.amount)}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Section 2: Services & Work */}
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-bold text-amber-400 mb-1.5 pb-1 border-b border-[#1a2333]">
                        <span className="flex items-center gap-1">
                          <Wrench className="w-3 h-3" />
                          Workshop Services & Labour
                        </span>
                        <span className="font-mono text-[10px] text-amber-300/80">{fmtLkr(labourTotal)}</span>
                      </div>

                      <div className="space-y-1.5">
                        {serviceItems.length === 0 ? (
                          <div className="text-[11px] text-zinc-500 italic py-1">Routine inspection service included</div>
                        ) : (
                          serviceItems.map((svcItem) => (
                            <div
                              key={svcItem.id}
                              className="flex items-center justify-between text-xs py-1.5 px-2 rounded-lg bg-[#0c1017] border border-[#161d2a]"
                            >
                              <span className="text-zinc-200 text-[11px] font-medium truncate pr-2" title={svcItem.name}>
                                {svcItem.name}
                              </span>
                              <span className="font-mono font-bold text-amber-300 text-[11px] shrink-0">
                                {fmtLkr(svcItem.amount)}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Action Link */}
                  <div className="pt-3 mt-3 border-t border-[#18202e] flex items-center justify-between text-[11px]">
                    <button
                      type="button"
                      onClick={() => setSelectedServiceId(service.id)}
                      className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <span>Focus this service</span>
                      <span>→</span>
                    </button>
                    <span className="text-zinc-500 font-mono text-[10px]">
                      {partsItems.length + serviceItems.length} items logged
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          (() => {
            const selected =
              itemizedServicesBreakdown.find((b) => b.service.id === selectedServiceId) ||
              itemizedServicesBreakdown[0];
            if (!selected) return null;
            const { service, partsItems, serviceItems, total, partsTotal, labourTotal } = selected;
            const partsPercent = total > 0 ? Math.round((partsTotal / total) * 100) : 0;
            const labourPercent = total > 0 ? 100 - partsPercent : 0;

            return (
              <div className="mt-5 space-y-4">
                {/* Detailed Service Banner */}
                <div className="bg-[#101520] border border-[#212b3d] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="font-display font-black text-lg text-white">{service.label}</h3>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                        {fmtKm(service.km)}
                      </span>
                      <span className="text-xs text-zinc-400">
                        Completed on {fmtDate(service.date)}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400">
                      Workshop: <strong className="text-zinc-200">{service.dealer || 'M.V. Electronic & D.S. Motors'}</strong>
                      {service.note && <span className="ml-2 text-zinc-500">· {service.note}</span>}
                    </p>
                  </div>

                  {/* Totals Pill */}
                  <div className="flex items-center gap-3 bg-[#0c1017] border border-[#1a2333] px-4 py-2.5 rounded-xl shrink-0">
                    <div>
                      <span className="text-[10px] text-zinc-400 uppercase font-mono block">Total Service Invoice</span>
                      <span className="font-mono font-black text-xl text-emerald-400">{fmtLkr(total)}</span>
                    </div>
                    <div className="h-8 w-px bg-[#1f2838]" />
                    <div className="text-right">
                      <span className="text-[10px] text-zinc-400 block">Parts / Service Split</span>
                      <span className="text-xs font-mono font-bold text-cyan-300">{partsPercent}%</span>
                      <span className="text-xs text-zinc-500 mx-1">/</span>
                      <span className="text-xs font-mono font-bold text-amber-300">{labourPercent}%</span>
                    </div>
                  </div>
                </div>

                {/* Side-by-Side Distinct Tables: Parts on Left, Services on Right */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Column 1: Specific Parts & Consumables */}
                  <div className="bg-[#101520] border border-[#1a2333] rounded-2xl p-4 sm:p-5">
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#1a2333]">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                          <Package className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm text-white">Specific Parts & Consumables</h4>
                          <span className="text-[10px] text-zinc-400">Physical genuine items installed</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-zinc-400 uppercase font-mono block">Parts Total</span>
                        <span className="font-mono font-bold text-cyan-400 text-sm">{fmtLkr(partsTotal)}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {partsItems.length === 0 ? (
                        <p className="text-xs text-zinc-500 py-4 text-center">No individual parts recorded for this service</p>
                      ) : (
                        partsItems.map((part) => (
                          <div
                            key={part.id}
                            className="flex items-center justify-between p-2.5 rounded-xl bg-[#0c1017] border border-[#161d2a] hover:border-[#222d40] transition-colors"
                          >
                            <div className="min-w-0 pr-2">
                              <div className="text-xs font-semibold text-zinc-200 truncate">{part.name}</div>
                              <span className="text-[10px] text-cyan-400/80 capitalize">
                                {part.category.replace('_', ' ')}
                              </span>
                            </div>
                            <div className="font-mono font-black text-sm text-cyan-300 shrink-0">
                              {fmtLkr(part.amount)}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Column 2: Workshop Services & Labour */}
                  <div className="bg-[#101520] border border-[#1a2333] rounded-2xl p-4 sm:p-5">
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#1a2333]">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                          <Wrench className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm text-white">Services, Labour & Operations</h4>
                          <span className="text-[10px] text-zinc-400">e.g. Chain lubrication, labour, wash, tuning</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-zinc-400 uppercase font-mono block">Service Fee Total</span>
                        <span className="font-mono font-bold text-amber-400 text-sm">{fmtLkr(labourTotal)}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {serviceItems.length === 0 ? (
                        <p className="text-xs text-zinc-500 py-4 text-center">No individual labour items recorded</p>
                      ) : (
                        serviceItems.map((svcItem) => (
                          <div
                            key={svcItem.id}
                            className="flex items-center justify-between p-2.5 rounded-xl bg-[#0c1017] border border-[#161d2a] hover:border-[#222d40] transition-colors"
                          >
                            <div className="min-w-0 pr-2">
                              <div className="text-xs font-semibold text-zinc-200 truncate">{svcItem.name}</div>
                              <span className="text-[10px] text-amber-400/80 capitalize">
                                {svcItem.category.replace('_', ' ')}
                              </span>
                            </div>
                            <div className="font-mono font-black text-sm text-amber-300 shrink-0">
                              {fmtLkr(svcItem.amount)}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Back to All Services Button */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={onOpenServiceTab}
                    className="text-xs text-zinc-400 hover:text-amber-400 font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <LinkIcon className="w-3 h-3" />
                    <span>View in Official Service Log</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedServiceId('all')}
                    className="text-xs text-zinc-300 hover:text-cyan-400 font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Show All Services Comparison Grid</span>
                  </button>
                </div>
              </div>
            );
          })()
        )}
      </div>

      {/* Visual Analytics & Breakdown (Collapsible for compact viewing) */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <PieChart className="w-4 h-4 text-emerald-400" />
          <h3 className="font-display font-bold text-sm text-zinc-200">
            Expenditure Analytics & Monthly Trends
          </h3>
        </div>
        <button
          type="button"
          onClick={() => setShowAnalytics(!showAnalytics)}
          className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1 cursor-pointer transition-colors"
        >
          <span>{showAnalytics ? 'Collapse Analytics' : 'Expand Analytics'}</span>
          {showAnalytics ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {showAnalytics && (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
        {/* Category Breakdown (2 Cols on lg) */}
        <div className="lg:col-span-2 bg-[#0d1117] border border-[#1a2333] rounded-2xl p-5 sm:p-6 shadow-xl">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <PieChart className="w-4 h-4" />
              </div>
              <h2 className="font-display font-bold text-base text-white tracking-wide">
                Expenditure by Component & Category
              </h2>
            </div>
            <span className="text-xs text-zinc-400 font-mono">
              Total: {fmtLkr(totalCost)}
            </span>
          </div>

          {/* Proportional Segment Bar */}
          <div className="w-full h-3 bg-[#161c28] rounded-full overflow-hidden flex mb-5 border border-[#212b3d]">
            {categoryBreakdown
              .filter((c) => c.amount > 0)
              .map((c) => {
                const conf = CATEGORY_CONFIG[c.category] || CATEGORY_CONFIG.service;
                return (
                  <div
                    key={c.category}
                    style={{ width: `${c.percentage}%` }}
                    className={`h-full transition-all duration-500 ${
                      c.category === 'service'
                        ? 'bg-amber-400'
                        : c.category === 'oil_fluids'
                        ? 'bg-cyan-400'
                        : c.category === 'chain_sprocket'
                        ? 'bg-emerald-400'
                        : c.category === 'spares_parts'
                        ? 'bg-blue-400'
                        : c.category === 'wash_detail'
                        ? 'bg-purple-400'
                        : 'bg-rose-400'
                    }`}
                    title={`${conf.label}: ${fmtLkr(c.amount)} (${c.percentage.toFixed(1)}%)`}
                  />
                );
              })}
          </div>

          {/* Category List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {categoryBreakdown.map((item) => {
              const conf = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.service;
              return (
                <div
                  key={item.category}
                  onClick={() => setSelectedCategory(selectedCategory === item.category ? 'all' : item.category)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    selectedCategory === item.category
                      ? 'bg-[#18202e] border-cyan-400 shadow-md ring-1 ring-cyan-400/30'
                      : 'bg-[#101520] border-[#1a2333] hover:border-[#2b3952]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-lg">{conf.iconText}</span>
                    <div className="truncate">
                      <div className="text-xs font-semibold text-zinc-200 truncate">{conf.label}</div>
                      <div className="text-[10px] text-zinc-400">
                        {item.count} {item.count === 1 ? 'record' : 'records'} · {item.percentage.toFixed(0)}% of total
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className={`font-mono font-bold text-xs sm:text-sm ${conf.color}`}>
                      {fmtLkr(item.amount)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Monthly Expense Trend & Quick Presets (1 Col on lg) */}
        <div className="space-y-6">
          {/* Monthly Trend Mini Bar Chart */}
          <div className="bg-[#0d1117] border border-[#1a2333] rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                <h3 className="font-display font-bold text-sm text-white">Monthly Spending Trend</h3>
              </div>
              <span className="text-[11px] text-zinc-400">2026 History</span>
            </div>

            {monthlyData.list.length === 0 ? (
              <p className="text-xs text-zinc-500 py-6 text-center">No monthly records yet</p>
            ) : (
              <div className="space-y-2.5">
                {monthlyData.list.map((m) => {
                  const percent = Math.min(Math.round((m.amount / monthlyData.maxVal) * 100), 100);
                  return (
                    <div key={m.key} className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-zinc-300 font-medium">{m.label}</span>
                        <span className="font-mono font-bold text-emerald-400">{fmtLkr(m.amount)}</span>
                      </div>
                      <div className="w-full h-2 bg-[#161c28] rounded-full overflow-hidden border border-[#212b3d]">
                        <div
                          style={{ width: `${percent}%` }}
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Preset Logger */}
          {isAdmin && (
            <div className="bg-[#0d1117] border border-[#1a2333] rounded-2xl p-5 shadow-xl">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h3 className="font-display font-bold text-sm text-white">Quick Log Common Presets</h3>
              </div>
              <p className="text-[11px] text-zinc-400 mb-3">
                Tap any common Bajaj maintenance routine to pre-fill standard OEM amounts:
              </p>
              <div className="space-y-2">
                {QUICK_PRESETS.slice(0, 3).map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => openAddModal(preset)}
                    className="w-full text-left p-2.5 rounded-xl bg-[#101520] hover:bg-[#161f30] border border-[#1a2333] hover:border-emerald-500/40 transition-all flex items-center justify-between gap-2 group cursor-pointer"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-zinc-200 group-hover:text-emerald-300 truncate">
                        {preset.title}
                      </div>
                      <div className="text-[10px] text-zinc-400 truncate">{preset.note}</div>
                    </div>
                    <span className="font-mono font-bold text-xs text-emerald-400 shrink-0">
                      {fmtLkr(preset.defaultAmount)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      )}

      {/* Expense Ledger & Records Table */}
      <div className="bg-[#0d1117] border border-[#1a2333] rounded-2xl p-5 sm:p-6 shadow-xl">
        {/* Header, Search & Filter Bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-base sm:text-lg text-white tracking-wide">
                Maintenance Expenses Ledger
              </h2>
              <p className="text-xs text-zinc-400">
                Showing {filteredExpenses.length} of {unifiedExpenses.length} logged expense items
              </p>
            </div>
          </div>

          {/* Search & Sort Controls */}
          <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap">
            {/* Search */}
            <div className="relative flex-1 md:w-64">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search bills, parts, vendors..."
                className="w-full bg-[#101520] border border-[#1a2333] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-zinc-500 focus:border-cyan-400 focus:outline-none transition-colors"
              />
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              aria-label="Sort maintenance expenses"
              className="bg-[#101520] border border-[#1a2333] rounded-xl px-3 py-1.5 text-xs text-zinc-300 focus:border-cyan-400 focus:outline-none transition-colors cursor-pointer"
            >
              <option value="date_desc">Newest First</option>
              <option value="date_asc">Oldest First</option>
              <option value="amount_desc">Highest Amount</option>
              <option value="amount_asc">Lowest Amount</option>
            </select>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-thin">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-cyan-500 text-zinc-950 font-bold'
                : 'bg-[#101520] text-zinc-400 hover:text-white border border-[#1a2333]'
            }`}
          >
            All Categories ({unifiedExpenses.length})
          </button>
          {Object.entries(CATEGORY_CONFIG).map(([catKey, conf]) => {
            const count = unifiedExpenses.filter((e) => e.category === catKey).length;
            if (count === 0 && selectedCategory !== catKey) return null;
            return (
              <button
                key={catKey}
                type="button"
                onClick={() => setSelectedCategory(selectedCategory === catKey ? 'all' : catKey)}
                className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                  selectedCategory === catKey
                    ? 'bg-cyan-500 text-zinc-950 font-bold'
                    : 'bg-[#101520] text-zinc-400 hover:text-white border border-[#1a2333]'
                }`}
              >
                <span>{conf.iconText}</span>
                <span>{conf.label}</span>
                <span className="opacity-70 text-[10px]">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Expense Items List */}
        {filteredExpenses.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-[#1a2333] rounded-xl bg-[#090d14]">
            <DollarSign className="w-10 h-10 text-zinc-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-zinc-300">No maintenance expenses found</p>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
              {searchTerm || selectedCategory !== 'all'
                ? 'Try adjusting your search query or category filter.'
                : 'Start logging parts, periodic service bills, and maintenance costs.'}
            </p>
            {isAdmin && (
              <button
                type="button"
                onClick={() => openAddModal()}
                className="mt-4 px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold inline-flex items-center gap-1.5 hover:bg-emerald-500/30 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add First Expense
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredExpenses.map((expense) => {
              const conf = CATEGORY_CONFIG[expense.category] || CATEGORY_CONFIG.service;
              const isLinkedToService = !!expense.serviceId;

              return (
                <div
                  key={expense.id}
                  className="bg-[#101520] border border-[#1a2333] hover:border-[#25334a] rounded-xl p-4 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
                >
                  {/* Left Column: Icon & Details */}
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 border ${conf.bg} ${conf.border}`}
                    >
                      {conf.iconText}
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-white text-sm tracking-wide">
                          {expense.title}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-medium border ${conf.bg} ${conf.color} ${conf.border}`}
                        >
                          {conf.label}
                        </span>
                        {isLinkedToService && (
                          <button
                            type="button"
                            onClick={onOpenServiceTab}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 transition-colors cursor-pointer"
                            title="View linked periodic service record"
                          >
                            <LinkIcon className="w-2.5 h-2.5" />
                            Official Service
                          </button>
                        )}
                      </div>

                      {/* Meta Information: Date, Mileage, Vendor */}
                      <div className="flex items-center gap-3 text-xs text-zinc-400 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-zinc-500" />
                          {fmtDate(expense.date)}
                        </span>

                        {expense.km !== undefined && expense.km !== null && (
                          <span className="font-mono text-cyan-400 font-medium">
                            {fmtKm(expense.km)}
                          </span>
                        )}

                        {expense.vendor && (
                          <span className="flex items-center gap-1 text-zinc-400">
                            <MapPin className="w-3 h-3 text-zinc-500" />
                            {expense.vendor}
                          </span>
                        )}

                        {expense.invoiceNo && (
                          <span className="font-mono text-[11px] px-1.5 py-0.2 bg-[#161d2a] text-zinc-300 rounded border border-[#232f42]">
                            #{expense.invoiceNo}
                          </span>
                        )}
                      </div>

                      {/* Note */}
                      {expense.note && (
                        <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                          {expense.note}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Amount & Controls */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#1a2333]">
                    <div className="text-left sm:text-right">
                      <div className="font-mono font-black text-base sm:text-lg text-emerald-400 tracking-tight">
                        {fmtLkr(expense.amount)}
                      </div>
                      <div className="text-[10px] text-zinc-500 capitalize">
                        via {expense.paymentMethod || 'cash'}
                      </div>
                    </div>

                    {isAdmin && (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(expense)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors cursor-pointer"
                          title="Edit expense details"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {deleteConfirmId === expense.id ? (
                          <div className="flex items-center gap-1 bg-red-950/60 p-1 rounded-lg border border-red-500/40">
                            <button
                              type="button"
                              onClick={() => {
                                onDeleteExpense(expense.id);
                                setDeleteConfirmId(null);
                              }}
                              className="px-2 py-0.5 text-[10px] font-bold bg-red-500 text-white rounded cursor-pointer"
                            >
                              Confirm
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmId(null)}
                              className="px-1.5 py-0.5 text-[10px] text-zinc-400 hover:text-white cursor-pointer"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(expense.id)}
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                            title="Delete this expense"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add / Edit Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#0e131b] border border-[#212b3d] rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-[#1a2333] mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-white">
                    {editingExpense ? 'Edit Maintenance Expense' : 'Log New Maintenance Expense'}
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    Record spare parts, garage repairs, or routine consumables
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-lg bg-[#141a24] hover:bg-[#1f2838] text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitForm} className="space-y-4">
              {/* Title / Description */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Expense Title / Work Description *
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Engine Oil (20W50 1.15L) & Genuine Filter"
                  className="w-full bg-[#121824] border border-[#212b3d] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-500 focus:border-emerald-400 focus:outline-none transition-colors"
                  required
                />
              </div>

              {/* Amount & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Amount in LKR (Rs.) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-zinc-400">
                      Rs.
                    </span>
                    <input
                      type="number"
                      step="1"
                      min="1"
                      value={formAmount}
                      onChange={(e) => setFormAmount(e.target.value)}
                      placeholder="4200"
                      className="w-full bg-[#121824] border border-[#212b3d] rounded-xl pl-10 pr-3 py-2 text-xs text-white placeholder:text-zinc-500 focus:border-emerald-400 focus:outline-none transition-colors font-mono font-bold"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Expense Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as ExpenseCategory)}
                    className="w-full bg-[#121824] border border-[#212b3d] rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-400 focus:outline-none transition-colors cursor-pointer"
                  >
                    {Object.entries(CATEGORY_CONFIG).map(([key, conf]) => (
                      <option key={key} value={key}>
                        {conf.iconText} {conf.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Date & Odometer */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Date of Expense
                  </label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full bg-[#121824] border border-[#212b3d] rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-400 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Odometer at Expense (KM)
                  </label>
                  <input
                    type="number"
                    value={formKm}
                    onChange={(e) => setFormKm(e.target.value)}
                    placeholder={odometer.toString()}
                    className="w-full bg-[#121824] border border-[#212b3d] rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-400 focus:outline-none transition-colors font-mono"
                  />
                </div>
              </div>

              {/* Vendor / Workshop */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Workshop / Store / Vendor
                </label>
                <input
                  type="text"
                  list="vendor-suggestions"
                  value={formVendor}
                  onChange={(e) => setFormVendor(e.target.value)}
                  placeholder="e.g. M.V. Electronic & D.S. Motors"
                  className="w-full bg-[#121824] border border-[#212b3d] rounded-xl px-3.5 py-2 text-xs text-white focus:border-emerald-400 focus:outline-none transition-colors"
                />
                <datalist id="vendor-suggestions">
                  {COMMON_VENDORS.map((v, i) => (
                    <option key={i} value={v} />
                  ))}
                </datalist>
              </div>

              {/* Invoice & Payment Method */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Bill / Invoice / Receipt No. (Optional)
                  </label>
                  <input
                    type="text"
                    value={formInvoice}
                    onChange={(e) => setFormInvoice(e.target.value)}
                    placeholder="INV-2026-XXXX"
                    className="w-full bg-[#121824] border border-[#212b3d] rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-emerald-400 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={formPaymentMethod}
                    onChange={(e) => setFormPaymentMethod(e.target.value as any)}
                    className="w-full bg-[#121824] border border-[#212b3d] rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-400 focus:outline-none transition-colors cursor-pointer"
                  >
                    <option value="cash">Cash (LKR)</option>
                    <option value="card">Credit / Debit Card</option>
                    <option value="online">Online / Bank Transfer</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Remarks & Notes
                </label>
                <textarea
                  value={formNote}
                  onChange={(e) => setFormNote(e.target.value)}
                  rows={2}
                  placeholder="Additional details, parts brand, warranty, or garage notes..."
                  className="w-full bg-[#121824] border border-[#212b3d] rounded-xl px-3.5 py-2 text-xs text-white focus:border-emerald-400 focus:outline-none transition-colors resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1a2333]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#151c28] hover:bg-[#1e2738] text-zinc-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-zinc-950 font-black text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-950/50 transition-all cursor-pointer"
                >
                  <CheckCircle className="w-4 h-4" />
                  {editingExpense ? 'Save Changes' : 'Record Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
