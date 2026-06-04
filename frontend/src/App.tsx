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

function App() {
  return (
    <div className='min-h-screen bg-slate-50 text-slate-950 flex items-center justify-center'>
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/login' element={<LoginPage />} />
        <Route path='/register' element={<RegisterPage />} />
        <Route path='/me' element={<MePage />} />
        <Route
          path='/dashboard'
          element={
            <AppLayout>
              <DashboardPage />
            </AppLayout>
          }
        />
        <Route
          path='/workspaces/:workspaceId'
          element={
            <AppLayout>
              <WorkspacePage />
            </AppLayout>
          }
        />
        <Route
          path='/workspaces/:workspaceId/projects/:projectId'
          element={
            <AppLayout>
              <ProjectPage />
            </AppLayout>
          }
        />
        <Route
          path='/workspaces/:workspaceId/projects/:projectId/issues/:issueId'
          element={
            <AppLayout>
              <IssuePage />
            </AppLayout>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
