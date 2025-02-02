import { useState } from 'react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { Box, Container, Paper, LinearProgress } from '@mui/material'
import WelcomeScreen from './components/WelcomeScreen'
import SpaceSetup from './components/SpaceSetup'
import PlantSelection from './components/PlantSelection'
import Setup3DVisualization from './components/Setup3DVisualization'
import VirtualEnvironment from './components/VirtualEnvironment'
import { AnimatePresence } from 'framer-motion'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#000000',
      light: '#333333',
      dark: '#000000',
    },
    secondary: {
      main: '#ffffff',
      light: '#ffffff',
      dark: '#f5f5f5',
    },
    background: {
      default: '#000000',
      paper: '#ffffff',
    },
    text: {
      primary: '#000000',
      secondary: '#666666',
    },
  },
  typography: {
    fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 800,
      letterSpacing: '-0.03em',
      fontSize: '4rem',
    },
    h2: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
      fontSize: '3rem',
    },
    h4: {
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h5: {
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    body1: {
      fontSize: '1.1rem',
      lineHeight: 1.7,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '14px 32px',
          fontSize: '1.1rem',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(120deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0) 100%)',
            transform: 'translateX(-100%)',
            transition: 'transform 0.5s',
          },
          '&:hover::before': {
            transform: 'translateX(100%)',
          },
        },
        contained: {
          backgroundColor: '#000',
          color: '#fff',
          '&:hover': {
            backgroundColor: '#333',
            transform: 'translateY(-3px)',
            boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
          },
        },
        outlined: {
          borderColor: '#000',
          borderWidth: '2px',
          color: '#000',
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.03)',
            borderWidth: '2px',
            transform: 'translateY(-3px)',
            boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          boxShadow: 'none',
          border: '1px solid rgba(0,0,0,0.1)',
          backgroundImage: 'none',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: 24,
            padding: 1,
            background: 'linear-gradient(130deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.02) 100%)',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
            pointerEvents: 'none',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: '1px solid rgba(0,0,0,0.1)',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            borderColor: '#000',
            transform: 'translateY(-8px) scale(1.02)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'scale(1.05)',
          },
        },
      },
    },
  },
})

const MainApp = () => {
  const [step, setStep] = useState(0)
  const [hasExistingSetup, setHasExistingSetup] = useState<boolean | null>(null)
  const [spaceSize, setSpaceSize] = useState<number>(0)
  const [selectedPlants, setSelectedPlants] = useState<{ [id: string]: number }>({})
  const location = useLocation()

  const steps = [
    <WelcomeScreen 
      onSelection={(hasSetup: boolean) => {
        setHasExistingSetup(hasSetup)
        setStep(1)
      }}
    />,
    <SpaceSetup
      onSpaceSizeChange={(size: number) => {
        setSpaceSize(size)
        setStep(2)
      }}
    />,
    <PlantSelection
      spaceSize={spaceSize}
      onPlantsSelected={(plants: { [id: string]: number }) => {
        setSelectedPlants(plants)
        setStep(3)
      }}
    />,
    <Setup3DVisualization
      spaceSize={spaceSize}
      selectedPlants={selectedPlants}
      setupType="horizontal"
    />
  ]

  const progress = (step / (steps.length - 1)) * 100

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        minWidth: '100vw',
        background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        position: 'fixed',
        top: 0,
        left: 0,
      }}
    >
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/virtual-environment" element={<VirtualEnvironment />} />
          <Route path="/" element={
            <>
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 50%)',
                  animation: 'pulse 8s ease-in-out infinite',
                  '@keyframes pulse': {
                    '0%': { opacity: 0.5 },
                    '50%': { opacity: 0.8 },
                    '100%': { opacity: 0.5 },
                  },
                }}
              />
              <Container 
                maxWidth="lg" 
                sx={{ 
                  position: 'relative',
                  height: '100vh',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  py: { xs: 2, md: 4 },
                  px: { xs: 2, md: 4 },
                }}
              >
                <Paper 
                  elevation={0}
                  sx={{ 
                    width: '100%',
                    maxHeight: '90vh',
                    height: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    overflow: 'hidden',
                    backdropFilter: 'blur(20px)',
                    backgroundColor: 'rgba(255,255,255,0.98)',
                    p: { xs: 2, sm: 3, md: 4 },
                    transform: 'translateZ(0)',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 4,
                      background: 'linear-gradient(90deg, transparent, rgba(0,0,0,0.1))',
                    }
                  }}
                >
                  <LinearProgress 
                    variant="determinate" 
                    value={progress} 
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 4,
                      backgroundColor: 'transparent',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: '#000',
                        transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                        backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                        backgroundSize: '200% 100%',
                        animation: 'shimmer 2s infinite',
                        '@keyframes shimmer': {
                          '0%': { backgroundPosition: '200% 0' },
                          '100%': { backgroundPosition: '-200% 0' },
                        },
                      },
                    }}
                  />
                  <Box 
                    sx={{ 
                      flex: 1,
                      overflowY: 'auto',
                      overflowX: 'hidden',
                      py: 2,
                      '&::-webkit-scrollbar': {
                        width: '8px',
                      },
                      '&::-webkit-scrollbar-track': {
                        background: 'transparent',
                      },
                      '&::-webkit-scrollbar-thumb': {
                        background: 'rgba(0,0,0,0.1)',
                        borderRadius: '4px',
                        transition: 'background 0.3s ease',
                        '&:hover': {
                          background: 'rgba(0,0,0,0.2)',
                        },
                      },
                    }}
                  >
                    {steps[step]}
                  </Box>
                </Paper>
              </Container>
            </>
          } />
        </Routes>
      </AnimatePresence>
    </Box>
  )
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <MainApp />
      </Router>
    </ThemeProvider>
  )
}

export default App
