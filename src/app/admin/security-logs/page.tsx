"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, X, Filter, Download, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { format } from "date-fns"
import { getAdminLogs } from "@/actions/admin"
import { toast } from "sonner"
import { ActionDropdown } from "@/components/admin/action-dropdown"
import { LogDetailDialog } from "@/components/admin/log-detail-dialog"

interface AdminLog {
  id: string
  action: string
  adminId: string
  adminName: string
  target: string
  details: string
  timestamp: string
}

export default function SecurityLogsPage() {
  const [loading, setLoading] = useState(true)
  const [logs, setLogs] = useState<AdminLog[]>([])
  const [search, setSearch] = useState("")
  const [actionFilter, setActionFilter] = useState("all")
  const [selectedLog, setSelectedLog] = useState<AdminLog | null>(null)
  const [isViewingDetails, setIsViewingDetails] = useState(false)

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const data = await getAdminLogs()
      setLogs(data)
    } catch (error) {
      console.error("Failed to fetch security logs:", error)
      toast.error("Failed to load security logs")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [])

  const filteredLogs = logs.filter(log => {
    const matchesSearch = search === "" || 
      log.details.toLowerCase().includes(search.toLowerCase()) ||
      log.adminName.toLowerCase().includes(search.toLowerCase()) ||
      log.target.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase())
    
    const matchesAction = actionFilter === "all" || log.action === actionFilter
    
    return matchesSearch && matchesAction
  })

  const uniqueActions = Array.from(new Set(logs.map(log => log.action)))

  const getActionColor = (action: string) => {
    if (action.includes("delete")) return "bg-red-500"
    if (action.includes("update") || action.includes("edited")) return "bg-blue-500"
    if (action.includes("create") || action.includes("add")) return "bg-green-500"
    if (action.includes("suspend")) return "bg-yellow-500"
    return "bg-slate-500"
  }

  const exportToCSV = () => {
    const headers = ["ID", "Action", "Admin", "Target", "Details", "Timestamp"]
    const csvData = [
      headers.join(","),
      ...filteredLogs.map(log => [
        log.id,
        log.action,
        log.adminName,
        log.target,
        `"${log.details.replace(/"/g, '""')}"`,
        log.timestamp
      ].join(","))
    ].join("\n")
    
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `security-logs-${format(new Date(), "yyyy-MM-dd")}.csv`)
    link.style.display = "none"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success("CSV file downloaded")
  }

  const handleViewDetails = (log: AdminLog) => {
    setSelectedLog(log)
    setIsViewingDetails(true)
  }

  if (loading && logs.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-16 h-16 border-4 border-t-orange-500 border-orange-200 rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Security Logs</h1>
        <p className="text-muted-foreground">Monitor all administrative actions in the system</p>
      </div>

      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 w-full md:max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search logs..."
              className="w-full pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full"
                onClick={() => setSearch("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <SelectValue placeholder="Filter by action" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Filter by action</SelectLabel>
                <SelectItem value="all">All Actions</SelectItem>
                {uniqueActions.map(action => (
                  <SelectItem key={action} value={action}>{action.replace(/_/g, " ")}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={exportToCSV} variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export to CSV
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Security Audit Trail</CardTitle>
          <CardDescription>Detailed audit logs of all administrative actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-3 text-left font-medium">Action</th>
                  <th className="p-3 text-left font-medium">Admin</th>
                  <th className="p-3 text-left font-medium">Target</th>
                  <th className="p-3 text-left font-medium">Details</th>
                  <th className="p-3 text-left font-medium">Timestamp</th>
                  <th className="p-3 text-right font-medium sr-only">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="border-b">
                    <td className="p-3">
                      <Badge className={getActionColor(log.action)}>
                        {log.action.replace(/_/g, " ")}
                      </Badge>
                    </td>
                    <td className="p-3">{log.adminName}</td>
                    <td className="p-3">{log.target}</td>
                    <td className="p-3 max-w-md truncate">{log.details}</td>
                    <td className="p-3 whitespace-nowrap">
                      {format(new Date(log.timestamp), "MMM d, yyyy HH:mm")}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleViewDetails(log)}
                        >
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View details</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                
                {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      No logs matching your criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <LogDetailDialog
        log={selectedLog}
        open={isViewingDetails}
        onClose={() => setIsViewingDetails(false)}
      />
    </div>
  )
} 