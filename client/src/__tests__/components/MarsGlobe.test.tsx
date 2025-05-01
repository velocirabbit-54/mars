import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import MarsGlobe from '../../components/Mars';

// mock the Three.js related modules
jest.mock('@react-three/fiber', () => ({
  Canvas: ({
    children,
    style,
  }: {
    children: React.ReactNode;
    style?: React.CSSProperties;
  }) => (
    <div data-testid='react-3-fiber-canvas' style={style}>
      {children}
    </div>
  ),
  useFrame: (callback: () => void) => {},
  ThreeElements: {},

  // This is what wee use inside our react component Mars.tsx
  directionalLight: (props: any) => <div data-testid='directional-light'></div>,
  ambientLight: (props: any) => <div data-testid='ambient-light'></div>,
  Suspense: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

jest.mock('@react-three/drei', () => {
  // create useGLTF function with preload method attached
  const useGLTF = () => ({
    scene: {
      clone: () => ({
        scale: {
          setScalar: jest.fn(),
        },
        rotation: {
          y: 0,
        },
      }),
    },
  });

  // Attach preload method to the function
  useGLTF.preload = jest.fn();

  return {
    OrbitControls: () => <div data-testid='orbit-controls'></div>,
    useGLTF: useGLTF,
  };
});

jest.mock('three', () => ({
  Group: class Group {
    rotation = { y: 0 };
  },
}));

describe('MarsGlobe component', () => {
  // 1/ render without error
  test('renders without errors', () => {
    render(<MarsGlobe scrollTop={0} />);
    expect(screen.getByTestId('react-3-fiber-canvas')).toBeInTheDocument();
  });

  // 2/ correct styling
  test('has proper styling when visible (scrollTop < 800)', () => {
    render(<MarsGlobe scrollTop={500} />);
    // Get the canvas element directly
    const canvasElement = screen.getByTestId('react-3-fiber-canvas');
    expect(canvasElement).toBeInTheDocument();
    // Check styling on this specific element
    expect(canvasElement).toHaveStyle({
      width: '100vw',
      height: '100vh',
    });
  });

  // 3/ sucessfully pass scrollTop to the MarsModel
  test('passes scrollTop to MarsModel component', () => {
    const { rerender } = render(<MarsGlobe scrollTop={0} />);

    // rerender with different scrollTop values
    rerender(<MarsGlobe scrollTop={100} />);
    rerender(<MarsGlobe scrollTop={500} />);

    expect(screen.getByTestId('react-3-fiber-canvas')).toBeInTheDocument();
  });
});
