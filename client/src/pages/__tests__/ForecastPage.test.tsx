import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { describe, beforeEach, it, expect, vi } from 'vitest';
import ForecastPage from '../ForecastPage';
import authReducer from '../../redux/services/authSlice';
import axios from 'axios';

// Mock the API calls
vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

// Mock the Redux store
const createMockStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
    },
    preloadedState: {
      auth: {
        user: {
          _id: 'test-id',
          email: 'test@example.com',
          exp: Math.floor(Date.now() / 1000) + 3600,
          iat: Math.floor(Date.now() / 1000),
        },
        token: 'test-token',
      },
    },
  });
};

describe('ForecastPage', () => {
  let store: ReturnType<typeof createMockStore>;

  beforeEach(() => {
    store = createMockStore();
    vi.clearAllMocks();
  });

  it('renders the forecast page', () => {
    render(
      <Provider store={store}>
        <ForecastPage />
      </Provider>
    );
    expect(screen.getByText('Forecast Demand')).toBeInTheDocument();
  });

  it('shows loading state while fetching products', () => {
    render(
      <Provider store={store}>
        <ForecastPage />
      </Provider>
    );
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows error message when product fetch fails', async () => {
    const mockError = new Error('Failed to fetch products');
    vi.mocked(axios.get).mockRejectedValueOnce(mockError);

    render(
      <Provider store={store}>
        <ForecastPage />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Error: Failed to fetch products')).toBeInTheDocument();
    });
  });

  it('shows "No products available" when there are no products', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({ data: [] });

    render(
      <Provider store={store}>
        <ForecastPage />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('No products available')).toBeInTheDocument();
    });
  });

  it('shows "Not enough data to forecast" when product has insufficient sales', async () => {
    const mockProducts = [{ _id: '1', name: 'Test Product' }];
    vi.mocked(axios.get).mockResolvedValueOnce({ data: mockProducts });
    vi.mocked(axios.post).mockResolvedValueOnce({
      data: { error: 'Not enough sales data' },
    });

    render(
      <Provider store={store}>
        <ForecastPage />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Not enough data to forecast')).toBeInTheDocument();
    });
  });

  it('shows forecast results when successful', async () => {
    const mockProducts = [{ _id: '1', name: 'Test Product' }];
    const mockForecast = {
      forecast: [100, 120, 140],
      dates: ['2024-01-01', '2024-01-02', '2024-01-03'],
    };

    vi.mocked(axios.get).mockResolvedValueOnce({ data: mockProducts });
    vi.mocked(axios.post).mockResolvedValueOnce({ data: mockForecast });

    render(
      <Provider store={store}>
        <ForecastPage />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Forecast Results')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.getByText('120')).toBeInTheDocument();
      expect(screen.getByText('140')).toBeInTheDocument();
    });
  });
}); 