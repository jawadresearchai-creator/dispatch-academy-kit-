import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { HomeScreen } from '../features/home/HomeScreen';
import { LearnScreen } from '../features/learn/LearnScreen';
import { ReaderScreen } from '../features/learn/ReaderScreen';
import { TutorScreen } from '../features/tutor/TutorScreen';
import { QuizScreen } from '../features/quiz/QuizScreen';
import { FlashcardsScreen } from '../features/quiz/FlashcardsScreen';
import { DrillScreen } from '../features/drills/DrillScreen';
import { RoleplayScreen } from '../features/roleplay/RoleplayScreen';
import { MapScreen } from '../features/map/MapScreen';
import { HosScreen } from '../features/hos/HosScreen';
import { EconomicsScreen } from '../features/economics/EconomicsScreen';
import { LoadBoardScreen } from '../features/loadboard/LoadBoardScreen';
import { VettingScreen } from '../features/vetting/VettingScreen';
import { DocumentScreen } from '../features/documents/DocumentScreen';
import { DispatchScreen } from '../features/dispatch/DispatchScreen';
import { ProblemsScreen } from '../features/problems/ProblemsScreen';
import { SimulationScreen } from '../features/simulation/SimulationScreen';
import { ToolboxScreen } from '../features/toolbox/ToolboxScreen';
import { ProgressScreen } from '../features/progress/ProgressScreen';
import { SettingsScreen } from '../features/settings/SettingsScreen';
import { DevScreen } from '../features/dev/DevScreen';

export const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomeScreen />} />
        <Route path="learn" element={<LearnScreen />} />
        <Route path="learn/:moduleId" element={<LearnScreen />} />
        <Route path="learn/:moduleId/:pageId" element={<ReaderScreen />} />
        <Route path="tutor" element={<TutorScreen />} />
        <Route path="practice/quizzes" element={<QuizScreen />} />
        <Route path="practice/flashcards" element={<FlashcardsScreen />} />
        <Route path="practice/drills" element={<DrillScreen />} />
        <Route path="practice/drills/:drillId" element={<DrillScreen />} />
        <Route path="practice/roleplay" element={<RoleplayScreen />} />
        <Route path="practice/roleplay/:roleplayId" element={<RoleplayScreen />} />
        <Route path="labs/map" element={<MapScreen />} />
        <Route path="labs/hos" element={<HosScreen />} />
        <Route path="labs/economics" element={<EconomicsScreen />} />
        <Route path="labs/loadboard" element={<LoadBoardScreen />} />
        <Route path="labs/vetting" element={<VettingScreen />} />
        <Route path="labs/documents" element={<DocumentScreen />} />
        <Route path="labs/dispatch" element={<DispatchScreen />} />
        <Route path="labs/problems" element={<ProblemsScreen />} />
        <Route path="simulation" element={<SimulationScreen />} />
        <Route path="toolbox" element={<ToolboxScreen />} />
        <Route path="progress" element={<ProgressScreen />} />
        <Route path="settings" element={<SettingsScreen />} />
        <Route path="dev" element={<DevScreen />} />
      </Route>
    </Routes>
  );
};
