import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MaritimeProvider, useMaritime } from './context/MaritimeContext';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { OperationsView } from './components/OperationsView';
import { VesselsView } from './components/VesselsView';
import { PilotsView } from './components/PilotsView';
import { IncidentsView } from './components/IncidentsView';
import { PerformanceView } from './components/PerformanceView';
import { SafetyChecklistView } from './components/SafetyChecklistView';
import { ReportsView } from './components/ReportsView';
import { AlertsView } from './components/AlertsView';
import { TideCalculatorView } from './components/TideCalculatorView';
import { DeviceTestView } from './components/DeviceTestView';
import { HealthView } from './components/HealthView';
import { ArchiveView } from './components/ArchiveView';
import { MobileBottomNav } from './components/MobileBottomNav';
import { MobilePilotLogView } from './components/MobilePilotLogView';
import { ManeuverFormModal } from './components/ManeuverFormModal';
import { ManeuverDetailModal } from './components/ManeuverDetailModal';
import { PilotRegistrationModal } from './components/PilotRegistrationModal';
import { Vessel, ManeuverRecord } from './types/maritime';

const AppContent: React.FC = () => {
  const { currentView, setCurrentView, isMobileHudOpen, setIsMobileHudOpen } = useMaritime();

  // Modals state
  const [isNewManeuverModalOpen, setIsNewManeuverModalOpen] = useState(false);
  const [selectedVesselForManeuver, setSelectedVesselForManeuver] = useState<Vessel | null>(null);
  const [editingManeuver, setEditingManeuver] = useState<ManeuverRecord | null>(null);
  const [detailManeuverId, setDetailManeuverId] = useState<string | null>(null);

  const handleOpenNewManeuver = (vessel?: Vessel) => {
    setSelectedVesselForManeuver(vessel || null);
    setEditingManeuver(null);
    setIsNewManeuverModalOpen(true);
  };

  const handleEditManeuver = (maneuver: ManeuverRecord) => {
    setEditingManeuver(maneuver);
    setSelectedVesselForManeuver(null);
    setIsNewManeuverModalOpen(true);
  };

  const handleOpenCertificate = (maneuverId: string) => {
    setDetailManeuverId(null);
    setCurrentView('relatorios');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-blue-900 selection:text-white">
      {/* Top Main Navigation Header */}
      <Header onOpenNewManeuverModal={() => handleOpenNewManeuver()} />

      {/* Main Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            {currentView === 'dashboard' && (
              <DashboardView
                onOpenNewManeuverModal={() => handleOpenNewManeuver()}
                onViewManeuverDetail={(id) => setDetailManeuverId(id)}
              />
            )}

            {currentView === 'operacoes' && (
              <OperationsView
                onOpenNewManeuverModal={() => handleOpenNewManeuver()}
                onViewManeuverDetail={(id) => setDetailManeuverId(id)}
                onOpenCertificate={handleOpenCertificate}
                onEditManeuver={handleEditManeuver}
              />
            )}

            {currentView === 'navios' && (
              <VesselsView
                onSelectVesselForManeuver={(vessel) => handleOpenNewManeuver(vessel)}
              />
            )}

            {currentView === 'pilotos' && (
              <PilotsView />
            )}

            {currentView === 'cancelamentos' && (
              <IncidentsView />
            )}

            {currentView === 'performance' && (
              <PerformanceView />
            )}

            {currentView === 'seguranca' && (
              <SafetyChecklistView />
            )}

            {currentView === 'mares' && (
              <TideCalculatorView />
            )}

            {currentView === 'saude' && (
              <HealthView />
            )}

            {currentView === 'arquivo' && (
              <ArchiveView />
            )}

            {currentView === 'testes' && (
              <DeviceTestView />
            )}

            {currentView === 'mobile_quicklog' && (
              <MobilePilotLogView onClose={() => setCurrentView('operacoes')} />
            )}

            {currentView === 'relatorios' && (
              <ReportsView />
            )}

            {currentView === 'alertas' && (
              <AlertsView />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Navigation Bar (visible on smartphones & small screens) */}
      <MobileBottomNav onOpenNewManeuver={() => handleOpenNewManeuver()} />

      {/* Mobile Pilot On-Board QuickLog HUD (Drawer / Modal) */}
      <AnimatePresence>
        {isMobileHudOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md p-3 sm:p-5 overflow-y-auto flex items-start justify-center"
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="w-full max-w-2xl my-auto"
            >
              <MobilePilotLogView onClose={() => setIsMobileHudOpen(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New / Edit Maneuver Modal */}
      <ManeuverFormModal
        isOpen={isNewManeuverModalOpen}
        onClose={() => {
          setIsNewManeuverModalOpen(false);
          setSelectedVesselForManeuver(null);
          setEditingManeuver(null);
        }}
        initialVessel={selectedVesselForManeuver}
        editManeuver={editingManeuver}
      />

      {/* Maneuver Details Modal */}
      <ManeuverDetailModal
        maneuverId={detailManeuverId}
        onClose={() => setDetailManeuverId(null)}
        onOpenCertificate={handleOpenCertificate}
        onEditManeuver={handleEditManeuver}
      />

      {/* Pilot Registration & Profile Gate Modal */}
      <PilotRegistrationModal />
    </div>
  );
};

export default function App() {
  return (
    <MaritimeProvider>
      <AppContent />
    </MaritimeProvider>
  );
}
