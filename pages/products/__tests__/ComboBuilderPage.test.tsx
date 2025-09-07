import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';

import ComboBuilderPage from '../ComboBuilderPage';
import {
  SnackBarProductCategory,
  SnackBarProductDelivery,
} from '../../../types';
import {
  getSnackBarProducts,
  getCombos,
  createCombo,
  updateCombo,
} from '../../../services/api';

vi.mock('../../../services/api', () => ({
  getSnackBarProducts: vi.fn(),
  getCombos: vi.fn(),
  createCombo: vi.fn(),
  updateCombo: vi.fn(),
}));

const mockProducts = [
  {
    id: '1',
    name: 'Beer',
    category: SnackBarProductCategory.Bebida,
    purchasePrice: 10,
    sellPrice: 20,
    stock: 100,
    delivery: SnackBarProductDelivery.Bar,
  },
];

const mockCombo = {
  id: 'c1',
  name: 'Combo',
  price: 10,
  components: [{ name: 'Comp', productIds: ['1'], quantity: 1 }],
};

beforeEach(() => {
  vi.clearAllMocks();
  (getSnackBarProducts as Mock).mockResolvedValue(mockProducts);
  (createCombo as Mock).mockResolvedValue({});
  (updateCombo as Mock).mockResolvedValue({});
});

describe('ComboBuilderPage', () => {
  it('adds new component rows', async () => {
    (getCombos as Mock).mockResolvedValue([]);
    render(<ComboBuilderPage />);
    await waitFor(() => expect(getSnackBarProducts).toHaveBeenCalled());

    expect(screen.queryAllByPlaceholderText('Nombre del componente')).toHaveLength(0);

    fireEvent.click(screen.getByText('Agregar componente'));
    expect(screen.getAllByPlaceholderText('Nombre del componente')).toHaveLength(1);

    fireEvent.click(screen.getByText('Agregar componente'));
    expect(screen.getAllByPlaceholderText('Nombre del componente')).toHaveLength(2);
  });

  it('submits new combo with expected structure', async () => {
    (getCombos as Mock).mockResolvedValue([]);
    render(<ComboBuilderPage />);
    await waitFor(() => expect(getSnackBarProducts).toHaveBeenCalled());

    fireEvent.change(screen.getByPlaceholderText('Nombre del combo'), {
      target: { value: 'Nuevo Combo' },
    });
    fireEvent.change(screen.getByPlaceholderText('Precio del combo'), {
      target: { value: '25' },
    });

    fireEvent.click(screen.getByText('Agregar componente'));
    fireEvent.change(screen.getAllByPlaceholderText('Nombre del componente')[0], {
      target: { value: 'Componente 1' },
    });
    fireEvent.change(screen.getByPlaceholderText('Cantidad'), {
      target: { value: '2' },
    });

    const categorySelect = screen.getByRole('listbox');
    fireEvent.change(categorySelect, {
      target: {
        selectedOptions: [{ value: SnackBarProductCategory.Bebida }],
      },
    });

    fireEvent.click(screen.getByText('Crear'));

    await waitFor(() =>
      expect(createCombo).toHaveBeenCalledWith({
        name: 'Nuevo Combo',
        price: 25,
        components: [
          { name: 'Componente 1', quantity: 2, productIds: ['1'] },
        ],
      }),
    );
  });

  it('loads data for editing and calls updateCombo on save', async () => {
    (getCombos as Mock).mockResolvedValue([mockCombo]);
    render(<ComboBuilderPage />);

    await screen.findByText('Combo');
    fireEvent.click(screen.getByText('Editar'));

    await waitFor(() =>
      expect(screen.getByPlaceholderText('Nombre del combo')).toHaveValue('Combo'),
    );
    expect(screen.getByPlaceholderText('Precio del combo')).toHaveValue(10);
    expect(
      screen.getAllByPlaceholderText('Nombre del componente')[0],
    ).toHaveValue('Comp');

    fireEvent.change(screen.getByPlaceholderText('Precio del combo'), {
      target: { value: '30' },
    });

    fireEvent.click(screen.getByText('Actualizar'));

    await waitFor(() =>
      expect(updateCombo).toHaveBeenCalledWith('c1', {
        name: 'Combo',
        price: 30,
        components: [{ name: 'Comp', quantity: 1, productIds: ['1'] }],
      }),
    );
  });
});

