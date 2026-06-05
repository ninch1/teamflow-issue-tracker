import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getIssue, updateIssue, deleteIssue } from '../api/issueApi';
import ErrorAlert from '../components/common/ErrorAlert';
import ApiError from '../errors/ApiError';
import { removeAuthToken } from '../utils/authToken';
import IssueDetailsCard from '../components/layout/IssueDetailsCard';
import IssueStatusSection from '../components/layout/IssueStatusSection';
import IssueEditForm from '../components/layout/IssueEditForm';
import DangerZone from '../components/common/DangerZone';
import LoadingCard from '../components/common/LoadingCard';

type IssueType = {
  id: string;
  title: string;
  description: string | null;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  type: 'BUG' | 'FEATURE' | 'TASK';
  projectId: string;
  createdAt: string;
  updatedAt: string;
};

type EditIssueInfo = {
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  type: 'BUG' | 'FEATURE' | 'TASK';
};

export default function IssuePage() {
  const { workspaceId, projectId, issueId } = useParams();
  const navigate = useNavigate();

  const [currentIssue, setCurrentIssue] = useState<IssueType | null>(null);
  const [pageError, setPageError] = useState('');
  const [formError, setFormError] = useState('');
  const [newStatus, setNewStatus] = useState<'TODO' | 'IN_PROGRESS' | 'DONE'>(
    'TODO',
  );
  const [editIssueInfo, setEditIssueInfo] = useState<EditIssueInfo>({
    title: '',
    description: '',
    priority: 'MEDIUM',
    type: 'TASK',
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function initialIssue() {
      try {
        setIsLoading(true);
        setPageError('');

        if (!workspaceId || !projectId || !issueId) {
          setPageError('Issue not found');
          return;
        }

        const issueData = await getIssue(workspaceId, projectId, issueId);

        setCurrentIssue(issueData.issue);
        setNewStatus(issueData.issue.status);
        setEditIssueInfo({
          title: issueData.issue.title,
          description: issueData.issue.description || '',
          priority: issueData.issue.priority,
          type: issueData.issue.type,
        });
      } catch (error: unknown) {
        if (error instanceof ApiError && error.status === 401) {
          removeAuthToken();
          navigate('/login');
          return;
        }

        if (error instanceof Error) {
          setPageError(error.message);
        } else {
          setPageError('Could not load issue');
        }
      } finally {
        setIsLoading(false);
      }
    }

    initialIssue();
  }, [workspaceId, projectId, issueId, navigate]);

  async function handleUpdateStatus() {
    setFormError('');

    if (!workspaceId || !projectId || !issueId) {
      setFormError('Issue not found');
      return;
    }

    try {
      const updatedIssueData = await updateIssue(
        workspaceId,
        projectId,
        issueId,
        { status: newStatus },
      );

      setCurrentIssue(updatedIssueData.issue);
      setNewStatus(updatedIssueData.issue.status);
      setEditIssueInfo({
        title: updatedIssueData.issue.title,
        description: updatedIssueData.issue.description || '',
        priority: updatedIssueData.issue.priority,
        type: updatedIssueData.issue.type,
      });
    } catch (error: unknown) {
      if (error instanceof ApiError && error.status === 401) {
        removeAuthToken();
        navigate('/login');
        return;
      }

      if (error instanceof Error) {
        setFormError(error.message);
      } else {
        setFormError('Could not update issue');
      }
    }
  }

  async function handleDeleteIssue() {
    setFormError('');

    if (!workspaceId || !projectId || !issueId) {
      setFormError('Issue not found');
      return;
    }

    const confirmed = window.confirm(
      'Are you sure you want to delete this issue?',
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteIssue(workspaceId, projectId, issueId);

      navigate(`/workspaces/${workspaceId}/projects/${projectId}`);
    } catch (error: unknown) {
      if (error instanceof ApiError && error.status === 401) {
        removeAuthToken();
        navigate('/login');
        return;
      }

      if (error instanceof Error) {
        setFormError(error.message);
      } else {
        setFormError('Could not delete issue');
      }
    }
  }

  async function handleUpdateIssueDetails(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError('');

    if (!workspaceId || !projectId || !issueId) {
      setFormError('Issue not found');
      return;
    }

    try {
      const updatedIssueData = await updateIssue(
        workspaceId,
        projectId,
        issueId,
        {
          title: editIssueInfo.title,
          description: editIssueInfo.description,
          priority: editIssueInfo.priority,
          type: editIssueInfo.type,
        },
      );

      setCurrentIssue(updatedIssueData.issue);
      setNewStatus(updatedIssueData.issue.status);
      setEditIssueInfo({
        title: updatedIssueData.issue.title,
        description: updatedIssueData.issue.description || '',
        priority: updatedIssueData.issue.priority,
        type: updatedIssueData.issue.type,
      });
    } catch (error: unknown) {
      if (error instanceof ApiError && error.status === 401) {
        removeAuthToken();
        navigate('/login');
        return;
      }

      if (error instanceof Error) {
        setFormError(error.message);
      } else {
        setFormError('Could not update issue');
      }
    }
  }

  if (isLoading) {
    return <LoadingCard message='Loading issue...' />;
  }

  return (
    <div className='w-full max-w-6xl'>
      {pageError && (
        <ErrorAlert message={pageError} onClose={() => setPageError('')} />
      )}

      {formError && (
        <ErrorAlert message={formError} onClose={() => setFormError('')} />
      )}

      {currentIssue && <IssueDetailsCard issue={currentIssue} />}

      <div className='mb-5 mt-8 flex flex-col gap-5 lg:flex-row'>
        <IssueStatusSection
          status={newStatus}
          onStatusChange={setNewStatus}
          onSubmit={handleUpdateStatus}
        />

        <IssueEditForm
          editIssueInfo={editIssueInfo}
          onEditIssueChange={setEditIssueInfo}
          onSubmit={handleUpdateIssueDetails}
        />
      </div>

      <DangerZone
        message='Deleting this issue cannot be undone.'
        buttonText='Delete issue'
        onDelete={handleDeleteIssue}
        fullWidth
      />
    </div>
  );
}
