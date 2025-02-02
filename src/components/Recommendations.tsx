import type React from "react"
import { Box, Typography, Paper, List, ListItem, ListItemIcon, ListItemText, Button } from "@mui/material"
import { Check, ArrowForward } from "@mui/icons-material"
import { motion } from "framer-motion"

const Recommendations: React.FC = () => {
  // This is a placeholder for the recommendations
  // In a real application, you would fetch these from your backend or AI service
  const recommendations = [
    "Optimize nutrient solution for selected plants",
    "Adjust lighting schedule to 16 hours on, 8 hours off",
    "Implement a vertical growing system to maximize space",
    "Use a recirculating deep water culture system for efficiency",
    "Install automated pH and EC monitoring system",
  ]

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        maxWidth: 600,
        mx: "auto",
      }}
    >
      <Typography variant="h4" component="h2" gutterBottom>
        Your Personalized Recommendations
      </Typography>
      <Paper elevation={3} sx={{ width: "100%", p: 3 }}>
        <List>
          {recommendations.map((recommendation, index) => (
            <ListItem key={index} component={motion.li} whileHover={{ scale: 1.02 }}>
              <ListItemIcon>
                <Check color="primary" />
              </ListItemIcon>
              <ListItemText primary={recommendation} />
            </ListItem>
          ))}
        </List>
      </Paper>
      <Button
        variant="contained"
        color="primary"
        endIcon={<ArrowForward />}
        component={motion.button}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Explore Virtual Environment
      </Button>
    </Box>
  )
}

export default Recommendations

