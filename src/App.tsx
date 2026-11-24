/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ClubProvider, useClub } from './context/ClubContext';
import { PublicWebsite } from './components/public/PublicWebsite';
import { PortalLayout } from './components/portal/PortalLayout';
import { DashboardTab } from './components/portal/DashboardTab';
import { SquadsTab } from './components/portal/SquadsTab';
import { FixturesTab } from './components/portal/FixturesTab';
import { FinanceTab } from './components/portal/FinanceTab';
import { GovernanceTab } from './components/portal/GovernanceTab';
import { AiAssistantTab } from './components/portal/AiAssistantTab';
import { SocialStudioTab } from './components/portal/SocialStudioTab';
import { SettingsTab } from './components/portal/SettingsTab';
import { Toast } from './components/common/Toast';

const AppContent: React.FC = () => {
  const { activeView } = useClub();

  if (activeView === 'public') {
    return (
      <>
        <PublicWebsite />
        <Toast />
      </>
    );
  }

  return (
    <PortalLayout>
      {activeView === 'dashboard' && <DashboardTab />}
      {activeView === 'squads' && <SquadsTab />}
      {activeView === 'fixtures' && <FixturesTab />}
      {activeView === 'finance' && <FinanceTab />}
      {activeView === 'governance' && <GovernanceTab />}
      {activeView === 'ai' && <AiAssistantTab />}
      {activeView === 'social' && <SocialStudioTab />}
      {activeView === 'settings' && <SettingsTab />}
      <Toast />
    </PortalLayout>
  );
};

export default function App() {
  return (
    <ClubProvider>
      <AppContent />
    </ClubProvider>
  );
}
