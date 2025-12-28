// FiveM NUI Callbacks Utilities - VRPex Framework
// Este arquivo contém todas as funções para comunicação com o client-side do FiveM

declare global {
  interface Window {
    GetParentResourceName?: () => string;
  }
}

/**
 * Obtém o nome do resource FiveM
 */
export const getResourceName = (): string => {
  return window.GetParentResourceName?.() || 'police-tablet';
};

/**
 * Verifica se está rodando dentro do FiveM
 */
export const isInFiveM = (): boolean => {
  return typeof window.GetParentResourceName === 'function';
};

/**
 * Envia uma callback NUI para o client-side do FiveM (VRPex)
 * @param event Nome do evento/callback
 * @param data Dados a serem enviados
 * @returns Promise com a resposta do server
 */
export async function nuiCallback<T = unknown, R = unknown>(
  event: string,
  data?: T
): Promise<R> {
  if (!isInFiveM()) {
    console.log(`[DEV MODE] NUI Callback: ${event}`, data);
    return {} as R;
  }

  const resourceName = getResourceName();

  try {
    const response = await fetch(`https://${resourceName}/${event}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data || {}),
    });

    if (!response.ok) {
      throw new Error(`NUI Callback failed: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error(`[NUI] Error in callback ${event}:`, error);
    throw error;
  }
}

// ============================================
// TIPOS E INTERFACES PARA CALLBACKS
// ============================================

export interface PlayerData {
  id: number;
  visaId: string;
  name: string;
  rank: string;
  rankId: number;
  rankColor: string;
  isOnDuty: boolean;
  permissions: string[];
  phone: string;
}

export interface OfficerData {
  id: number;
  visaId: string;
  name: string;
  rank: string;
  rankId: number;
  rankColor: string;
  lastClockIn: string;
  isOnDuty: boolean;
  bulletinsCreated: number;
  isRecruiter: boolean;
  clockHistory: { type: 'in' | 'out'; date: string }[];
}

export interface PositionData {
  id: number;
  name: string;
  salary: string;
  officerCount: number;
  color: string;
  permissions: string[];
}

export interface OccurrenceData {
  id: number;
  title: string;
  date: string;
  requester: string;
  openedBy: string;
  openedAt: string;
  description?: string;
  status?: string;
  involvedOfficers?: number[];
}

export interface CitizenData {
  id: number;
  visaId: string;
  name: string;
  phone: string;
  registration: string;
  address?: string;
  criminal_record?: CriminalRecord[];
}

export interface CriminalRecord {
  id: number;
  article: string;
  date: string;
  officer: string;
  fine: number;
  jailTime: number;
}

export interface VehicleData {
  id: number;
  plate: string;
  model: string;
  owner: string;
  ownerVisaId: string;
  garage: string;
  status: string;
  irregular: boolean;
  irregularReason?: string;
}

export interface RecruitmentData {
  id: number;
  visaId: string;
  name: string;
  grade: number;
  status: string;
  updatedBy: string;
  updatedAt: string;
  notes?: string;
}

export interface PenalCodeData {
  id: number;
  article: string;
  title: string;
  description: string;
  penalty: string;
  fine: number;
  jailTime: number;
  category: string;
}

export interface AlertData {
  content: string;
  lastUpdate: string;
  updatedBy: string;
}

export interface StatsData {
  bulletins: number;
  officers: number;
  onDuty: number;
  activeRecruitments: number;
  pendingOccurrences: number;
}

export interface MissionData {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  assignedTo: number[];
  createdBy: number;
  createdAt: string;
  completedAt?: string;
  priority: 'low' | 'medium' | 'high';
}

// ============================================
// CALLBACKS - SISTEMA GERAL
// ============================================

/** Fecha o tablet */
export const closeTablet = () => nuiCallback('tablet:close');

/** Obtém dados do jogador logado */
export const getPlayerData = () => nuiCallback<void, PlayerData>('tablet:getPlayerData');

/** Obtém estatísticas gerais */
export const getStats = () => nuiCallback<void, StatsData>('tablet:getStats');

/** Verifica permissões do jogador */
export const checkPermission = (permission: string) => 
  nuiCallback<{ permission: string }, { hasPermission: boolean }>('tablet:checkPermission', { permission });

/** Obtém configurações do resource */
export const getConfig = () => nuiCallback<void, Record<string, unknown>>('tablet:getConfig');

// ============================================
// CALLBACKS - PONTO/SERVIÇO (VRPex)
// ============================================

/** Bate ponto de entrada */
export const clockIn = () => nuiCallback<void, { success: boolean; time: string }>('duty:clockIn');

/** Bate ponto de saída */
export const clockOut = () => nuiCallback<void, { success: boolean; time: string }>('duty:clockOut');

/** Obtém status do ponto atual */
export const getDutyStatus = () => nuiCallback<void, { isOnDuty: boolean; clockInTime?: string; totalTime?: string }>('duty:getStatus');

/** Obtém lista de oficiais em serviço */
export const getOnDutyOfficers = () => nuiCallback<void, OfficerData[]>('duty:getOnDutyOfficers');

/** Força ponto de outro oficial (admin) */
export const forceDuty = (visaId: string, status: boolean) =>
  nuiCallback<{ visaId: string; status: boolean }, { success: boolean }>('duty:force', { visaId, status });

// ============================================
// CALLBACKS - CARGOS/PATENTES (VRPex)
// ============================================

/** Obtém lista de cargos/patentes */
export const getPositions = () => nuiCallback<void, PositionData[]>('positions:getAll');

/** Atualiza permissões de um cargo */
export const updatePositionPermissions = (positionId: number, permissions: string[]) =>
  nuiCallback<{ positionId: number; permissions: string[] }, { success: boolean }>(
    'positions:updatePermissions',
    { positionId, permissions }
  );

/** Atualiza salário de um cargo */
export const updatePositionSalary = (positionId: number, salary: number) =>
  nuiCallback<{ positionId: number; salary: number }, { success: boolean }>(
    'positions:updateSalary',
    { positionId, salary }
  );

/** Cria novo cargo */
export const createPosition = (data: Omit<PositionData, 'id' | 'officerCount'>) =>
  nuiCallback<Omit<PositionData, 'id' | 'officerCount'>, { success: boolean; id: number }>(
    'positions:create',
    data
  );

/** Remove cargo */
export const deletePosition = (positionId: number) =>
  nuiCallback<{ positionId: number }, { success: boolean }>('positions:delete', { positionId });

// ============================================
// CALLBACKS - FUNCIONÁRIOS (VRPex)
// ============================================

/** Obtém lista de funcionários */
export const getEmployees = () => nuiCallback<void, OfficerData[]>('employees:getAll');

/** Obtém detalhes de um funcionário */
export const getEmployeeDetails = (visaId: string) =>
  nuiCallback<{ visaId: string }, OfficerData>('employees:getDetails', { visaId });

/** Altera patente de um funcionário */
export const updateEmployeeRank = (visaId: string, newRankId: number) =>
  nuiCallback<{ visaId: string; newRankId: number }, { success: boolean }>(
    'employees:updateRank',
    { visaId, newRankId }
  );

/** Alterna status de recrutador */
export const toggleRecruiter = (visaId: string) =>
  nuiCallback<{ visaId: string }, { success: boolean; isRecruiter: boolean }>(
    'employees:toggleRecruiter',
    { visaId }
  );

/** Exonera um funcionário */
export const dismissEmployee = (visaId: string, reason?: string) =>
  nuiCallback<{ visaId: string; reason?: string }, { success: boolean }>(
    'employees:dismiss',
    { visaId, reason }
  );

/** Obtém histórico de ponto de um funcionário */
export const getEmployeeClockHistory = (visaId: string) =>
  nuiCallback<{ visaId: string }, { type: 'in' | 'out'; date: string }[]>(
    'employees:getClockHistory',
    { visaId }
  );

/** Adiciona advertência a funcionário */
export const addEmployeeWarning = (visaId: string, reason: string) =>
  nuiCallback<{ visaId: string; reason: string }, { success: boolean }>(
    'employees:addWarning',
    { visaId, reason }
  );

/** Obtém advertências do funcionário */
export const getEmployeeWarnings = (visaId: string) =>
  nuiCallback<{ visaId: string }, { id: number; reason: string; date: string; issuedBy: string }[]>(
    'employees:getWarnings',
    { visaId }
  );

// ============================================
// CALLBACKS - OCORRÊNCIAS/BOLETINS (VRPex)
// ============================================

/** Obtém lista de ocorrências */
export const getOccurrences = () => nuiCallback<void, OccurrenceData[]>('occurrences:getAll');

/** Obtém detalhes de uma ocorrência */
export const getOccurrenceDetails = (occurrenceId: number) =>
  nuiCallback<{ occurrenceId: number }, OccurrenceData>('occurrences:getDetails', { occurrenceId });

/** Cria uma nova ocorrência */
export const createOccurrence = (data: Omit<OccurrenceData, 'id' | 'openedBy' | 'openedAt'>) =>
  nuiCallback<Omit<OccurrenceData, 'id' | 'openedBy' | 'openedAt'>, { success: boolean; id: number }>(
    'occurrences:create',
    data
  );

/** Atualiza uma ocorrência */
export const updateOccurrence = (occurrenceId: number, data: Partial<OccurrenceData>) =>
  nuiCallback<{ occurrenceId: number; data: Partial<OccurrenceData> }, { success: boolean }>(
    'occurrences:update',
    { occurrenceId, data }
  );

/** Exclui uma ocorrência */
export const deleteOccurrence = (occurrenceId: number) =>
  nuiCallback<{ occurrenceId: number }, { success: boolean }>(
    'occurrences:delete',
    { occurrenceId }
  );

/** Adiciona oficial envolvido na ocorrência */
export const addOccurrenceOfficer = (occurrenceId: number, visaId: string) =>
  nuiCallback<{ occurrenceId: number; visaId: string }, { success: boolean }>(
    'occurrences:addOfficer',
    { occurrenceId, visaId }
  );

/** Fecha/finaliza ocorrência */
export const closeOccurrence = (occurrenceId: number, resolution: string) =>
  nuiCallback<{ occurrenceId: number; resolution: string }, { success: boolean }>(
    'occurrences:close',
    { occurrenceId, resolution }
  );

// ============================================
// CALLBACKS - CIDADÃOS (VRPex)
// ============================================

/** Busca cidadãos por nome ou visa */
export const searchCitizens = (query: string) =>
  nuiCallback<{ query: string }, CitizenData[]>('citizens:search', { query });

/** Obtém todos os cidadãos */
export const getCitizens = () => nuiCallback<void, CitizenData[]>('citizens:getAll');

/** Obtém detalhes de um cidadão por visaId */
export const getCitizenDetails = (visaId: string) =>
  nuiCallback<{ visaId: string }, CitizenData>('citizens:getDetails', { visaId });

/** Atualiza informações de um cidadão */
export const updateCitizen = (visaId: string, data: Partial<CitizenData>) =>
  nuiCallback<{ visaId: string; data: Partial<CitizenData> }, { success: boolean }>(
    'citizens:update',
    { visaId, data }
  );

/** Adiciona ficha criminal */
export const addCriminalRecord = (visaId: string, record: Omit<CriminalRecord, 'id'>) =>
  nuiCallback<{ visaId: string; record: Omit<CriminalRecord, 'id'> }, { success: boolean; id: number }>(
    'citizens:addCriminalRecord',
    { visaId, record }
  );

/** Obtém ficha criminal */
export const getCriminalRecord = (visaId: string) =>
  nuiCallback<{ visaId: string }, CriminalRecord[]>('citizens:getCriminalRecord', { visaId });

/** Aplica multa */
export const applyFine = (visaId: string, article: string, value: number, reason: string) =>
  nuiCallback<{ visaId: string; article: string; value: number; reason: string }, { success: boolean }>(
    'citizens:applyFine',
    { visaId, article, value, reason }
  );

/** Aplica prisão */
export const applyJail = (visaId: string, article: string, time: number, reason: string) =>
  nuiCallback<{ visaId: string; article: string; time: number; reason: string }, { success: boolean }>(
    'citizens:applyJail',
    { visaId, article, time, reason }
  );

// ============================================
// CALLBACKS - VEÍCULOS (VRPex)
// ============================================

/** Busca veículos por placa */
export const searchVehicles = (plate: string) =>
  nuiCallback<{ plate: string }, VehicleData[]>('vehicles:search', { plate });

/** Obtém todos os veículos */
export const getVehicles = () => nuiCallback<void, VehicleData[]>('vehicles:getAll');

/** Obtém detalhes de um veículo */
export const getVehicleDetails = (plate: string) =>
  nuiCallback<{ plate: string }, VehicleData>('vehicles:getDetails', { plate });

/** Realiza vistoria em um veículo */
export const inspectVehicle = (plate: string, notes: string) =>
  nuiCallback<{ plate: string; notes: string }, { success: boolean }>(
    'vehicles:inspect',
    { plate, notes }
  );

/** Marca veículo como irregular */
export const markVehicleIrregular = (plate: string, reason: string) =>
  nuiCallback<{ plate: string; reason: string }, { success: boolean }>(
    'vehicles:markIrregular',
    { plate, reason }
  );

/** Remove irregularidade de veículo */
export const clearVehicleIrregular = (plate: string) =>
  nuiCallback<{ plate: string }, { success: boolean }>(
    'vehicles:clearIrregular',
    { plate }
  );

/** Apreende veículo */
export const seizeVehicle = (plate: string, reason: string) =>
  nuiCallback<{ plate: string; reason: string }, { success: boolean }>(
    'vehicles:seize',
    { plate, reason }
  );

/** Libera veículo apreendido */
export const releaseVehicle = (plate: string) =>
  nuiCallback<{ plate: string }, { success: boolean }>('vehicles:release', { plate });

// ============================================
// CALLBACKS - RECRUTAMENTO (VRPex)
// ============================================

/** Obtém lista de candidatos */
export const getRecruitments = () => nuiCallback<void, RecruitmentData[]>('recruitment:getAll');

/** Adiciona novo candidato */
export const addRecruitment = (visaId: string, name: string, notes?: string) =>
  nuiCallback<{ visaId: string; name: string; notes?: string }, { success: boolean; id: number }>(
    'recruitment:add',
    { visaId, name, notes }
  );

/** Atualiza status do candidato */
export const updateRecruitmentStatus = (recruitmentId: number, status: string, grade?: number) =>
  nuiCallback<{ recruitmentId: number; status: string; grade?: number }, { success: boolean }>(
    'recruitment:updateStatus',
    { recruitmentId, status, grade }
  );

/** Aprova candidato e contrata */
export const approveRecruitment = (recruitmentId: number) =>
  nuiCallback<{ recruitmentId: number }, { success: boolean }>(
    'recruitment:approve',
    { recruitmentId }
  );

/** Reprova candidato */
export const rejectRecruitment = (recruitmentId: number, reason?: string) =>
  nuiCallback<{ recruitmentId: number; reason?: string }, { success: boolean }>(
    'recruitment:reject',
    { recruitmentId, reason }
  );

/** Remove candidato */
export const deleteRecruitment = (recruitmentId: number) =>
  nuiCallback<{ recruitmentId: number }, { success: boolean }>(
    'recruitment:delete',
    { recruitmentId }
  );

// ============================================
// CALLBACKS - CÓDIGO PENAL (VRPex)
// ============================================

/** Obtém código penal completo */
export const getPenalCode = () => nuiCallback<void, PenalCodeData[]>('penalCode:getAll');

/** Obtém artigo específico */
export const getPenalCodeArticle = (article: string) =>
  nuiCallback<{ article: string }, PenalCodeData>('penalCode:getArticle', { article });

/** Adiciona novo artigo */
export const addPenalCode = (data: Omit<PenalCodeData, 'id'>) =>
  nuiCallback<Omit<PenalCodeData, 'id'>, { success: boolean; id: number }>(
    'penalCode:add',
    data
  );

/** Atualiza um artigo */
export const updatePenalCode = (codeId: number, data: Partial<PenalCodeData>) =>
  nuiCallback<{ codeId: number; data: Partial<PenalCodeData> }, { success: boolean }>(
    'penalCode:update',
    { codeId, data }
  );

/** Remove um artigo */
export const deletePenalCode = (codeId: number) =>
  nuiCallback<{ codeId: number }, { success: boolean }>(
    'penalCode:delete',
    { codeId }
  );

// ============================================
// CALLBACKS - AVISOS/ALERTAS (VRPex)
// ============================================

/** Obtém avisos atuais */
export const getAlerts = () => nuiCallback<void, AlertData>('alerts:get');

/** Atualiza avisos */
export const updateAlerts = (content: string) =>
  nuiCallback<{ content: string }, { success: boolean }>(
    'alerts:update',
    { content }
  );

// ============================================
// CALLBACKS - MISSÕES (VRPex)
// ============================================

/** Obtém lista de missões */
export const getMissions = () => nuiCallback<void, MissionData[]>('missions:getAll');

/** Obtém detalhes de uma missão */
export const getMissionDetails = (missionId: number) =>
  nuiCallback<{ missionId: number }, MissionData>('missions:getDetails', { missionId });

/** Cria uma nova missão */
export const createMission = (data: Omit<MissionData, 'id' | 'createdBy' | 'createdAt'>) =>
  nuiCallback<Omit<MissionData, 'id' | 'createdBy' | 'createdAt'>, { success: boolean; id: number }>(
    'missions:create',
    data
  );

/** Atualiza status de uma missão */
export const updateMissionStatus = (missionId: number, status: MissionData['status']) =>
  nuiCallback<{ missionId: number; status: MissionData['status'] }, { success: boolean }>(
    'missions:updateStatus',
    { missionId, status }
  );

/** Atribui oficiais a uma missão */
export const assignMission = (missionId: number, visaIds: string[]) =>
  nuiCallback<{ missionId: number; visaIds: string[] }, { success: boolean }>(
    'missions:assign',
    { missionId, visaIds }
  );

/** Remove oficial de uma missão */
export const unassignMission = (missionId: number, visaId: string) =>
  nuiCallback<{ missionId: number; visaId: string }, { success: boolean }>(
    'missions:unassign',
    { missionId, visaId }
  );

/** Deleta uma missão */
export const deleteMission = (missionId: number) =>
  nuiCallback<{ missionId: number }, { success: boolean }>('missions:delete', { missionId });

// ============================================
// CALLBACKS - RÁDIO/COMUNICAÇÃO (VRPex)
// ============================================

/** Envia mensagem para todos em serviço */
export const broadcastMessage = (message: string) =>
  nuiCallback<{ message: string }, { success: boolean }>('radio:broadcast', { message });

/** Envia alerta de emergência */
export const sendEmergencyAlert = (type: string, location: string, details: string) =>
  nuiCallback<{ type: string; location: string; details: string }, { success: boolean }>(
    'radio:emergency',
    { type, location, details }
  );

/** Solicita reforços */
export const requestBackup = (location: string, priority: 'low' | 'medium' | 'high') =>
  nuiCallback<{ location: string; priority: string }, { success: boolean }>(
    'radio:backup',
    { location, priority }
  );

// ============================================
// CALLBACKS - LOGS/AUDITORIA (VRPex)
// ============================================

/** Obtém logs de ações */
export const getLogs = (filter?: { action?: string; visaId?: string; startDate?: string; endDate?: string }) =>
  nuiCallback<{ filter?: { action?: string; visaId?: string; startDate?: string; endDate?: string } }, { id: number; action: string; visaId: string; details: string; date: string }[]>(
    'logs:getAll',
    { filter }
  );

// ============================================
// LISTENER DE MENSAGENS DO CLIENT (VRPex)
// ============================================

export type NUIMessageHandler = (data: unknown) => void;

const messageHandlers = new Map<string, Set<NUIMessageHandler>>();

/**
 * Registra um listener para mensagens do client-side
 */
export const onNUIMessage = (event: string, handler: NUIMessageHandler): (() => void) => {
  if (!messageHandlers.has(event)) {
    messageHandlers.set(event, new Set());
  }
  messageHandlers.get(event)!.add(handler);

  // Retorna função de cleanup
  return () => {
    messageHandlers.get(event)?.delete(handler);
  };
};

// Listener global para mensagens do FiveM (VRPex)
if (typeof window !== 'undefined') {
  window.addEventListener('message', (event: MessageEvent) => {
    const { type, ...data } = event.data || {};
    
    if (type && messageHandlers.has(type)) {
      messageHandlers.get(type)?.forEach(handler => handler(data));
    }
  });
}
