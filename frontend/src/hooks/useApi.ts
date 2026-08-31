import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import type { DisasterReport, ReportStatus } from '../types';

export function useDisasters() {
  return useQuery({
    queryKey: ['disasters'],
    queryFn: () => api.getDisasters(),
    refetchInterval: 10000, // auto refetch every 10s
  });
}

export function useAddDisaster() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newDisaster: Omit<DisasterReport, 'id' | 'timestamp' | 'status'>) => 
      api.addDisaster(newDisaster),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['disasters'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['logs'] });
    }
  });
}

export function useUpdateDisasterStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ReportStatus }) => 
      api.updateDisasterStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['disasters'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['logs'] });
    }
  });
}

export function useDashboardMetrics() {
  return useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: () => api.getDashboardMetrics(),
    refetchInterval: 10000,
  });
}

export function useResourceCamps() {
  return useQuery({
    queryKey: ['resource-camps'],
    queryFn: () => api.getResourceCamps(),
  });
}

export function useBudgetProposals() {
  return useQuery({
    queryKey: ['budget-proposals'],
    queryFn: () => api.getBudgetProposals(),
    refetchInterval: 5000,
  });
}

export function useApproveBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.approveBudget(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget-proposals'] });
      queryClient.invalidateQueries({ queryKey: ['disasters'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['blockchain-txs'] });
      queryClient.invalidateQueries({ queryKey: ['logs'] });
    }
  });
}

export function useSystemHealth() {
  return useQuery({
    queryKey: ['system-health'],
    queryFn: () => api.getSystemHealth(),
    refetchInterval: 15000,
  });
}

export function useReports() {
  return useQuery({
    queryKey: ['reports'],
    queryFn: () => api.getReports(),
  });
}

export function useBlockchainTransactions() {
  return useQuery({
    queryKey: ['blockchain-txs'],
    queryFn: () => api.getBlockchainTransactions(),
    refetchInterval: 5000,
  });
}

export function useLogs() {
  return useQuery({
    queryKey: ['logs'],
    queryFn: () => api.getLogs(),
    refetchInterval: 4000,
  });
}
