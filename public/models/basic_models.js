// This file serves as a placeholder for real GLTF models
// Replace these with actual .glb files when available

export const BASIC_MODELS = {
  water_pump: {
    geometry: {
      type: 'cylinder',
      args: [0.15, 0.15, 0.3, 16],
      material: {
        color: '#4287f5',
        metalness: 0.8,
        roughness: 0.2
      }
    },
    children: [
      {
        type: 'cylinder',
        args: [0.05, 0.05, 0.4, 8],
        position: [0.1, 0.2, 0],
        material: {
          color: '#2b5aa5',
          metalness: 0.9,
          roughness: 0.1
        }
      },
      {
        type: 'box',
        args: [0.2, 0.1, 0.2],
        position: [0, -0.15, 0],
        material: {
          color: '#2b5aa5',
          metalness: 0.7,
          roughness: 0.3
        }
      }
    ]
  },
  nutrient_pump: {
    geometry: {
      type: 'cylinder',
      args: [0.12, 0.12, 0.25, 16],
      material: {
        color: '#e74c3c',
        metalness: 0.8,
        roughness: 0.2
      }
    },
    children: [
      {
        type: 'cylinder',
        args: [0.03, 0.03, 0.35, 8],
        position: [0.08, 0.2, 0],
        material: {
          color: '#c0392b',
          metalness: 0.9,
          roughness: 0.1
        }
      },
      {
        type: 'box',
        args: [0.18, 0.08, 0.18],
        position: [0, -0.12, 0],
        material: {
          color: '#c0392b',
          metalness: 0.7,
          roughness: 0.3
        }
      }
    ]
  },
  sensor: {
    geometry: {
      type: 'box',
      args: [0.15, 0.05, 0.15],
      material: {
        color: '#27ae60',
        metalness: 0.7,
        roughness: 0.3
      }
    },
    children: [
      {
        type: 'sphere',
        args: [0.03, 16, 16],
        position: [0, 0.04, 0],
        material: {
          color: '#2ecc71',
          emissive: '#2ecc71',
          emissiveIntensity: 0.5,
          metalness: 0.9,
          roughness: 0.1
        }
      },
      {
        type: 'cylinder',
        args: [0.01, 0.01, 0.1, 8],
        position: [0.05, 0.02, 0.05],
        material: {
          color: '#27ae60',
          metalness: 0.8,
          roughness: 0.2
        }
      }
    ]
  },
  light_panel: {
    geometry: {
      type: 'box',
      args: [0.6, 0.05, 0.3],
      material: {
        color: '#95a5a6',
        metalness: 0.8,
        roughness: 0.2
      }
    },
    children: [
      {
        type: 'box',
        args: [0.55, 0.02, 0.25],
        position: [0, -0.02, 0],
        material: {
          color: '#ffffff',
          emissive: '#ffffff',
          emissiveIntensity: 1,
          metalness: 0.9,
          roughness: 0.1
        }
      },
      {
        type: 'cylinder',
        args: [0.02, 0.02, 0.1, 8],
        position: [0.25, 0.05, 0.1],
        material: {
          color: '#7f8c8d',
          metalness: 0.8,
          roughness: 0.2
        }
      },
      {
        type: 'cylinder',
        args: [0.02, 0.02, 0.1, 8],
        position: [-0.25, 0.05, 0.1],
        material: {
          color: '#7f8c8d',
          metalness: 0.8,
          roughness: 0.2
        }
      }
    ]
  },
  support: {
    geometry: {
      type: 'cylinder',
      args: [0.04, 0.04, 1, 8],
      material: {
        color: '#95a5a6',
        metalness: 0.8,
        roughness: 0.2
      }
    },
    children: [
      {
        type: 'box',
        args: [0.12, 0.02, 0.12],
        position: [0, 0.5, 0],
        material: {
          color: '#7f8c8d',
          metalness: 0.8,
          roughness: 0.2
        }
      },
      {
        type: 'box',
        args: [0.12, 0.02, 0.12],
        position: [0, -0.5, 0],
        material: {
          color: '#7f8c8d',
          metalness: 0.8,
          roughness: 0.2
        }
      }
    ]
  },
  camera: {
    geometry: {
      type: 'box',
      args: [0.15, 0.15, 0.25],
      material: {
        color: '#34495e',
        metalness: 0.7,
        roughness: 0.3
      }
    },
    children: [
      {
        type: 'cylinder',
        args: [0.05, 0.05, 0.1, 16],
        position: [0, 0, 0.15],
        material: {
          color: '#2c3e50',
          metalness: 0.8,
          roughness: 0.2
        }
      },
      {
        type: 'sphere',
        args: [0.02, 16, 16],
        position: [0.05, 0.05, 0],
        material: {
          color: '#e74c3c',
          emissive: '#e74c3c',
          emissiveIntensity: 0.5,
          metalness: 0.9,
          roughness: 0.1
        }
      }
    ]
  },
  drone: {
    geometry: {
      type: 'box',
      args: [0.3, 0.05, 0.3],
      material: {
        color: '#2c3e50',
        metalness: 0.8,
        roughness: 0.2
      }
    },
    children: [
      // Motors and propellers
      {
        type: 'cylinder',
        args: [0.08, 0.08, 0.02, 16],
        position: [0.15, 0.02, 0.15],
        material: {
          color: '#95a5a6',
          metalness: 0.9,
          roughness: 0.1
        }
      },
      {
        type: 'cylinder',
        args: [0.08, 0.08, 0.02, 16],
        position: [-0.15, 0.02, 0.15],
        material: {
          color: '#95a5a6',
          metalness: 0.9,
          roughness: 0.1
        }
      },
      {
        type: 'cylinder',
        args: [0.08, 0.08, 0.02, 16],
        position: [0.15, 0.02, -0.15],
        material: {
          color: '#95a5a6',
          metalness: 0.9,
          roughness: 0.1
        }
      },
      {
        type: 'cylinder',
        args: [0.08, 0.08, 0.02, 16],
        position: [-0.15, 0.02, -0.15],
        material: {
          color: '#95a5a6',
          metalness: 0.9,
          roughness: 0.1
        }
      },
      // Camera
      {
        type: 'box',
        args: [0.08, 0.05, 0.08],
        position: [0, -0.03, 0],
        material: {
          color: '#34495e',
          metalness: 0.7,
          roughness: 0.3
        }
      }
    ]
  },
  plant_1: {
    geometry: {
      type: 'cylinder',
      args: [0.05, 0.07, 0.1, 8],
      material: {
        color: '#8b4513',
        metalness: 0.1,
        roughness: 0.9
      }
    },
    children: [
      {
        type: 'sphere',
        args: [0.15, 16, 16],
        position: [0, 0.2, 0],
        material: {
          color: '#27ae60',
          metalness: 0.1,
          roughness: 0.9
        }
      }
    ]
  },
  plant_2: {
    geometry: {
      type: 'cylinder',
      args: [0.05, 0.07, 0.12, 8],
      material: {
        color: '#8b4513',
        metalness: 0.1,
        roughness: 0.9
      }
    },
    children: [
      {
        type: 'sphere',
        args: [0.12, 16, 16],
        position: [0.1, 0.2, 0],
        material: {
          color: '#2ecc71',
          metalness: 0.1,
          roughness: 0.9
        }
      },
      {
        type: 'sphere',
        args: [0.12, 16, 16],
        position: [-0.1, 0.25, 0],
        material: {
          color: '#27ae60',
          metalness: 0.1,
          roughness: 0.9
        }
      }
    ]
  },
  plant_3: {
    geometry: {
      type: 'cylinder',
      args: [0.05, 0.07, 0.15, 8],
      material: {
        color: '#8b4513',
        metalness: 0.1,
        roughness: 0.9
      }
    },
    children: [
      {
        type: 'sphere',
        args: [0.1, 16, 16],
        position: [0.12, 0.3, 0],
        material: {
          color: '#27ae60',
          metalness: 0.1,
          roughness: 0.9
        }
      },
      {
        type: 'sphere',
        args: [0.1, 16, 16],
        position: [-0.12, 0.25, 0],
        material: {
          color: '#2ecc71',
          metalness: 0.1,
          roughness: 0.9
        }
      },
      {
        type: 'sphere',
        args: [0.1, 16, 16],
        position: [0, 0.35, 0],
        material: {
          color: '#27ae60',
          metalness: 0.1,
          roughness: 0.9
        }
      }
    ]
  },
  plant_4: {
    geometry: {
      type: 'cylinder',
      args: [0.05, 0.07, 0.2, 8],
      material: {
        color: '#8b4513',
        metalness: 0.1,
        roughness: 0.9
      }
    },
    children: [
      {
        type: 'sphere',
        args: [0.08, 16, 16],
        position: [0.15, 0.35, 0],
        material: {
          color: '#27ae60',
          metalness: 0.1,
          roughness: 0.9
        }
      },
      {
        type: 'sphere',
        args: [0.08, 16, 16],
        position: [-0.15, 0.3, 0],
        material: {
          color: '#2ecc71',
          metalness: 0.1,
          roughness: 0.9
        }
      },
      {
        type: 'sphere',
        args: [0.08, 16, 16],
        position: [0, 0.4, 0],
        material: {
          color: '#27ae60',
          metalness: 0.1,
          roughness: 0.9
        }
      },
      {
        type: 'sphere',
        args: [0.08, 16, 16],
        position: [0.1, 0.25, 0.1],
        material: {
          color: '#2ecc71',
          metalness: 0.1,
          roughness: 0.9
        }
      }
    ]
  }
}; 