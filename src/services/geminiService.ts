import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai"
import { APIKeyManager } from "./apiKeyManager"

export enum HydroComponentType {
  EMPTY = 0,
  WATER_PUMP = 1,
  NUTRIENT_PUMP = 2,
  SENSOR_NODE = 3,
  VERTICAL_SUPPORT = 4,
  LIGHT_PANEL = 5,
  CAMERA = 6,
  DRONE = 7,
  CUCUMBER = 10,
  STRAWBERRY = 11,
  TOMATO = 12,
  LETTUCE = 13,
  BASIL = 14,
  BELL_PEPPER = 15,
  SPINACH = 16,
  KALE = 17,
  MINT = 18,
  CHERRY_TOMATOES = 19,
  ARUGULA = 20,
  HERBS_MIX = 21,
}

export type SetupType = "horizontal" | "vertical"

export interface LayoutAnalysis {
  matrix: number[][][]
  recommendations: string[]
  waterFlow: {
    from: [number, number, number]
    to: [number, number, number]
  }[]
  nutrientDistribution: {
    primary: [number, number, number][]
    secondary: [number, number, number][]
  }
  environmentalZones: {
    temperature: {
      high: [number, number, number][]
      low: [number, number, number][]
    }
    humidity: {
      high: [number, number, number][]
      low: [number, number, number][]
    }
    lighting: {
      direct: [number, number, number][]
      indirect: [number, number, number][]
    }
  }
  maintenanceRoutes: [number, number, number][]
  setupType: SetupType
  levels: number
  monitoringDevices?: {
    cameras: [number, number, number][]
    drones: [number, number, number][]
  }
  selectedPlants: { [id: string]: number }
  plantData: {
    id: string
    name: string
    growthTime: number
    spaceRequired: number
  }[]
}

export interface LayoutRequest {
  spaceSize: number
  selectedPlants: { [id: string]: number }
  plantData: {
    id: string
    name: string
    growthTime: number
    spaceRequired: number
  }[]
  setupType: SetupType
  maxHeight?: number
}

const GEMINI_PROMPT = `You are a hydroponic system layout optimizer. Return a valid JSON object with a 3D matrix that represents the optimal placement of plants, components, and monitoring devices. Consider the space size, selected plants, and setup type (horizontal or vertical).

The matrix should be a 3D array where each number represents:
${Object.entries(HydroComponentType)
  .filter(([key, value]) => typeof value === "number")
  .map(([key, value]) => `${value}: ${key}`)
  .join("\n")}

Example response format:
{
  "matrix": [
    [
      [0, 1, 10, 0, 6],
      [2, 0, 12, 0, 0],
      [0, 11, 0, 3, 6]
    ],
    [
      [0, 5, 13, 0, 0],
      [3, 0, 14, 0, 7],
      [0, 15, 0, 5, 0]
    ]
  ],
  "recommendations": [
    "Group similar plants for efficient nutrient distribution",
    "Ensure proper spacing between plants for optimal growth",
    "Place cameras strategically for maximum coverage",
    "Use drones for larger setups to monitor hard-to-reach areas"
  ],
  "waterFlow": [
    { "from": [0, 0, 0], "to": [2, 0, 1] },
    { "from": [0, 1, 0], "to": [2, 1, 1] }
  ],
  "nutrientDistribution": {
    "primary": [[0, 0, 0], [2, 0, 2]],
    "secondary": [[1, 0, 1], [3, 0, 3]]
  },
  "environmentalZones": {
    "temperature": {
      "high": [[0, 0, 0], [1, 0, 1]],
      "low": [[2, 0, 2], [3, 0, 3]]
    },
    "humidity": {
      "high": [[0, 0, 0], [1, 0, 1]],
      "low": [[2, 0, 2], [3, 0, 3]]
    },
    "lighting": {
      "direct": [[0, 0, 0], [1, 0, 1]],
      "indirect": [[2, 0, 2], [3, 0, 3]]
    }
  },
  "maintenanceRoutes": [[0, 0, 0], [1, 0, 1], [2, 0, 2], [3, 0, 3]],
  "setupType": "vertical",
  "levels": 2,
  "monitoringDevices": {
    "cameras": [[0, 0, 4], [2, 0, 4]],
    "drones": [[1, 1, 1]]
  }
}

Consider:
1. Group similar plants together
2. Place water pumps and nutrient pumps strategically
3. Distribute sensor nodes evenly
4. Leave appropriate spacing between plants
5. For vertical setups, use multiple levels and add vertical supports
6. Optimize light distribution, especially for vertical setups
7. Create efficient water flow and nutrient distribution paths
8. Design maintenance routes for easy access to all plants and components
9. Place cameras for optimal coverage (1 camera per square meter for small setups)
10. Use drones for larger setups to monitor hard-to-reach areas

Return ONLY the JSON object, no additional text.`

export class GeminiService {
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
        model: "gemini-2.0-flash-thinking-exp-01-21",
        generationConfig: {
          temperature: 0.6,
          topP: 0.9,
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

  async generateLayout(request: LayoutRequest): Promise<LayoutAnalysis> {
    return this.retryOperation(async () => {
      const prompt = `${GEMINI_PROMPT}

Space size: ${request.spaceSize}m²
Setup type: ${request.setupType}
${request.setupType === "vertical" ? `Max height: ${request.maxHeight || 3}m` : ""}

Selected plants:
${Object.entries(request.selectedPlants || {})
  .map(([id, quantity]) => {
    const plant = (request.plantData || []).find((p) => p.id === id);
    return `- ${plant?.name || id} (ID: ${id}): ${quantity} plants, Growth time: ${plant?.growthTime || 0} days, Space required: ${plant?.spaceRequired || 0}m²`;
  })
  .join("\n")}

Additional considerations:
1. Optimize for energy efficiency and resource utilization
2. Consider plant growth patterns and light requirements
3. Ensure proper air circulation and temperature control
4. Design for scalability and future expansion
5. Implement redundancy for critical systems
6. Create efficient maintenance access routes
7. Optimize sensor placement for comprehensive monitoring
8. Consider seasonal variations in environmental conditions
9. Plan for automated harvesting and maintenance procedures
10. Implement zones for different growth stages`

      console.log("Sending prompt to Gemini 2.0 Flash Thinking:", prompt)
      const result = await this.model.generateContent(prompt)
      let response = result.response.text()
      response = response.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()

      console.log("Raw Gemini response:", response)

      try {
        const parsedResponse = JSON.parse(response)
        
        // Validate and normalize the response
        const normalizedResponse: LayoutAnalysis = {
          ...parsedResponse,
          matrix: this.validateMatrix(parsedResponse.matrix, request),
          recommendations: parsedResponse.recommendations || [],
          waterFlow: this.validateWaterFlow(parsedResponse.waterFlow || []),
          nutrientDistribution: {
            primary: parsedResponse.nutrientDistribution?.primary || [],
            secondary: parsedResponse.nutrientDistribution?.secondary || []
          },
          environmentalZones: {
            temperature: {
              high: parsedResponse.environmentalZones?.temperature?.high || [],
              low: parsedResponse.environmentalZones?.temperature?.low || []
            },
            humidity: {
              high: parsedResponse.environmentalZones?.humidity?.high || [],
              low: parsedResponse.environmentalZones?.humidity?.low || []
            },
            lighting: {
              direct: parsedResponse.environmentalZones?.lighting?.direct || [],
              indirect: parsedResponse.environmentalZones?.lighting?.indirect || []
            }
          },
          maintenanceRoutes: parsedResponse.maintenanceRoutes || [],
          setupType: request.setupType,
          levels: request.setupType === "vertical" ? (parsedResponse.levels || 1) : 1,
          monitoringDevices: {
            cameras: parsedResponse.monitoringDevices?.cameras || [],
            drones: parsedResponse.monitoringDevices?.drones || []
          },
          selectedPlants: request.selectedPlants || {},
          plantData: request.plantData || []
        }

        console.log("Normalized layout:", normalizedResponse)
        return normalizedResponse
      } catch (error) {
        console.error("JSON parsing error:", error)
        console.error("Response that failed to parse:", response)
        throw new Error("Failed to parse hydroponic layout response")
      }
    })
  }

  private validateMatrix(matrix: number[][][], request: LayoutRequest): number[][][] {
    if (!matrix || !Array.isArray(matrix)) {
      // Create empty matrix if none provided
      const size = Math.ceil(Math.sqrt(request.spaceSize))
      return [Array(size).fill(Array(size).fill(HydroComponentType.EMPTY))]
    }

    // Ensure all values are valid HydroComponentTypes
    return matrix.map(level =>
      level.map(row =>
        row.map(cell => {
          if (Object.values(HydroComponentType).includes(cell)) {
            return cell
          }
          return HydroComponentType.EMPTY
        })
      )
    )
  }

  private validateWaterFlow(waterFlow: { from: [number, number, number], to: [number, number, number] }[]): typeof waterFlow {
    return waterFlow.filter(flow =>
      Array.isArray(flow.from) && flow.from.length === 3 &&
      Array.isArray(flow.to) && flow.to.length === 3 &&
      flow.from.every(n => typeof n === 'number') &&
      flow.to.every(n => typeof n === 'number')
    )
  }
}

// Initialize with multiple API keys
const API_KEYS = [
  import.meta.env.VITE_GEMINI_API_KEY,
  'AIzaSyBywzgqD_P9Go3w8t2c2YYe6rs4hlKMJkk',
  // Add more API keys here
].filter(Boolean) // Filter out any undefined keys

export const geminiService = new GeminiService(API_KEYS) 
