// src/lib/hooks/useService.ts
import { useContext } from 'react';
import { useServiceContext } from '../contexts/ServiceContext';

/**
 * @hook useService
 * @description A convenient alias for useServiceContext to simplify accessing services.
 * This is the primary hook components will use to get the service container.
 * @returns The container with all application services.
 *
 * @example
 * const { creditService, voiceService } = useService();
 * const balance = await creditService.getCurrentBalance(userId);
 */
export const useService = () => {
  return useServiceContext();
};
