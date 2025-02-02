import { useEffect, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import { Group } from 'three';
import { BasicModelGenerator } from './BasicModelGenerator';

// Define model paths
export const MODEL_PATHS = {
  WATER_PUMP: '/models/water_pump.glb',
  NUTRIENT_PUMP: '/models/nutrient_pump.glb',
  SENSOR: '/models/sensor.glb',
  LIGHT_PANEL: '/models/light_panel.glb',
  SUPPORT: '/models/support.glb',
  CAMERA: '/models/camera.glb',
  DRONE: '/models/drone.glb',
  PLANT_1: '/models/plant_1.glb',
  PLANT_2: '/models/plant_2.glb',
  PLANT_3: '/models/plant_3.glb',
  PLANT_4: '/models/plant_4.glb',
} as const;

// Map GLTF paths to basic model types
const MODEL_TYPE_MAP: Record<string, string> = {
  'water_pump.glb': 'water_pump',
  'nutrient_pump.glb': 'nutrient_pump',
  'sensor.glb': 'sensor',
  'light_panel.glb': 'light_panel',
  'support.glb': 'support',
  'camera.glb': 'camera',
  'drone.glb': 'drone',
  'plant_1.glb': 'plant_1',
  'plant_2.glb': 'plant_2',
  'plant_3.glb': 'plant_3',
  'plant_4.glb': 'plant_4',
};

interface ModelLoaderProps {
  url: string;
  scale?: number;
  rotation?: [number, number, number];
  position?: [number, number, number];
  animate?: boolean;
  onLoad?: (model: Group) => void;
}

export const ModelLoader = ({ 
  url, 
  scale = 1, 
  rotation = [0, 0, 0],
  position = [0, 0, 0],
  animate = false,
  onLoad 
}: ModelLoaderProps) => {
  const [loadError, setLoadError] = useState(false);
  
  let gltfScene: Group | undefined;
  try {
    const gltf = useGLTF(url, true); // Add true for suspense mode
    gltfScene = gltf.scene;
  } catch (error) {
    if (!loadError) {
      console.warn(`Failed to load GLTF model: ${url}`, error);
      setLoadError(true);
    }
  }

  useEffect(() => {
    if (gltfScene && !loadError) {
      onLoad?.(gltfScene.clone());
    }
  }, [gltfScene, loadError, onLoad]);

  if (loadError || !gltfScene) {
    // Extract the filename from the URL and get the corresponding basic model type
    const filename = url.split('/').pop() || '';
    const basicModelType = MODEL_TYPE_MAP[filename];

    if (basicModelType) {
      return (
        <BasicModelGenerator
          modelType={basicModelType}
          scale={scale}
          rotation={rotation}
          position={position}
        />
      );
    }
    return null;
  }

  return (
    <primitive 
      object={gltfScene} 
      scale={scale} 
      rotation={rotation}
      position={position}
    />
  );
};

// Preload all models
Object.values(MODEL_PATHS).forEach(path => {
  useGLTF.preload(path);
}); 