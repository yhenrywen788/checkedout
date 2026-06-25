"use client";

import { useFormState } from "react-dom";
import { addComment, type CommentState } from "@/lib/actions/engagement";
import { SubmitButton } from "@/components/SubmitButton";

export function CommentForm({ postId, path }: { postId: string; path: string }) {
  const [state, formAction] = useFormState<CommentState, FormData>(
    addComment,
    {},
  );
  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="postId" value={postId} />
      <input type="hidden" name="path" value={path} />
      <textarea
        name="body"
        rows={3}
        className="field"
        placeholder="Add something real. Questions welcome; spin isn't."
      />
      <div className="flex items-center justify-between gap-2">
        <label className="flex items-center gap-2 text-xs text-muted">
          <input type="checkbox" name="identityMode" value="ANON" className="h-4 w-4" />
          Reply anonymously
        </label>
        <SubmitButton className="btn-primary" pendingLabel="Posting…">
          Reply
        </SubmitButton>
      </div>
      {state.error && <p className="text-sm text-contested">{state.error}</p>}
    </form>
  );
}
