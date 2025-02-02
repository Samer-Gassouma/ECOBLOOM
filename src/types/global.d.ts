declare namespace JSX {
  interface IntrinsicAttributes {
    [key: string]: any;
  }
}

declare module '*.glb' {
  const content: any;
  export default content;
}

declare module '*.gltf' {
  const content: any;
  export default content;
}

// Make TypeScript more permissive with component props
declare namespace React {
  interface FunctionComponent<P = {}> {
    (props: P & { [key: string]: any }, context?: any): ReactElement<any, any> | null;
  }
}

// Add comprehensive Framer Motion type definitions
declare module 'framer-motion' {
  import { ComponentType, ForwardRefExoticComponent, RefAttributes, ReactElement, PropsWithoutRef } from 'react';

  export interface MotionProps {
    initial?: any;
    animate?: any;
    exit?: any;
    variants?: any;
    transition?: any;
    whileHover?: any;
    whileTap?: any;
    whileFocus?: any;
    whileDrag?: any;
    layout?: boolean | "position" | "size";
    [key: string]: any;
  }

  type MotionComponent<P = {}> = ForwardRefExoticComponent<PropsWithoutRef<P> & MotionProps & RefAttributes<HTMLElement>>;

  export interface Motion {
    <C extends ComponentType<any> | ForwardRefExoticComponent<any>>(component: C): MotionComponent<React.ComponentProps<C>>;
    (component: keyof JSX.IntrinsicElements): MotionComponent;
    div: MotionComponent<JSX.IntrinsicElements['div']>;
    button: MotionComponent<JSX.IntrinsicElements['button']>;
    span: MotionComponent<JSX.IntrinsicElements['span']>;
    img: MotionComponent<JSX.IntrinsicElements['img']>;
    [key: string]: MotionComponent;
  }

  export const motion: Motion;
  export const AnimatePresence: ComponentType<{
    children?: React.ReactNode;
    custom?: any;
    initial?: boolean;
    onExitComplete?: () => void;
    exitBeforeEnter?: boolean;
    presenceAffectsLayout?: boolean;
  }>;
} 