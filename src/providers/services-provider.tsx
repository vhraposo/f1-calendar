import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { createAppServices, type AppServices } from '@/providers/create-app-services';

const ServicesContext = createContext<AppServices | null>(null);

export function ServicesProvider({ children }: { children: ReactNode }) {
  const services = useMemo(() => createAppServices(), []);
  return <ServicesContext.Provider value={services}>{children}</ServicesContext.Provider>;
}

export function useServices(): AppServices {
  const services = useContext(ServicesContext);
  if (!services) {
    throw new Error('useServices must be used within ServicesProvider');
  }
  return services;
}
