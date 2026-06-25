import { FaClock, FaUsers } from "react-icons/fa6"

interface TeamStatsRowProps {
  memberCount: number
  inviteCount: number
}

export function TeamStatsRow({ memberCount, inviteCount }: TeamStatsRowProps) {
  return (
    <div className="flex gap-4 mb-10">
      <div className="rounded-xl border border-border bg-bg-surface p-5 flex items-center gap-4 w-64">
        <div className="w-12 h-12 rounded-xl bg-accent-subtle flex items-center justify-center text-accent">
          <FaUsers size={20} />
        </div>
        <div>
          <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">
            Total Members
          </p>
          <p className="text-2xl font-bold text-text-primary">{memberCount}</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-bg-surface p-5 flex items-center gap-4 w-64">
        <div className="w-12 h-12 rounded-xl bg-accent-subtle flex items-center justify-center text-accent">
          <FaClock size={20} />
        </div>
        <div>
          <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">
            Pending Invites
          </p>
          <p className="text-2xl font-bold text-text-primary">{inviteCount}</p>
        </div>
      </div>
    </div>
  )
}
