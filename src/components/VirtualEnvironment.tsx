import { Box, IconButton, Typography, Grid, Paper, Chip, CircularProgress, Slider, Switch, FormControlLabel, Alert, Snackbar } from '@mui/material';
import { HydroponicLayout } from './HydroponicLayout';
import CloseIcon from '@mui/icons-material/Close';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import { type VirtualEnvironment as VirtualEnvironmentType, virtualEnvService } from '../services/virtualEnvService';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import OpacityIcon from '@mui/icons-material/Opacity';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import SpaIcon from '@mui/icons-material/Spa';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import WarningIcon from '@mui/icons-material/Warning';
import { keyframes } from '@mui/material';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

type SensorType = 'temperature' | 'humidity' | 'pH' | 'nutrient' | 'light';
type SensorStatus = 'normal' | 'warning' | 'critical';

interface SensorReading {
  type: SensorType;
  value: number;
  unit: string;
  timestamp: Date;
  status: SensorStatus;
}

interface SensorCard {
  type: SensorType;
  icon: React.ReactNode;
  label: string;
  unit: string;
  normalRange: [number, number];
  warningRange: [number, number];
}

interface MonitoringPoint {
  position: [number, number, number];
  type: 'temperature' | 'humidity' | 'pH' | 'nutrient' | 'light';
  frequency: number;
  lastValue?: number;
}

// Add alert animations
const pulseAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const sensorCards: SensorCard[] = [
  {
    type: 'temperature',
    icon: <ThermostatIcon />,
    label: 'Temperature',
    unit: '°C',
    normalRange: [20, 25],
    warningRange: [18, 28]
  },
  {
    type: 'humidity',
    icon: <OpacityIcon />,
    label: 'Humidity',
    unit: '%',
    normalRange: [40, 60],
    warningRange: [30, 70]
  },
  {
    type: 'light',
    icon: <WbSunnyIcon />,
    label: 'Light Intensity',
    unit: 'lux',
    normalRange: [3000, 6000],
    warningRange: [2000, 7000]
  },
  {
    type: 'pH',
    icon: <SpaIcon />,
    label: 'pH Level',
    unit: 'pH',
    normalRange: [5.5, 6.5],
    warningRange: [5, 7]
  }
];

const VirtualEnvironment = () => {
  const navigate = useNavigate();
  const [virtualEnv, setVirtualEnv] = useState<VirtualEnvironmentType | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sensorReadings, setSensorReadings] = useState<SensorReading[]>([]);
  const [historicalData, setHistoricalData] = useState<Record<SensorType, SensorReading[]>>({
    temperature: [],
    humidity: [],
    pH: [],
    nutrient: [],
    light: []
  });
  const [lastOptimization, setLastOptimization] = useState<Date | null>(null);
  const [manualControls, setManualControls] = useState<Record<SensorType, {
    enabled: boolean;
    value: number;
  }>>({
    temperature: { enabled: false, value: 22.5 },
    humidity: { enabled: false, value: 50 },
    light: { enabled: false, value: 4500 },
    pH: { enabled: false, value: 6 },
    nutrient: { enabled: false, value: 500 }
  });
  const [showLabels, setShowLabels] = useState(true);
  const [alerts, setAlerts] = useState<Array<{
    id: number;
    message: string;
    type: 'warning' | 'error';
    timestamp: Date;
  }>>([]);

  // Memoized sensor status calculation
  const getSensorStatus = useCallback((value: number, sensor: SensorCard): SensorStatus => {
    const [normalMin, normalMax] = sensor.normalRange;
    const [warningMin, warningMax] = sensor.warningRange;
    return value >= normalMin && value <= normalMax ? 'normal' :
      value >= warningMin && value <= warningMax ? 'warning' : 'critical';
  }, []);

  // Status color mapping
  const getStatusColor = useCallback((status: SensorStatus): string => ({
    normal: '#00e676',
    warning: '#ffea00',
    critical: '#ff1744'
  }[status]), []);

  // Add alert handler
  const addAlert = useCallback((message: string, type: 'warning' | 'error') => {
    setAlerts(prev => [...prev, {
      id: Date.now(),
      message,
      type,
      timestamp: new Date()
    }]);
  }, []);

  // Load initial data
  useEffect(() => {
    try {
      const storedEnv = localStorage.getItem('virtualEnvironment');
      if (storedEnv) {
        const env = JSON.parse(storedEnv) as VirtualEnvironmentType;
        setVirtualEnv(env);
        
        const initialReadings = sensorCards.map(sensor => {
          const point = env.monitoringPoints.find(p => p.type === sensor.type);
          const value = point?.lastValue ?? (sensor.normalRange[0] + sensor.normalRange[1]) / 2;
          return {
            type: sensor.type,
            value,
            unit: sensor.unit,
            timestamp: new Date(),
            status: getSensorStatus(value, sensor)
          };
        });
        setSensorReadings(initialReadings);
      }
    } catch (error) {
      console.error('Error loading virtual environment:', error);
    }
  }, [getSensorStatus]);

  // Time updater
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Update sensor monitoring with alerts
  useEffect(() => {
    if (!virtualEnv) return;

    const sensorTimer = setInterval(async () => {
      try {
        // Optimization check
        const now = new Date();
        const needsOptimization = !lastOptimization || now.getTime() - lastOptimization.getTime() >= 15 * 60 * 1000;
        
        if (needsOptimization) {
          const optimizedEnv = await virtualEnvService.optimizeSchedule(virtualEnv);
          setVirtualEnv(optimizedEnv);
          setLastOptimization(now);
          localStorage.setItem('virtualEnvironment', JSON.stringify(optimizedEnv));
        }

        // Update sensor readings with enhanced monitoring
        setSensorReadings(prev => prev.map(prevReading => {
          const sensor = sensorCards.find(s => s.type === prevReading.type)!;
          const control = manualControls[prevReading.type];
          const point = virtualEnv.monitoringPoints.find(p => p.type === prevReading.type);
          
          // Use manual control value if enabled
          let value = control.enabled ? control.value : prevReading.value;
          
          if (!control.enabled) {
            // Add small random variations
            value += (Math.random() - 0.5) * (sensor.normalRange[1] - sensor.normalRange[0]) * 0.02;
            
            // Environmental adjustments
            if (prevReading.type === 'temperature') {
              const isHighTemp = virtualEnv.layout.environmentalZones.temperature.high
                .some(pos => pos[0] === point?.position[0] && pos[1] === point.position[1] && pos[2] === point.position[2]);
              value += isHighTemp ? 0.2 : -0.1;
            } else if (prevReading.type === 'light') {
              const isDirect = virtualEnv.layout.environmentalZones.lighting.direct
                .some(pos => pos[0] === point?.position[0] && pos[1] === point.position[1] && pos[2] === point.position[2]);
              const currentHour = now.getHours();
              const isActive = currentHour >= parseInt(virtualEnv.schedule.lighting.on) && 
                             currentHour < parseInt(virtualEnv.schedule.lighting.off);
              const targetValue = isActive ? (isDirect ? 6000 : 4000) : 0;
              value = value + (targetValue - value) * 0.1; // Smooth transition
            }
          }

          // Clamp values
          value = Math.max(sensor.warningRange[0], Math.min(sensor.warningRange[1], value));
          const status = getSensorStatus(value, sensor);

          // Check for critical conditions and trigger alerts
          if (status === 'critical' && prevReading.status !== 'critical') {
            addAlert(`${sensor.label} is at critical level: ${value.toFixed(1)}${sensor.unit}`, 'error');
          } else if (status === 'warning' && prevReading.status !== 'warning' && prevReading.status !== 'critical') {
            addAlert(`${sensor.label} needs attention: ${value.toFixed(1)}${sensor.unit}`, 'warning');
          }

          return {
            ...prevReading,
            value: Number(value.toFixed(2)),
            timestamp: new Date(),
            status
          };
        }));

        // Update historical data
        setHistoricalData(prev => {
          const newData = { ...prev };
          sensorCards.forEach(sensor => {
            const reading = sensorReadings.find(r => r.type === sensor.type);
            if (reading) {
              newData[sensor.type] = [...(newData[sensor.type].slice(-59)), reading];
            }
          });
          return newData;
        });

      } catch (error) {
        console.error('Error updating sensors:', error);
      }
    }, 2000);

    return () => clearInterval(sensorTimer);
  }, [virtualEnv, lastOptimization, getSensorStatus, manualControls, addAlert]);

  // Chart rendering optimization
  const renderSensorChart = useCallback((sensorType: SensorType) => {
    const data = historicalData[sensorType] || [];
    if (data.length === 0) return null;

    const chartData = {
      labels: data.map(reading => 
        reading.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      ),
      datasets: [{
        label: sensorCards.find(s => s.type === sensorType)?.label || '',
        data: data.map(reading => reading.value),
        borderColor: '#00e676',
        tension: 0.4,
        pointRadius: 0
      }]
    };

    return (
      <Box sx={{ height: 100 }}>
        <Line data={chartData} options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { display: false },
            y: { 
              grid: { color: 'rgba(255,255,255,0.1)' },
              ticks: { color: '#fff' }
            }
          }
        }} />
      </Box>
    );
  }, [historicalData]);

  if (!virtualEnv) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        color: 'white'
      }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: '#000',
        color: '#fff',
        zIndex: 1400,
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 2,
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h4" sx={{ 
            fontWeight: 'bold',
            background: 'linear-gradient(45deg, #00e676 30%, #69f0ae 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            ECOBLOOM
          </Typography>
          <Typography variant="subtitle1" sx={{ opacity: 0.7, color: '#fff' }}>
            Virtual Environment
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" sx={{ opacity: 0.7 }}>
            {currentTime.toLocaleTimeString()}
          </Typography>
          <IconButton onClick={() => navigate(-1)} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Main Content */}
      <Box
        sx={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: '1fr 300px',
          gridTemplateRows: 'minmax(0, 2fr) minmax(0, 1fr)',
          gap: 2,
          p: 2,
          overflow: 'hidden'
        }}
      >
        {/* 3D View */}
        <Box sx={{ 
          position: 'relative',
          borderRadius: 1,
          overflow: 'hidden',
          bgcolor: 'rgba(255,255,255,0.05)',
          gridRow: '1 / 2',
          gridColumn: '1 / 2',
          minHeight: '60vh'
        }}>
          <HydroponicLayout 
            spaceSize={virtualEnv.layout.matrix[0].length ** 2}
            setupType={virtualEnv.layout.setupType}
            selectedPlants={virtualEnv.layout.selectedPlants}
            plantData={virtualEnv.layout.plantData}
            showLabels={showLabels}
            environmentalControls={manualControls}
            onEnvironmentChange={(type, value) => {
              setManualControls(prev => ({
                ...prev,
                [type as SensorType]: { ...prev[type as SensorType], value }
              }));
            }}
          />
        </Box>

        {/* Sensor Grid */}
        <Grid container spacing={2} sx={{ 
          height: 'fit-content',
          gridRow: '2 / 3',
          gridColumn: '1 / 2',
          alignContent: 'start'
        }}>
          {sensorCards.map(sensor => {
            const reading = sensorReadings.find(r => r.type === sensor.type);
            const status = reading ? reading.status : 'normal';

            return (
              <Grid item xs={6} sm={3} key={sensor.type}>
                <Paper 
                  sx={{ 
                    p: 2,
                    bgcolor: 'rgba(255,255,255,0.05)',
                    animation: status === 'critical' ? `${pulseAnimation} 2s infinite` : 'none',
                    borderLeft: `4px solid ${getStatusColor(status)}`,
                    transition: 'all 0.3s ease'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    {sensor.icon}
                    <Typography sx={{ color: '#fff' }}>{sensor.label}</Typography>
                    {status !== 'normal' && (
                      <WarningIcon 
                        sx={{ 
                          color: getStatusColor(status),
                          animation: `${pulseAnimation} 1s infinite`
                        }} 
                      />
                    )}
                  </Box>
                  {reading ? (
                    <>
                      <Typography variant="h4" sx={{ mb: 1, color: '#fff' }}>
                        {reading.value.toFixed(1)}{sensor.unit}
                      </Typography>
                      {renderSensorChart(sensor.type)}
                    </>
                  ) : (
                    <CircularProgress size={20} />
                  )}
                </Paper>
              </Grid>
            )}
          )}
        </Grid>

        {/* Right Panel */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 2, 
          overflow: 'auto',
          gridColumn: '2 / 3',
          gridRow: '1 / 3'
        }}>
          {/* Control Panel */}
          <Paper sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.05)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, color: '#fff' }}>
              <Typography variant="h6">Environmental Controls</Typography>
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={showLabels}
                    onChange={(e) => setShowLabels(e.target.checked)}
                  />
                }
                label="Show Labels"
              />
            </Box>
            <Grid container spacing={2}>
              {sensorCards.map(sensor => {
                const control = manualControls[sensor.type];
                const reading = sensorReadings.find(r => r.type === sensor.type);
                const status = reading ? reading.status : 'normal';

                return (
                  <Grid item xs={12} key={sensor.type}>
                    <Paper 
                      sx={{ 
                        p: 2, 
                        bgcolor: 'rgba(255,255,255,0.1)',
                        animation: status === 'critical' ? `${pulseAnimation} 2s infinite` : 'none',
                        borderLeft: `4px solid ${getStatusColor(status)}`,
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        mb: 1,
                        alignItems: 'center'
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {sensor.icon}
                          <Typography sx={{ color: '#fff' }}>{sensor.label}</Typography>
                          {status !== 'normal' && (
                            <WarningIcon 
                              sx={{ 
                                color: getStatusColor(status),
                                animation: `${pulseAnimation} 1s infinite`
                              }} 
                            />
                          )}
                        </Box>
                        <FormControlLabel
                          control={
                            <Switch
                              size="small"
                              checked={control.enabled}
                              onChange={(e) => setManualControls(prev => ({
                                ...prev,
                                [sensor.type]: { ...prev[sensor.type], enabled: e.target.checked }
                              }))}
                            />
                          }
                          label="Manual"
                          sx={{ color: '#fff' }}
                        />
                      </Box>
                      <Box sx={{ px: 1 }}>
                        <Slider
                          disabled={!control.enabled}
                          value={control.value}
                          min={sensor.warningRange[0]}
                          max={sensor.warningRange[1]}
                          step={(sensor.warningRange[1] - sensor.warningRange[0]) / 100}
                          marks={[
                            { value: sensor.normalRange[0], label: `${sensor.normalRange[0]}${sensor.unit}` },
                            { value: sensor.normalRange[1], label: `${sensor.normalRange[1]}${sensor.unit}` }
                          ]}
                          onChange={(_, value) => setManualControls(prev => ({
                            ...prev,
                            [sensor.type]: { ...prev[sensor.type], value: value as number }
                          }))}
                          sx={{
                            '& .MuiSlider-rail': { bgcolor: 'rgba(255,255,255,0.2)' },
                            '& .MuiSlider-track': { bgcolor: getStatusColor(
                              getSensorStatus(control.value, sensor)
                            )},
                            '& .MuiSlider-thumb': { bgcolor: '#fff' },
                            '& .MuiSlider-mark': { bgcolor: '#fff' },
                            '& .MuiSlider-markLabel': { color: '#fff' }
                          }}
                        />
                      </Box>
                      <Typography variant="body2" sx={{ mt: 1, textAlign: 'center', color: '#fff' }}>
                        Current: {control.value.toFixed(1)}{sensor.unit}
                      </Typography>
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          </Paper>

          {/* Tasks */}
          <Paper sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.05)' }}>
            <Typography variant="h6" sx={{ color: '#fff' }} gutterBottom>Active Tasks</Typography>
            <Grid container spacing={1}>
              {virtualEnv.automationTasks?.map(task => (
                <Grid item xs={12} key={task.id}>
                  <Paper sx={{ p: 1, bgcolor: 'rgba(255,255,255,0.1)' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: '#fff' }}>{task.name}</Typography>
                      <Chip label={task.priority} size="small" sx={{ 
                        bgcolor: task.priority === 'critical' ? '#ff1744' :
                        task.priority === 'high' ? '#ff9100' : '#00e676',
                        color: '#fff'
                      }} />
                    </Box>
                    <Typography variant="caption" sx={{ opacity: 0.7, color: '#fff' }}>
                      {task.schedule.frequency}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Schedule */}
          <Paper sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.05)' }}>
            <Typography variant="h6" sx={{ color: '#fff' }} gutterBottom>Current Schedule</Typography>
            <Grid container spacing={2}>
              {Object.entries(virtualEnv.schedule).map(([key, value]) => (
                <Grid item xs={12} key={key}>
                  <Paper sx={{ p: 1, bgcolor: 'rgba(255,255,255,0.1)' }}>
                    <Typography variant="body2" sx={{ color: '#fff' }} textTransform="capitalize">
                      {key}: {JSON.stringify(value)}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Box>
      </Box>

      {/* Alerts */}
      {alerts.map(alert => (
        <Snackbar
          key={alert.id}
          open
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          autoHideDuration={6000}
          onClose={() => setAlerts(prev => prev.filter(a => a.id !== alert.id))}
        >
          <Alert 
            severity={alert.type} 
            variant="filled"
            sx={{ 
              width: '100%',
              animation: `${pulseAnimation} 1s infinite`,
              '& .MuiAlert-icon': {
                animation: `${pulseAnimation} 1s infinite`,
              }
            }}
          >
            {alert.message}
          </Alert>
        </Snackbar>
      ))}
    </Box>
  );
};

export default VirtualEnvironment;