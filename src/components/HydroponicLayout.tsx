import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { 
  OrbitControls, 
  PerspectiveCamera, 
  Environment, 
  ContactShadows, 
  Html, 
  Box, 
  Cylinder,
  useGLTF 
} from "@react-three/drei"
import * as THREE from "three"
import { HydroComponentType, type LayoutAnalysis, geminiService, type SetupType } from "../services/geminiService"
import { Box as MuiBox, Typography, Slider, Button, Chip } from "@mui/material"
import AICamera from "./AICamera"
import { Fog } from 'three'
import { ModelLoader, MODEL_PATHS } from './ModelLoader'

const PLANT_GROWTH_CYCLE = 60 // Seconds for demonstration purposes

// Model loading with error handling
const Model = ({ url, scale = 1, rotation = [0, 0, 0] }: { url: string; scale?: number; rotation?: [number, number, number] }) => {
  const { scene } = useGLTF(url)
  return <primitive object={scene} scale={scale} rotation={rotation} />
}

interface GridCellProps {
  type: HydroComponentType
  position: [number, number, number]
  size: number
  progress: number
  showLabel?: boolean
}

const GridCell = ({ type, position, size, progress, showLabel = true }: GridCellProps) => {
  const meshRef = useRef<THREE.Mesh>(null)
  const [growth, setGrowth] = useState(0)

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const scale = 0.8 + Math.sin(clock.elapsedTime * 2) * 0.05
      meshRef.current.scale.set(scale, scale, scale)
      setGrowth(Math.min(1, progress / PLANT_GROWTH_CYCLE))
    }
  })

  if (type === HydroComponentType.EMPTY) return null

  const renderComponent = () => {
    switch (type) {
      case HydroComponentType.WATER_PUMP:
        return (
          <group position={[0, 0.15, 0]}>
            <ModelLoader 
              url={MODEL_PATHS.WATER_PUMP}
              scale={0.2}
              rotation={[0, Math.PI / 2, 0]}
            />
            <pointLight color="#0088ff" intensity={0.2} distance={1} />
          </group>
        )

      case HydroComponentType.NUTRIENT_PUMP:
        return (
          <group position={[0, 0.15, 0]}>
            <ModelLoader 
              url={MODEL_PATHS.NUTRIENT_PUMP}
              scale={0.2}
              rotation={[0, Math.PI / 2, 0]}
            />
            <pointLight color="#ff4400" intensity={0.2} distance={1} />
          </group>
        )

      case HydroComponentType.SENSOR_NODE:
        return (
          <group position={[0, 0.1, 0]}>
            <ModelLoader 
              url={MODEL_PATHS.SENSOR}
              scale={0.15}
            />
            <pointLight color="#44ff44" intensity={0.5} distance={1} />
          </group>
        )

      case HydroComponentType.LIGHT_PANEL:
        return (
          <group position={[0, size * 0.5, 0]}>
            <ModelLoader 
              url={MODEL_PATHS.LIGHT_PANEL}
              scale={0.3}
            />
            <pointLight
              color="#ffffff"
              intensity={1}
              distance={2}
              decay={2}
              position={[0, -0.1, 0]}
            />
          </group>
        )

      case HydroComponentType.VERTICAL_SUPPORT:
        return (
          <group>
            <ModelLoader 
              url={MODEL_PATHS.SUPPORT}
              scale={0.25}
            />
          </group>
        )

      case HydroComponentType.CAMERA:
        return (
          <group position={[0, 0.3, 0]}>
            <ModelLoader 
              url={MODEL_PATHS.CAMERA}
              scale={0.2}
              rotation={[0, Math.PI, 0]}
            />
          </group>
        )

      case HydroComponentType.DRONE:
        return (
          <group position={[0, 0.2, 0]}>
            <ModelLoader 
              url={MODEL_PATHS.DRONE}
              scale={0.25}
            />
          </group>
        )

      default: // Plants
        const plantType = type - 10 // Convert to plant index
        const plantModel = MODEL_PATHS[`PLANT_${(plantType % 4) + 1}` as keyof typeof MODEL_PATHS]
        return (
          <group>
            <group position={[0, growth * 0.3, 0]}>
              <ModelLoader 
                url={plantModel}
                scale={0.2 * (0.5 + growth * 0.5)}
                animate
              />
            </group>
          </group>
        )
    }
  }

  return (
    <group position={position}>
      {renderComponent()}
      {showLabel && (
        <Html distanceFactor={10}>
          <MuiBox
            className="plant-hud"
            sx={{
              background: "rgba(0,0,0,0.7)",
              borderRadius: 1,
              p: 1,
              minWidth: 120,
              color: "white",
            }}
          >
            <Typography variant="caption">{HydroComponentType[type]}</Typography>
            <Slider value={progress} min={0} max={PLANT_GROWTH_CYCLE} size="small" sx={{ mt: 1 }} />
          </MuiBox>
        </Html>
      )}
    </group>
  )
}

const WaterFlowSystem = ({
  paths = [],
}: { paths?: Array<{ from: [number, number, number]; to: [number, number, number] }> }) => {
  const [droplets, setDroplets] = useState<Array<{ position: [number, number, number]; speed: number }>>([])

  useEffect(() => {
    const newDroplets = paths.flatMap((path) =>
      Array.from({ length: 5 }).map(() => ({
        position: [...path.from] as [number, number, number],
        speed: 0.5 + Math.random() * 0.5,
      })),
    )
    setDroplets(newDroplets)
  }, [paths])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()

    setDroplets((prev) =>
      prev.map((droplet, i) => {
        const pathIndex = Math.floor(i / 5)
        const path = paths[pathIndex]
        if (!path) return droplet

        const progress = (t * droplet.speed) % 1
        return {
          ...droplet,
          position: [
            path.from[0] + (path.to[0] - path.from[0]) * progress,
            path.from[1] + (path.to[1] - path.from[1]) * progress - Math.sin(progress * Math.PI) * 0.2,
            path.from[2] + (path.to[2] - path.from[2]) * progress,
          ] as [number, number, number],
        }
      }),
    )
  })

  return (
    <group>
      {paths.map((path, i) => (
        <mesh key={i}>
          <tubeGeometry
            args={[
              new THREE.CatmullRomCurve3([
                new THREE.Vector3(...path.from),
                new THREE.Vector3(
                  path.from[0] + (path.to[0] - path.from[0]) * 0.5,
                  path.from[1] + (path.to[1] - path.from[1]) * 0.5 + 0.2,
                  path.from[2] + (path.to[2] - path.from[2]) * 0.5,
                ),
                new THREE.Vector3(...path.to),
              ]),
              20,
              0.02,
              8,
              false,
            ]}
          />
          <meshStandardMaterial color="#60a5fa" transparent opacity={0.3} metalness={0.8} roughness={0.2} />
        </mesh>
      ))}

      {droplets.map((droplet, i) => (
        <group key={i} position={droplet.position}>
          <mesh>
            <sphereGeometry args={[0.03]} />
            <meshStandardMaterial
              color="#60a5fa"
              emissive="#60a5fa"
              emissiveIntensity={0.5}
              metalness={0.9}
              roughness={0.1}
            />
          </mesh>
          <pointLight color="#60a5fa" intensity={0.2} distance={0.5} />
        </group>
      ))}
    </group>
  )
}

interface HydroponicLayoutProps {
  spaceSize: number
  selectedPlants: { [id: string]: number }
  plantData: Array<{
    id: string
    name: string
    growthTime: number
    spaceRequired: number
  }>
  setupType: SetupType
  showLabels?: boolean
  environmentalControls?: {
    temperature: { enabled: boolean; value: number }
    humidity: { enabled: boolean; value: number }
    light: { enabled: boolean; value: number }
    pH: { enabled: boolean; value: number }
    nutrient: { enabled: boolean; value: number }
  }
  onEnvironmentChange?: (type: string, value: number) => void
}

const EnvironmentHUD = ({ zones, controls, onControlChange }: { 
  zones: any, 
  controls?: HydroponicLayoutProps['environmentalControls'],
  onControlChange?: (type: string, value: number) => void 
}) => {
  const { camera } = useThree()
  const [visible, setVisible] = useState(true)

  return (
    <Html
      position={[0, 0, 0]}
      style={{
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    >
      <MuiBox
        sx={{
          position: "absolute",
          top: 20,
          left: 20,
          background: "rgba(0,0,0,0.8)",
          borderRadius: 2,
          p: 2,
          width: 300,
          color: "white",
          pointerEvents: "auto",
        }}
      >
        <Typography variant="h6" gutterBottom>
          Environmental Controls
        </Typography>

        <MuiBox sx={{ mb: 2 }}>
          <Typography variant="caption">Temperature Control</Typography>
          <MuiBox sx={{ display: "flex", gap: 1, mt: 1, alignItems: "center" }}>
            <Slider 
              value={controls?.temperature.value ?? 22} 
              min={18} 
              max={28} 
              step={0.1}
              disabled={!controls?.temperature.enabled}
              onChange={(_, value) => onControlChange?.('temperature', value as number)}
              sx={{ flex: 1 }} 
              size="small" 
            />
            <Typography variant="caption" sx={{ minWidth: 50 }}>
              {controls?.temperature.value.toFixed(1)}°C
            </Typography>
          </MuiBox>
        </MuiBox>

        <MuiBox sx={{ mb: 2 }}>
          <Typography variant="caption">Humidity Control</Typography>
          <MuiBox sx={{ display: "flex", gap: 1, mt: 1, alignItems: "center" }}>
            <Slider 
              value={controls?.humidity.value ?? 50} 
              min={30} 
              max={70} 
              step={1}
              disabled={!controls?.humidity.enabled}
              onChange={(_, value) => onControlChange?.('humidity', value as number)}
              sx={{ flex: 1 }} 
              size="small" 
            />
            <Typography variant="caption" sx={{ minWidth: 50 }}>
              {controls?.humidity.value.toFixed(0)}%
            </Typography>
          </MuiBox>
        </MuiBox>

        <MuiBox>
          <Typography variant="caption">Light Intensity</Typography>
          <MuiBox sx={{ display: "flex", gap: 1, mt: 1, alignItems: "center" }}>
            <Slider 
              value={controls?.light.value ?? 4500} 
              min={2000} 
              max={7000} 
              step={100}
              disabled={!controls?.light.enabled}
              onChange={(_, value) => onControlChange?.('light', value as number)}
              sx={{ flex: 1 }} 
              size="small" 
            />
            <Typography variant="caption" sx={{ minWidth: 50 }}>
              {controls?.light.value.toFixed(0)} lux
            </Typography>
          </MuiBox>
        </MuiBox>
      </MuiBox>
    </Html>
  )
}

// Add environmental effect component
const EnvironmentalEffects = ({ controls }: { controls?: HydroponicLayoutProps['environmentalControls'] }) => {
  const { scene } = useThree()

  useEffect(() => {
    if (!controls) return

    // Temperature effect (red tint when hot, blue when cold)
    const tempNormalized = (controls.temperature.value - 18) / (28 - 18)
    const isHot = tempNormalized > 0.7
    const isCold = tempNormalized < 0.3
    
    if (isHot) {
      scene.fog = new Fog('#ff000033', 10, 50)
      scene.background = new THREE.Color('#1a0000')
    } else if (isCold) {
      scene.fog = new Fog('#0000ff33', 10, 50)
      scene.background = new THREE.Color('#00001a')
    } else {
      scene.fog = null
      scene.background = new THREE.Color('#000000')
    }

    // Humidity effect (haziness)
    const humidityNormalized = (controls.humidity.value - 30) / (70 - 30)
    if (humidityNormalized > 0.7) {
      scene.fog = new Fog('#ffffff11', 5, 30)
    }

    // Light intensity effect
    const lightNormalized = (controls.light.value - 2000) / (7000 - 2000)
    scene.background?.multiplyScalar(0.5 + lightNormalized * 0.5)

    return () => {
      scene.fog = null
      scene.background = new THREE.Color('#000000')
    }
  }, [controls, scene])

  return null
}

export const HydroponicLayout = ({ 
  spaceSize, 
  selectedPlants, 
  plantData, 
  setupType, 
  showLabels = true,
  environmentalControls,
  onEnvironmentChange 
}: HydroponicLayoutProps) => {
  const [layout, setLayout] = useState<LayoutAnalysis | null>(null)
  const [simulationTime, setSimulationTime] = useState(0)
  const [activeCameraIndex, setActiveCameraIndex] = useState<number | null>(null)
  const [labelsVisible, setLabelsVisible] = useState(showLabels)

  useEffect(() => {
    const generateLayout = async () => {
      try {
        const generatedLayout = await geminiService.generateLayout({
          spaceSize,
          selectedPlants,
          setupType,
          plantData,
        })
        setLayout(generatedLayout)
      } catch (err) {
        console.error("Failed to generate layout:", err)
      }
    }

    generateLayout()
  }, [spaceSize, selectedPlants, setupType, plantData])

  useEffect(() => {
    const timer = setInterval(() => {
      setSimulationTime((prev) => prev + 0.016)
    }, 16)
    return () => clearInterval(timer)
  }, [])

  const cameras = useMemo(() => {
    if (!layout) return []
    const cameraPositions: [number, number, number][] = []
    layout.matrix.forEach((level, z) =>
      level.forEach((row, y) =>
        row.forEach((cell, x) => {
          if (cell === HydroComponentType.CAMERA || cell === HydroComponentType.DRONE) {
            cameraPositions.push([x - layout.matrix[0][0].length / 2, z, y - layout.matrix[0].length / 2])
          }
        }),
      ),
    )
    return cameraPositions
  }, [layout])

  const toggleCamera = (index: number) => {
    setActiveCameraIndex(activeCameraIndex === index ? null : index)
  }

  const handleEnvironmentChange = useCallback((type: string, value: number) => {
    onEnvironmentChange?.(type, value)
  }, [onEnvironmentChange])

  if (!layout) {
    return <div>Loading...</div>
  }

  const maxHeight = layout.matrix.length
  const maxWidth = Math.max(...layout.matrix.map((level) => level[0].length))
  const maxDepth = Math.max(...layout.matrix.map((level) => level.length))

  return (
    <>
      <Canvas shadows camera={{ position: [maxWidth, maxHeight * 1.5, maxDepth], fov: 50 }}>
        <EnvironmentalEffects controls={environmentalControls} />
        <ambientLight intensity={environmentalControls?.light.value ? 
          0.3 + (environmentalControls.light.value - 2000) / (7000 - 2000) * 0.7 : 
          0.5} 
        />
        <directionalLight
          position={[maxWidth, maxHeight * 2, maxDepth]}
          intensity={environmentalControls?.light.value ? 
            0.5 + (environmentalControls.light.value - 2000) / (7000 - 2000) * 1.5 : 
            1}
          castShadow
          shadow-mapSize={[2048, 2048]}
          color={environmentalControls?.temperature.value && environmentalControls.temperature.value > 25 ? 
            '#ffb74d' : '#ffffff'}
        />
        <spotLight
          position={[-maxWidth, maxHeight * 2, -maxDepth]}
          angle={0.3}
          penumbra={1}
          intensity={0.5}
          castShadow
        />

        <Environment preset="warehouse" background blur={0.5} />
        <ContactShadows opacity={0.6} scale={20} blur={2} far={10} resolution={1024} color="#000000" />

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
          <planeGeometry args={[maxWidth * 2, maxDepth * 2]} />
          <meshStandardMaterial color="#202020" metalness={0.2} roughness={0.8} />
        </mesh>

        {layout.matrix.map((level, z) =>
          level.map((row, y) =>
            row.map((cell, x) => (
              <GridCell
                key={`${x}-${y}-${z}`}
                type={cell}
                position={[x - maxWidth / 2, z, y - maxDepth / 2]}
                size={1}
                progress={simulationTime % PLANT_GROWTH_CYCLE}
                showLabel={labelsVisible}
              />
            )),
          ),
        )}

        <WaterFlowSystem paths={layout.waterFlow} />
        <EnvironmentHUD 
          zones={layout.environmentalZones} 
          controls={environmentalControls}
          onControlChange={handleEnvironmentChange}
        />

        {cameras.map((cameraPosition, index) => (
          <AICamera key={index} position={cameraPosition} target={[0, 0, 0]} isActive={activeCameraIndex === index} />
        ))}

        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          minDistance={5}
          maxDistance={Math.max(maxWidth, maxHeight, maxDepth) * 2}
          maxPolarAngle={Math.PI / 2}
        />
        <PerspectiveCamera makeDefault position={[maxWidth, maxHeight * 1.5, maxDepth]} fov={50} />
      </Canvas>
      <div style={{ position: "absolute", top: 10, right: 10, display: "flex", gap: "10px", alignItems: "center" }}>
        <Button
          variant="outlined"
          onClick={() => setLabelsVisible(!labelsVisible)}
          style={{ margin: "0 5px" }}
        >
          {labelsVisible ? "Hide Labels" : "Show Labels"}
        </Button>
        {cameras.map((_, index) => (
          <Button
            key={index}
            variant={activeCameraIndex === index ? "contained" : "outlined"}
            onClick={() => toggleCamera(index)}
            style={{ margin: "0 5px" }}
          >
            Camera {index + 1}
          </Button>
        ))}
      </div>
    </>
  )
}

