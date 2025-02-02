import type React from "react"
import { useRef, useState,  } from "react"
import { Canvas, useThree} from "@react-three/fiber"
import { useDrag } from "@use-gesture/react"
import { OrbitControls, Html, Line, Text } from "@react-three/drei"
import { Button, Typography, LinearProgress, Grid, Paper, IconButton, Slider } from "@mui/material"
import * as THREE from "three"
import { HydroComponentType, type LayoutAnalysis } from "../services/geminiService"
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import VirtualEnvironmentSetup from './VirtualEnvironmentSetup'
import { type VirtualEnvironment } from '../services/virtualEnvService'

interface CubeProps {
  type: HydroComponentType
  position: [number, number, number]
  onDragEnd: (position: [number, number, number]) => void
  selected?: boolean
  onClick?: () => void
}

const getComponentColor = (type: HydroComponentType): string => {
  switch (type) {
    case HydroComponentType.WATER_PUMP:
      return "#0088ff"
    case HydroComponentType.NUTRIENT_PUMP:
      return "#ff4400"
    case HydroComponentType.SENSOR_NODE:
      return "#00ff00"
    case HydroComponentType.VERTICAL_SUPPORT:
      return "#888888"
    case HydroComponentType.LIGHT_PANEL:
      return "#ffff00"
    case HydroComponentType.CAMERA:
      return "#444444"
    case HydroComponentType.DRONE:
      return "#666666"
    default:
      // Plants - generate unique colors based on type
      return `hsl(${((type - 10) * 30) % 360}, 70%, 50%)`
  }
}

const Cube: React.FC<CubeProps> = ({ type, position, onDragEnd, selected, onClick }) => {
  const [pos, setPos] = useState<[number, number, number]>(position)
  const { camera, gl } = useThree()
  const meshRef = useRef<THREE.Mesh>(null)
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
  const intersection = new THREE.Vector3()
  const color = getComponentColor(type)

  const bind = useDrag(
    ({ active, event }) => {
      if (!event || !('clientX' in event)) return
      event.stopPropagation()

      // Convert mouse coordinates to normalized device coordinates (-1 to +1)
      const rect = gl.domElement.getBoundingClientRect()
      const mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1
      const mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1

      // Update raycaster
      const raycaster = new THREE.Raycaster()
      raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), camera)

      // Find intersection with the ground plane
      if (raycaster.ray.intersectPlane(plane, intersection)) {
        // Snap to grid
        const newX = Math.round(intersection.x)
        const newZ = Math.round(intersection.z)
        const newPos: [number, number, number] = [newX, 0, newZ]
        setPos(newPos)

        if (!active) {
          onDragEnd(newPos)
        }
      }
    },
    { pointer: { capture: false } }
  )

  const scale = type >= HydroComponentType.CUCUMBER ? 0.5 : 1 // Make plants smaller

  return (
    <group position={pos}>
      <mesh 
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation()
          onClick?.()
        }}
        {...(bind() as any)}
        scale={[scale, scale, scale]}
      >
        {type === HydroComponentType.LIGHT_PANEL ? (
          <boxGeometry args={[1.5, 0.1, 1]} />
        ) : type === HydroComponentType.VERTICAL_SUPPORT ? (
          <cylinderGeometry args={[0.1, 0.1, 2, 8]} />
        ) : type >= HydroComponentType.CUCUMBER ? (
          // Plant geometry
          <group>
            <cylinderGeometry args={[0.2, 0.3, 1]} />
            <sphereGeometry args={[0.4]} />
          </group>
        ) : (
        <boxGeometry args={[1, 1, 1]} />
        )}
        <meshStandardMaterial 
          color={color} 
          emissive={selected ? color : undefined}
          emissiveIntensity={selected ? 0.5 : 0}
          metalness={0.6}
          roughness={0.4}
        />
      </mesh>
      <Html distanceFactor={10}>
        <div style={{ 
          background: "rgba(0,0,0,0.5)", 
          color: "white", 
          padding: "2px 5px", 
          borderRadius: "3px",
          border: selected ? `2px solid ${color}` : 'none',
          userSelect: 'none',
          pointerEvents: 'none'
        }}>
          {HydroComponentType[type]}
        </div>
      </Html>
    </group>
  )
}

interface SchemaComponent {
  type: HydroComponentType
  quantity: number
}

interface Setup3DDrawingProps {
  onSubmit: (layout: LayoutAnalysis, virtualEnv: VirtualEnvironment) => void
  spaceSize: number
  selectedPlants: { [id: string]: number }
}

const GridWithDimensions: React.FC<{ width: number; height: number; cellSize: number }> = ({ width, height, cellSize }) => {
  return (
    <group>
      {/* Floor plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial color="#f0f0f0" />
      </mesh>

      {/* Grid lines */}
      {Array.from({ length: width + 1 }).map((_, i) => (
        <group key={`vertical-${i}`}>
          <Line
            points={[[i - width/2, 0, -height/2], [i - width/2, 0, height/2]]}
            color="#cccccc"
            lineWidth={1}
          />
          {i < width && (
            <Text
              position={[i - width/2 + 0.5, 0.01, -height/2 - 0.3]}
              rotation={[-Math.PI / 2, 0, 0]}
              fontSize={0.3}
              color="#666666"
            >
              {`${i * cellSize}m`}
            </Text>
          )}
        </group>
      ))}
      {Array.from({ length: height + 1 }).map((_, i) => (
        <group key={`horizontal-${i}`}>
          <Line
            points={[[-width/2, 0, i - height/2], [width/2, 0, i - height/2]]}
            color="#cccccc"
            lineWidth={1}
          />
          {i < height && (
            <Text
              position={[-width/2 - 0.3, 0.01, i - height/2 + 0.5]}
              rotation={[-Math.PI / 2, 0, 0]}
              fontSize={0.3}
              color="#666666"
            >
              {`${i * cellSize}m`}
            </Text>
          )}
        </group>
      ))}

      {/* Cell size indicators */}
      {Array.from({ length: width }).map((_, i) =>
        Array.from({ length: height }).map((_, j) => (
          <Text
            key={`cell-${i}-${j}`}
            position={[i - width/2 + 0.5, 0.01, j - height/2 + 0.5]}
            rotation={[-Math.PI / 2, 0, 0]}
            fontSize={0.2}
            color="#999999"
          >
            {`${cellSize}m²`}
          </Text>
        ))
      )}

      {/* Dimension arrows and labels */}
      <group position={[0, 0.1, -height/2 - 1]}>
        <Line
          points={[[-width/2, 0, 0], [width/2, 0, 0]]}
          color="#333333"
          lineWidth={2}
        />
        <Text
          position={[0, 0.3, 0]}
          fontSize={0.4}
          color="#333333"
        >
          {`${width * cellSize}m`}
        </Text>
      </group>
      <group position={[-width/2 - 1, 0.1, 0]}>
        <Line
          points={[[0, 0, -height/2], [0, 0, height/2]]}
          color="#333333"
          lineWidth={2}
        />
        <Text
          position={[-0.3, 0.3, 0]}
          fontSize={0.4}
          color="#333333"
        >
          {`${height * cellSize}m`}
        </Text>
      </group>
    </group>
  )
}

const Setup3DDrawing: React.FC<Setup3DDrawingProps> = ({ onSubmit, spaceSize, selectedPlants = {} }) => {
  const [layout, setLayout] = useState<LayoutAnalysis | null>(null)
  const [selectedComponentId, setSelectedComponentId] = useState<number | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [cellSize, setCellSize] = useState(1)
  const [gridDimensions, setGridDimensions] = useState({
    width: Math.ceil(Math.sqrt(spaceSize)),
    height: Math.ceil(Math.sqrt(spaceSize))
  })

  // Initialize schema with both infrastructure components and selected plants
  const [schema, setSchema] = useState<SchemaComponent[]>(() => {
    const infrastructureComponents = [
      { type: HydroComponentType.WATER_PUMP, quantity: 1 },
      { type: HydroComponentType.NUTRIENT_PUMP, quantity: 1 },
      { type: HydroComponentType.SENSOR_NODE, quantity: 2 },
      { type: HydroComponentType.LIGHT_PANEL, quantity: 2 },
    ]

    // Convert selected plants to schema components
    const plantComponents = Object.entries(selectedPlants).map(([id, quantity]) => ({
      type: Number(id) + 10 as HydroComponentType, // Convert plant ID to HydroComponentType (offset by 10)
      quantity
    }))

    return [...infrastructureComponents, ...plantComponents]
  })

  const [isSchemaMode, setIsSchemaMode] = useState(true)

  // Calculate space metrics
  const totalCells = gridDimensions.width * gridDimensions.height
  const actualArea = totalCells * cellSize

  // Group components by type for display
  const groupedComponents = {
    infrastructure: schema.filter(comp => comp.type < HydroComponentType.CUCUMBER),
    plants: schema.filter(comp => comp.type >= HydroComponentType.CUCUMBER)
  }

  const handleQuantityChange = (type: HydroComponentType, change: number) => {
    setSchema(prev => prev.map(comp => 
      comp.type === type 
        ? { ...comp, quantity: Math.max(0, comp.quantity + change) }
        : comp
    ))
  }

  const addComponentType = (type: HydroComponentType) => {
    if (!schema.find(comp => comp.type === type)) {
      setSchema(prev => [...prev, { type, quantity: 1 }])
    }
  }

  const removeComponentType = (type: HydroComponentType) => {
    setSchema(prev => prev.filter(comp => comp.type !== type))
  }

  const generateLayout = async () => {
    if (isGenerating) return
    
    try {
      setIsGenerating(true)
      console.log("Generating layout with schema:", schema)
      
      // Create empty matrix with grid dimensions
      const matrix: number[][][] = [
        Array(gridDimensions.height).fill(null).map(() => 
          Array(gridDimensions.width).fill(HydroComponentType.EMPTY)
        )
      ]

      // Calculate total components
      const totalComponents = schema.reduce((sum, comp) => sum + comp.quantity, 0)
      if (totalComponents > totalCells) {
        throw new Error(`Too many components (${totalComponents}) for the available space (${totalCells} cells)`)
      }

      // Place components according to schema
      let x = 0, y = 0
      for (const component of schema) {
        for (let i = 0; i < component.quantity; i++) {
          // Find next empty position
          while (y < gridDimensions.height && matrix[0][y][x] !== HydroComponentType.EMPTY) {
            x++
            if (x >= gridDimensions.width) {
              x = 0
              y++
            }
          }
          
          // Check if we still have space
          if (y < gridDimensions.height) {
            matrix[0][y][x] = component.type
          } else {
            throw new Error("Not enough space for all components")
          }
        }
      }

      const generatedLayout: LayoutAnalysis = {
        matrix,
        recommendations: [
          "Initial layout based on schema",
          `Grid size: ${gridDimensions.width}x${gridDimensions.height}`,
          `Cell size: ${cellSize}m²`,
          `Total area: ${actualArea}m²`,
          `Total components: ${totalComponents}`
        ],
        waterFlow: [],
        nutrientDistribution: { primary: [], secondary: [] },
        environmentalZones: {
          temperature: { high: [], low: [] },
          humidity: { high: [], low: [] },
          lighting: { direct: [], indirect: [] }
        },
        maintenanceRoutes: [],
        setupType: "horizontal",
        levels: 1
      }

      console.log("Generated layout:", generatedLayout)
      setLayout(generatedLayout)
      setIsSchemaMode(false)
    } catch (error) {
      console.error("Error generating layout:", error)
      alert(error instanceof Error ? error.message : "Failed to generate layout")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleComponentClick = (id: number) => {
    console.log("Component clicked:", id)
    setSelectedComponentId(id === selectedComponentId ? null : id)
  }

  const [showVirtualEnv, setShowVirtualEnv] = useState(false)
  const [confirmedLayout, setConfirmedLayout] = useState<LayoutAnalysis | null>(null)

  if (isSchemaMode) {
    return (
      <div style={{ 
        width: "100%", 
        height: "100vh", 
        display: "flex", 
        flexDirection: "column",
        alignItems: "center", 
        padding: "2rem",
        background: "#ffffff",
        color: "#333333"
      }}>
        <Typography variant="h4" gutterBottom>
          Setup Hydroponic Components
        </Typography>
        <Typography variant="body1" style={{ marginBottom: "2rem" }}>
          Define your workspace and components
        </Typography>

        <Paper style={{ padding: "2rem", maxWidth: "800px", width: "100%", background: "#f5f5f5" }}>
          {/* Workspace Configuration */}
          <div style={{ marginBottom: "2rem" }}>
            <Typography variant="h6" gutterBottom>
              Workspace Configuration
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Paper style={{ padding: "1rem", background: "#ffffff" }}>
                  <Typography gutterBottom>Grid Width (meters)</Typography>
                  <Slider
                    value={gridDimensions.width}
                    onChange={(_, value) => setGridDimensions(prev => ({ ...prev, width: value as number }))}
                    min={1}
                    max={10}
                    step={1}
                    marks
                    valueLabelDisplay="auto"
                    style={{ marginBottom: "1rem" }}
                  />
                  <Typography gutterBottom>Grid Height (meters)</Typography>
                  <Slider
                    value={gridDimensions.height}
                    onChange={(_, value) => setGridDimensions(prev => ({ ...prev, height: value as number }))}
                    min={1}
                    max={10}
                    step={1}
                    marks
                    valueLabelDisplay="auto"
                    style={{ marginBottom: "1rem" }}
                  />
                  <Typography gutterBottom>Cell Size (m²)</Typography>
                  <Slider
                    value={cellSize}
                    onChange={(_, value) => setCellSize(value as number)}
                    min={0.5}
                    max={2}
                    step={0.5}
                    marks
                    valueLabelDisplay="auto"
                  />
                  <div style={{ marginTop: "1rem", padding: "1rem", background: "#f5f5f5", borderRadius: "4px" }}>
                    <Typography>Workspace Dimensions: {gridDimensions.width}m x {gridDimensions.height}m</Typography>
                    <Typography>Grid Size: {gridDimensions.width}x{gridDimensions.height} ({totalCells} cells)</Typography>
                    <Typography>Cell Size: {cellSize}m²</Typography>
                    <Typography>Total Area: {actualArea}m²</Typography>
                  </div>
                </Paper>
              </Grid>
            </Grid>
          </div>

          {/* Infrastructure Components */}
          <Typography variant="h6" gutterBottom style={{ marginTop: "2rem" }}>
            Infrastructure Components
          </Typography>
          <Grid container spacing={2}>
            {groupedComponents.infrastructure.map(({ type, quantity }) => (
              <Grid item xs={12} key={type}>
                <Paper style={{ padding: "1rem", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#ffffff" }}>
                  <div>
                    <Typography style={{ color: getComponentColor(type) }}>
                      {HydroComponentType[type]}
                    </Typography>
                    <Typography variant="caption" style={{ color: "#888" }}>
                      Space required: {quantity * cellSize}m²
                    </Typography>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <Button 
                      variant="outlined" 
                      onClick={() => handleQuantityChange(type, -1)}
                      disabled={quantity <= 1}
                    >
                      -
                    </Button>
                    <Typography>{quantity}</Typography>
                    <Button 
                      variant="outlined" 
                      onClick={() => handleQuantityChange(type, 1)}
                      disabled={quantity + schema.reduce((sum, comp) => sum + comp.quantity, 0) >= totalCells}
                    >
                      +
                    </Button>
                    <IconButton 
                      onClick={() => removeComponentType(type)}
                      style={{ color: "#ff4444" }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </div>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {/* Plants */}
          <Typography variant="h6" gutterBottom style={{ marginTop: "2rem" }}>
            Plants
          </Typography>
          <Grid container spacing={2}>
            {groupedComponents.plants.map(({ type, quantity }) => (
              <Grid item xs={12} key={type}>
                <Paper style={{ 
                  padding: "1rem", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "space-between", 
                  background: "#ffffff",
                  borderLeft: `4px solid ${getComponentColor(type)}`
                }}>
                  <div>
                    <Typography style={{ color: getComponentColor(type) }}>
                      {HydroComponentType[type]}
                    </Typography>
                    <Typography variant="caption" style={{ color: "#888" }}>
                      Space required: {quantity * cellSize}m²
                    </Typography>
                  </div>
                  <Typography variant="h6">
                    {quantity} plants
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          <div style={{ marginTop: "2rem" }}>
            <Typography variant="body2" style={{ color: "#888", marginBottom: "1rem" }}>
              Space Usage Summary:
            </Typography>
            <Grid container spacing={1}>
              <Grid item xs={12}>
                <Paper style={{ padding: "0.5rem", background: "#ffffff" }}>
                  <Typography>
                    Infrastructure: {groupedComponents.infrastructure.reduce((sum, comp) => sum + comp.quantity * cellSize, 0)}m²
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Paper style={{ padding: "0.5rem", background: "#ffffff" }}>
                  <Typography>
                    Plants: {groupedComponents.plants.reduce((sum, comp) => sum + comp.quantity * cellSize, 0)}m²
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Paper style={{ padding: "0.5rem", background: "#ffffff" }}>
                  <Typography>
                    Total Used: {schema.reduce((sum, comp) => sum + comp.quantity * cellSize, 0)}m² / {actualArea}m²
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </div>

          <div style={{ marginTop: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => addComponentType(HydroComponentType.SENSOR_NODE)}
              disabled={schema.reduce((sum, comp) => sum + comp.quantity, 0) >= totalCells}
            >
              Add Infrastructure
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={generateLayout}
              disabled={schema.length === 0}
            >
              Generate Layout
            </Button>
          </div>
        </Paper>
      </div>
    )
  }

  if (isGenerating) {
    return (
      <div style={{ 
        width: "100%", 
        height: "100vh", 
        display: "flex", 
        flexDirection: "column",
        alignItems: "center", 
        justifyContent: "center",
        background: "#000"
      }}>
        <Typography variant="h5" style={{ color: "#fff", marginBottom: 20 }}>
          Generating Optimal Layout...
        </Typography>
        <LinearProgress 
          style={{ width: "300px" }} 
          color="primary"
        />
      </div>
    )
  }

  if (!layout) {
    console.error("No layout available!")
    return null
  }

  if (showVirtualEnv && confirmedLayout) {
    return (
      <VirtualEnvironmentSetup 
        layout={confirmedLayout}
        onComplete={(virtualEnv) => onSubmit(confirmedLayout, virtualEnv)}
      />
    )
  }

  return (
    <div style={{ width: "100%", height: "100vh", position: "relative", background: "#ffffff" }}>
      <Canvas camera={{ position: [gridDimensions.width * 2, gridDimensions.height * 1.5, gridDimensions.width * 2], fov: 50 }}>
        <color attach="background" args={["#ffffff"]} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} castShadow />
        <GridWithDimensions 
          width={gridDimensions.width} 
          height={gridDimensions.height} 
          cellSize={cellSize}
        />
        
        {layout.matrix[0].map((row, y) =>
          row.map((cell, x) => {
            if (cell === HydroComponentType.EMPTY) return null
            return (
          <Cube
                key={`${x}-${y}-0`}
                type={cell}
                position={[x - gridDimensions.width / 2, 0, y - gridDimensions.height / 2]}
                onDragEnd={(newPosition) => {
                  const newMatrix = [...layout.matrix]
                  newMatrix[0][y][x] = HydroComponentType.EMPTY
                  const newY = Math.floor(newPosition[2] + gridDimensions.height / 2)
                  const newX = Math.floor(newPosition[0] + gridDimensions.width / 2)
                  if (newY >= 0 && newY < gridDimensions.height && newX >= 0 && newX < gridDimensions.width) {
                    newMatrix[0][newY][newX] = cell
                  }
                  setLayout({ ...layout, matrix: newMatrix })
                }}
                selected={selectedComponentId === cell}
                onClick={() => handleComponentClick(cell)}
              />
            )
          })
        )}
        
        <OrbitControls makeDefault />
      </Canvas>

      <div style={{ position: "absolute", bottom: "20px", left: "50%", transform: "translateX(-50%)", zIndex: 1000 }}>
          <Button
            variant="contained"
          color="secondary"
          style={{ marginRight: "1rem" }}
          onClick={() => setIsSchemaMode(true)}
          >
          Edit Schema
          </Button>
      <Button
        variant="contained"
        color="primary"
          onClick={() => {
            if (layout) {
              setConfirmedLayout(layout)
              setShowVirtualEnv(true)
            }
          }}
        >
          Setup Virtual Environment
      </Button>
      </div>
    </div>
  )
}

export default Setup3DDrawing

