import { useCallback, useEffect, useRef, useState, type FormEvent } from "react"
import { useParams } from "react-router"
import { BotMessageSquare, Loader2, Send } from "lucide-react"
import { Streamdown } from "streamdown"
import "streamdown/styles.css"

import { apiFetch } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

type ChatMessage = {
  role: "user" | "assistant"
  content: string
}

interface Project {
  _id: string
  name: string
}

function sessionStorageKey(projectId: string) {
  return `chatbot-session:${projectId}`
}

export default function ChatbotPanel() {
  const { boardId } = useParams()
  const [open, setOpen] = useState(false)
  const [projectId, setProjectId] = useState<string | null>(null)
  const [projectName, setProjectName] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [loadingProject, setLoadingProject] = useState(true)
  const [sending, setSending] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function resolveProject() {
      setLoadingProject(true)
      try {
        if (boardId) {
          const projectRes = await apiFetch(`/projects/${boardId}`)
          if (projectRes?.project) {
            setProjectId(projectRes.project._id)
            setProjectName(projectRes.project.name)
            return
          }
        }

        const teamsRes = await apiFetch("/teams")
        const teams = teamsRes?.teams || []
        const teamId = teams[0]?._id
        if (!teamId) {
          setProjectId(null)
          setProjectName(null)
          return
        }

        const projectsRes = await apiFetch(`/teams/${teamId}/projects`)
        const projects: Project[] = projectsRes?.projects || projectsRes?.items || []
        const project = projects[0] ?? null
        setProjectId(project?._id ?? null)
        setProjectName(project?.name ?? null)
      } catch (err) {
        console.error("Failed to resolve chatbot project", err)
        setProjectId(null)
        setProjectName(null)
      } finally {
        setLoadingProject(false)
      }
    }

    resolveProject()
  }, [boardId])

  const loadHistory = useCallback(async (pid: string, sid: string) => {
    setLoadingHistory(true)
    try {
      const result = await apiFetch(`/ai/${pid}/chat-history/${sid}`, {
        method: "POST",
      })
      const history = (result?.chatHistory ?? []) as Array<{
        role: string
        content?: string | null
      }>
      const visible = history
        .filter((m) => m.role === "user" || m.role === "assistant")
        .map((m) => ({
          role: m.role as "user" | "assistant",
          content: typeof m.content === "string" ? m.content : "",
        }))
        .filter((m) => m.content.length > 0)
      setMessages(visible)
    } catch (err) {
      console.error("Failed to load chat history", err)
      setMessages([])
    } finally {
      setLoadingHistory(false)
    }
  }, [])

  useEffect(() => {
    if (!open || !projectId) return

    const stored = sessionStorage.getItem(sessionStorageKey(projectId))
    setSessionId(stored)
    if (stored) {
      loadHistory(projectId, stored)
    } else {
      setMessages([])
    }
  }, [open, projectId, loadHistory])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, sending])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || !projectId || sending) return

    setError(null)
    setInput("")
    setMessages((prev) => [...prev, { role: "user", content: text }])
    setSending(true)

    try {
      const result = await apiFetch(`/ai/${projectId}/chat`, {
        method: "POST",
        body: JSON.stringify({
          message: text,
          ...(sessionId ? { sessionId } : {}),
        }),
      })

      const newSessionId = result?.sessionId as string
      const response = result?.response as { content?: string | null }
      const assistantContent =
        typeof response?.content === "string" ? response.content : ""

      sessionStorage.setItem(sessionStorageKey(projectId), newSessionId)
      setSessionId(newSessionId)
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: assistantContent },
      ])
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to send message"
      setError(message)
      setMessages((prev) => prev.slice(0, -1))
      setInput(text)
    } finally {
      setSending(false)
    }
  }

  const handleSend = async (e: FormEvent) => {
    e.preventDefault()
    await sendMessage()
  }

  const canSend = Boolean(projectId && input.trim() && !sending)

  return (
    <>
      <Button
        type="button"
        aria-label={open ? "Close assistant" : "Open assistant"}
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="fixed right-0 top-1/2 z-40 h-11 w-11 -translate-y-1/2 rounded-r-none rounded-l-xl border border-border border-r-0"
        size="icon"
      >
        <BotMessageSquare className="size-5" />
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
          <SheetHeader className="border-b border-border px-4 py-4">
            <SheetTitle>Project assistant</SheetTitle>
            <SheetDescription>
              {loadingProject
                ? "Loading project context…"
                : projectName
                  ? `Chatting about ${projectName}`
                  : "Create a project to start chatting"}
            </SheetDescription>
          </SheetHeader>

          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4">
              {loadingHistory ? (
                <div className="flex flex-1 items-center justify-center text-muted-foreground">
                  <Loader2 className="size-5 animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {projectId
                    ? "Ask about tasks, sprints, or your project."
                    : "Open a board or create a project first."}
                </p>
              ) : (
                messages.map((message, index) => (
                  <div
                    key={`${message.role}-${index}`}
                    className={cn(
                      "max-w-[85%] rounded-xl px-3 py-2 text-sm",
                      message.role === "user"
                        ? "ml-auto bg-primary text-primary-foreground"
                        : "mr-auto bg-muted text-foreground",
                    )}
                  >
                    {message.role === "assistant" ? (
                      <Streamdown
                        mode="static"
                        className="[&_*]:text-inherit [&_a]:text-primary [&_code]:text-foreground [&_pre]:bg-background/60 [&_strong]:text-foreground"
                      >
                        {message.content}
                      </Streamdown>
                    ) : (
                      message.content
                    )}
                  </div>
                ))
              )}
              {sending ? (
                <div className="mr-auto flex items-center gap-2 rounded-xl bg-muted px-3 py-2 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />
                  Thinking…
                </div>
              ) : null}
              <div ref={messagesEndRef} />
            </div>

            {error ? (
              <p className="px-4 pb-2 text-sm text-destructive" role="alert">
                {error}
              </p>
            ) : null}

            <form
              onSubmit={handleSend}
              className="flex flex-col gap-2 border-t border-border p-4"
            >
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  projectId ? "Ask the assistant…" : "No project available"
                }
                disabled={!projectId || sending}
                rows={2}
                className="min-h-0 resize-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    void sendMessage()
                  }
                }}
              />
              <Button type="submit" disabled={!canSend} className="self-end">
                {sending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Send className="size-4" />
                )}
                Send
              </Button>
            </form>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
