import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getIssue, updateIssue, deleteIssue } from "../api/issueApi";
import ErrorAlert from "../components/common/ErrorAlert";
import ApiError from "../errors/ApiError";
import { removeAuthToken } from "../utils/authToken";
import IssueDetailsCard from "../components/layout/IssueDetailsCard";
import IssueStatusSection from "../components/layout/IssueStatusSection";
import IssueEditForm from "../components/layout/IssueEditForm";
import DangerZone from "../components/common/DangerZone";
import LoadingCard from "../components/common/LoadingCard";
import type { Issue, IssueStatus, EditIssueInfo } from "../types/issueTypes";
import BackLink from "../components/common/BackLink";
import SuccessAlert from "../components/common/SuccessAlert";
import { useWorkspaceContext } from "../context/workspaceContextValue";
import IssueAssigneeSection from "../components/layout/IssueAssigneeSection";
import IssueCommentsSection from "../components/layout/IssueCommentsSection";
import type { Comment } from "../types/commentTypes";
import {
  getIssueComments,
  createIssueComment,
  updateIssueComment,
  deleteIssueComment,
} from "../api/commentApi";

export default function IssuePage() {
  const { workspaceId, projectId, issueId } = useParams();
  const navigate = useNavigate();

  const [currentIssue, setCurrentIssue] = useState<Issue | null>(null);
  const [pageError, setPageError] = useState("");
  const [formError, setFormError] = useState("");
  const [newStatus, setNewStatus] = useState<IssueStatus>("TODO");
  const [editIssueInfo, setEditIssueInfo] = useState<EditIssueInfo>({
    title: "",
    description: "",
    priority: "MEDIUM",
    type: "TASK",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isUpdatingIssueDetails, setIsUpdatingIssueDetails] = useState(false);
  const [isDeletingIssue, setIsDeletingIssue] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [newAssigneeId, setNewAssigneeId] = useState<string | null>(null);
  const [isUpdatingAssignee, setIsUpdatingAssignee] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newCommentBody, setNewCommentBody] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentBody, setEditingCommentBody] = useState("");
  const [isCreatingComment, setIsCreatingComment] = useState(false);
  const [isUpdatingComment, setIsUpdatingComment] = useState(false);
  const [isDeletingComment, setIsDeletingComment] = useState(false);
  const [commentsPage, setCommentsPage] = useState(1);
  const [hasMoreComments, setHasMoreComments] = useState(false);
  const [isLoadingMoreComments, setIsLoadingMoreComments] = useState(false);

  const { members, currentMemberId, currentUserId, canManageWorkspace } =
    useWorkspaceContext();

  useEffect(() => {
    async function initialIssue() {
      try {
        setIsLoading(true);
        setPageError("");

        if (!workspaceId || !projectId || !issueId) {
          setPageError("Issue not found");
          return;
        }

        const issueData = await getIssue(workspaceId, projectId, issueId);
        const commentsData = await getIssueComments(
          workspaceId,
          projectId,
          issueId,
          5,
          1,
        );

        setCurrentIssue(issueData.issue);
        setComments(commentsData.comments);

        setCommentsPage(commentsData.page);
        setHasMoreComments(commentsData.hasMore);
        setNewStatus(issueData.issue.status);
        setEditIssueInfo({
          title: issueData.issue.title,
          description: issueData.issue.description || "",
          priority: issueData.issue.priority,
          type: issueData.issue.type,
        });
        setNewAssigneeId(issueData.issue.assigneeId);
      } catch (error: unknown) {
        if (error instanceof ApiError && error.status === 401) {
          removeAuthToken();
          navigate("/login");
          return;
        }

        if (error instanceof Error) {
          setPageError(error.message);
        } else {
          setPageError("Could not load issue");
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

    setFormError("");
    setSuccessMessage("");

    if (!workspaceId || !projectId || !issueId) {
      setFormError("Issue not found");
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
        description: updatedIssueData.issue.description || "",
        priority: updatedIssueData.issue.priority,
        type: updatedIssueData.issue.type,
      });
      setSuccessMessage("Status updated successfully.");
    } catch (error: unknown) {
      if (error instanceof ApiError && error.status === 401) {
        removeAuthToken();
        navigate("/login");
        return;
      }

      if (error instanceof Error) {
        setFormError(error.message);
      } else {
        setFormError("Could not update issue");
      }
    } finally {
      setIsUpdatingStatus(false);
    }
  }

  async function handleDeleteIssue() {
    if (isDeletingIssue) {
      return;
    }

    setFormError("");
    setSuccessMessage("");

    if (!workspaceId || !projectId || !issueId) {
      setFormError("Issue not found");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this issue?",
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
        navigate("/login");
        return;
      }

      if (error instanceof Error) {
        setFormError(error.message);
      } else {
        setFormError("Could not delete issue");
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

    setFormError("");
    setSuccessMessage("");

    if (!editIssueInfo.title.trim()) {
      setFormError("Issue title is required");
      return;
    }

    if (!workspaceId || !projectId || !issueId) {
      setFormError("Issue not found");
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
        description: updatedIssueData.issue.description || "",
        priority: updatedIssueData.issue.priority,
        type: updatedIssueData.issue.type,
      });
      setSuccessMessage("Issue updated successfully.");
    } catch (error: unknown) {
      if (error instanceof ApiError && error.status === 401) {
        removeAuthToken();
        navigate("/login");
        return;
      }

      if (error instanceof Error) {
        setFormError(error.message);
      } else {
        setFormError("Could not update issue");
      }
    } finally {
      setIsUpdatingIssueDetails(false);
    }
  }

  async function handleUpdateAssignee() {
    if (isUpdatingAssignee) {
      return;
    }

    setFormError("");
    setSuccessMessage("");

    if (!workspaceId || !projectId || !issueId) {
      setFormError("Issue not found");
      return;
    }

    try {
      setIsUpdatingAssignee(true);

      const updatedIssueData = await updateIssue(
        workspaceId,
        projectId,
        issueId,
        { assigneeId: newAssigneeId },
      );

      setCurrentIssue(updatedIssueData.issue);
      setNewAssigneeId(updatedIssueData.issue.assigneeId);
      setSuccessMessage("Assignee updated successfully.");
    } catch (error: unknown) {
      if (error instanceof ApiError && error.status === 401) {
        removeAuthToken();
        navigate("/login");
        return;
      }

      if (error instanceof Error) {
        setFormError(error.message);
      } else {
        setFormError("Could not update assignee");
      }
    } finally {
      setIsUpdatingAssignee(false);
    }
  }

  async function handleCreateComment() {
    if (isCreatingComment) {
      return;
    }

    setFormError("");
    setSuccessMessage("");

    if (!newCommentBody.trim()) {
      setFormError("Comment body is required");
      return;
    }

    if (!workspaceId || !projectId || !issueId) {
      setFormError("Issue not found");
      return;
    }

    try {
      setIsCreatingComment(true);

      const commentData = await createIssueComment(
        workspaceId,
        projectId,
        issueId,
        { body: newCommentBody },
      );

      setComments((currentComments) => [
        commentData.comment,
        ...currentComments,
      ]);
      setNewCommentBody("");
      setSuccessMessage("Comment posted successfully.");
    } catch (error: unknown) {
      if (error instanceof ApiError && error.status === 401) {
        removeAuthToken();
        navigate("/login");
        return;
      }

      if (error instanceof Error) {
        setFormError(error.message);
      } else {
        setFormError("Could not create comment");
      }
    } finally {
      setIsCreatingComment(false);
    }
  }

  function handleStartEditingComment(comment: Comment) {
    setEditingCommentId(comment.id);
    setEditingCommentBody(comment.body);
    setFormError("");
    setSuccessMessage("");
  }

  function handleCancelEditingComment() {
    setEditingCommentId(null);
    setEditingCommentBody("");
  }

  async function handleUpdateComment(commentId: string) {
    if (isUpdatingComment) {
      return;
    }

    setFormError("");
    setSuccessMessage("");

    if (!editingCommentBody.trim()) {
      setFormError("Comment body is required");
      return;
    }

    if (!workspaceId || !projectId || !issueId) {
      setFormError("Issue not found");
      return;
    }

    try {
      setIsUpdatingComment(true);

      const commentData = await updateIssueComment(
        workspaceId,
        projectId,
        issueId,
        commentId,
        { body: editingCommentBody },
      );

      setComments((currentComments) =>
        currentComments.map((comment) =>
          comment.id === commentId ? commentData.comment : comment,
        ),
      );

      setEditingCommentId(null);
      setEditingCommentBody("");
      setSuccessMessage("Comment updated successfully.");
    } catch (error: unknown) {
      if (error instanceof ApiError && error.status === 401) {
        removeAuthToken();
        navigate("/login");
        return;
      }

      if (error instanceof Error) {
        setFormError(error.message);
      } else {
        setFormError("Could not update comment");
      }
    } finally {
      setIsUpdatingComment(false);
    }
  }

  async function handleDeleteComment(commentId: string) {
    if (isDeletingComment) {
      return;
    }

    setFormError("");
    setSuccessMessage("");

    if (!workspaceId || !projectId || !issueId) {
      setFormError("Issue not found");
      return;
    }

    try {
      setIsDeletingComment(true);

      await deleteIssueComment(workspaceId, projectId, issueId, commentId);

      setComments((currentComments) =>
        currentComments.filter((comment) => comment.id !== commentId),
      );

      if (editingCommentId === commentId) {
        setEditingCommentId(null);
        setEditingCommentBody("");
      }

      setSuccessMessage("Comment deleted successfully.");
    } catch (error: unknown) {
      if (error instanceof ApiError && error.status === 401) {
        removeAuthToken();
        navigate("/login");
        return;
      }

      if (error instanceof Error) {
        setFormError(error.message);
      } else {
        setFormError("Could not delete comment");
      }
    } finally {
      setIsDeletingComment(false);
    }
  }

  async function handleLoadMoreComments() {
    if (isLoadingMoreComments) {
      return;
    }

    if (!workspaceId || !projectId || !issueId) {
      setFormError("Issue not found");
      return;
    }

    try {
      setIsLoadingMoreComments(true);
      setFormError("");

      const nextPage = commentsPage + 1;

      const commentsData = await getIssueComments(
        workspaceId,
        projectId,
        issueId,
        5,
        nextPage,
      );

      setComments((currentComments) => [
        ...currentComments,
        ...commentsData.comments,
      ]);

      setCommentsPage(commentsData.page);
      setHasMoreComments(commentsData.hasMore);
    } catch (error: unknown) {
      if (error instanceof ApiError && error.status === 401) {
        removeAuthToken();
        navigate("/login");
        return;
      }

      if (error instanceof Error) {
        setFormError(error.message);
      } else {
        setFormError("Could not load more comments");
      }
    } finally {
      setIsLoadingMoreComments(false);
    }
  }

  useEffect(() => {
    if (!successMessage) {
      return;
    }

    const timeoutId = setTimeout(() => {
      setSuccessMessage("");
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, [successMessage]);

  if (isLoading) {
    return <LoadingCard message="Loading issue..." />;
  }

  const canUpdateIssueStatus =
    canManageWorkspace ||
    currentIssue?.assigneeId === null ||
    currentIssue?.assigneeId === currentMemberId;

  return (
    <div className="w-full max-w-6xl">
      <BackLink to={`/workspaces/${workspaceId}/projects/${projectId}`}>
        Back to Project
      </BackLink>

      {pageError && (
        <ErrorAlert message={pageError} onClose={() => setPageError("")} />
      )}

      {formError && (
        <ErrorAlert message={formError} onClose={() => setFormError("")} />
      )}

      {successMessage && (
        <SuccessAlert
          message={successMessage}
          onClose={() => setSuccessMessage("")}
        />
      )}

      {currentIssue && <IssueDetailsCard issue={currentIssue} />}

      <div className="mt-8">
        <IssueAssigneeSection
          assigneeId={newAssigneeId}
          members={members}
          canManageWorkspace={canManageWorkspace}
          isSubmitting={isUpdatingAssignee}
          onAssigneeChange={setNewAssigneeId}
          onSubmit={handleUpdateAssignee}
        />
      </div>

      <div className="my-8 flex flex-col gap-5 lg:flex-row">
        {canUpdateIssueStatus ? (
          <IssueStatusSection
            status={newStatus}
            onStatusChange={setNewStatus}
            onSubmit={handleUpdateStatus}
            isSubmitting={isUpdatingStatus}
          />
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">
              Update Status
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              This issue is assigned to another member, so only the assignee or
              a workspace admin can update its status.
            </p>
          </div>
        )}

        {canManageWorkspace && (
          <IssueEditForm
            editIssueInfo={editIssueInfo}
            onEditIssueChange={setEditIssueInfo}
            onSubmit={handleUpdateIssueDetails}
            isSubmitting={isUpdatingIssueDetails}
          />
        )}
      </div>

      {canManageWorkspace && (
        <DangerZone
          message="Deleting this issue cannot be undone."
          buttonText="Delete issue"
          submittingText="Deleting..."
          isSubmitting={isDeletingIssue}
          onDelete={handleDeleteIssue}
          fullWidth
        />
      )}

      <div className="mt-8">
        <IssueCommentsSection
          comments={comments}
          currentUserId={currentUserId}
          canManageWorkspace={canManageWorkspace}
          newCommentBody={newCommentBody}
          editingCommentId={editingCommentId}
          editingCommentBody={editingCommentBody}
          isCreatingComment={isCreatingComment}
          isUpdatingComment={isUpdatingComment}
          isDeletingComment={isDeletingComment}
          hasMoreComments={hasMoreComments}
          isLoadingMoreComments={isLoadingMoreComments}
          onNewCommentBodyChange={setNewCommentBody}
          onEditingCommentBodyChange={setEditingCommentBody}
          onCreateComment={handleCreateComment}
          onStartEditing={handleStartEditingComment}
          onCancelEditing={handleCancelEditingComment}
          onUpdateComment={handleUpdateComment}
          onDeleteComment={handleDeleteComment}
          onLoadMoreComments={handleLoadMoreComments}
        />
      </div>
    </div>
  );
}
