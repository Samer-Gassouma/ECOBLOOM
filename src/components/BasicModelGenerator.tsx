import { useEffect, useRef } from 'react';
import { Group, Mesh, BoxGeometry, CylinderGeometry, SphereGeometry, MeshStandardMaterial } from 'three';
import { BASIC_MODELS } from '../../public/models/basic_models';

interface BasicModelProps {
  modelType: keyof typeof BASIC_MODELS;
  scale?: number;
  rotation?: [number, number, number];
  position?: [number, number, number];
}

interface ModelDefinition {
  type: string;
  args: number[];
  position?: [number, number, number];
  material: {
    color: string;
    metalness?: number;
    roughness?: number;
    emissive?: string;
    emissiveIntensity?: number;
  };
}

interface CompleteModelDefinition {
  geometry: ModelDefinition;
  children?: ModelDefinition[];
}

export const BasicModelGenerator = ({ 
  modelType, 
  scale = 1, 
  rotation = [0, 0, 0],
  position = [0, 0, 0]
}: BasicModelProps) => {
  const groupRef = useRef<Group>(null);
  const modelDef = BASIC_MODELS[modelType];

  useEffect(() => {
    if (!groupRef.current || !modelDef) return;

    const createGeometry = (type: string, args: number[]) => {
      switch (type) {
        case 'box':
          return new BoxGeometry(...args);
        case 'cylinder':
          return new CylinderGeometry(...args);
        case 'sphere':
          return new SphereGeometry(...args);
        default:
          return new BoxGeometry(1, 1, 1);
      }
    };

    const createMesh = (def: ModelDefinition) => {
      const geometry = createGeometry(def.type, def.args);
      const material = new MeshStandardMaterial(def.material);
      const mesh = new Mesh(geometry, material);
      if (def.position) {
        mesh.position.set(...def.position);
      }
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      return mesh;
    };

    // Create main mesh
    const mainMesh = createMesh(modelDef.geometry);
    groupRef.current.add(mainMesh);

    // Create children
    if (modelDef.children) {
      modelDef.children.forEach((childDef) => {
        const childMesh = createMesh(childDef);
        groupRef.current?.add(childMesh);
      });
    }

    return () => {
      // Cleanup
      if (groupRef.current) {
        while (groupRef.current.children.length) {
          const child = groupRef.current.children[0];
          if (child instanceof Mesh) {
            child.geometry.dispose();
            if (child.material instanceof MeshStandardMaterial) {
              child.material.dispose();
            }
          }
          groupRef.current.remove(child);
        }
      }
    };
  }, [modelDef]);

  return (
    <group 
      ref={groupRef} 
      scale={scale} 
      rotation={rotation}
      position={position}
    />
  );
}; 