import React, { useState, useEffect, useMemo } from 'react';
import {
  MapPin,
  Navigation,
  Compass,
  Phone,
  Clock,
  Star,
  ShieldCheck,
  Fuel,
  Wrench,
  AlertTriangle,
  ExternalLink,
  Plus,
  Trash2,
  Search,
  Crosshair,
  Route,
  Share2,
  Layers,
  Map as MapIcon,
  Check,
  Zap,
} from 'lucide-react';
import { ServiceCenter, CenterCategory } from '../types';
import { INITIAL_SERVICE_CENTERS } from '../data/serviceCenters';

interface GoogleMapsServiceLocatorProps {
  currentOdometer: number;
  nextServiceKm: number;
  isAdmin: boolean;
}

const STORAGE_KEY_CUSTOM_CENTERS = 'n160_custom_service_centers';

// Helper to calculate haversine distance in km
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export const GoogleMapsServiceLocator: React.FC<GoogleMapsServiceLocatorProps> = ({
  currentOdometer,
  nextServiceKm,
  isAdmin,
}) => {
  // Service Centers State
  const [centers, setCenters] = useState<ServiceCenter[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CUSTOM_CENTERS);
      if (saved) {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_SERVICE_CENTERS;
      }
    } catch {
      // fallback
    }
    return INITIAL_SERVICE_CENTERS;
  });

  // Selected Center for preview
  const [selectedCenter, setSelectedCenter] = useState<ServiceCenter>(centers[0]);

  // User Current Geolocation
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locatingUser, setLocatingUser] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [mapViewMode, setMapViewMode] = useState<'m' | 'k'>('m'); // m = standard roadmap, k = satellite

  // Modal for Admin to add custom service center
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCenter, setNewCenter] = useState({
    name: '',
    category: 'dealer' as CenterCategory,
    city: '',
    district: '',
    address: '',
    lat: '',
    lng: '',
    phone: '',
    openingHours: '8:00 AM - 5:00 PM',
    servicesOffered: 'General Service, Oil & Filter Change',
  });

  // Copy status
  const [copiedLink, setCopiedLink] = useState(false);

  // Save centers to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CUSTOM_CENTERS, JSON.stringify(centers));
    } catch (e) {
      console.warn('Could not save custom service centers:', e);
    }
  }, [centers]);

  // Connect GPS location
  const handleConnectGPS = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }

    setLocatingUser(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(coords);
        setLocatingUser(false);
      },
      (error) => {
        console.warn('GPS location error:', error);
        setGeoError('Could not acquire GPS position. Defaulting to Kurunegala Hub.');
        // Default to Kurunegala coordinates if denied or unavailable
        setUserLocation({ lat: 7.4863, lng: 80.3623 });
        setLocatingUser(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  // Filter & calculate distances
  const filteredCenters = useMemo(() => {
    return centers
      .map((c) => {
        let dist: number | undefined;
        if (userLocation) {
          dist = calculateDistanceKm(userLocation.lat, userLocation.lng, c.lat, c.lng);
        }
        return { ...c, distanceKm: dist };
      })
      .filter((c) => {
        const matchesCat = activeCategory === 'all' || c.category === activeCategory;
        const matchesSearch =
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.address.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCat && matchesSearch;
      })
      .sort((a, b) => {
        if (a.distanceKm !== undefined && b.distanceKm !== undefined) {
          return a.distanceKm - b.distanceKm;
        }
        return 0;
      });
  }, [centers, userLocation, activeCategory, searchQuery]);

  // Google Maps Direct Navigation Link
  const getGoogleMapsNavUrl = (destLat: number, destLng: number, name: string) => {
    if (userLocation) {
      return `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${destLat},${destLng}&travelmode=two-wheeler`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + ' ' + destLat + ',' + destLng)}`;
  };

  // Google Maps Embedded Iframe URL
  const mapEmbedUrl = useMemo(() => {
    const targetLat = selectedCenter.lat;
    const targetLng = selectedCenter.lng;
    const query = encodeURIComponent(`${selectedCenter.name}, ${selectedCenter.city}`);
    return `https://maps.google.com/maps?q=${targetLat},${targetLng}&t=${mapViewMode}&z=14&ie=UTF8&iwloc=&output=embed`;
  }, [selectedCenter, mapViewMode]);

  // Handle Adding New Center (Admin Only)
  const handleAddCenter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCenter.name || !newCenter.lat || !newCenter.lng) return;

    const created: ServiceCenter = {
      id: `center-${Date.now()}`,
      name: newCenter.name,
      category: newCenter.category,
      city: newCenter.city || 'Custom City',
      district: newCenter.district || 'Sri Lanka',
      address: newCenter.address || 'Authorized Service Station',
      lat: parseFloat(newCenter.lat) || 7.4863,
      lng: parseFloat(newCenter.lng) || 80.3623,
      phone: newCenter.phone || '+94 11 470 0600',
      openingHours: newCenter.openingHours || '8:00 AM - 5:00 PM',
      rating: 4.8,
      servicesOffered: newCenter.servicesOffered
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      isAuthorizedBajaj: newCenter.category === 'dealer',
    };

    setCenters((prev) => [created, ...prev]);
    setSelectedCenter(created);
    setShowAddModal(false);
    setNewCenter({
      name: '',
      category: 'dealer',
      city: '',
      district: '',
      address: '',
      lat: '',
      lng: '',
      phone: '',
      openingHours: '8:00 AM - 5:00 PM',
      servicesOffered: 'General Service, Oil & Filter Change',
    });
  };

  // Delete custom center
  const handleDeleteCenter = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (globalThis.confirm('Delete this service location from the map?')) {
      const remaining = centers.filter((c) => c.id !== id);
      setCenters(remaining);
      if (selectedCenter.id === id && remaining.length > 0) {
        setSelectedCenter(remaining[0]);
      }
    }
  };

  // Share current location or SOS link
  const handleShareLocation = () => {
    const shareUrl = userLocation
      ? `https://maps.google.com/?q=${userLocation.lat},${userLocation.lng}`
      : `https://maps.google.com/?q=${selectedCenter.lat},${selectedCenter.lng}`;

    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="space-y-5">
      {/* Top Banner: Pulsar N160 GPS & Google Map Hub */}
      <div className="bg-gradient-to-r from-[#171a23] via-[#1a1f2c] to-[#141720] border border-[#2a3040] rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-amber-500/30 p-1 flex items-center justify-center text-amber-400 shrink-0 shadow-lg shadow-amber-500/10 overflow-hidden">
              <img
                src="/pulsar_n160.svg"
                alt="Bajaj Pulsar N160"
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-display font-black text-white tracking-wide">
                  BAJAJ AUTHORISED SERVICE LOCATOR
                </h1>
                <span className="text-[10px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full uppercase">
                  Google Maps Connected
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Official David Pieris Motor Company dealer network, spare parts hubs, and roadside assistance across Sri Lanka.
              </p>
            </div>
          </div>

          {/* GPS Connect & Location Button */}
          <div className="flex items-center gap-2.5 flex-wrap w-full sm:w-auto">
            <button
              onClick={handleConnectGPS}
              disabled={locatingUser}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all shadow-md cursor-pointer ${
                userLocation
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 hover:from-amber-400 hover:to-amber-500 font-bold border border-amber-400/50 shadow-amber-500/20'
              }`}
            >
              <Crosshair className={`w-4 h-4 ${locatingUser ? 'animate-spin text-zinc-950' : ''}`} />
              {locatingUser
                ? 'Acquiring GPS Signal...'
                : userLocation
                ? `GPS Connected (${userLocation.lat.toFixed(3)}, ${userLocation.lng.toFixed(3)})`
                : 'Connect Live GPS Location'}
            </button>

            {isAdmin && (
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-zinc-200 bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-700 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4 text-amber-400" />
                <span>Add Workshop Pin</span>
              </button>
            )}
          </div>
        </div>

        {/* GPS Alert Notice if active */}
        {geoError && (
          <div className="mt-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{geoError}</span>
          </div>
        )}
      </div>

      {/* Main 2-Column Split Layout: Interactive Map vs Service Centers Directory */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* LEFT COLUMN (7 cols): Embedded Google Map & Selected Location Preview */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          {/* Map Card */}
          <div className="bg-[#14171e] border border-[#262c38] rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            {/* Map Header Toolbar */}
            <div className="px-4 py-3 bg-[#181d26] border-b border-[#262c38] flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2 min-w-0">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-xs font-semibold text-white truncate">
                  {selectedCenter.name}
                </span>
              </div>

              {/* Map Layer Switcher & Share */}
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-[#0e1117] p-0.5 rounded-lg border border-[#2b3240] text-[11px]">
                  <button
                    onClick={() => setMapViewMode('m')}
                    className={`px-2 py-1 rounded font-medium transition-colors ${
                      mapViewMode === 'm'
                        ? 'bg-amber-500 text-zinc-950 font-bold'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Roadmap
                  </button>
                  <button
                    onClick={() => setMapViewMode('k')}
                    className={`px-2 py-1 rounded font-medium transition-colors ${
                      mapViewMode === 'k'
                        ? 'bg-amber-500 text-zinc-950 font-bold'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Satellite
                  </button>
                </div>

                <button
                  onClick={handleShareLocation}
                  className="p-1.5 rounded-lg bg-zinc-800/60 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700/50 transition-colors cursor-pointer text-xs flex items-center gap-1"
                  title="Copy Google Maps link"
                >
                  {copiedLink ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Share2 className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Embedded Live Google Map Frame */}
            <div className="relative w-full h-[360px] sm:h-[420px] bg-[#0c0e12]">
              <iframe
                title="Google Maps Location View"
                src={mapEmbedUrl}
                width="100%"
                height="100%"
                className="border-0 w-full h-full"
                loading="lazy"
                allowFullScreen
              />

              {/* Overlay Navigation CTA on Map */}
              <div className="absolute bottom-3 right-3 left-3 sm:left-auto flex items-center gap-2">
                <a
                  href={getGoogleMapsNavUrl(selectedCenter.lat, selectedCenter.lng, selectedCenter.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-display font-black text-xs tracking-wider uppercase shadow-xl shadow-black/60 transition-transform active:scale-95"
                >
                  <Navigation className="w-4 h-4 fill-zinc-950" />
                  Start Navigation in Google Maps
                  <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
                </a>
              </div>
            </div>

            {/* Selected Location Detailed Inspection Card */}
            <div className="p-4 sm:p-5 bg-[#171b24] border-t border-[#262c38] space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-display font-bold text-base text-white">
                      {selectedCenter.name}
                    </h3>
                    {selectedCenter.isAuthorizedBajaj && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        <ShieldCheck className="w-3 h-3" />
                        Bajaj Authorised
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 mt-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    {selectedCenter.address}, {selectedCenter.city} ({selectedCenter.district})
                  </p>
                </div>

                {selectedCenter.distanceKm !== undefined && (
                  <div className="text-right shrink-0 bg-[#0e1117] border border-[#2a3040] px-3 py-1.5 rounded-xl">
                    <div className="text-xs font-mono font-bold text-amber-400">
                      {selectedCenter.distanceKm} km away
                    </div>
                    <div className="text-[10px] text-zinc-400">
                      ~{Math.round((selectedCenter.distanceKm / 45) * 60)} mins ride
                    </div>
                  </div>
                )}
              </div>

              {/* Contact, Hours & Services Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-zinc-300 pt-2 border-t border-[#242936]">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <a
                    href={`tel:${selectedCenter.phone}`}
                    className="hover:text-amber-300 font-mono hover:underline"
                  >
                    {selectedCenter.phone}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{selectedCenter.openingHours}</span>
                </div>
              </div>

              {/* Services Rendered */}
              <div className="pt-2">
                <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Available Services & Facilities:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCenter.servicesOffered.map((srv, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] px-2.5 py-0.5 rounded-lg bg-[#1e232e] text-zinc-300 border border-[#2e3544]"
                    >
                      {srv}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (5 cols): Directory, Search, Filters & Emergency Hotlines */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          {/* Search & Category Filter */}
          <div className="bg-[#14171e] border border-[#262c38] rounded-2xl p-4 shadow-xl space-y-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search city (e.g., Kurunegala, Colombo)..."
                className="w-full bg-[#0d0f15] border border-[#262c38] focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-zinc-500 transition-all font-sans"
              />
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {[
                { id: 'all', label: 'All Centers' },
                { id: 'dealer', label: 'Bajaj Dealers' },
                { id: 'fuel', label: 'Octane 95 Fuel' },
                { id: 'emergency', label: '24/7 Breakdown' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    activeCategory === cat.id
                      ? 'bg-amber-500 text-zinc-950 font-bold'
                      : 'bg-zinc-800/60 text-zinc-400 hover:text-white border border-zinc-700/50'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Service Centers List */}
          <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
            {filteredCenters.length === 0 ? (
              <div className="p-8 text-center bg-[#14171e] border border-[#262c38] rounded-2xl text-zinc-500 text-xs">
                No service centers matching "{searchQuery}"
              </div>
            ) : (
              filteredCenters.map((center) => {
                const isSelected = selectedCenter.id === center.id;
                return (
                  <div
                    key={center.id}
                    onClick={() => setSelectedCenter(center)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative group ${
                      isSelected
                        ? 'bg-gradient-to-r from-amber-500/10 via-[#1c212d] to-[#14171e] border-amber-500/50 shadow-lg'
                        : 'bg-[#14171e] border-[#242a36] hover:bg-[#181d27] hover:border-[#353d4f]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`font-semibold text-xs truncate ${
                              isSelected ? 'text-amber-300 font-bold' : 'text-zinc-200'
                            }`}
                          >
                            {center.name}
                          </span>
                          {center.isAuthorizedBajaj && (
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                              OEM
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                          {center.city} · {center.district}
                        </p>
                      </div>

                      {/* Distance or Pin Icon */}
                      <div className="text-right shrink-0">
                        {center.distanceKm !== undefined ? (
                          <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                            {center.distanceKm} km
                          </span>
                        ) : (
                          <div className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-amber-400">
                            <Navigation className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer Row in Card */}
                    <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-2.5 pt-2 border-t border-[#202532]">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-zinc-500" />
                        {center.phone}
                      </span>

                      <div className="flex items-center gap-2">
                        <a
                          href={getGoogleMapsNavUrl(center.lat, center.lng, center.name)}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-amber-400 hover:text-amber-300 hover:underline flex items-center gap-0.5 font-medium"
                        >
                          Directions →
                        </a>

                        {isAdmin && !INITIAL_SERVICE_CENTERS.some((ic) => ic.id === center.id) && (
                          <button
                            onClick={(e) => handleDeleteCenter(center.id, e)}
                            className="text-red-400 hover:text-red-300 p-1"
                            title="Delete custom center"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Emergency 24/7 Breakdown Assistance Card */}
          <div className="bg-gradient-to-br from-red-950/30 to-[#171a22] border border-red-500/30 rounded-2xl p-4 shadow-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-red-400 font-display font-bold text-xs">
                <AlertTriangle className="w-4 h-4" />
                <span>24/7 ROADSIDE EMERGENCY ASSISTANCE</span>
              </div>
              <span className="text-[10px] font-mono text-zinc-400">Islandwide</span>
            </div>
            <p className="text-[11px] text-zinc-300 leading-relaxed">
              If your Pulsar N160 experiences a puncture, electrical issue, or mechanical breakdown on the road:
            </p>
            <div className="flex items-center gap-2 pt-1">
              <a
                href="tel:+94114700700"
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-all shadow-md cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5" />
                Call Breakdown Hotline (+94 11 470 0700)
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ADMIN MODAL: Add Custom Workshop Pin */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#171b24] border border-[#2e3646] rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#252c3a] pb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-amber-400" />
                <h3 className="font-display font-bold text-base text-white">
                  Add Custom Service Location Pin
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-zinc-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCenter} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">
                  Workshop / Center Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sachi Custom Garage & Tuning"
                  value={newCenter.name}
                  onChange={(e) => setNewCenter({ ...newCenter, name: e.target.value })}
                  className="w-full bg-[#0c0e14] border border-[#2a3040] rounded-xl px-3 py-2 text-white focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Category</label>
                  <select
                    value={newCenter.category}
                    onChange={(e) =>
                      setNewCenter({ ...newCenter, category: e.target.value as CenterCategory })
                    }
                    className="w-full bg-[#0c0e14] border border-[#2a3040] rounded-xl px-3 py-2 text-white focus:border-amber-400"
                  >
                    <option value="dealer">Bajaj Dealer / Authorized</option>
                    <option value="mechanic">Specialized Motorcycle Mechanic</option>
                    <option value="spare_parts">Spare Parts Shop</option>
                    <option value="fuel">Fuel Station</option>
                    <option value="emergency">Emergency Towing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">City / Town *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kurunegala"
                    value={newCenter.city}
                    onChange={(e) => setNewCenter({ ...newCenter, city: e.target.value })}
                    className="w-full bg-[#0c0e14] border border-[#2a3040] rounded-xl px-3 py-2 text-white focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Street Address</label>
                <input
                  type="text"
                  placeholder="e.g. Colombo Road, Kurunegala"
                  value={newCenter.address}
                  onChange={(e) => setNewCenter({ ...newCenter, address: e.target.value })}
                  className="w-full bg-[#0c0e14] border border-[#2a3040] rounded-xl px-3 py-2 text-white focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">
                    Latitude (e.g. 7.4863) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="7.4863"
                    value={newCenter.lat}
                    onChange={(e) => setNewCenter({ ...newCenter, lat: e.target.value })}
                    className="w-full bg-[#0c0e14] border border-[#2a3040] rounded-xl px-3 py-2 text-white font-mono focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">
                    Longitude (e.g. 80.3623) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="80.3623"
                    value={newCenter.lng}
                    onChange={(e) => setNewCenter({ ...newCenter, lng: e.target.value })}
                    className="w-full bg-[#0c0e14] border border-[#2a3040] rounded-xl px-3 py-2 text-white font-mono focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+94 37 123 4567"
                    value={newCenter.phone}
                    onChange={(e) => setNewCenter({ ...newCenter, phone: e.target.value })}
                    className="w-full bg-[#0c0e14] border border-[#2a3040] rounded-xl px-3 py-2 text-white focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Opening Hours</label>
                  <input
                    type="text"
                    placeholder="8:00 AM - 5:30 PM"
                    value={newCenter.openingHours}
                    onChange={(e) => setNewCenter({ ...newCenter, openingHours: e.target.value })}
                    className="w-full bg-[#0c0e14] border border-[#2a3040] rounded-xl px-3 py-2 text-white focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#252c3a]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold"
                >
                  Save Location Pin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
