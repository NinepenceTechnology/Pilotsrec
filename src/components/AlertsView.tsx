import React, { useState, useEffect } from 'react';
import { 
  AlertOctagon, 
  AlertTriangle, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  Power, 
  Edit3, 
  Trash2, 
  Wind, 
  Compass, 
  Anchor, 
  ShieldAlert, 
  Clock, 
  MapPin, 
  X, 
  Check, 
  Search,
  Filter,
  Radio,
  Wifi,
  WifiOff,
  RefreshCw
} from 'lucide-react';
import { useMaritime } from '../context/MaritimeContext';
import { MaritimeAlert, AlertCategory, AlertSeverity } from '../types/maritime';

export const AlertsView: React.FC = () => {
  const { 
    alerts, 
    addAlert, 
    updateAlert, 
    toggleAlertActive, 
    deleteAlert,
    isOnline,
    isRealtimeConnected,
    activeSyncDevices,
    lastSyncTime,
    refreshAlertsNow
  } = useMaritime();

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleManualSync = async () => {
    setIsRefreshing(true);
    await refreshAlertsNow();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAlert, setEditingAlert] = useState<MaritimeAlert | null>(null);

  // Draft backup state
  const ALERT_DRAFT_KEY = 'pilots_records_alert_form_draft_v2';
  const [hasRestoredDraft, setHasRestoredDraft] = useState<boolean>(false);
  const [draftToast, setDraftToast] = useState<string | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<AlertCategory>('canal_navegacao');
  const [formSeverity, setFormSeverity] = useState<AlertSeverity>('alta');
  const [formLocation, setFormLocation] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formActionRequired, setFormActionRequired] = useState('');
  const [formIssuedBy, setFormIssuedBy] = useState('Capitania dos Portos / VTS');
  const [formValidUntil, setFormValidUntil] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);

  // Auto-save draft in background when modal is open and user is typing
  useEffect(() => {
    if (!isModalOpen || editingAlert) return;
    if (!formTitle && !formDescription && !formLocation && !formActionRequired) return;

    const timer = setTimeout(() => {
      try {
        localStorage.setItem(ALERT_DRAFT_KEY, JSON.stringify({
          formTitle,
          formCategory,
          formSeverity,
          formLocation,
          formDescription,
          formActionRequired,
          formIssuedBy,
          formValidUntil,
          formIsActive,
          savedAt: new Date().toISOString()
        }));
      } catch {}
    }, 500);

    return () => clearTimeout(timer);
  }, [isModalOpen, editingAlert, formTitle, formCategory, formSeverity, formLocation, formDescription, formActionRequired, formIssuedBy, formValidUntil, formIsActive]);

  const openNewModal = () => {
    setEditingAlert(null);
    setHasRestoredDraft(false);

    // Check if there is an unsaved draft
    try {
      const raw = localStorage.getItem(ALERT_DRAFT_KEY);
      if (raw) {
        const draft = JSON.parse(raw);
        if (draft && (draft.formTitle || draft.formDescription || draft.formLocation)) {
          setFormTitle(draft.formTitle || '');
          setFormCategory(draft.formCategory || 'canal_navegacao');
          setFormSeverity(draft.formSeverity || 'alta');
          setFormLocation(draft.formLocation || '');
          setFormDescription(draft.formDescription || '');
          setFormActionRequired(draft.formActionRequired || '');
          setFormIssuedBy(draft.formIssuedBy || 'Capitania dos Portos / VTS');
          setFormValidUntil(draft.formValidUntil || '');
          setFormIsActive(draft.formIsActive ?? true);
          setHasRestoredDraft(true);
          setIsModalOpen(true);
          return;
        }
      }
    } catch {}

    setFormTitle('');
    setFormCategory('canal_navegacao');
    setFormSeverity('alta');
    setFormLocation('');
    setFormDescription('');
    setFormActionRequired('');
    setFormIssuedBy('Capitania dos Portos / VTS');
    setFormValidUntil('');
    setFormIsActive(true);
    setIsModalOpen(true);
  };

  const discardAlertDraft = () => {
    try {
      localStorage.removeItem(ALERT_DRAFT_KEY);
    } catch {}
    setHasRestoredDraft(false);
    setFormTitle('');
    setFormLocation('');
    setFormDescription('');
    setFormActionRequired('');
  };

  const handleManualSaveAlertDraft = () => {
    try {
      localStorage.setItem(ALERT_DRAFT_KEY, JSON.stringify({
        formTitle,
        formCategory,
        formSeverity,
        formLocation,
        formDescription,
        formActionRequired,
        formIssuedBy,
        formValidUntil,
        formIsActive,
        savedAt: new Date().toISOString()
      }));
      setDraftToast('Backup do rascunho guardado com sucesso.');
      setTimeout(() => setDraftToast(null), 3500);
    } catch {}
  };

  const openEditModal = (alert: MaritimeAlert) => {
    setEditingAlert(alert);
    setHasRestoredDraft(false);
    setFormTitle(alert.title);
    setFormCategory(alert.category);
    setFormSeverity(alert.severity);
    setFormLocation(alert.location || '');
    setFormDescription(alert.description);
    setFormActionRequired(alert.actionRequired || '');
    setFormIssuedBy(alert.issuedBy);
    setFormValidUntil(alert.validUntil ? alert.validUntil.slice(0, 16) : '');
    setFormIsActive(alert.isActive);
    setIsModalOpen(true);
  };

  const handleSaveAlert = (e: React.FormEvent) => {
    e.preventDefault();
    // Aceita salvar/guardar informações mesmo quando não estão preenchidas no total
    const effectiveTitle = formTitle.trim() || 'Alerta Operacional Geral';
    const effectiveDescription = formDescription.trim() || (formLocation.trim() ? `Restrição reportada em ${formLocation.trim()}` : 'Alerta operacional registrado.');

    if (editingAlert) {
      updateAlert(editingAlert.id, {
        title: effectiveTitle,
        category: formCategory,
        severity: formSeverity,
        location: formLocation.trim() || undefined,
        description: effectiveDescription,
        actionRequired: formActionRequired.trim() || undefined,
        issuedBy: formIssuedBy.trim() || 'Capitania dos Portos / VTS',
        validUntil: formValidUntil ? new Date(formValidUntil).toISOString() : undefined,
        isActive: formIsActive
      });
    } else {
      addAlert({
        title: effectiveTitle,
        category: formCategory,
        severity: formSeverity,
        location: formLocation.trim() || undefined,
        description: effectiveDescription,
        actionRequired: formActionRequired.trim() || undefined,
        issuedBy: formIssuedBy.trim() || 'Capitania dos Portos / VTS',
        validUntil: formValidUntil ? new Date(formValidUntil).toISOString() : undefined,
        isActive: formIsActive
      });
      // Limpar rascunho após salvar
      try {
        localStorage.removeItem(ALERT_DRAFT_KEY);
      } catch {}
    }

    setIsModalOpen(false);
  };

  // Filter calculations
  const filteredAlerts = alerts.filter(a => {
    if (filterStatus === 'active' && !a.isActive) return false;
    if (filterStatus === 'inactive' && a.isActive) return false;
    if (filterCategory !== 'all' && a.category !== filterCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        a.title.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        (a.location && a.location.toLowerCase().includes(q)) ||
        a.issuedBy.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const activeCount = alerts.filter(a => a.isActive).length;
  const inactiveCount = alerts.filter(a => !a.isActive).length;

  const getCategoryIcon = (category: AlertCategory) => {
    switch (category) {
      case 'meteorologico':
        return <Wind className="w-4 h-4 text-sky-600" />;
      case 'canal_navegacao':
        return <Compass className="w-4 h-4 text-blue-600" />;
      case 'berco_porto':
        return <Anchor className="w-4 h-4 text-emerald-600" />;
      case 'operacional':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case 'seguranca':
        return <ShieldAlert className="w-4 h-4 text-rose-600" />;
      default:
        return <AlertOctagon className="w-4 h-4 text-slate-600" />;
    }
  };

  const getCategoryLabel = (category: AlertCategory) => {
    switch (category) {
      case 'meteorologico': return 'Meteorologia / Vento';
      case 'canal_navegacao': return 'Canal de Acesso';
      case 'berco_porto': return 'Berço / Cais';
      case 'operacional': return 'Restrição Operacional';
      case 'seguranca': return 'Segurança Marítima';
    }
  };

  const getSeverityBadge = (severity: AlertSeverity) => {
    switch (severity) {
      case 'critica':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-red-100 text-red-800 border border-red-300">
            Crítica
          </span>
        );
      case 'alta':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-orange-100 text-orange-800 border border-orange-300">
            Alta
          </span>
        );
      case 'media':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300">
            Média
          </span>
        );
      case 'baixa':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-300">
            Informativa
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-900 text-white border border-black shadow-xs">
              <AlertOctagon className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Gestão de Alertas Portuários
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Avisos aos navegantes, restrições operacionais da barra e acionamento de segurança
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={openNewModal}
          className="px-4 py-2.5 rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-black text-xs sm:text-sm tracking-wide border-2 border-black flex items-center gap-2 shadow-md transition-all active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>NOVO ALERTA OPERACIONAL</span>
        </button>
      </div>

      {/* Multi-Device Real-Time Sync Status Banner */}
      <div className={`p-3.5 rounded-xl border-2 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
        isOnline
          ? isRealtimeConnected
            ? 'bg-emerald-50/90 border-emerald-500 text-emerald-950 shadow-xs'
            : 'bg-sky-50/90 border-sky-400 text-sky-950'
          : 'bg-amber-50 border-amber-400 text-amber-950'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg border ${
            isOnline
              ? isRealtimeConnected
                ? 'bg-emerald-600 text-white border-emerald-700'
                : 'bg-sky-600 text-white border-sky-700'
              : 'bg-amber-600 text-white border-amber-700'
          }`}>
            {isOnline ? (
              isRealtimeConnected ? (
                <Radio className="w-4 h-4 animate-pulse" />
              ) : (
                <Wifi className="w-4 h-4" />
              )
            ) : (
              <WifiOff className="w-4 h-4" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs sm:text-sm font-black tracking-tight">
                {isOnline
                  ? isRealtimeConnected
                    ? 'Sincronização em Tempo Real Ativa (Multi-Dispositivos)'
                    : 'Sincronização Online Ativa'
                  : 'Modo Offline - Alertas Armazenados Localmente'}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                isOnline
                  ? isRealtimeConnected
                    ? 'bg-emerald-200/80 text-emerald-900 border-emerald-400'
                    : 'bg-sky-200/80 text-sky-900 border-sky-400'
                  : 'bg-amber-200 text-amber-900 border-amber-400'
              }`}>
                {isOnline ? (isRealtimeConnected ? 'Ao Vivo (Push SSE)' : 'Conectado') : 'Offline'}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              {isOnline
                ? `Qualquer alerta criado, editado ou desativado é transmitido instantaneamente para todos os utilizadores (${activeSyncDevices} dispositivo${activeSyncDevices > 1 ? 's' : ''} sincronizado${activeSyncDevices > 1 ? 's' : ''}${lastSyncTime ? ` · Última sync: ${lastSyncTime}` : ''}).`
                : 'Os alertas criados no dispositivo serão automaticamente transmitidos para os outros práticos quando a ligação retornar.'}
            </p>
          </div>
        </div>

        <button
          onClick={handleManualSync}
          disabled={isRefreshing}
          className="self-end sm:self-center px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-800 border-2 border-black font-bold text-xs flex items-center gap-1.5 shadow-xs transition-transform active:scale-95 shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-700' : ''}`} />
          <span>{isRefreshing ? 'Sincronizando...' : 'Sincronizar Agora'}</span>
        </button>
      </div>

      {/* Stats and Filter Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white border-2 border-black rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase">Alertas Ativos</span>
            <div className="text-2xl font-black text-rose-700 flex items-center gap-2">
              <span>{activeCount}</span>
              {activeCount > 0 && (
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
              )}
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
          </div>
        </div>

        <div className="bg-white border-2 border-black rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase">Alertas Desativados</span>
            <div className="text-2xl font-black text-slate-700">
              {inactiveCount}
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-300 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-slate-500" />
          </div>
        </div>

        <div className="bg-white border-2 border-black rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase">Total de Avisos</span>
            <div className="text-2xl font-black text-blue-900">
              {alerts.length}
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5 text-blue-900" />
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white border-2 border-black rounded-xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Pesquisar por título, local, autoridade ou descrição..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs font-medium border border-slate-300 rounded-lg focus:outline-none focus:border-blue-900"
            />
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 shrink-0">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1 text-xs font-bold rounded ${
                filterStatus === 'all' ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-600 hover:text-black'
              }`}
            >
              Todos ({alerts.length})
            </button>
            <button
              onClick={() => setFilterStatus('active')}
              className={`px-3 py-1 text-xs font-bold rounded ${
                filterStatus === 'active' ? 'bg-rose-700 text-white shadow-xs' : 'text-slate-600 hover:text-black'
              }`}
            >
              Ativos ({activeCount})
            </button>
            <button
              onClick={() => setFilterStatus('inactive')}
              className={`px-3 py-1 text-xs font-bold rounded ${
                filterStatus === 'inactive' ? 'bg-slate-700 text-white shadow-xs' : 'text-slate-600 hover:text-black'
              }`}
            >
              Inativos ({inactiveCount})
            </button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-500 font-bold shrink-0 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Categoria:
          </span>
          {[
            { id: 'all', label: 'Todas' },
            { id: 'canal_navegacao', label: 'Canal de Acesso' },
            { id: 'meteorologico', label: 'Meteorologia' },
            { id: 'berco_porto', label: 'Berço / Cais' },
            { id: 'operacional', label: 'Operacional' },
            { id: 'seguranca', label: 'Segurança' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id)}
              className={`px-2.5 py-1 rounded-md font-bold whitespace-nowrap border transition-all ${
                filterCategory === cat.id
                  ? 'bg-blue-900 text-white border-black shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-black'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="bg-white border-2 border-black rounded-xl p-12 text-center shadow-sm">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900">Nenhum alerta encontrado</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Não existem alertas correspondentes aos filtros selecionados. Crie um novo aviso clicando no botão acima.
            </p>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`bg-white border-2 rounded-xl p-4 sm:p-5 shadow-sm transition-all ${
                alert.isActive 
                  ? 'border-black hover:shadow-md' 
                  : 'border-slate-300 opacity-75 bg-slate-50'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`p-2.5 rounded-lg border shrink-0 ${
                    alert.isActive ? 'bg-amber-50 border-amber-300' : 'bg-slate-100 border-slate-300'
                  }`}>
                    {getCategoryIcon(alert.category)}
                  </div>

                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm sm:text-base font-black text-slate-950">
                        {alert.title}
                      </h4>
                      {getSeverityBadge(alert.severity)}
                      <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {getCategoryLabel(alert.category)}
                      </span>
                    </div>

                    {alert.location && (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
                        <MapPin className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                        <span>Local: {alert.location}</span>
                      </div>
                    )}

                    <p className="text-xs text-slate-700 leading-relaxed pt-1">
                      {alert.description}
                    </p>

                    {alert.actionRequired && (
                      <div className="bg-amber-50 border-l-4 border-amber-500 p-2.5 rounded-r text-xs text-amber-950 font-medium mt-2">
                        <strong>Conduta para os Pilotos:</strong> {alert.actionRequired}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                      <span><strong>Emitido por:</strong> {alert.issuedBy}</span>
                      <span><strong>Data:</strong> {new Date(alert.issuedAt).toLocaleString('pt-PT')}</span>
                      {alert.validUntil && (
                        <span><strong>Válido até:</strong> {new Date(alert.validUntil).toLocaleString('pt-PT')}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Acionamento (Ativar / Desativar) & Actions */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-600">
                      {alert.isActive ? 'Ativo' : 'Desativado'}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleAlertActive(alert.id)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        alert.isActive ? 'bg-emerald-600' : 'bg-slate-300'
                      }`}
                      title={alert.isActive ? 'Clique para Desativar Alerta' : 'Clique para Ativar Alerta'}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          alert.isActive ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5 mt-1">
                    <button
                      onClick={() => openEditModal(alert)}
                      className="p-1.5 rounded-lg border border-slate-300 hover:border-black hover:bg-slate-100 text-slate-700"
                      title="Editar detalhes do alerta"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Remover permanentemente o alerta "${alert.title}"?`)) {
                          deleteAlert(alert.id);
                        }
                      }}
                      className="p-1.5 rounded-lg border border-rose-200 hover:border-rose-500 hover:bg-rose-50 text-rose-600"
                      title="Excluir alerta"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Formulário de Detalhes do Alerta */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white border-2 border-black rounded-xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col text-slate-900 my-auto">
            {/* Modal Header */}
            <div className="bg-blue-900 text-white px-5 py-3.5 border-b-2 border-black flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertOctagon className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-black uppercase">
                  {editingAlert ? 'Editar Alerta Portuário' : 'Novo Alerta de Pilotagem & Porto'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded text-white/80 hover:text-white hover:bg-blue-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveAlert} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              
              {/* BANNER DE RESGATE DE RASCUNHO */}
              {hasRestoredDraft && (
                <div className="bg-amber-50 border border-amber-400 rounded-lg p-3 flex items-center justify-between gap-2 shadow-xs">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-700 shrink-0" />
                    <p className="text-[11px] text-amber-900 font-bold">
                      Rascunho recuperado automaticamente do backup anterior.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={discardAlertDraft}
                    className="text-[10px] font-bold px-2 py-1 bg-white hover:bg-amber-100 text-amber-950 border border-amber-300 rounded shadow-xs"
                  >
                    Descartar
                  </button>
                </div>
              )}

              {draftToast && (
                <div className="p-2 bg-emerald-50 border border-emerald-400 text-emerald-950 text-xs font-bold rounded">
                  {draftToast}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Título do Alerta
                </label>
                <input
                  type="text"
                  placeholder="Ex: Restrição de Calado por Ressaca ou Manutenção de Bóia"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-blue-900 font-bold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Categoria *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as AlertCategory)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-blue-900 bg-white"
                  >
                    <option value="canal_navegacao">Canal de Navegação / Barra</option>
                    <option value="meteorologico">Meteorologia / Vento / Maré</option>
                    <option value="berco_porto">Berço / Terminal Portuário</option>
                    <option value="operacional">Restrição Operacional / Rebocadores</option>
                    <option value="seguranca">Segurança Marítima / SOLAS</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Severidade *
                  </label>
                  <select
                    value={formSeverity}
                    onChange={(e) => setFormSeverity(e.target.value as AlertSeverity)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-blue-900 bg-white font-bold"
                  >
                    <option value="critica">Crítica (Interrupção Imediata)</option>
                    <option value="alta">Alta (Restrição com Condicionantes)</option>
                    <option value="media">Média (Atenção / Rebocadores Extras)</option>
                    <option value="baixa">Informativa (Aviso Geral)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Localização Afetada
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Canal de Acesso Bóia 04, Berço 101"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-blue-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Autoridade Emissora
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Capitania dos Portos, VTS, Pilotagem"
                    value={formIssuedBy}
                    onChange={(e) => setFormIssuedBy(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-blue-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Descrição Detalhada do Alerta
                </label>
                <textarea
                  rows={3}
                  placeholder="Descreva as condições observadas, causa técnica ou instrução regulamentar..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-blue-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Conduta / Procedimento Recomendado aos Pilotos
                </label>
                <input
                  type="text"
                  placeholder="Ex: Utilizar obrigatoriamente 2 rebocadores ASD; velocidade máx. 5 nós"
                  value={formActionRequired}
                  onChange={(e) => setFormActionRequired(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-blue-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Válido Até (Opcional)
                  </label>
                  <input
                    type="datetime-local"
                    value={formValidUntil}
                    onChange={(e) => setFormValidUntil(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-blue-900"
                  />
                </div>

                <div className="flex items-center gap-3 pt-5">
                  <input
                    type="checkbox"
                    id="formIsActive"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="w-4 h-4 text-blue-900 rounded border-slate-300 focus:ring-blue-900"
                  />
                  <label htmlFor="formIsActive" className="text-xs font-bold text-slate-800 cursor-pointer">
                    Ativar alerta imediatamente
                  </label>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={handleManualSaveAlertDraft}
                  className="px-3 py-2 text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-300 flex items-center gap-1.5"
                  title="Salvar rascunho de backup"
                >
                  <Clock className="w-3.5 h-3.5 text-amber-700" />
                  <span>Guardar Rascunho / Backup</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-300"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-black text-white bg-blue-900 hover:bg-blue-800 rounded-lg border border-black shadow"
                  >
                    {editingAlert ? 'Salvar Alterações' : 'Salvar Alerta (Aceita Parcial)'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
