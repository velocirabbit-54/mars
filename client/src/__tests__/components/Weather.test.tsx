import { render, screen, fireEvent } from '@testing-library/react';
import Weather from '../../components/Weather';
import '@testing-library/jest-dom';

// Mock the 3D model components to avoid unnecessary rendering
// this mock is used to replace the actual 3D model components with simple divs
// this is done to speed up the test and avoid rendering complex 3D models
jest.mock('../../components/MarsWeatherModel', () => ({
  __esModule: true,
  default: () => <div>Mars Model</div>,
}));

jest.mock('../../components/EarthWeatherModel', () => ({
  __esModule: true,
  default: () => <div>Earth Model</div>,
}));

// Sample test data
const mockComparisonData = {
  mars: [
    {
      sol: '675',
      temp_avg: '-62.3',
      temp_min: '-96.8',
      temp_max: '-15.9',
      pressure: '750.6',
      wind_speed: '7.2',
      humidity: '10',
    },
    {
      sol: '676',
      temp_avg: '-63.0',
      temp_min: '-97.0',
      temp_max: '-16.0',
      pressure: '749.1',
      wind_speed: '8.5',
      humidity: '12',
    },
  ],
  earth: {
    date: '2024-04-28',
    humidity: '60%',
    pressure: '1013 hPa',
    temp_avg: '15°C',
    temp_max: '22°C',
    temp_min: '8°C',
    wind_speed: '12 km/h',
  },
};

describe('Weather component', () => {
  // Replace "it" with "test" (though both work in Jest)
  test('renders weather data', () => {
    const mockSetCoords = jest.fn(); // Changed from vi.fn()

    render(
      <Weather
        scrollTop={2500}
        comparisonData={mockComparisonData}
        setCoords={mockSetCoords}
      />
    );

    // Check Mars data
    expect(screen.getByText('Mars')).toBeInTheDocument();
    // Rest of expectations...

    // Check Earth data
    expect(screen.getByText('Earth')).toBeInTheDocument();

    // Check that dropdowns exist
    expect(screen.getAllByRole('combobox').length).toBe(2);
  });

  test('calls setCoords when selecting a city', () => {
    const mockSetCoords = jest.fn(); // Changed from vi.fn()

    render(
      <Weather
        scrollTop={2500}
        comparisonData={mockComparisonData}
        setCoords={mockSetCoords}
      />
    );

    const cityDropdown = screen.getAllByRole('combobox')[1];
    fireEvent.change(cityDropdown, { target: { value: 'London' } });

    expect(mockSetCoords).toHaveBeenCalledWith({
      lat: 51.5072,
      lon: -0.1276,
    });
  });

  test('Checks for Mars data update when Sol is changed', () => {
    const mockSetCoords = jest.fn(); // Changed from vi.fn()

    render(
      <Weather
        scrollTop={2500}
        comparisonData={mockComparisonData}
        setCoords={mockSetCoords}
      />
    );

    const solDropdown = screen.getAllByRole('combobox')[0];
    fireEvent.change(solDropdown, { target: { value: '676' } });

    expect(screen.getByText(/Avg Temp: -63/)).toBeInTheDocument();
  });
});
