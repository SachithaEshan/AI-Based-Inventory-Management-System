import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import ProductManagePage from '../pages/managements/ProductManagePage';
import authReducer from '../redux/services/authSlice';

// Mock the API calls
vi.mock('../api/productApi', () => ({
  getProducts: vi.fn().mockResolvedValue({
    data: [
      {
        _id: '1',
        name: 'Test Product',
        description: 'Test Description',
        price: 100,
        quantity: 10,
        reorder_threshold: 5,
        category: 'Test Category'
      }
    ]
  }),
  createProduct: vi.fn().mockResolvedValue({
    data: {
      _id: '2',
      name: 'New Product',
      description: 'New Description',
      price: 200,
      quantity: 20,
      reorder_threshold: 10,
      category: 'New Category'
    }
  }),
  updateProduct: vi.fn().mockResolvedValue({
    data: {
      _id: '1',
      name: 'Updated Product',
      description: 'Updated Description',
      price: 150,
      quantity: 15,
      reorder_threshold: 8,
      category: 'Updated Category'
    }
  }),
  deleteProduct: vi.fn().mockResolvedValue({ data: { _id: '1' } })
}));

describe('ProductManagePage', () => {
  const store = configureStore({
    reducer: {
      auth: authReducer as any
    },
    preloadedState: {
      auth: {
        user: {
          name: 'Test User',
          role: 'admin',
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          _id: 'test-id',
          email: 'test@example.com',
          exp: Math.floor(Date.now() / 1000) + 3600,
          iat: Math.floor(Date.now() / 1000)
        },
        token: 'test-token'
      }
    }
  });

  beforeEach(() => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <ProductManagePage />
        </BrowserRouter>
      </Provider>
    );
  });

  it('renders the product management page', () => {
    expect(screen.getByText('Product Management')).toBeInTheDocument();
    expect(screen.getByText('Add New Product')).toBeInTheDocument();
  });

  it('displays the list of products', async () => {
    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument();
      expect(screen.getByText('Test Description')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
    });
  });

  it('opens the add product modal when clicking the add button', () => {
    fireEvent.click(screen.getByText('Add New Product'));
    expect(screen.getByText('Add Product')).toBeInTheDocument();
  });

  it('opens the edit product modal when clicking the edit button', async () => {
    await waitFor(() => {
      const editButton = screen.getByTestId('edit-product-1');
      fireEvent.click(editButton);
      expect(screen.getByText('Edit Product')).toBeInTheDocument();
    });
  });

  it('deletes a product when clicking the delete button', async () => {
    await waitFor(() => {
      const deleteButton = screen.getByTestId('delete-product-1');
      fireEvent.click(deleteButton);
      expect(screen.getByText('Are you sure you want to delete this product?')).toBeInTheDocument();
    });
  });
}); 