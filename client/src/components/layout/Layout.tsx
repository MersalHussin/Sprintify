import { Outlet } from "react-router"
import AppNavbar from "./app-navbar"
import AppSidebar from "./Sidebar"
import ChatbotPanel from "./chatbot-panel"
import { PageTitleProvider } from "@/context/page-title-context"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default function Layout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <PageTitleProvider>
          <AppNavbar />
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden">
            <Outlet />
          </div>
        </PageTitleProvider>
      </SidebarInset>
      <ChatbotPanel />
    </SidebarProvider>
  )
}
