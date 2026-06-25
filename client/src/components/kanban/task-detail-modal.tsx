import { Loader2, Trash2 } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import type { TaskListPatch } from "@/types/task"

import { PANEL_FOOTER_CLASS } from "./task-detail/constants"
import {
  TaskDetailCommentsPanel,
  TaskDetailDetailsPanel,
  TaskDetailSubtasksSection,
} from "./task-detail/panels"
import { useTaskDetail } from "./task-detail/use-task-detail"

export type { TaskListPatch }

export function TaskDetailModal({
  taskId,
  open,
  onOpenChange,
  onTaskUpdated,
}: {
  taskId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onTaskUpdated?: (patch?: TaskListPatch) => void
}) {
  const detail = useTaskDetail({ taskId, open, onOpenChange, onTaskUpdated })

  return (
    <Dialog open={open} onOpenChange={detail.handleOpenChange}>
      <DialogContent
        className="flex h-[min(85vh,720px)] max-w-5xl flex-col gap-0 overflow-hidden p-0 sm:max-w-5xl"
        showCloseButton
      >
        <DialogTitle className="sr-only">
          {detail.task?.name ?? "Task details"}
        </DialogTitle>
        <DialogDescription className="sr-only">
          Task details, subtasks, and comments
        </DialogDescription>

        {detail.loading || !detail.task ? (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col md:flex-row">
            <div className="flex min-h-0 flex-1 flex-col border-border md:border-r">
              <TaskDetailDetailsPanel
                task={detail.task}
                users={detail.users}
                teamMembers={detail.teamMembers}
                isManager={detail.isManager}
                canEditStatusAndSubtasks={detail.canEditStatusAndSubtasks}
                editingTitle={detail.editingTitle}
                titleDraft={detail.titleDraft}
                onTitleDraftChange={detail.setTitleDraft}
                onSaveTitle={() => void detail.saveTitle()}
                onCancelTitleEdit={() => {
                  detail.setEditingTitle(false)
                  detail.setTitleDraft(detail.task?.name ?? "")
                }}
                onStartTitleEdit={() => detail.setEditingTitle(true)}
                editingDescription={detail.editingDescription}
                descriptionDraft={detail.descriptionDraft}
                onDescriptionDraftChange={detail.setDescriptionDraft}
                onSaveDescription={() => void detail.saveDescription()}
                onCancelDescriptionEdit={() => {
                  detail.setEditingDescription(false)
                  detail.setDescriptionDraft(detail.task?.description ?? "")
                }}
                onStartDescriptionEdit={() => detail.setEditingDescription(true)}
                editingCategory={detail.editingCategory}
                categoryDraft={detail.categoryDraft}
                onCategoryDraftChange={detail.setCategoryDraft}
                onSaveCategory={() => void detail.saveCategory()}
                onCancelCategoryEdit={() => {
                  detail.setEditingCategory(false)
                  detail.setCategoryDraft(detail.task?.category ?? "")
                }}
                onStartCategoryEdit={() => {
                  detail.setCategoryDraft(detail.task?.category ?? "")
                  detail.setEditingCategory(true)
                }}
                onUpdateTaskFields={(fields) => void detail.updateTaskFields(fields)}
                onAssigneeToggle={(userId, checked) =>
                  void detail.handleAssigneeToggle(userId, checked)
                }
              />

              <Separator />

              <TaskDetailSubtasksSection
                subtasks={detail.subtasks}
                doneCount={detail.doneCount}
                canEditStatusAndSubtasks={detail.canEditStatusAndSubtasks}
                addingSubtask={detail.addingSubtask}
                subtaskAddDraft={detail.subtaskAddDraft}
                onSubtaskAddDraftChange={detail.setSubtaskAddDraft}
                onStartAddSubtask={() => detail.setAddingSubtask(true)}
                onSaveSubtaskAdd={() => void detail.saveSubtaskAdd()}
                onCancelSubtaskAdd={() => {
                  detail.setAddingSubtask(false)
                  detail.setSubtaskAddDraft("")
                }}
                editingSubtaskId={detail.editingSubtaskId}
                subtaskEditDraft={detail.subtaskEditDraft}
                onSubtaskEditDraftChange={detail.setSubtaskEditDraft}
                onSaveSubtaskEdit={() => void detail.saveSubtaskEdit()}
                onCancelSubtaskEdit={detail.cancelSubtaskEdit}
                onSubtaskToggle={(subtask) => void detail.handleSubtaskToggle(subtask)}
                onStartSubtaskEdit={detail.startSubtaskEdit}
                onSubtaskDelete={(id) => void detail.handleSubtaskDelete(id)}
                onSubtaskDragEnd={(result) => void detail.handleSubtaskDragEnd(result)}
              />

              {detail.isManager ? (
                <div className={PANEL_FOOTER_CLASS}>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    disabled={detail.deleting}
                    onClick={() => void detail.handleDelete()}
                  >
                    {detail.deleting ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Trash2 className="size-4" />
                    )}
                    Delete task
                  </Button>
                </div>
              ) : null}
            </div>

            <TaskDetailCommentsPanel
              task={detail.task}
              comments={detail.comments}
              users={detail.users}
              commentDraft={detail.commentDraft}
              submittingComment={detail.submittingComment}
              onCommentDraftChange={detail.setCommentDraft}
              onAddComment={() => void detail.handleAddComment()}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
