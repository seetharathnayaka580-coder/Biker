import React from 'react';
import { OdometerGauge } from './OdometerGauge';
import { ServiceLogger } from './ServiceLogger';
import { ServiceTimeline } from './ServiceTimeline';
import { AppState, ServiceRecord } from '../types';

interface ServiceTabProps {
  state: AppState;
  isAdmin: boolean;
  onUpdateOdometer: (newOdo: number) => void;
  onUpdateTarget: (newTarget: number) => void;
  onAddService: (newService: ServiceRecord) => void;
  onDeleteService: (id: string) => void;
  onOpenScheduleGuide: () => void;
}

export const ServiceTab: React.FC<ServiceTabProps> = ({
  state,
  isAdmin,
  onUpdateOdometer,
  onUpdateTarget,
  onAddService,
  onDeleteService,
  onOpenScheduleGuide,
}) => {
  return (
    <div className="space-y-6">
      {/* Top 2-Column Grid: Odometer Gauge & Service Logger */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 flex flex-col">
          <OdometerGauge
            odometer={state.odometer}
            targets={state.targets}
            services={state.services}
            isAdmin={isAdmin}
            onUpdateOdometer={onUpdateOdometer}
            onUpdateTarget={onUpdateTarget}
          />
        </div>

        <div className="lg:col-span-6 flex flex-col">
          <ServiceLogger
            currentOdometer={state.odometer}
            servicesCount={state.services.length}
            isAdmin={isAdmin}
            onAddService={onAddService}
          />
        </div>
      </div>

      {/* Service History Timeline */}
      <ServiceTimeline
        services={state.services}
        isAdmin={isAdmin}
        onDeleteService={onDeleteService}
      />
    </div>
  );
};
