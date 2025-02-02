import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai"
import { HydroComponentType, type LayoutAnalysis } from "./geminiService"
import { APIKeyManager } from "./apiKeyManager"

export interface AutomationTask {
  id: string
  name: string
  type: 'monitoring' | 'maintenance' | 'alert' | 'control'
  schedule: {
    frequency: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'on_demand'
    timeOfDay?: string // For daily/weekly/monthly tasks
    daysOfWeek?: number[] // For weekly tasks (0-6)
    dayOfMonth?: number // For monthly tasks
  }
  conditions?: {
    sensor: string
    operator: '>' | '<' | '=' | '>=' | '<='
    value: number
    unit: string
  }[]
  actions: {
    component: HydroComponentType
    action: string
    value?: number
    unit?: string
  }[]
  priority: 'low' | 'medium' | 'high' | 'critical'
}

export interface VirtualEnvironment {
  layout: LayoutAnalysis
  automationTasks: AutomationTask[]
  monitoringPoints: {
    position: [number, number, number]
    type: 'temperature' | 'humidity' | 'pH' | 'nutrient' | 'light'
    frequency: number // seconds
    lastValue?: number
  }[]
  maintenanceRoutes: {
    name: string
    points: [number, number, number][]
    frequency: 'daily' | 'weekly' | 'monthly'
  }[]
  alerts: {
    condition: string
    severity: 'info' | 'warning' | 'error' | 'critical'
    message: string
    actions: string[]
  }[]
  schedule: {
    lighting: {
      on: string // time in 24h format
      off: string
      intensity: number // percentage
    }
    watering: {
      frequency: number // times per day
      duration: number // minutes
      startTime: string // time in 24h format
    }
    nutrients: {
      schedule: {
        time: string
        formula: string
        amount: number
      }[]
    }
  }
}

const VIRTUAL_ENV_PROMPT = `You are a hydroponic system automation expert. Generate a complete virtual environment setup based on the provided layout. Include automation tasks, monitoring points, maintenance routes, alerts, and schedules.

The response should be a valid JSON object following this structure:
{
  "automationTasks": [
    {
      "id": "unique_id",
      "name": "Task Name",
      "type": "monitoring|maintenance|alert|control",
      "schedule": {
        "frequency": "hourly|daily|weekly|monthly|on_demand",
        "timeOfDay": "HH:MM" (optional),
        "daysOfWeek": [0-6] (optional),
        "dayOfMonth": 1-31 (optional)
      },
      "conditions": [
        {
          "sensor": "sensor_name",
          "operator": ">|<|=|>=|<=",
          "value": number,
          "unit": "unit_string"
        }
      ],
      "actions": [
        {
          "component": ComponentType,
          "action": "action_string",
          "value": number (optional),
          "unit": "unit_string" (optional)
        }
      ],
      "priority": "low|medium|high|critical"
    }
  ],
  "monitoringPoints": [
    {
      "position": [x, y, z],
      "type": "temperature|humidity|pH|nutrient|light",
      "frequency": number
    }
  ],
  "maintenanceRoutes": [
    {
      "name": "route_name",
      "points": [[x, y, z], ...],
      "frequency": "daily|weekly|monthly"
    }
  ],
  "alerts": [
    {
      "condition": "condition_string",
      "severity": "info|warning|error|critical",
      "message": "alert_message",
      "actions": ["action1", "action2"]
    }
  ],
  "schedule": {
    "lighting": {
      "on": "HH:MM",
      "off": "HH:MM",
      "intensity": 0-100
    },
    "watering": {
      "frequency": number,
      "duration": number,
      "startTime": "HH:MM"
    },
    "nutrients": {
      "schedule": [
        {
          "time": "HH:MM",
          "formula": "formula_string",
          "amount": number
        }
      ]
    }
  }
}

Consider:
1. Optimal sensor placement for complete coverage
2. Efficient maintenance routes
3. Plant-specific requirements
4. Energy efficiency
5. Resource optimization
6. Early warning systems
7. Automated responses to common issues
8. Schedule optimization for plant growth
9. Emergency procedures
10. Data collection points

Return ONLY the JSON object, no additional text.`

export class VirtualEnvService {
  private apiKeyManager: APIKeyManager
  private model: any

  constructor(apiKeys: string[]) {
    this.apiKeyManager = new APIKeyManager(apiKeys)
    this.initializeModel()
  }

  private async initializeModel() {
    try {
      const genAI = await this.apiKeyManager.createGeminiClient()
      this.model = genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash-exp",
        generationConfig: {
          temperature: 0.7,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 8192,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT" as HarmCategory,
            threshold: "BLOCK_MEDIUM_AND_ABOVE" as HarmBlockThreshold
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH" as HarmCategory,
            threshold: "BLOCK_MEDIUM_AND_ABOVE" as HarmBlockThreshold
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT" as HarmCategory,
            threshold: "BLOCK_MEDIUM_AND_ABOVE" as HarmBlockThreshold
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT" as HarmCategory,
            threshold: "BLOCK_MEDIUM_AND_ABOVE" as HarmBlockThreshold
          }
        ]
      })
    } catch (error) {
      console.error("Failed to initialize model:", error)
      throw error
    }
  }

  private async retryOperation<T>(operation: () => Promise<T>, maxRetries = 3): Promise<T> {
    let lastError: Error | null = null
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error as Error
        console.error(`Operation failed (attempt ${i + 1}/${maxRetries}):`, error)
        
        // Reinitialize model with a new API key
        await this.initializeModel()
      }
    }

    throw lastError || new Error("Operation failed after multiple attempts")
  }

  async generateVirtualEnvironment(layout: LayoutAnalysis): Promise<VirtualEnvironment> {
    return this.retryOperation(async () => {
      const prompt = `${VIRTUAL_ENV_PROMPT}

Layout Details:
${JSON.stringify(layout, null, 2)}

Consider the specific components and their positions when generating monitoring points and maintenance routes.
Ensure all automation tasks are optimized for the given layout and plant types.
Generate realistic and practical values for all schedules and sensor readings.
Include comprehensive error handling and failsafe procedures.
Optimize task scheduling for energy efficiency and resource utilization.`

      console.log("Sending prompt to Gemini 2.0 Flash for virtual environment generation")
      const result = await this.model.generateContent(prompt)
      let response = result.response.text()
      response = response.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()

      try {
        const parsedResponse = JSON.parse(response)
        console.log("Generated virtual environment:", parsedResponse)
        
        // Validate and normalize the response
        const normalizedResponse = {
          ...parsedResponse,
          automationTasks: parsedResponse.automationTasks?.map((task: Partial<AutomationTask>) => ({
            ...task,
            id: task.id || `task-${Math.random().toString(36).substr(2, 9)}`,
            priority: task.priority || 'medium'
          })) || [],
          monitoringPoints: parsedResponse.monitoringPoints?.map((point: { frequency?: number }) => ({
            ...point,
            frequency: Math.max(1, Math.min(point.frequency || 30, 3600)) // Ensure frequency is between 1s and 1h
          })) || [],
          alerts: parsedResponse.alerts?.map((alert: Partial<VirtualEnvironment['alerts'][0]>) => ({
            ...alert,
            severity: alert.severity || 'info'
          })) || []
        }

        return {
          layout,
          ...normalizedResponse
        }
      } catch (error) {
        console.error("JSON parsing error:", error)
        console.error("Response that failed to parse:", response)
        throw new Error("Failed to parse virtual environment response")
      }
    })
  }

  async updateAutomationTask(env: VirtualEnvironment, taskId: string, updates: Partial<AutomationTask>): Promise<VirtualEnvironment> {
    const updatedTasks = env.automationTasks.map(task =>
      task.id === taskId ? { ...task, ...updates } : task
    )
    return { ...env, automationTasks: updatedTasks }
  }

  async addAutomationTask(env: VirtualEnvironment, task: AutomationTask): Promise<VirtualEnvironment> {
    return { ...env, automationTasks: [...env.automationTasks, task] }
  }

  async removeAutomationTask(env: VirtualEnvironment, taskId: string): Promise<VirtualEnvironment> {
    return { ...env, automationTasks: env.automationTasks.filter(task => task.id !== taskId) }
  }

  async optimizeSchedule(env: VirtualEnvironment): Promise<VirtualEnvironment> {
    return this.retryOperation(async () => {
      const prompt = `Optimize the following hydroponic system schedule for maximum efficiency and plant growth:

Current Schedule:
${JSON.stringify(env.schedule, null, 2)}

Layout Details:
${JSON.stringify(env.layout, null, 2)}

Consider:
1. Plant types and their specific needs
2. Energy efficiency and peak usage hours
3. Resource optimization and water conservation
4. Growth cycles and light requirements
5. Environmental conditions and seasonal adjustments
6. Cost optimization
7. Maintenance windows
8. System stability and redundancy`

      const result = await this.model.generateContent(prompt)
      let response = result.response.text()
      response = response.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()

      const optimizedSchedule = JSON.parse(response)
      return { ...env, schedule: optimizedSchedule }
    })
  }
}

// Initialize with multiple API keys
const API_KEYS = [
  import.meta.env.VITE_GEMINI_API_KEY,
  'AIzaSyBywzgqD_P9Go3w8t2c2YYe6rs4hlKMJkk',
  // Add more API keys here
].filter(Boolean) // Filter out any undefined keys

export const virtualEnvService = new VirtualEnvService(API_KEYS) 