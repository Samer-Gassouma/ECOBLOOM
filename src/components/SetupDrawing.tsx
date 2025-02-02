import type React from "react"
import { useState, useRef } from "react"
import { Stage, Layer, Circle, Line } from "react-konva"
import { Box, Button, Typography, Paper, Grid } from "@mui/material"
import type { KonvaEventObject } from "konva/lib/Node"
import type { Plant } from "../types/Plant.ts"

interface SetupDrawingProps {
  onSubmit: (layout: any) => void
}

const SetupDrawing: React.FC<SetupDrawingProps> = ({ onSubmit }) => {
  const [plants, setPlants] = useState<Plant[]>([])
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null)
  const [gridSize, setGridSize] = useState({ width: 800, height: 600 })
  const stageRef = useRef<any>(null)

  const plantTypes: Plant[] = [
    { id: 1, name: "Tomato", color: "red", size: 30 },
    { id: 2, name: "Lettuce", color: "green", size: 20 },
    { id: 3, name: "Cucumber", color: "darkgreen", size: 25 },
    { id: 4, name: "Basil", color: "lightgreen", size: 15 },
  ]

  const handlePlantSelect = (plant: Plant) => {
    setSelectedPlant(plant)
  }

  const handleCanvasClick = (e: KonvaEventObject<MouseEvent>) => {
    if (selectedPlant) {
      const stage = e.target.getStage()
      const pointerPosition = stage?.getPointerPosition()
      if (pointerPosition) {
        const newPlant = {
          ...selectedPlant,
          x: pointerPosition.x,
          y: pointerPosition.y,
        }
        setPlants([...plants, newPlant])
      }
    }
  }

  const handleSubmit = () => {
    const layout = {
      plants: plants,
      gridSize: gridSize,
    }
    onSubmit(layout)
  }

  const handleClear = () => {
    setPlants([])
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
      <Typography variant="h4" gutterBottom>
        Draw Your Hydroponic Setup
      </Typography>
      <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} justifyContent="center">
          {plantTypes.map((plant) => (
            <Grid item key={plant.id}>
              <Button
                variant={selectedPlant?.id === plant.id ? "contained" : "outlined"}
                onClick={() => handlePlantSelect(plant)}
                sx={{ minWidth: 120 }}
              >
                {plant.name}
              </Button>
            </Grid>
          ))}
        </Grid>
      </Paper>
      <Stage
        width={gridSize.width}
        height={gridSize.height}
        onMouseDown={handleCanvasClick}
        style={{ border: "1px solid #ccc" }}
        ref={stageRef}
      >
        <Layer>
          {/* Grid lines */}
          {Array.from({ length: gridSize.width / 50 }).map((_, i) => (
            <Line key={`vertical-${i}`} points={[i * 50, 0, i * 50, gridSize.height]} stroke="#ddd" strokeWidth={1} />
          ))}
          {Array.from({ length: gridSize.height / 50 }).map((_, i) => (
            <Line key={`horizontal-${i}`} points={[0, i * 50, gridSize.width, i * 50]} stroke="#ddd" strokeWidth={1} />
          ))}
          {/* Plants */}
          {plants.map((plant, index) => (
            <Circle key={index} x={plant.x} y={plant.y} radius={plant.size / 2} fill={plant.color} />
          ))}
        </Layer>
      </Stage>
      <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
        <Button variant="contained" color="primary" onClick={handleSubmit}>
          Submit Layout
        </Button>
        <Button variant="outlined" color="secondary" onClick={handleClear}>
          Clear Canvas
        </Button>
      </Box>
    </Box>
  )
}

export default SetupDrawing

