import type React from "react"
import { useRef, useEffect, useState } from "react"
import * as THREE from "three"
import { Html } from "@react-three/drei"
import { Box, Typography, Paper, CircularProgress } from "@mui/material"

interface Detection {
  confidence: number
  label: string
}

interface DetectionResponse {
  detections: Detection[]
  processed_image_url: string
}

interface AICameraProps {
  position: [number, number, number]
  target: [number, number, number]
  isActive: boolean
}

const AICamera: React.FC<AICameraProps> = ({ position, target, isActive }) => {
  const meshRef = useRef<THREE.Mesh>(null)
  const [detectionResults, setDetectionResults] = useState<DetectionResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.lookAt(new THREE.Vector3(...target))
    }
  }, [target])

  useEffect(() => {
    if (isActive) {
      const fetchDetections = async () => {
        try {
          setLoading(true)
          setError(null)
          const response = await fetch('http://192.168.16.84:8080/random-predict')
          if (!response.ok) {
            throw new Error('Failed to fetch detection results')
          }
          const data = await response.json()
          setDetectionResults(data)
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to get detection results')
        } finally {
          setLoading(false)
        }
      }

      fetchDetections()
      // Refresh detections every 10 seconds when camera is active
      const interval = setInterval(fetchDetections, 10000)
      return () => clearInterval(interval)
    } else {
      setDetectionResults(null)
      setError(null)
    }
  }, [isActive])

  if (!isActive) return null

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial color="#444444" />
      </mesh>
      <Html>
        <Box
          sx={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '400px',
            maxWidth: '90vw',
            pointerEvents: 'auto',
          }}
        >
          <Paper
            elevation={3}
            sx={{
              p: 2,
              bgcolor: 'rgba(0,0,0,0.8)',
              color: 'white',
              borderRadius: 2,
            }}
          >
            <Typography variant="h6" gutterBottom>
              Plant Health Analysis
            </Typography>
            
            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <CircularProgress color="inherit" size={24} />
              </Box>
            )}

            {error && (
              <Typography color="error" sx={{ mt: 1 }}>
                {error}
              </Typography>
            )}

            {detectionResults && (
              <>
                <Box sx={{ mt: 2, mb: 2 }}>
                  {detectionResults.detections.map((detection, index) => (
                    <Box key={index} sx={{ mb: 1 }}>
                      <Typography variant="body1">
                        {detection.label}
                      </Typography>
                      <Typography variant="body2" color="rgba(255,255,255,0.7)">
                        Confidence: {(detection.confidence * 100).toFixed(1)}%
                      </Typography>
                    </Box>
                  ))}
                </Box>
                {detectionResults.processed_image_url && (
                  <Box
                    component="img"
                    src={detectionResults.processed_image_url}
                    alt="Processed plant image"
                    sx={{
                      width: '100%',
                      height: 'auto',
                      borderRadius: 1,
                      mt: 1
                    }}
                  />
                )}
              </>
            )}
          </Paper>
        </Box>
      </Html>
    </group>
  )
}

export default AICamera

