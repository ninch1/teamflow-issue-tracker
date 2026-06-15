import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getProject, updateProject, deleteProject } from "../api/projectApi";
import { getIssues, createIssue } from "../api/issueApi";
import IssueCard from "../components/common/IssueCard";
import CreateIssueCard from "../components/layout/CreateIssueCard";
import ErrorAlert from "../components/common/ErrorAlert";
import ApiError from "../errors/ApiError";
import { removeAuthToken } from "../utils/authToken";
import ProjectDetailsCard from "../components/layout/ProjectDetailsCard";
import ProjectEditForm from "../components/layout/ProjectEditForm";
import DangerZone from "../components/common/DangerZone";
import LoadingCard from "../components/common/LoadingCard";
import type {
  Issue,
  IssuePriority,
  IssueStatus,
  IssueType,
  EditIssueInfo,
} from "../types/issueTypes";
import type { Project, EditProjectInfo } from "../types/projectTypes";
import BackLink from "../components/common/BackLink";
import SuccessAlert from "../components/common/SuccessAlert";
import IssueFiltersBar from "../components/layout/IssueFiltersBar";
import EmptyState from "../components/common/EmptyState";
import { useWorkspaceContext } from "../context/workspaceContextValue";
import type { Label } from "../types/labelTypes";
import { getWorkspaceLabels } from "../api/labelApi";

type NewIssue = EditIssueInfo;

export default function ProjectPage() {
  const { workspaceId, projectId } = useParams();
  const navigate = useNavigate();

  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [pageError, setPageError] = useState("");
  const [formError, setFormError] = useState("");
  const [showCreateIssueForm, setShowIssueForm] = useState(false);
  const [isCreatingIssue, setIsCreatingIssue] = useState(false);
  const [isUpdatingProject, setIsUpdatingProject] = useState(false);
  const [isDeletingProject, setIsDeletingProject] = useState(false);
  const [newIssueInfo, setNewIssueInfo] = useState<NewIssue>({
    title: "",
    description: "",
    priority: "MEDIUM",
    type: "TASK",
  });
  const [editProjectInfo, setEditProjectInfo] = useState<EditProjectInfo>({
    name: "",
    description: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"ALL" | IssueStatus>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<"ALL" | IssuePriority>(
    "ALL",
  );
  const [typeFilter, setTypeFilter] = useState<"ALL" | IssueType>("ALL");
  const [isIssuesLoading, setIsIssuesLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearchValue, setDebouncedSearchValue] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [labels, setLabels] = useState<Label[]>([]);
  const [selectedLabelFilter, setSelectedLabelFilter] = useState("");

  const hasActiveFilters =
    statusFilter !== "ALL" ||
    priorityFilter !== "ALL" ||
    typeFilter !== "ALL" ||
    selectedLabelFilter !== "" ||
    searchValue.trim() !== "";

  const filteredIssues = selectedLabelFilter
    ? issues.filter((issue) =>
        issue.labels.some(
          (issueLabel) => issueLabel.labelId === selectedLabelFilter,
        ),
      )
    : issues;

  const issueCountText = hasActiveFilters
    ? `Showing ${filteredIssues.length} issue${filteredIssues.length === 1 ? "" : "s"}`
    : `${filteredIssues.length} total issue${filteredIssues.length === 1 ? "" : "s"}`;

  const { canManageWorkspace } = useWorkspaceContext();

  function handleResetFilters() {
    setStatusFilter("ALL");
    setPriorityFilter("ALL");
    setTypeFilter("ALL");
    setSelectedLabelFilter("");
    setSearchValue("");
    setDebouncedSearchValue("");
  }

  useEffect(() => {
    async function initialProject() {
      try {
        setIsLoading(true);
        setPageError("");

        if (!workspaceId || !projectId) {
          setPageError("Project not found");
          return;
        }

        const activeWorkspaceId = workspaceId;
        const activeProjectId = projectId;

        const projectData = await getProject(
          activeWorkspaceId,
          activeProjectId,
        );
        const labelsData = await getWorkspaceLabels(activeWorkspaceId);

        setCurrentProject(projectData.project);
        setLabels(labelsData.labels);
        setEditProjectInfo({
          name: projectData.project.name,
          description: projectData.project.description || "",
        });
      } catch (error: unknown) {
        if (error instanceof ApiError && error.status === 401) {
          removeAuthToken();
          navigate("/login");
          return;
        }

        if (error instanceof Error) {
          setPageError(error.message);
        } else {
          setPageError("Could not load project");
        }
      } finally {
        setIsLoading(false);
      }
    }

    initialProject();
  }, [workspaceId, projectId, navigate]);

  useEffect(() => {
    async function loadIssues() {
      try {
        setIsIssuesLoading(true);
        setPageError("");

        if (!workspaceId || !projectId) {
          setPageError("Project not found");
          return;
        }

        const issuesData = await getIssues(
          workspaceId,
          projectId,
          statusFilter === "ALL" ? undefined : statusFilter,
          priorityFilter === "ALL" ? undefined : priorityFilter,
          typeFilter === "ALL" ? undefined : typeFilter,
          debouncedSearchValue,
        );

        setIssues(issuesData.issues);
      } catch (error: unknown) {
        if (error instanceof ApiError && error.status === 401) {
          removeAuthToken();
          navigate("/login");
          return;
        }

        if (error instanceof Error) {
          setPageError(error.message);
        } else {
          setPageError("Could not load issues");
        }
      } finally {
        setIsIssuesLoading(false);
      }
    }

    loadIssues();
  }, [
    workspaceId,
    projectId,
    navigate,
    statusFilter,
    priorityFilter,
    typeFilter,
    debouncedSearchValue,
  ]);

  // useEffect for debouncing search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchValue(searchValue);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchValue]);

  async function handleCreateIssue(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (isCreatingIssue) {
      return;
    }

    setFormError("");
    setSuccessMessage("");

    if (!newIssueInfo.title.trim()) {
      setFormError("Issue title is required");
      return;
    }

    if (!workspaceId || !projectId) {
      setFormError("Project not found");
      return;
    }

    try {
      setIsCreatingIssue(true);

      const newIssueData = await createIssue(
        workspaceId,
        projectId,
        newIssueInfo.title,
        newIssueInfo.description,
        newIssueInfo.priority,
        newIssueInfo.type,
      );

      setNewIssueInfo({
        title: "",
        description: "",
        priority: "MEDIUM",
        type: "TASK",
      });
      setShowIssueForm(false);

      const createdIssue = newIssueData.issue;

      const matchesStatus =
        statusFilter === "ALL" || createdIssue.status === statusFilter;

      const matchesPriority =
        priorityFilter === "ALL" || createdIssue.priority === priorityFilter;

      const matchesType =
        typeFilter === "ALL" || createdIssue.type === typeFilter;

      const matchesSearch =
        debouncedSearchValue.trim() === "" ||
        createdIssue.title
          .toLowerCase()
          .includes(debouncedSearchValue.trim().toLowerCase());

      if (matchesStatus && matchesPriority && matchesType && matchesSearch) {
        setIssues((prev) => [...prev, createdIssue]);
      }

      setSuccessMessage("Issue created successfully.");
    } catch (error: unknown) {
      if (error instanceof ApiError && error.status === 401) {
        removeAuthToken();
        navigate("/login");
        return;
      }

      if (error instanceof Error) {
        setFormError(error.message);
      } else {
        setFormError("Could not create issue");
      }
    } finally {
      setIsCreatingIssue(false);
    }
  }

  async function handleUpdateProject(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (isUpdatingProject) {
      return;
    }

    setFormError("");
    setSuccessMessage("");

    if (!editProjectInfo.name.trim()) {
      setFormError("Project name is required");
      return;
    }

    if (!workspaceId || !projectId) {
      setFormError("Project not found");
      return;
    }

    try {
      setIsUpdatingProject(true);

      const updatedProjectData = await updateProject(workspaceId, projectId, {
        name: editProjectInfo.name,
        description: editProjectInfo.description,
      });

      setCurrentProject(updatedProjectData.project);

      setEditProjectInfo({
        name: updatedProjectData.project.name,
        description: updatedProjectData.project.description || "",
      });
      setSuccessMessage("Project saved successfully.");
    } catch (error: unknown) {
      if (error instanceof ApiError && error.status === 401) {
        removeAuthToken();
        navigate("/login");
        return;
      }

      if (error instanceof Error) {
        setFormError(error.message);
      } else {
        setFormError("Could not update project");
      }
    } finally {
      setIsUpdatingProject(false);
    }
  }

  async function handleDeleteProject() {
    if (isDeletingProject) {
      return;
    }

    setFormError("");
    setSuccessMessage("");

    if (!workspaceId || !projectId) {
      setFormError("Project not found");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this project? This will also remove its issues.",
    );

    if (!confirmed) {
      return;
    }

    try {
      setIsDeletingProject(true);

      await deleteProject(workspaceId, projectId);

      navigate(`/workspaces/${workspaceId}`);
    } catch (error: unknown) {
      if (error instanceof ApiError && error.status === 401) {
        removeAuthToken();
        navigate("/login");
        return;
      }

      if (error instanceof Error) {
        setFormError(error.message);
      } else {
        setFormError("Could not delete project");
      }
    } finally {
      setIsDeletingProject(false);
    }
  }

  const hasNoIssueFilters =
    statusFilter === "ALL" &&
    priorityFilter === "ALL" &&
    typeFilter === "ALL" &&
    selectedLabelFilter === "" &&
    debouncedSearchValue === "";

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
    return <LoadingCard message="Loading project..." />;
  }

  return (
    <div className="w-full max-w-6xl">
      <BackLink to={`/workspaces/${workspaceId}`}>Back to workspace</BackLink>

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

      {currentProject && <ProjectDetailsCard project={currentProject} />}

      {canManageWorkspace && (
        <ProjectEditForm
          editProjectInfo={editProjectInfo}
          onEditProjectChange={setEditProjectInfo}
          onSubmit={handleUpdateProject}
          isSubmitting={isUpdatingProject}
        />
      )}

      {canManageWorkspace && (
        <DangerZone
          buttonText="Delete project"
          submittingText="Deleting..."
          isSubmitting={isDeletingProject}
          message="Deleting this project cannot be undone. All issues inside this project will be removed."
          onDelete={handleDeleteProject}
          fullWidth
        />
      )}

      <main className="mt-8">
        <IssueFiltersBar
          issueCountText={issueCountText}
          statusFilter={statusFilter}
          priorityFilter={priorityFilter}
          typeFilter={typeFilter}
          hasActiveFilters={hasActiveFilters}
          showCreateIssueForm={showCreateIssueForm}
          onStatusFilterChange={setStatusFilter}
          onPriorityFilterChange={setPriorityFilter}
          onTypeFilterChange={setTypeFilter}
          onResetFilters={handleResetFilters}
          onShowCreateIssueForm={() => setShowIssueForm(true)}
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          selectedLabelFilter={selectedLabelFilter}
          onLabelFilterChange={setSelectedLabelFilter}
          labels={labels}
        />

        {isIssuesLoading ? (
          <div className="mt-5">
            <LoadingCard message="Loading issues..." />
          </div>
        ) : (
          <>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {showCreateIssueForm && (
                <CreateIssueCard
                  title={newIssueInfo.title}
                  description={newIssueInfo.description}
                  priority={newIssueInfo.priority}
                  type={newIssueInfo.type}
                  onTitleChange={(value) =>
                    setNewIssueInfo((prev) => ({ ...prev, title: value }))
                  }
                  onDescriptionChange={(value) =>
                    setNewIssueInfo((prev) => ({ ...prev, description: value }))
                  }
                  onPriorityChange={(value) =>
                    setNewIssueInfo((prev) => ({ ...prev, priority: value }))
                  }
                  onTypeChange={(value) =>
                    setNewIssueInfo((prev) => ({ ...prev, type: value }))
                  }
                  onSubmit={handleCreateIssue}
                  onCancel={() => {
                    setNewIssueInfo({
                      title: "",
                      description: "",
                      priority: "MEDIUM",
                      type: "TASK",
                    });
                    setFormError("");
                    setShowIssueForm(false);
                  }}
                  isSubmitting={isCreatingIssue}
                />
              )}

              {currentProject &&
                filteredIssues.map((issue) => (
                  <IssueCard
                    key={issue.id}
                    workspaceId={currentProject.workspaceId}
                    issueInfo={issue}
                  />
                ))}
            </div>

            {!showCreateIssueForm && filteredIssues.length === 0 && (
              <EmptyState
                message={
                  hasNoIssueFilters
                    ? "No issues yet. Create your first issue to start tracking work."
                    : "No issues match your filters."
                }
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}
