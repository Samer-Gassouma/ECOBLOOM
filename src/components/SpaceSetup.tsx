import { useState, useEffect, useMemo } from 'react';
import { 
  Box, 
  Slider, 
  Typography, 
  Button, 
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Chip,
  Stack,
} from '@mui/material';
import { Canvas, Vector3 } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Html } from '@react-three/drei';
import { motion } from 'framer-motion';
import AddIcon from '@mui/icons-material/Add';
import GridViewIcon from '@mui/icons-material/GridView';
import Crop54Icon from '@mui/icons-material/Crop54';
import SquareFootIcon from '@mui/icons-material/SquareFoot';
import ViewInArIcon from '@mui/icons-material/ViewInAr';
import GridOnIcon from '@mui/icons-material/GridOn';
import StraightenIcon from '@mui/icons-material/Straighten';
import CropLandscapeIcon from '@mui/icons-material/CropLandscape';

interface SpaceSetupProps {
  onSpaceSizeChange: (size: number) => void;
}

interface GridCellProps {
  position: Vector3;
  size: number;
  isHovered?: boolean;
  isSelected?: boolean;
  onHover: () => void;
  onUnhover: () => void;
  onClick: () => void;
}

const GridCell = ({ position, size, isHovered, isSelected, onHover, onUnhover, onClick }: GridCellProps) => {
  return (
    <mesh
      position={position}
      rotation={[-Math.PI / 2, 0, 0]}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover();
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        onUnhover();
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <planeGeometry args={[size - 0.05, size - 0.05]} />
      <meshStandardMaterial 
        color={isSelected ? "#000000" : "#ffffff"}
        transparent
        opacity={isHovered ? 0.3 : isSelected ? 0.2 : 0.1}
        roughness={0.8}
      />
      {isHovered && (
        <Html center>
          <div style={{ 
            background: 'rgba(0,0,0,0.8)', 
            color: 'white', 
            padding: '4px 8px', 
            borderRadius: '4px',
            fontSize: '12px',
            whiteSpace: 'nowrap',
          }}>
            {size.toFixed(1)}m × {size.toFixed(1)}m
          </div>
        </Html>
      )}
    </mesh>
  );
};

const GridVisualization = ({ 
  size, 
  gridSize, 
  selectedCells, 
  onCellClick,
}: { 
  size: number;
  gridSize: number;
  selectedCells: Set<string>;
  onCellClick: (cellId: string) => void;
}) => {
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);
  const cellSize = size / gridSize;

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial color="#f8f8f8" />
        <gridHelper args={[size, gridSize, '#000000', '#cccccc']} />
      </mesh>
      {Array.from({ length: gridSize }).map((_, row) =>
        Array.from({ length: gridSize }).map((_, col) => {
          const cellId = `${row}-${col}`;
          const position: Vector3 = [
            (col - gridSize / 2 + 0.5) * cellSize,
            0,
            (row - gridSize / 2 + 0.5) * cellSize
          ];

          return (
            <GridCell
              key={cellId}
              position={position}
              size={cellSize}
              isHovered={hoveredCell === cellId}
              isSelected={selectedCells.has(cellId)}
              onHover={() => setHoveredCell(cellId)}
              onUnhover={() => setHoveredCell(null)}
              onClick={() => onCellClick(cellId)}
            />
          );
        })
      )}
    </group>
  );
};

const SpaceSetup = ({ onSpaceSizeChange }: SpaceSetupProps) => {
  const [spaceSize, setSpaceSize] = useState<number>(2);
  const [customSize, setCustomSize] = useState<string>('');
  const [isCustomDialog, setIsCustomDialog] = useState(false);
  const [gridView, setGridView] = useState(true);
  const [gridSize, setGridSize] = useState(4);
  const [cameraPosition, setCameraPosition] = useState([5, 5, 5]);
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('3d');
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
  const [dimensions, setDimensions] = useState<{ width: number; length: number }>({
    width: 2,
    length: 2,
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const selectedArea = useMemo(() => {
    const cellSize = spaceSize / gridSize;
    return selectedCells.size * cellSize * cellSize;
  }, [selectedCells, spaceSize, gridSize]);

  // Update grid size calculation for better precision with smaller spaces
  const calculateGridSize = (size: number) => {
    // For spaces up to 12m², use a finer grid
    return Math.max(4, Math.min(12, Math.floor(size * 3)));
  };

  useEffect(() => {
    // Adjust camera position for smaller maximum space
    const distance = 2.5 + spaceSize * 0.5;
    setCameraPosition([distance, distance, distance]);
  }, [spaceSize]);

  const handleSizeChange = (newSize: number) => {
    setSpaceSize(newSize);
    setGridSize(calculateGridSize(newSize));
    setSelectedCells(new Set());
  };

  const handleCustomSizeSubmit = () => {
    const size = parseFloat(customSize);
    if (!isNaN(size) && size > 0 && size <= 12) {
      handleSizeChange(size);
      setIsCustomDialog(false);
    }
  };

  const handleCellClick = (cellId: string) => {
    const newSelectedCells = new Set(selectedCells);
    if (selectedCells.has(cellId)) {
      newSelectedCells.delete(cellId);
    } else {
      newSelectedCells.add(cellId);
    }
    setSelectedCells(newSelectedCells);
  };

  const handleViewModeChange = (_: React.MouseEvent<HTMLElement>, newMode: '2d' | '3d') => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  return (
    <Box
      component={motion.div}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 6,
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        position: 'relative',
        mx: 'auto',
        maxWidth: 'md',
        width: '100%',
        px: { xs: 2, sm: 4 },
      }}
    >
      <Box
        component={motion.div}
        variants={itemVariants}
        sx={{ 
          width: '100%',
          maxWidth: '600px',
          position: 'relative',
        }}
      >
        <Typography 
          variant="h4" 
          sx={{
            fontWeight: 700,
            mb: 3,
            fontSize: { xs: '2rem', md: '2.5rem' },
            background: 'linear-gradient(45deg, #000 30%, #333 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Design Your Growing Space
        </Typography>
        
        <Typography 
          variant="body1" 
          color="text.secondary" 
          sx={{ 
            mb: 4,
            fontSize: { xs: '1rem', md: '1.1rem' },
            lineHeight: 1.7,
          }}
        >
          Click on grid cells to select areas for your setup.
          Use the controls to customize your view and space dimensions.
        </Typography>
      </Box>

      <Stack 
        direction="row" 
        spacing={2} 
        alignItems="center" 
        sx={{ 
          width: '100%',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            border: '1px solid rgba(0,0,0,0.1)',
            borderRadius: 2,
            position: 'relative',
            overflow: 'hidden',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: `${(spaceSize / 12) * 100}%`,
              height: 3,
              backgroundColor: spaceSize >= 11 ? '#ff4444' : '#000',
              transition: 'all 0.3s ease',
            },
          }}
        >
          <SquareFootIcon sx={{ fontSize: 24, opacity: 0.7 }} />
          <Box>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 600,
                fontSize: '1.5rem',
                lineHeight: 1,
              }}
            >
              {spaceSize.toFixed(1)} m²
            </Typography>
            <Typography 
              variant="caption" 
              color="text.secondary"
              sx={{ display: 'block' }}
            >
              Maximum 12m²
            </Typography>
          </Box>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            border: '1px solid rgba(0,0,0,0.1)',
            borderRadius: 2,
          }}
        >
          <ViewInArIcon sx={{ fontSize: 24, opacity: 0.7 }} />
          <Box>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 600,
                fontSize: '1.5rem',
                lineHeight: 1,
              }}
            >
              {selectedArea.toFixed(1)} m²
            </Typography>
            <Typography 
              variant="caption" 
              color="text.secondary"
              sx={{ display: 'block' }}
            >
              Selected Area
            </Typography>
          </Box>
        </Paper>
      </Stack>

      <Box
        sx={{ 
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center',
          gap: 2,
          mb: 2,
        }}>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewModeChange}
            aria-label="view mode"
            size="small"
          >
            <ToggleButton value="2d" aria-label="2D view">
              <Tooltip title="2D View">
                <GridOnIcon />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="3d" aria-label="3D view">
              <Tooltip title="3D View">
                <ViewInArIcon />
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>

          <Tooltip title="Toggle grid">
            <IconButton 
              onClick={() => setGridView(!gridView)}
              sx={{ 
                border: '1px solid rgba(0,0,0,0.1)',
                '&:hover': { backgroundColor: 'rgba(0,0,0,0.05)' },
              }}
            >
              {gridView ? <GridViewIcon /> : <Crop54Icon />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Custom size">
            <IconButton 
              onClick={() => setIsCustomDialog(true)}
              sx={{ 
                border: '1px solid rgba(0,0,0,0.1)',
                '&:hover': { backgroundColor: 'rgba(0,0,0,0.05)' },
              }}
            >
              <AddIcon />
            </IconButton>
          </Tooltip>
        </Box>

        <Box sx={{ px: 4, width: '100%', maxWidth: 600, mx: 'auto' }}>
          <Slider
            value={spaceSize}
            onChange={(_, value) => handleSizeChange(value as number)}
            min={1}
            max={12}
            step={0.5}
            marks={[
              { value: 1, label: '1m²' },
              { value: 6, label: '6m²' },
              { value: 12, label: '12m²' },
            ]}
            valueLabelDisplay="auto"
            aria-label="Space size"
            sx={{
              '& .MuiSlider-thumb': {
                width: 20,
                height: 20,
                backgroundColor: '#000',
                '&:hover, &.Mui-focusVisible': {
                  boxShadow: '0 0 0 8px rgba(0,0,0,0.1)',
                },
              },
              '& .MuiSlider-track': {
                backgroundColor: spaceSize >= 11 ? '#ff4444' : '#000',
                height: 4,
                border: 'none',
                transition: 'background-color 0.3s ease',
              },
              '& .MuiSlider-rail': {
                backgroundColor: '#e0e0e0',
                height: 4,
              },
              '& .MuiSlider-mark': {
                backgroundColor: '#000',
                width: 4,
                height: 4,
                borderRadius: '50%',
              },
              '& .MuiSlider-markLabel': {
                fontSize: '0.875rem',
                color: 'text.secondary',
              },
            }}
          />
        </Box>
      </Box>

      <Box
        component={motion.div}
        variants={itemVariants}
        sx={{ 
          width: '100%',
          aspectRatio: '16/9',
          maxHeight: '500px',
          bgcolor: '#fafafa',
          borderRadius: 3,
          overflow: 'hidden',
          border: '1px solid #eaeaea',
          position: 'relative',
        }}
      >
        <Canvas>
          <PerspectiveCamera 
            makeDefault 
            position={viewMode === '3d' ? cameraPosition as Vector3 : [0, 10, 0]} 
            fov={50}
            rotation={viewMode === '2d' ? [-Math.PI / 2, 0, 0] : undefined}
          />
          <ambientLight intensity={0.7} />
          <pointLight position={[10, 10, 10]} intensity={0.5} />
          <GridVisualization 
            size={spaceSize} 
            gridSize={gridView ? gridSize : 1}
            selectedCells={selectedCells}
            onCellClick={handleCellClick}
          />
          <OrbitControls 
            enableDamping
            dampingFactor={0.05}
            minDistance={3}
            maxDistance={50}
            maxPolarAngle={viewMode === '2d' ? 0 : Math.PI / 2}
          />
        </Canvas>
        <Box
          sx={{
            position: 'absolute',
            bottom: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(255,255,255,0.9)',
            padding: '8px 16px',
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            backdropFilter: 'blur(4px)',
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Click cells to select • Drag to rotate • Scroll to zoom • Double-click to reset
          </Typography>
        </Box>
      </Box>

      <Box
        component={motion.div}
        variants={itemVariants}
        sx={{ mt: 4 }}
      >
        <Button
          component={motion.button}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          variant="contained"
          size="large"
          onClick={() => onSpaceSizeChange(spaceSize)}
          disabled={selectedCells.size === 0}
          sx={{ 
            minWidth: 200,
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '100%',
              height: '20px',
              background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0) 70%)',
              pointerEvents: 'none',
            }
          }}
        >
          Continue
        </Button>
      </Box>

      <Dialog 
        open={isCustomDialog} 
        onClose={() => setIsCustomDialog(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 2,
          }
        }}
      >
        <DialogTitle sx={{ textAlign: 'center' }}>
          Enter Custom Space Size
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Size in square meters (max 12)"
            type="number"
            fullWidth
            value={customSize}
            onChange={(e) => setCustomSize(e.target.value)}
            InputProps={{
              inputProps: { 
                min: 1,
                max: 12,
                step: 0.5
              }
            }}
            helperText={parseFloat(customSize) > 12 ? "Maximum size is 12m²" : ""}
            error={parseFloat(customSize) > 12}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pt: 2 }}>
          <Button onClick={() => setIsCustomDialog(false)} variant="outlined">
            Cancel
          </Button>
          <Button 
            onClick={handleCustomSizeSubmit} 
            variant="contained"
            disabled={parseFloat(customSize) > 12}
          >
            Apply
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SpaceSetup; 