import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getWorkspace,
  deleteWorkspace,
  updateWorkspace,
} from "../api/workspaceApi";
import { getProjects, createProject } from "../api/projectApi";
import ProjectCard from "../components/common/ProjectCard";
import CreateProjectCard from "../components/layout/CreateProjectCard";
import ErrorAlert from "../components/common/ErrorAlert";
import ApiError from "../errors/ApiError";
import { clearAuthTokens } from "../utils/authToken";
import PrimaryButton from "../components/common/PrimaryButton";
import WorkspaceDetailsCard from "../components/layout/WorkspaceDetailsCard";
import WorkspaceEditForm from "../components/layout/WorkspaceEditForm";
import DangerZone from "../components/common/DangerZone";
import LoadingCard from "../components/common/LoadingCard";
import type { Project } from "../types/projectTypes";
import type { Workspace, EditWorkspaceInfo } from "../types/workspaceTypes";
import BackLink from "../components/common/BackLink";
import SuccessAlert from "../components/common/SuccessAlert";
import EmptyState from "../components/common/EmptyState";
import { useWorkspaceContext } from "../context/workspaceContextValue";
import WorkspaceLabelsPanel from "../components/layout/WorkspaceLabelsPanel";
import type { Label } from "../types/labelTypes";
import {
  getWorkspaceLabels,
  createWorkspaceLabel,
  updateWorkspaceLabel,
  deleteWorkspaceLabel,
} from "../api/labelApi";
import { leaveWorkspace } from "../api/membersApi";

type NewProject = {
  name: string;
  description: string;
};

export default function WorkspacePage() {
  const { workspaceId } = useParams();
  const navigate = useNavigate();

  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(
    null,
  );
  const [currentProjects, setCurrentProjects] = useState<Project[]>([]);
  const [pageError, setPageError] = useState("");
  const [formError, setFormError] = useState("");
  const [showCreateProjectForm, setShowCreateProjectForm] = useState(false);
  const [newProjectInfo, setNewProjectInfo] = useState<NewProject>({
    name: "",
    description: "",
  });
  const [editWorkspaceInfo, setEditWorkspaceInfo] = useState<EditWorkspaceInfo>(
    {
      name: "",
      description: "",
    },
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [isUpdatingWorkspace, setIsUpdatingWorkspace] = useState(false);
  const [isDeletingWorkspace, setIsDeletingWorkspace] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [labels, setLabels] = useState<Label[]>([]);
  const [newLabelName, setNewLabelName] = useState("");
  const [newLabelColor, setNewLabelColor] = useState("#5e6ad2");
  const [editingLabelId, setEditingLabelId] = useState<string | null>(null);
  const [editingLabelName, setEditingLabelName] = useState("");
  const [editingLabelColor, setEditingLabelColor] = useState("#5e6ad2");
  const [isLoadingLabels, setIsLoadingLabels] = useState(false);
  const [isCreatingLabel, setIsCreatingLabel] = useState(false);
  const [isUpdatingLabel, setIsUpdatingLabel] = useState(false);
  const [isDeletingLabel, setIsDeletingLabel] = useState(false);
  const [labelError, setLabelError] = useState("");
  const [labelSuccess, setLabelSuccess] = useState("");
  const [isLeavingWorkspace, setIsLeavingWorkspace] = useState(false);

  const { canManageWorkspace, currentUserRole } = useWorkspaceContext();

  useEffect(() => {
    async function initialWorkspace() {
      try {
        setIsLoading(true);
        setPageError("");

        if (!workspaceId) {
          setPageError("Workspace not found");
          return;
        }

        const workspaceData = await getWorkspace(workspaceId);
        const projectsData = await getProjects(workspaceId);

        setCurrentWorkspace(workspaceData.workspace);
        setCurrentProjects(projectsData.projects);
        setEditWorkspaceInfo({
          name: workspaceData.workspace.name,
          description: workspaceData.workspace.description || "",
        });
      } catch (error: unknown) {
        if (error instanceof ApiError && error.status === 401) {
          clearAuthTokens();
          navigate("/login");
          return;
        }

        if (error instanceof Error) {
          setPageError(error.message);
        } else {
          setPageError("Could not load workspace");
        }
      } finally {
        setIsLoading(false);
      }
    }

    initialWorkspace();
  }, [workspaceId, navigate]);

  async function handleCreateProject(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (isCreatingProject) {
      return;
    }

    setFormError("");
    setSuccessMessage("");

    if (!newProjectInfo.name.trim()) {
      setFormError("Project name is required");
      return;
    }

    if (!workspaceId) {
      setFormError("Workspace not found");
      return;
    }

    try {
      setIsCreatingProject(true);

      const newProjectData = await createProject(
        workspaceId,
        newProjectInfo.name,
        newProjectInfo.description,
      );

      setNewProjectInfo({ name: "", description: "" });
      setShowCreateProjectForm(false);

      setCurrentProjects((prev) => [...prev, newProjectData.project]);

      setSuccessMessage("Project created successfully.");
    } catch (error: unknown) {
      if (error instanceof ApiError && error.status === 401) {
        clearAuthTokens();
        navigate("/login");
        return;
      }

      if (error instanceof Error) {
        setFormError(error.message);
      } else {
        setFormError("Could not create project");
      }
    } finally {
      setIsCreatingProject(false);
    }
  }

  useEffect(() => {
    if (!workspaceId) {
      return;
    }

    const activeWorkspaceId = workspaceId;

    async function loadLabels() {
      try {
        setIsLoadingLabels(true);
        setLabelError("");

        const data = await getWorkspaceLabels(activeWorkspaceId);
        setLabels(data.labels);
      } catch (error: unknown) {
        if (error instanceof ApiError && error.status === 401) {
          clearAuthTokens();
          navigate("/login");
          return;
        }

        if (error instanceof Error) {
          setLabelError(error.message);
        } else {
          setLabelError("Could not load labels");
        }
      } finally {
        setIsLoadingLabels(false);
      }
    }

    loadLabels();
  }, [workspaceId, navigate]);

  async function handleUpdateWorkspace(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (isUpdatingWorkspace) {
      return;
    }

    setFormError("");
    setSuccessMessage("");

    if (!editWorkspaceInfo.name.trim()) {
      setFormError("Workspace name is required");
      return;
    }

    if (!workspaceId) {
      setFormError("Workspace not found");
      return;
    }

    try {
      setIsUpdatingWorkspace(true);

      const updatedWorkspaceData = await updateWorkspace(workspaceId, {
        name: editWorkspaceInfo.name,
        description: editWorkspaceInfo.description,
      });

      setCurrentWorkspace(updatedWorkspaceData.workspace);

      setEditWorkspaceInfo({
        name: updatedWorkspaceData.workspace.name,
        description: updatedWorkspaceData.workspace.description || "",
      });
      setSuccessMessage("Workspace saved successfully.");
    } catch (error: unknown) {
      if (error instanceof ApiError && error.status === 401) {
        clearAuthTokens();
        navigate("/login");
        return;
      }

      if (error instanceof Error) {
        setFormError(error.message);
      } else {
        setFormError("Could not update workspace");
      }
    } finally {
      setIsUpdatingWorkspace(false);
    }
  }

  async function handleDeleteWorkspace() {
    if (isDeletingWorkspace) {
      return;
    }

    setFormError("");
    setSuccessMessage("");

    if (!workspaceId) {
      setFormError("Workspace not found");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this workspace? This will also remove its projects and issues.",
    );

    if (!confirmed) {
      return;
    }

    try {
      setIsDeletingWorkspace(true);

      await deleteWorkspace(workspaceId);

      navigate("/dashboard");
    } catch (error: unknown) {
      if (error instanceof ApiError && error.status === 401) {
        clearAuthTokens();
        navigate("/login");
        return;
      }

      if (error instanceof Error) {
        setFormError(error.message);
      } else {
        setFormError("Could not delete workspace");
      }
    } finally {
      setIsDeletingWorkspace(false);
    }
  }

  async function handleCreateLabel() {
    if (isCreatingLabel) {
      return;
    }

    setLabelError("");
    setLabelSuccess("");

    if (!newLabelName.trim()) {
      setLabelError("Label name is required");
      return;
    }

    if (!workspaceId) {
      setLabelError("Workspace not found");
      return;
    }

    try {
      setIsCreatingLabel(true);

      const data = await createWorkspaceLabel(workspaceId, {
        name: newLabelName,
        color: newLabelColor,
      });

      setLabels((currentLabels) => [...currentLabels, data.label]);
      setNewLabelName("");
      setNewLabelColor("#5e6ad2");
      setLabelSuccess("Label created successfully.");
    } catch (error: unknown) {
      if (error instanceof ApiError && error.status === 401) {
        clearAuthTokens();
        navigate("/login");
        return;
      }

      if (error instanceof Error) {
        setLabelError(error.message);
      } else {
        setLabelError("Could not create label");
      }
    } finally {
      setIsCreatingLabel(false);
    }
  }

  function handleStartEditingLabel(label: Label) {
    setEditingLabelId(label.id);
    setEditingLabelName(label.name);
    setEditingLabelColor(label.color || "#5e6ad2");
    setLabelError("");
    setLabelSuccess("");
  }

  function handleCancelEditingLabel() {
    setEditingLabelId(null);
    setEditingLabelName("");
    setEditingLabelColor("#5e6ad2");
  }

  async function handleUpdateLabel() {
    if (isUpdatingLabel) {
      return;
    }

    setLabelError("");
    setLabelSuccess("");

    if (!editingLabelId) {
      setLabelError("Label not found");
      return;
    }

    if (!editingLabelName.trim()) {
      setLabelError("Label name is required");
      return;
    }

    if (!workspaceId) {
      setLabelError("Workspace not found");
      return;
    }

    try {
      setIsUpdatingLabel(true);

      const data = await updateWorkspaceLabel(workspaceId, editingLabelId, {
        name: editingLabelName,
        color: editingLabelColor,
      });

      setLabels((currentLabels) =>
        currentLabels.map((label) =>
          label.id === editingLabelId ? data.label : label,
        ),
      );

      setEditingLabelId(null);
      setEditingLabelName("");
      setEditingLabelColor("#5e6ad2");
      setLabelSuccess("Label updated successfully.");
    } catch (error: unknown) {
      if (error instanceof ApiError && error.status === 401) {
        clearAuthTokens();
        navigate("/login");
        return;
      }

      if (error instanceof Error) {
        setLabelError(error.message);
      } else {
        setLabelError("Could not update label");
      }
    } finally {
      setIsUpdatingLabel(false);
    }
  }

  async function handleDeleteLabel(labelId: string) {
    if (isDeletingLabel) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this label? It will be removed from all issues.",
    );

    if (!confirmed) {
      return;
    }

    setLabelError("");
    setLabelSuccess("");

    if (!workspaceId) {
      setLabelError("Workspace not found");
      return;
    }

    try {
      setIsDeletingLabel(true);

      await deleteWorkspaceLabel(workspaceId, labelId);

      setLabels((currentLabels) =>
        currentLabels.filter((label) => label.id !== labelId),
      );

      if (editingLabelId === labelId) {
        setEditingLabelId(null);
        setEditingLabelName("");
        setEditingLabelColor("#5e6ad2");
      }

      setLabelSuccess("Label deleted successfully.");
    } catch (error: unknown) {
      if (error instanceof ApiError && error.status === 401) {
        clearAuthTokens();
        navigate("/login");
        return;
      }

      if (error instanceof Error) {
        setLabelError(error.message);
      } else {
        setLabelError("Could not delete label");
      }
    } finally {
      setIsDeletingLabel(false);
    }
  }

  async function handleLeaveWorkspace() {
    if (isLeavingWorkspace) {
      return;
    }

    setPageError("");
    setSuccessMessage("");

    if (!workspaceId) {
      setPageError("Workspace not found");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to leave this workspace? You will lose access unless someone invites you again.",
    );

    if (!confirmed) {
      return;
    }

    try {
      setIsLeavingWorkspace(true);

      await leaveWorkspace(workspaceId);

      navigate("/dashboard");
    } catch (error: unknown) {
      if (error instanceof ApiError && error.status === 401) {
        clearAuthTokens();
        navigate("/login");
        return;
      }

      if (error instanceof Error) {
        setPageError(error.message);
      } else {
        setPageError("Could not leave workspace");
      }
    } finally {
      setIsLeavingWorkspace(false);
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

  useEffect(() => {
    if (!formError) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setFormError("");
    }, 3000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [formError]);

  useEffect(() => {
    if (!pageError) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setPageError("");
    }, 3000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [pageError]);

  useEffect(() => {
    if (!labelError) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setLabelError("");
    }, 3000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [labelError]);

  useEffect(() => {
    if (!labelSuccess) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setLabelSuccess("");
    }, 3000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [labelSuccess]);

  if (isLoading) {
    return <LoadingCard message="Loading workspace..." />;
  }

  return (
    <div className="w-full">
      <BackLink to="/dashboard">Back to dashboard</BackLink>

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

      {currentWorkspace && (
        <WorkspaceDetailsCard
          workspace={currentWorkspace}
          role={currentUserRole}
        />
      )}

      {canManageWorkspace && (
        <WorkspaceEditForm
          editWorkspaceInfo={editWorkspaceInfo}
          onEditWorkspaceChange={setEditWorkspaceInfo}
          onSubmit={handleUpdateWorkspace}
          isSubmitting={isUpdatingWorkspace}
        />
      )}

      <main className="mt-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-medium tracking-[-0.04em] text-slate-950">
              Projects
            </h2>
            <p className="text-sm text-slate-500">
              Track projects inside this workspace.
            </p>
          </div>

          {canManageWorkspace && !showCreateProjectForm && (
            <PrimaryButton onClick={() => setShowCreateProjectForm(true)}>
              Create project
            </PrimaryButton>
          )}
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {canManageWorkspace && showCreateProjectForm && (
            <CreateProjectCard
              name={newProjectInfo.name}
              description={newProjectInfo.description}
              onNameChange={(value) =>
                setNewProjectInfo((prev) => ({ ...prev, name: value }))
              }
              onDescriptionChange={(value) =>
                setNewProjectInfo((prev) => ({ ...prev, description: value }))
              }
              onSubmit={handleCreateProject}
              onCancel={() => {
                setNewProjectInfo({ name: "", description: "" });
                setFormError("");
                setShowCreateProjectForm(false);
              }}
              isSubmitting={isCreatingProject}
            />
          )}

          {currentProjects.map((project) => (
            <ProjectCard key={project.id} projectInfo={project} />
          ))}
        </div>

        {!showCreateProjectForm && currentProjects.length === 0 && (
          <EmptyState message="No projects yet. Create your first project to start tracking work." />
        )}

        {labelError && (
          <div className="mt-8">
            <ErrorAlert
              message={labelError}
              onClose={() => setLabelError("")}
            />
          </div>
        )}

        {labelSuccess && (
          <div className="mt-8">
            <SuccessAlert
              message={labelSuccess}
              onClose={() => setLabelSuccess("")}
            />
          </div>
        )}

        {isLoadingLabels ? (
          <LoadingCard message="Loading labels..." />
        ) : (
          <WorkspaceLabelsPanel
            labels={labels}
            canManageWorkspace={canManageWorkspace}
            newLabelName={newLabelName}
            newLabelColor={newLabelColor}
            editingLabelId={editingLabelId}
            editingLabelName={editingLabelName}
            editingLabelColor={editingLabelColor}
            isCreatingLabel={isCreatingLabel}
            isUpdatingLabel={isUpdatingLabel}
            isDeletingLabel={isDeletingLabel}
            onNewLabelNameChange={setNewLabelName}
            onNewLabelColorChange={setNewLabelColor}
            onCreateLabel={handleCreateLabel}
            onStartEditingLabel={handleStartEditingLabel}
            onCancelEditingLabel={handleCancelEditingLabel}
            onEditingLabelNameChange={setEditingLabelName}
            onEditingLabelColorChange={setEditingLabelColor}
            onUpdateLabel={handleUpdateLabel}
            onDeleteLabel={handleDeleteLabel}
          />
        )}

        <div className="mt-8 mb-8">
          <DangerZone
            buttonText="Leave workspace"
            submittingText="Leaving..."
            isSubmitting={isLeavingWorkspace}
            message="Leaving this workspace will remove your access. You can only rejoin if someone invites you again."
            onDelete={handleLeaveWorkspace}
            fullWidth
          />
        </div>

        {canManageWorkspace && (
          <DangerZone
            buttonText="Delete workspace"
            submittingText="Deleting..."
            isSubmitting={isDeletingWorkspace}
            message="Deleting this workspace cannot be undone. All projects and issues inside this workspace will be removed."
            onDelete={handleDeleteWorkspace}
            fullWidth
          />
        )}
      </main>
    </div>
  );
}
