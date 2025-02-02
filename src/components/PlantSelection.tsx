import { useState, useEffect, useMemo, useCallback, memo, forwardRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Grid,
  Button,
  Chip,
  LinearProgress,
  IconButton,
  TextField,
  InputAdornment,
  FormControl,
  Select,
  MenuItem,
  Skeleton,
  Alert,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import SearchIcon from '@mui/icons-material/Search';
import SortIcon from '@mui/icons-material/Sort';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useNavigate } from 'react-router-dom';

interface Plant {
  id: string;
  name: string;
  image: string;
  growthTime: number;
  spaceRequired: number;
}

interface PlantSelectionProps {
  spaceSize: number;
  onPlantsSelected: (plants: { [id: string]: number }) => void;
}

// Optimized plant fetching with error handling
const fetchPlants = async (): Promise<Plant[]> => {
  try {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return [
      {
        id: '1',
        name: 'Cucumber',
        image: 'https://images.unsplash.com/photo-1604977042946-1eecc30f269e',
        growthTime: 55,
        spaceRequired: 0.4,
      },
      {
        id: '2',
        name: 'Strawberry',
        image: 'https://images.unsplash.com/photo-1543528176-61b239494933',
        growthTime: 60,
        spaceRequired: 0.3,
      },
      {
        id: '3',
        name: 'Tomato',
        image: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa',
        growthTime: 65,
        spaceRequired: 0.5,
      },
      {
        id: '4',
        name: 'Lettuce',
        image: 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1',
        growthTime: 30,
        spaceRequired: 0.2,
      },
      {
        id: '5',
        name: 'Basil',
        image: 'https://images.unsplash.com/photo-1618375569909-3c8616cf7733',
        growthTime: 25,
        spaceRequired: 0.1,
      },
      {
        id: '6',
        name: 'Bell Pepper',
        image: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83',
        growthTime: 70,
        spaceRequired: 0.4,
      },
      {
        id: '7',
        name: 'Spinach',
        image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb',
        growthTime: 40,
        spaceRequired: 0.2,
      },
      {
        id: '8',
        name: 'Kale',
        image: 'https://images.unsplash.com/photo-1524179091875-bf99a9a6af57',
        growthTime: 45,
        spaceRequired: 0.3,
      },
      {
        id: '9',
        name: 'Mint',
        image: 'https://images.unsplash.com/photo-1628556270448-4d4e4148e1b1',
        growthTime: 30,
        spaceRequired: 0.15,
      },
      {
        id: '10',
        name: 'Cherry Tomatoes',
        image: 'https://images.unsplash.com/photo-1592148153481-9ca6a16bb8b8',
        growthTime: 55,
        spaceRequired: 0.3,
      },
      {
        id: '11',
        name: 'Arugula',
        image: 'https://images.unsplash.com/photo-1593105544559-ecb03bf76f82',
        growthTime: 35,
        spaceRequired: 0.2,
      },
      {
        id: '12',
        name: 'Herbs Mix',
        image: 'https://images.unsplash.com/photo-1466637574441-749b8f19452f',
        growthTime: 28,
        spaceRequired: 0.25,
      }
    ];
  } catch (error) {
    console.error('Error fetching plants:', error);
    throw new Error('Failed to fetch plants');
  }
};

// Memoized Plant Card Component
const PlantCard = motion(forwardRef<HTMLDivElement, {
  plant: Plant;
  quantity: number;
  onSelect: (id: string, action: 'add' | 'remove') => void;
  disabled: boolean;
}>(({ plant, quantity, onSelect, disabled }, ref) => (
  <Card 
    ref={ref}
    component="div"
    sx={{ 
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.7 : 1,
      transition: 'all 0.3s ease-in-out',
      border: quantity > 0 ? '2px solid #000' : '1px solid #eaeaea',
      borderRadius: 3,
      overflow: 'hidden',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      '&:hover': disabled ? {} : {
        transform: 'translateY(-4px)',
        boxShadow: '0 12px 24px rgba(0,0,0,0.1)',
      },
    }}
  >
    <Box sx={{ position: 'relative' }}>
      <CardMedia
        component="img"
        height="180"
        image={plant.image}
        alt={plant.name}
        loading="lazy"
        sx={{ objectFit: 'cover' }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: 12,
          right: 12,
          display: 'flex',
          gap: 1,
          alignItems: 'center',
        }}
      >
        {quantity > 0 && (
          <Chip
            label={quantity}
            size="small"
            sx={{
              backgroundColor: 'rgba(255,255,255,0.9)',
              fontWeight: 600,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          />
        )}
        <Box
          sx={{
            backgroundColor: 'rgba(255,255,255,0.9)',
            borderRadius: '24px',
            height: 36,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            padding: '0 4px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              if (!disabled) onSelect(plant.id, 'remove');
            }}
            disabled={quantity === 0}
            sx={{ 
              width: 28,
              height: 28,
              '&:hover': { backgroundColor: 'rgba(0,0,0,0.05)' },
            }}
          >
            <RemoveIcon sx={{ fontSize: 16 }} />
          </IconButton>
          
          <Typography 
            sx={{ 
              minWidth: '24px', 
              textAlign: 'center',
              fontWeight: 600,
              userSelect: 'none',
            }}
          >
            {quantity}
          </Typography>

          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              if (!disabled) onSelect(plant.id, 'add');
            }}
            disabled={disabled && quantity === 0}
            sx={{ 
              width: 28,
              height: 28,
              '&:hover': { backgroundColor: 'rgba(0,0,0,0.05)' },
            }}
          >
            <AddIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>
      </Box>
    </Box>
    <CardContent sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <Typography 
        variant="h6" 
        component="div"
        sx={{ fontWeight: 600, mb: 2 }}
      >
        {plant.name}
      </Typography>
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Chip 
          label={`${plant.spaceRequired} m²`} 
          size="small"
          sx={{
            backgroundColor: '#f0f0f0',
            color: '#000',
            fontWeight: 500,
            px: 1,
          }}
        />
        <Chip 
          label={`${plant.growthTime} days`} 
          size="small"
          sx={{
            backgroundColor: '#f0f0f0',
            color: '#000',
            fontWeight: 500,
            px: 1,
          }}
        />
      </Box>
    </CardContent>
  </Card>
)));

const PlantSelection = ({ spaceSize, onPlantsSelected }: PlantSelectionProps) => {
  const navigate = useNavigate();
  const [plants, setPlants] = useState<Plant[]>([]);
  const [selectedPlants, setSelectedPlants] = useState<{ [id: string]: number }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'growthTime' | 'spaceRequired'>('name');
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  // Memoized space calculations
  const spaceUsed = useMemo(() => 
    plants.reduce((acc, plant) => 
      acc + (selectedPlants[plant.id] || 0) * plant.spaceRequired, 0
    ),
    [plants, selectedPlants]
  );

  const spaceUsagePercentage = useMemo(() => 
    (spaceUsed / spaceSize) * 100,
    [spaceUsed, spaceSize]
  );

  // Memoized filtered and sorted plants
  const filteredAndSortedPlants = useMemo(() => {
    return plants
      .filter(plant => 
        plant.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => {
        switch (sortBy) {
          case 'growthTime':
            return a.growthTime - b.growthTime;
          case 'spaceRequired':
            return a.spaceRequired - b.spaceRequired;
          default:
            return a.name.localeCompare(b.name);
        }
      });
  }, [plants, searchQuery, sortBy]);

  // Optimized plant selection handler
  const handlePlantSelect = useCallback((plantId: string, action: 'add' | 'remove') => {
    const plant = plants.find(p => p.id === plantId);
    if (!plant) return;

    setSelectedPlants(prev => {
      const currentQuantity = prev[plantId] || 0;
      const newQuantity = action === 'add' ? currentQuantity + 1 : currentQuantity - 1;
      
      if (newQuantity <= 0) {
        const { [plantId]: _, ...rest } = prev;
        return rest;
      }

      const newSpaceUsed = plants.reduce((acc, p) => {
        const quantity = p.id === plantId ? newQuantity : (prev[p.id] || 0);
        return acc + quantity * p.spaceRequired;
      }, 0);

      if (newSpaceUsed > spaceSize) return prev;

      return { ...prev, [plantId]: newQuantity };
    });
  }, [plants, spaceSize]);

  // Load plants with error handling
  useEffect(() => {
    const loadPlants = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedPlants = await fetchPlants();
        setPlants(fetchedPlants);
      } catch (err) {
        setError('Failed to load plants. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    loadPlants();
  }, []);

  // Image preloading
  useEffect(() => {
    plants.forEach(plant => {
      const img = new Image();
      img.src = plant.image;
      img.onload = () => {
        setLoadedImages(prev => new Set(prev).add(plant.id));
      };
    });
  }, [plants]);

  if (error) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100%' 
      }}>
        <Alert 
          severity="error" 
          icon={<ErrorOutlineIcon />}
          sx={{ maxWidth: 400 }}
        >
          {error}
        </Alert>
      </Box>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
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
        mx: 'auto',
        maxWidth: 'md',
        width: '100%',
        px: { xs: 2, sm: 4 },
      }}
    >
      <Box
        component={motion.div}
        variants={itemVariants}
        sx={{ width: '100%', maxWidth: '600px' }}
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
          Select Your Plants
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
          Choose the plants you want to grow in your hydroponic setup.
          We'll help you optimize the space for maximum yield.
        </Typography>
      </Box>

      <Box
        component={motion.div}
        variants={itemVariants}
        sx={{ 
          width: '100%', 
          maxWidth: '600px', 
          mb: 4,
          background: '#fafafa',
          borderRadius: 3,
          p: 3,
          border: '1px solid #eaeaea',
        }}
      >
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
            Space Usage
          </Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {spaceUsed.toFixed(1)} / {spaceSize.toFixed(1)} m²
          </Typography>
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={spaceUsagePercentage}
          sx={{
            height: 8,
            borderRadius: 4,
            backgroundColor: 'rgba(0,0,0,0.05)',
            '& .MuiLinearProgress-bar': {
              backgroundColor: spaceUsagePercentage > 90 ? '#ff4444' : '#000',
              borderRadius: 4,
              transition: 'all 0.3s ease-in-out',
            },
          }}
        />
        <Typography 
          variant="caption" 
          color="text.secondary"
          sx={{ mt: 1, display: 'block', textAlign: 'right' }}
        >
          {spaceUsagePercentage.toFixed(0)}% utilized
        </Typography>
      </Box>

      <Box sx={{ width: '100%', mb: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search plants..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ flex: 1, minWidth: 200 }}
        />
        <FormControl sx={{ minWidth: 150 }}>
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            displayEmpty
            startAdornment={
              <InputAdornment position="start">
                <SortIcon />
              </InputAdornment>
            }
          >
            <MenuItem value="name">Name</MenuItem>
            <MenuItem value="growthTime">Growth Time</MenuItem>
            <MenuItem value="spaceRequired">Space Required</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Grid 
        container 
        spacing={3} 
        sx={{ width: '100%', mx: 'auto' }}
      >
        <AnimatePresence>
          {loading ? (
            // Skeleton loading state
            Array.from({ length: 6 }).map((_, index) => (
              <Grid item xs={12} sm={6} md={4} key={`skeleton-${index}`}>
                <Skeleton 
                  variant="rectangular" 
                  height={300} 
                  sx={{ borderRadius: 3 }} 
                />
              </Grid>
            ))
          ) : (
            filteredAndSortedPlants.map((plant) => (
              <Grid item xs={12} sm={6} md={4} key={plant.id}>
                <Box
                  component={motion.div}
                  variants={itemVariants}
                  layout
                >
                  <PlantCard
                    plant={plant}
                    quantity={selectedPlants[plant.id] || 0}
                    onSelect={handlePlantSelect}
                    disabled={
                      selectedPlants[plant.id] === 0 &&
                      spaceUsed + plant.spaceRequired > spaceSize
                    }
                  />
                </Box>
              </Grid>
            ))
          )}
        </AnimatePresence>
      </Grid>

      <Box
        component={motion.div}
        variants={itemVariants}
        sx={{ mt: 6, display: 'flex', gap: 2 }}
      >
        <Button
          component={motion.button}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          variant="outlined"
          size="large"
          disabled={Object.keys(selectedPlants).length === 0}
          onClick={() => navigate('/virtual-env')}
          sx={{ 
            minWidth: 200,
            position: 'relative',
            borderWidth: 2,
            '&:hover': {
              borderWidth: 2
            }
          }}
        >
          View in Virtual Environment
        </Button>

        <Button
          component={motion.button}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          variant="contained"
          size="large"
          disabled={Object.keys(selectedPlants).length === 0}
          onClick={() => onPlantsSelected(selectedPlants)}
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
    </Box>
  );
};

export default PlantSelection; 