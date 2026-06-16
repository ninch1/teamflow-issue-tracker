import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MePage from './pages/MePage';
import DashboardPage from './pages/DashboardPage';
import AppLayout from './layout/AppLayout';
import WorkspacePage from './pages/WorkspacePage';
import ProjectPage from './pages/ProjectPage';
import IssuePage from './pages/IssuePage';
import WorkspaceLayout from './layout/WorkspaceLayout';
import ActivityPage from './pages/ActivityPage';

function App() {
  return (
    <div className='min-h-screen bg-slate-50 text-slate-950 flex items-center justify-center'>
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/login' element={<LoginPage />} />
        <Route path='/register' element={<RegisterPage />} />

        <Route element={<AppLayout />}>
          <Route path='/dashboard' element={<DashboardPage />} />
          <Route path='/me' element={<MePage />} />
          <Route path='/workspaces/:workspaceId' element={<WorkspaceLayout />}>
            <Route index element={<WorkspacePage />} />
            <Route path='projects/:projectId' element={<ProjectPage />} />
            <Route
              path='projects/:projectId/issues/:issueId'
              element={<IssuePage />}
            />
            <Route path='activity' element={<ActivityPage />} />
          </Route>
        </Route>
      </Routes>
    </div>
  );
}

export default App;
