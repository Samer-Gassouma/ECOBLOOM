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

export const BASIC_MODELS: Record<string, CompleteModelDefinition>; 