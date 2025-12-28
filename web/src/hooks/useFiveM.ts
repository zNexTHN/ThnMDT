// Hooks personalizados para integração FiveM
import { useEffect, useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  isInFiveM,
  onNUIMessage,
  getPlayerData,
  getStats,
  getDutyStatus,
  clockIn,
  clockOut,
  getOnDutyOfficers,
  getPositions,
  updatePositionPermissions,
  getEmployees,
  updateEmployeeRank,
  toggleRecruiter,
  dismissEmployee,
  getOccurrences,
  createOccurrence,
  updateOccurrence,
  deleteOccurrence,
  getCitizens,
  getVehicles,
  getRecruitments,
  addRecruitment,
  updateRecruitmentStatus,
  deleteRecruitment,
  getPenalCode,
  addPenalCode,
  updatePenalCode,
  deletePenalCode,
  getAlerts,
  updateAlerts,
  closeTablet,
  type PlayerData,
  type OfficerData,
  type PositionData,
  type OccurrenceData,
  type CitizenData,
  type VehicleData,
  type RecruitmentData,
  type PenalCodeData,
  type AlertData,
  type StatsData,
} from '@/lib/fivem';

/**
 * Hook para verificar se está no ambiente FiveM
 */
export const useIsFiveM = () => {
  const [inFiveM, setInFiveM] = useState(false);

  useEffect(() => {
    setInFiveM(isInFiveM());
  }, []);

  return inFiveM;
};

/**
 * Hook para controlar visibilidade do tablet
 */
export const useTabletVisibility = () => {
  const [isVisible, setIsVisible] = useState(false);
  const queryClient = useQueryClient(); // 2. Instancia o QueryClient

  useEffect(() => {
    // Listener para abrir tablet
    // 3. Adicionamos 'data: any' para receber o payload do Lua
    const cleanupOpen = onNUIMessage('tablet:open', (data: any) => {
      
      // 4. Se o Lua enviou playerData, injetamos direto no cache!
      if (data.playerData) {
        console.log("Dados recebidos do Lua:", data.playerData); // Debug
        queryClient.setQueryData(['playerData'], data.playerData);
      }

      setIsVisible(true);
    });

    // Listener para fechar tablet
    const cleanupClose = onNUIMessage('tablet:close', () => {
      setIsVisible(false);
    });

    // Fecha com ESC
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      cleanupOpen();
      cleanupClose();
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [queryClient]); // Adicione queryClient nas dependências

  const handleClose = useCallback(() => {
    setIsVisible(false);
    closeTablet();
  }, []);

  return { isVisible, setIsVisible, handleClose };
};
/**
 * Hook para dados do jogador logado
 */
export const usePlayerData = () => {
  return useQuery<PlayerData>({
    queryKey: ['playerData'],
    queryFn: getPlayerData,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};

/**
 * Hook para estatísticas gerais
 */
export const useStats = () => {
  return useQuery<StatsData>({
    queryKey: ['stats'],
    queryFn: getStats,
    refetchInterval: 30000, // Atualiza a cada 30 segundos
  });
};

/**
 * Hook para controle de ponto/serviço
 */
export const useDutyStatus = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['dutyStatus'],
    queryFn: getDutyStatus,
  });

  const clockInMutation = useMutation({
    mutationFn: clockIn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dutyStatus'] });
      queryClient.invalidateQueries({ queryKey: ['onDutyOfficers'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });

  const clockOutMutation = useMutation({
    mutationFn: clockOut,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dutyStatus'] });
      queryClient.invalidateQueries({ queryKey: ['onDutyOfficers'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });

  return {
    ...query,
    clockIn: clockInMutation.mutate,
    clockOut: clockOutMutation.mutate,
    isToggling: clockInMutation.isPending || clockOutMutation.isPending,
  };
};

/**
 * Hook para oficiais em serviço
 */
export const useOnDutyOfficers = () => {
  return useQuery<OfficerData[]>({
    queryKey: ['onDutyOfficers'],
    queryFn: getOnDutyOfficers,
    refetchInterval: 10000, // Atualiza a cada 10 segundos
  });
};

/**
 * Hook para cargos/patentes
 */
export const usePositions = () => {
  const queryClient = useQueryClient();

  const query = useQuery<PositionData[]>({
    queryKey: ['positions'],
    queryFn: getPositions,
  });

  const updatePermissionsMutation = useMutation({
    mutationFn: ({ positionId, permissions }: { positionId: number; permissions: string[] }) =>
      updatePositionPermissions(positionId, permissions),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['positions'] });
    },
  });

  return {
    ...query,
    updatePermissions: updatePermissionsMutation.mutate,
    isUpdating: updatePermissionsMutation.isPending,
  };
};

/**
 * Hook para funcionários
 */
export const useEmployees = () => {
  const queryClient = useQueryClient();

  const query = useQuery<OfficerData[]>({
    queryKey: ['employees'],
    queryFn: getEmployees,
  });

  const updateRankMutation = useMutation({
    mutationFn: ({ visaId, newRankId }: { visaId: string; newRankId: number }) =>
      updateEmployeeRank(visaId, newRankId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['positions'] });
    },
  });

  const toggleRecruiterMutation = useMutation({
    mutationFn: ({ visaId }: { visaId: string }) => toggleRecruiter(visaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });

  const dismissMutation = useMutation({
    mutationFn: ({ visaId, reason }: { visaId: string; reason?: string }) =>
      dismissEmployee(visaId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['positions'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });

  return {
    ...query,
    updateRank: updateRankMutation.mutate,
    toggleRecruiter: toggleRecruiterMutation.mutate,
    dismiss: dismissMutation.mutate,
    isUpdating: updateRankMutation.isPending || toggleRecruiterMutation.isPending,
    isDismissing: dismissMutation.isPending,
  };
};

/**
 * Hook para ocorrências
 */
export const useOccurrences = () => {
  const queryClient = useQueryClient();

  const query = useQuery<OccurrenceData[]>({
    queryKey: ['occurrences'],
    queryFn: getOccurrences,
  });

  const createMutation = useMutation({
    mutationFn: createOccurrence,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['occurrences'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ occurrenceId, data }: { occurrenceId: number; data: Partial<OccurrenceData> }) =>
      updateOccurrence(occurrenceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['occurrences'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteOccurrence,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['occurrences'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });

  return {
    ...query,
    create: createMutation.mutate,
    update: updateMutation.mutate,
    delete: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

/**
 * Hook para cidadãos
 */
export const useCitizens = () => {
  return useQuery<CitizenData[]>({
    queryKey: ['citizens'],
    queryFn: getCitizens,
  });
};

/**
 * Hook para veículos
 */
export const useVehicles = () => {
  return useQuery<VehicleData[]>({
    queryKey: ['vehicles'],
    queryFn: getVehicles,
  });
};

/**
 * Hook para recrutamento
 */
export const useRecruitment = () => {
  const queryClient = useQueryClient();

  const query = useQuery<RecruitmentData[]>({
    queryKey: ['recruitment'],
    queryFn: getRecruitments,
  });

  const addMutation = useMutation({
    mutationFn: ({ visaId, name, notes }: { visaId: string; name: string; notes?: string }) =>
      addRecruitment(visaId, name, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recruitment'] });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ recruitmentId, status, grade }: { recruitmentId: number; status: string; grade?: number }) =>
      updateRecruitmentStatus(recruitmentId, status, grade),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recruitment'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRecruitment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recruitment'] });
    },
  });

  return {
    ...query,
    add: addMutation.mutate,
    updateStatus: updateStatusMutation.mutate,
    delete: deleteMutation.mutate,
    isAdding: addMutation.isPending,
    isUpdating: updateStatusMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

/**
 * Hook para código penal
 */
export const usePenalCode = () => {
  const queryClient = useQueryClient();

  const query = useQuery<PenalCodeData[]>({
    queryKey: ['penalCode'],
    queryFn: getPenalCode,
  });

  const addMutation = useMutation({
    mutationFn: addPenalCode,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['penalCode'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ codeId, data }: { codeId: number; data: Partial<PenalCodeData> }) =>
      updatePenalCode(codeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['penalCode'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deletePenalCode,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['penalCode'] });
    },
  });

  return {
    ...query,
    add: addMutation.mutate,
    update: updateMutation.mutate,
    delete: deleteMutation.mutate,
    isAdding: addMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

/**
 * Hook para avisos/alertas
 */
export const useAlerts = () => {
  const queryClient = useQueryClient();

  const query = useQuery<AlertData>({
    queryKey: ['alerts'],
    queryFn: getAlerts,
  });

  const updateMutation = useMutation({
    mutationFn: updateAlerts,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });

  return {
    ...query,
    update: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
  };
};

/**
 * Hook para escutar eventos NUI personalizados
 */
export const useNUIEvent = <T = unknown>(eventName: string, handler: (data: T) => void) => {
  useEffect(() => {
    const cleanup = onNUIMessage(eventName, handler as (data: unknown) => void);
    return cleanup;
  }, [eventName, handler]);
};
