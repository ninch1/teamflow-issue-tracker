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
import type { Issue, IssueStatus, EditIssueInfo } from '../types/issueTypes';
import BackLink from '../components/common/BackLink';
import SuccessAlert from '../components/common/SuccessAlert';

export default function IssuePage() {
  const { workspaceId, projectId, issueId } = useParams();
  const navigate = useNavigate();

  const [currentIssue, setCurrentIssue] = useState<Issue | null>(null);
  const [pageError, setPageError] = useState('');
  const [formError, setFormError] = useState('');
  const [newStatus, setNewStatus] = useState<IssueStatus>('TODO');
  const [editIssueInfo, setEditIssueInfo] = useState<EditIssueInfo>({
    title: '',
    description: '',
    priority: 'MEDIUM',
    type: 'TASK',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isUpdatingIssueDetails, setIsUpdatingIssueDetails] = useState(false);
  const [isDeletingIssue, setIsDeletingIssue] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

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
    if (isUpdatingStatus) {
      return;
    }

    setFormError('');
    setSuccessMessage('');

    if (!workspaceId || !projectId || !issueId) {
      setFormError('Issue not found');
      return;
    }

    try {
      setIsUpdatingStatus(true);

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
      setSuccessMessage('Status updated successfully.');
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
    } finally {
      setIsUpdatingStatus(false);
    }
  }

  async function handleDeleteIssue() {
    if (isDeletingIssue) {
      return;
    }

    setFormError('');
    setSuccessMessage('');

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
      setIsDeletingIssue(true);

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
    } finally {
      setIsDeletingIssue(false);
    }
  }

  async function handleUpdateIssueDetails(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (isUpdatingIssueDetails) {
      return;
    }

    setFormError('');
    setSuccessMessage('');

    if (!editIssueInfo.title.trim()) {
      setFormError('Issue title is required');
      return;
    }

    if (!workspaceId || !projectId || !issueId) {
      setFormError('Issue not found');
      return;
    }

    try {
      setIsUpdatingIssueDetails(true);

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
      setSuccessMessage('Issue updated successfully.');
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
    } finally {
      setIsUpdatingIssueDetails(false);
    }
  }

  useEffect(() => {
    if (!successMessage) {
      return;
    }

    const timeoutId = setTimeout(() => {
      setSuccessMessage('');
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, [successMessage]);

  if (isLoading) {
    return <LoadingCard message='Loading issue...' />;
  }

  return (
    <div className='w-full max-w-6xl'>
      <BackLink to={`/workspaces/${workspaceId}/projects/${projectId}`}>
        Back to Project
      </BackLink>

      {pageError && (
        <ErrorAlert message={pageError} onClose={() => setPageError('')} />
      )}

      {formError && (
        <ErrorAlert message={formError} onClose={() => setFormError('')} />
      )}

      {successMessage && (
        <SuccessAlert
          message={successMessage}
          onClose={() => setSuccessMessage('')}
        />
      )}

      {currentIssue && <IssueDetailsCard issue={currentIssue} />}

      <div className='mb-5 mt-8 flex flex-col gap-5 lg:flex-row'>
        <IssueStatusSection
          status={newStatus}
          onStatusChange={setNewStatus}
          onSubmit={handleUpdateStatus}
          isSubmitting={isUpdatingStatus}
        />

        <IssueEditForm
          editIssueInfo={editIssueInfo}
          onEditIssueChange={setEditIssueInfo}
          onSubmit={handleUpdateIssueDetails}
          isSubmitting={isUpdatingIssueDetails}
        />
      </div>

      <DangerZone
        message='Deleting this issue cannot be undone.'
        buttonText='Delete issue'
        submittingText='Deleting...'
        isSubmitting={isDeletingIssue}
        onDelete={handleDeleteIssue}
        fullWidth
      />
    </div>
  );
}
