export type GeneratedTask = {
  name: string
  description: string
  priority?: string
  status?: string
  category?: string
  subtasks?: { name: string; completed: boolean }[]
}

export type TaskSubtask = {
  _id: string
  name: string
  completed: boolean
}

export type TaskComment = {
  _id: string
  taskId: string
  author: string
  content: string
  createdAt: string
}

export type TaskUser = {
  id: string
  name?: string
  professionalTitle?: string
}

export type TaskDetail = {
  _id: string
  name: string
  description?: string
  status: string
  priority?: string
  category?: string
  assignees?: string[]
  subtasks?: TaskSubtask[]
  teamId?: string
  createdBy: string
  createdAt?: string
  updatedAt?: string
}

export type TaskDetailResponse = {
  task: TaskDetail
  comments: TaskComment[]
  users: Record<string, TaskUser>
  callerRole?: string
}
