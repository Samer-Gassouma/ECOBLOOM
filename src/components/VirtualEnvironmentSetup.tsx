import React, { useEffect, useState } from 'react'
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  Chip,
  Button,
  Card,
  CardContent,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { virtualEnvService, type VirtualEnvironment, type AutomationTask } from '../services/virtualEnvService'
import { type LayoutAnalysis } from '../services/geminiService'
import { useNavigate } from 'react-router-dom'

interface CostBreakdown {
  setup: {
    hardware: number;
    sensors: number;
    installation: number;
  };
  monthly: {
    electricity: number;
    water: number;
    nutrients: number;
    maintenance: number;
  };
  yearly: {
    total: number;
  };
}

interface VirtualEnvironmentSetupProps {
  layout: LayoutAnalysis
  onComplete: (virtualEnv: VirtualEnvironment) => void
}

const VirtualEnvironmentSetup: React.FC<VirtualEnvironmentSetupProps> = ({ layout, onComplete }) => {
  const navigate = useNavigate()
  const [virtualEnv, setVirtualEnv] = useState<VirtualEnvironment | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [costBreakdown, setCostBreakdown] = useState<CostBreakdown>({
    setup: {
      hardware: 7500, // ~2500 USD in TND
      sensors: 2400, // ~800 USD in TND
      installation: 1500, // ~500 USD in TND
    },
    monthly: {
      electricity: 360, // ~120 USD in TND
      water: 120, // ~40 USD in TND
      nutrients: 240, // ~80 USD in TND
      maintenance: 300, // ~100 USD in TND
    },
    yearly: {
      total: 23740, // Initial setup + (monthly costs * 12) in TND
    },
  })

  useEffect(() => {
    generateVirtualEnvironment()
  }, [layout])

  const generateVirtualEnvironment = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const env = await virtualEnvService.generateVirtualEnvironment(layout)
      setVirtualEnv(env)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate virtual environment')
    } finally {
      setIsLoading(false)
    }
  }

  const getPriorityColor = (priority: AutomationTask['priority']) => {
    switch (priority) {
      case 'critical': return '#ff1744'
      case 'high': return '#ff9100'
      case 'medium': return '#ffea00'
      case 'low': return '#00e676'
      default: return '#757575'
    }
  }

  const handleComplete = () => {
    if (virtualEnv) {
      onComplete(virtualEnv)
      // Store virtual environment data in localStorage for access in the VirtualEnvironment component
      localStorage.setItem('virtualEnvironment', JSON.stringify(virtualEnv))
      // Navigate to the virtual environment view with the correct path
      navigate('/virtual-environment', { replace: true })
    }
  }

  if (isLoading) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="100vh">
        <CircularProgress size={60} />
        <Typography variant="h6" style={{ marginTop: 20 }}>
          Generating Virtual Environment...
        </Typography>
      </Box>
    )
  }

  if (error) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="100vh">
        <Typography variant="h6" color="error">
          {error}
        </Typography>
        <Button variant="contained" onClick={generateVirtualEnvironment} style={{ marginTop: 20 }}>
          Retry
        </Button>
      </Box>
    )
  }

  if (!virtualEnv) return null

  return (
    <Box p={3} maxWidth={1400} margin="auto">
      <Typography variant="h4" gutterBottom>
        Virtual Environment Setup
      </Typography>

      <Grid container spacing={3}>
        {/* Left Panel - Recipe and Cost Estimation */}
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Cost Breakdown & Recipe
              </Typography>
              
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Initial Setup Costs
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell>Hardware Components</TableCell>
                      <TableCell align="right">{costBreakdown.setup.hardware} TND</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Sensors & Controls</TableCell>
                      <TableCell align="right">{costBreakdown.setup.sensors} TND</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Installation</TableCell>
                      <TableCell align="right">{costBreakdown.setup.installation} TND</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                Monthly Operating Costs
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell>Electricity</TableCell>
                      <TableCell align="right">{costBreakdown.monthly.electricity} TND</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Water</TableCell>
                      <TableCell align="right">{costBreakdown.monthly.water} TND</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Nutrients</TableCell>
                      <TableCell align="right">{costBreakdown.monthly.nutrients} TND</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Maintenance</TableCell>
                      <TableCell align="right">{costBreakdown.monthly.maintenance} TND</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              <Box mt={3}>
                <Divider />
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Estimated Yearly Total
                </Typography>
                <Typography variant="h4" color="primary">
                  {costBreakdown.yearly.total} TND
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Includes initial setup and 12 months of operation
                </Typography>
              </Box>

              <Box mt={3}>
                <Divider />
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  System Recipe
                </Typography>
                
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  Nutrient Solution
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableBody>
                      {virtualEnv.schedule.nutrients.schedule.map((nutrient, index) => (
                        <TableRow key={index}>
                          <TableCell>{nutrient.formula}</TableCell>
                          <TableCell align="right">{nutrient.amount}ml</TableCell>
                          <TableCell align="right">{nutrient.time}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Typography variant="subtitle2" color="primary" gutterBottom sx={{ mt: 2 }}>
                  Light Schedule
                </Typography>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2">
                    On: {virtualEnv.schedule.lighting.on}
                  </Typography>
                  <Typography variant="body2">
                    Off: {virtualEnv.schedule.lighting.off}
                  </Typography>
                  <Typography variant="body2">
                    Intensity: {virtualEnv.schedule.lighting.intensity}%
                  </Typography>
                </Box>

                <Typography variant="subtitle2" color="primary" gutterBottom sx={{ mt: 2 }}>
                  Watering Schedule
                </Typography>
                <Box>
                  <Typography variant="body2">
                    Frequency: {virtualEnv.schedule.watering.frequency}x per day
                  </Typography>
                  <Typography variant="body2">
                    Duration: {virtualEnv.schedule.watering.duration} minutes
                  </Typography>
                  <Typography variant="body2">
                    Start Time: {virtualEnv.schedule.watering.startTime}
                  </Typography>
                </Box>

                <Typography variant="subtitle2" color="primary" gutterBottom sx={{ mt: 2 }}>
                  Maintenance Tips
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText 
                      primary="Check pH levels daily"
                      secondary="Maintain between 5.5-6.5"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Clean filters weekly"
                      secondary="Prevents nutrient buildup"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Inspect plants daily"
                      secondary="Look for signs of deficiency or stress"
                    />
                  </ListItem>
                </List>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Panel - Existing Content */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={3}>
            {/* Automation Tasks */}
            <Grid item xs={12}>
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">Automation Tasks</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <List>
                    {virtualEnv.automationTasks?.map((task) => (
                      <ListItem key={task.id}>
                        <Paper elevation={2} style={{ width: '100%', padding: '16px' }}>
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="subtitle1">{task.name}</Typography>
                              <Typography variant="body2" color="textSecondary">
                                Type: {task.type}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6} container justifyContent="flex-end" alignItems="center">
                              <Chip 
                                label={task.priority} 
                                style={{ 
                                  backgroundColor: getPriorityColor(task.priority),
                                  color: task.priority === 'medium' ? '#000' : '#fff'
                                }}
                              />
                            </Grid>
                            <Grid item xs={12}>
                              <Typography variant="body2">
                                Schedule: {task.schedule.frequency}
                                {task.schedule.timeOfDay && ` at ${task.schedule.timeOfDay}`}
                              </Typography>
                            </Grid>
                          </Grid>
                        </Paper>
                      </ListItem>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>
            </Grid>

            {/* Monitoring Points */}
            <Grid item xs={12}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">Monitoring Points</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <List>
                    {virtualEnv.monitoringPoints?.map((point, index) => (
                      <ListItem key={index}>
                        <Paper elevation={2} style={{ width: '100%', padding: '16px' }}>
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="subtitle1">
                                {point.type.charAt(0).toUpperCase() + point.type.slice(1)} Sensor
                              </Typography>
                              <Typography variant="body2" color="textSecondary">
                                Position: [{point.position.join(', ')}]
                              </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="body2">
                                Frequency: {point.frequency} seconds
                              </Typography>
                            </Grid>
                          </Grid>
                        </Paper>
                      </ListItem>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>
            </Grid>

            {/* Schedules */}
            <Grid item xs={12}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">Schedules</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={3}>
                    {/* Lighting Schedule */}
                    <Grid item xs={12} md={4}>
                      <Paper elevation={2} style={{ padding: '16px' }}>
                        <Typography variant="subtitle1" gutterBottom>
                          Lighting
                        </Typography>
                        <Typography variant="body2">
                          On: {virtualEnv.schedule?.lighting?.on || 'Not configured'}
                        </Typography>
                        <Typography variant="body2">
                          Off: {virtualEnv.schedule?.lighting?.off || 'Not configured'}
                        </Typography>
                        <Typography variant="body2">
                          Intensity: {virtualEnv.schedule?.lighting?.intensity || 0}%
                        </Typography>
                      </Paper>
                    </Grid>

                    {/* Watering Schedule */}
                    <Grid item xs={12} md={4}>
                      <Paper elevation={2} style={{ padding: '16px' }}>
                        <Typography variant="subtitle1" gutterBottom>
                          Watering
                        </Typography>
                        <Typography variant="body2">
                          Frequency: {virtualEnv.schedule?.watering?.frequency || 0} times/day
                        </Typography>
                        <Typography variant="body2">
                          Duration: {virtualEnv.schedule?.watering?.duration || 0} minutes
                        </Typography>
                        <Typography variant="body2">
                          Start Time: {virtualEnv.schedule?.watering?.startTime || 'Not configured'}
                        </Typography>
                      </Paper>
                    </Grid>

                    {/* Nutrients Schedule */}
                    <Grid item xs={12} md={4}>
                      <Paper elevation={2} style={{ padding: '16px' }}>
                        <Typography variant="subtitle1" gutterBottom>
                          Nutrients
                        </Typography>
                        {virtualEnv.schedule?.nutrients?.schedule ? (
                          virtualEnv.schedule.nutrients.schedule.map((schedule, index) => (
                            <Box key={index} mb={1}>
                              <Typography variant="body2">
                                Time: {schedule.time}
                              </Typography>
                              <Typography variant="body2">
                                Formula: {schedule.formula}
                              </Typography>
                              <Typography variant="body2">
                                Amount: {schedule.amount}
                              </Typography>
                            </Box>
                          ))
                        ) : (
                          <Typography variant="body2" color="textSecondary">
                            No nutrient schedule configured
                          </Typography>
                        )}
                      </Paper>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Grid>

            {/* Alerts */}
            <Grid item xs={12}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">Alerts</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <List>
                    {virtualEnv.alerts?.map((alert, index) => (
                      <ListItem key={index}>
                        <Paper elevation={2} style={{ width: '100%', padding: '16px' }}>
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="subtitle1">
                                {alert.condition}
                              </Typography>
                              <Typography variant="body2" color="textSecondary">
                                {alert.message}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6} container justifyContent="flex-end">
                              <Chip 
                                label={alert.severity}
                                color={
                                  alert.severity === 'critical' ? 'error' :
                                  alert.severity === 'error' ? 'error' :
                                  alert.severity === 'warning' ? 'warning' :
                                  'default'
                                }
                              />
                            </Grid>
                          </Grid>
                        </Paper>
                      </ListItem>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>
            </Grid>
          </Grid>

          <Box mt={4} display="flex" justifyContent="flex-end">
            <Button
              variant="contained"
              color="primary"
              onClick={handleComplete}
            >
              Launch Virtual Environment
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  )
}

export default VirtualEnvironmentSetup 