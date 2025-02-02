import type React from "react"
import { useState } from "react"
import { Box, Button, Typography, useTheme, useMediaQuery } from "@mui/material"
import { motion } from "framer-motion"
import Setup3DDrawing from "./Setup3DDrawing"

interface WelcomeScreenProps {
  onSelection: (hasSetup: boolean, layout?: any) => void
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSelection }) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const [showDrawing, setShowDrawing] = useState(false)

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  }

  const handleDrawingSubmit = (layout: any) => {
    // Here you would send the layout to the Gemini API for processing
    console.log("Submitting layout:", layout)
    onSelection(true, layout)
  }

  if (showDrawing) {
    return <Setup3DDrawing 
      onSubmit={handleDrawingSubmit} 
      spaceSize={10} 
      selectedPlants={{}} 
    />
  }

  return (
    <Box
      component={motion.div}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100%",
        gap: { xs: 4, md: 6 },
        position: "relative",
        mx: "auto",
        maxWidth: "md",
        width: "100%",
      }}
    >
      {/* Decorative elements */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: "5%",
          width: "90%",
          height: "100%",
          opacity: 0.05,
          background: `repeating-linear-gradient(
            90deg,
            #000 0px,
            #000 1px,
            transparent 1px,
            transparent 30px
          )`,
          pointerEvents: "none",
        }}
      />

      <Box
        component={motion.div}
        variants={itemVariants}
        sx={{
          textAlign: "center",
          width: "100%",
          maxWidth: "800px",
          position: "relative",
          px: { xs: 2, sm: 4 },
        }}
      >
        <Typography
          variant="h1"
          component="h1"
          sx={{
            fontSize: { xs: "2.5rem", sm: "3.5rem", md: "4.5rem" },
            fontWeight: 800,
            letterSpacing: "-0.03em",
            mb: 3,
            background: "linear-gradient(45deg, #000 30%, #333 90%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          ECOBLOOM
        </Typography>

        <Typography
          variant="h5"
          component="h2"
          color="text.secondary"
          sx={{
            mb: { xs: 4, md: 6 },
            maxWidth: "600px",
            mx: "auto",
            lineHeight: 1.6,
            fontSize: { xs: "1.1rem", md: "1.3rem" },
          }}
        >
          Design your perfect hydroponic setup with our intelligent planning system. Get personalized recommendations
          based on your space and needs.
        </Typography>
      </Box>

      <Box
        component={motion.div}
        variants={itemVariants}
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 3,
          width: "100%",
          maxWidth: "400px",
          position: "relative",
          zIndex: 1,
          px: { xs: 2, sm: 0 },
        }}
      >
        <Typography
          variant="h6"
          align="center"
          sx={{
            fontWeight: 500,
            mb: 2,
            color: "text.secondary",
          }}
        >
          Do you already have a hydroponic setup?
        </Typography>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Button
            component={motion.button}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            variant="contained"
            size="large"
            onClick={() => setShowDrawing(true)}
            fullWidth
          >
            Yes, I have a setup (Design in 3D)
          </Button>

          <Button
            component={motion.button}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            variant="outlined"
            size="large"
            onClick={() => onSelection(false)}
            fullWidth
          >
            No, I need a new setup
          </Button>
        </Box>
      </Box>

      <Box
        component={motion.div}
        variants={itemVariants}
        sx={{
          position: "absolute",
          bottom: isMobile ? -20 : -40,
          left: "50%",
          transform: "translateX(-50%)",
          textAlign: "center",
          opacity: 0.6,
        }}
      >
        <Typography variant="caption" color="text.secondary">
          Scroll or click to continue
        </Typography>
      </Box>
    </Box>
  )
}

export default WelcomeScreen

