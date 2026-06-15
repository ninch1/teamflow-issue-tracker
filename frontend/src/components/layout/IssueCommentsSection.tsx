import { useState } from "react";
import type { Comment } from "../../types/commentTypes";

type IssueCommentsSectionProps = {
  comments: Comment[];
  currentUserId: string | null;
  canManageWorkspace: boolean;
  newCommentBody: string;
  editingCommentId: string | null;
  editingCommentBody: string;
  isCreatingComment: boolean;
  isUpdatingComment: boolean;
  isDeletingComment: boolean;
  onNewCommentBodyChange: (body: string) => void;
  onEditingCommentBodyChange: (body: string) => void;
  onCreateComment: () => void;
  onStartEditing: (comment: Comment) => void;
  onCancelEditing: () => void;
  onUpdateComment: (commentId: string) => void;
  onDeleteComment: (commentId: string) => void;
  hasMoreComments: boolean;
  isLoadingMoreComments: boolean;
  onLoadMoreComments: () => void;
};

function getDisplayName(comment: Comment) {
  return comment.user.name || comment.user.email;
}

function formatDate(date: string) {
  return new Date(date).toLocaleString();
}

export default function IssueCommentsSection({
  comments,
  currentUserId,
  canManageWorkspace,
  newCommentBody,
  editingCommentId,
  editingCommentBody,
  isCreatingComment,
  isUpdatingComment,
  isDeletingComment,
  onNewCommentBodyChange,
  onEditingCommentBodyChange,
  onCreateComment,
  onStartEditing,
  onCancelEditing,
  onUpdateComment,
  onDeleteComment,
  hasMoreComments,
  isLoadingMoreComments,
  onLoadMoreComments,
}: IssueCommentsSectionProps) {
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  function handleDelete(commentId: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this comment?",
    );

    if (!confirmed) {
      return;
    }

    setDeleteTargetId(commentId);
    onDeleteComment(commentId);
  }

  return (
    <section className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-slate-950">Comments</h2>
        <p className="text-sm text-slate-500">
          Add updates, questions, or notes for this issue.
        </p>
      </div>

      <div className="mt-5 space-y-3">
        <textarea
          value={newCommentBody}
          onChange={(e) => onNewCommentBodyChange(e.target.value)}
          placeholder="Write a comment..."
          disabled={isCreatingComment}
          className="min-h-24 w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-950 outline-none focus:border-[#5e6ad2] focus:ring-2 focus:ring-[#5e69d1]/20 disabled:cursor-not-allowed disabled:opacity-60"
        />

        <button
          type="button"
          onClick={onCreateComment}
          disabled={isCreatingComment || !newCommentBody.trim()}
          className="rounded-lg bg-[#5e6ad2] px-4 py-2 text-sm font-medium text-white hover:bg-[#828fff] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isCreatingComment ? "Posting..." : "Post comment"}
        </button>
      </div>

      <div className="mt-6 space-y-4">
        {comments.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500">
            No comments yet.
          </p>
        ) : (
          comments.map((comment) => {
            const canModifyComment =
              canManageWorkspace || comment.userId === currentUserId;

            const isEditing = editingCommentId === comment.id;
            const isDeletingThisComment =
              isDeletingComment && deleteTargetId === comment.id;

            return (
              <article
                key={comment.id}
                className="min-w-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex min-w-0 items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-950">
                      {getDisplayName(comment)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatDate(comment.createdAt)}
                    </p>
                  </div>

                  {canModifyComment && !isEditing && (
                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        onClick={() => onStartEditing(comment)}
                        className="text-xs font-medium text-slate-500 hover:text-slate-950"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(comment.id)}
                        disabled={isDeletingComment}
                        className="text-xs font-medium text-red-500 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isDeletingThisComment ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  )}
                </div>

                {isEditing ? (
                  <div className="mt-3 space-y-3">
                    <textarea
                      value={editingCommentBody}
                      onChange={(e) =>
                        onEditingCommentBodyChange(e.target.value)
                      }
                      disabled={isUpdatingComment}
                      className="min-h-24 w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-[#5e6ad2] focus:ring-2 focus:ring-[#5e69d1]/20 disabled:cursor-not-allowed disabled:opacity-60"
                    />

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => onUpdateComment(comment.id)}
                        disabled={
                          isUpdatingComment || !editingCommentBody.trim()
                        }
                        className="rounded-lg bg-[#5e6ad2] px-3 py-2 text-sm font-medium text-white hover:bg-[#828fff] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isUpdatingComment ? "Saving..." : "Save"}
                      </button>

                      <button
                        type="button"
                        onClick={onCancelEditing}
                        disabled={isUpdatingComment}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="mt-3 max-w-full whitespace-pre-wrap break-all text-sm text-slate-700">
                    {comment.body}
                  </p>
                )}
              </article>
            );
          })
        )}
      </div>

      {hasMoreComments && (
        <div className="pt-2">
          <button
            type="button"
            onClick={onLoadMoreComments}
            disabled={isLoadingMoreComments}
            className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoadingMoreComments ? "Loading..." : "Load more comments"}
          </button>
        </div>
      )}
    </section>
  );
}
