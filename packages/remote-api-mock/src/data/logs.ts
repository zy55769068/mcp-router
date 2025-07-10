import type { RequestLogEntry } from '@mcp_router/remote-api-types'

class LogsStore {
  private logs: Map<string, RequestLogEntry> = new Map()
  private nextId = 1

  list(params: {
    limit?: number
    cursor?: string
    serverId?: string
    requestType?: string
    startDate?: string
    endDate?: string
    responseStatus?: 'success' | 'error'
  } = {}): { logs: RequestLogEntry[]; total: number; nextCursor?: string; hasMore: boolean } {
    let logs = Array.from(this.logs.values())
    
    // Filter by serverId
    if (params.serverId) {
      logs = logs.filter(log => log.serverId === params.serverId)
    }
    
    // Filter by requestType
    if (params.requestType) {
      logs = logs.filter(log => log.requestType === params.requestType)
    }
    
    // Filter by responseStatus
    if (params.responseStatus) {
      logs = logs.filter(log => log.responseStatus === params.responseStatus)
    }
    
    // Filter by date range
    if (params.startDate) {
      const startTimestamp = new Date(params.startDate).getTime()
      logs = logs.filter(log => log.timestamp >= startTimestamp)
    }
    if (params.endDate) {
      const endTimestamp = new Date(params.endDate).getTime()
      logs = logs.filter(log => log.timestamp <= endTimestamp)
    }
    
    // Sort by timestamp descending
    logs.sort((a, b) => b.timestamp - a.timestamp)
    
    // Handle cursor-based pagination
    let startIndex = 0
    if (params.cursor) {
      const cursorIndex = logs.findIndex(log => log.id === params.cursor)
      if (cursorIndex !== -1) {
        startIndex = cursorIndex + 1
      }
    }
    
    const limit = params.limit || 50
    const paginatedLogs = logs.slice(startIndex, startIndex + limit)
    const hasMore = startIndex + limit < logs.length
    const nextCursor = hasMore ? paginatedLogs[paginatedLogs.length - 1]?.id : undefined
    
    return {
      logs: paginatedLogs,
      total: logs.length,
      nextCursor,
      hasMore
    }
  }

  get(id: string): RequestLogEntry | null {
    return this.logs.get(id) || null
  }

  create(data: Omit<RequestLogEntry, 'id'>): RequestLogEntry {
    const id = `log-${this.nextId++}`
    const log: RequestLogEntry = {
      ...data,
      id
    }
    
    this.logs.set(id, log)
    return log
  }

  delete(id: string): boolean {
    return this.logs.delete(id)
  }

  clear(serverId?: string): void {
    if (serverId) {
      // Delete only logs for specific server
      for (const [id, log] of this.logs.entries()) {
        if (log.serverId === serverId) {
          this.logs.delete(id)
        }
      }
    } else {
      // Clear all logs
      this.logs.clear()
    }
  }

  // Helper method to add sample logs
  addSampleLog(serverId: string, serverName: string, responseStatus: 'success' | 'error' = 'success'): void {
    const requestTypes = ['tools/list', 'resources/list', 'prompts/list', 'completion/complete']
    const randomRequestType = requestTypes[Math.floor(Math.random() * requestTypes.length)]
    
    this.create({
      timestamp: Date.now(),
      clientId: 'mock-client-1',
      clientName: 'Mock Client',
      serverId,
      serverName,
      requestType: randomRequestType,
      requestParams: { example: 'params' },
      responseStatus,
      responseData: responseStatus === 'success' ? { result: 'ok' } : undefined,
      duration: Math.floor(Math.random() * 1000) + 100,
      errorMessage: responseStatus === 'error' ? 'Sample error message' : undefined
    })
  }
}

export const logsStore = new LogsStore()