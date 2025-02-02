import { Box } from "@mui/material"
import { HydroponicLayout } from "./HydroponicLayout"
import type { SetupType } from "../services/geminiService"

interface Setup3DVisualizationProps {
  spaceSize: number
  selectedPlants: { [id: string]: number }
  setupType: SetupType
}

const plantData = [
  { id: "1", name: "Cucumber", growthTime: 55, spaceRequired: 0.4 },
  { id: "2", name: "Strawberry", growthTime: 60, spaceRequired: 0.3 },
  { id: "3", name: "Tomato", growthTime: 65, spaceRequired: 0.5 },
  { id: "4", name: "Lettuce", growthTime: 30, spaceRequired: 0.2 },
  { id: "5", name: "Basil", growthTime: 25, spaceRequired: 0.1 },
  { id: "6", name: "Bell Pepper", growthTime: 70, spaceRequired: 0.4 },
  { id: "7", name: "Spinach", growthTime: 40, spaceRequired: 0.2 },
  { id: "8", name: "Kale", growthTime: 45, spaceRequired: 0.3 },
  { id: "9", name: "Mint", growthTime: 30, spaceRequired: 0.15 },
  { id: "10", name: "Cherry Tomatoes", growthTime: 55, spaceRequired: 0.3 },
  { id: "11", name: "Arugula", growthTime: 35, spaceRequired: 0.2 },
  { id: "12", name: "Herbs Mix", growthTime: 28, spaceRequired: 0.25 },
]

const Setup3DVisualization = ({ spaceSize, selectedPlants, setupType }: Setup3DVisualizationProps) => {
  console.log("Setup3D - Space Size:", spaceSize)
  console.log("Setup3D - Selected Plants:", selectedPlants)
  console.log("Setup3D - Setup Type:", setupType)

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "#000000",
        zIndex: 1300,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <HydroponicLayout
        spaceSize={spaceSize}
        selectedPlants={selectedPlants}
        plantData={plantData}
        setupType={setupType}
      />
    </Box>
  )
}

export default Setup3DVisualization

