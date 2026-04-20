import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { MemoryRouter } from 'react-router-dom';
import ItemList from './ItemList';

vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    post: vi.fn(),
  },
}));

vi.mock('next-themes', () => ({
  useTheme: () => ({ resolvedTheme: 'light' }),
}));

const mockedAxios = axios as unknown as {
  get: ReturnType<typeof vi.fn>;
  put: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
  post: ReturnType<typeof vi.fn>;
};

const ITEMS = [
  {
    id: 1,
    name: 'Cordless drill',
    category: 'Tools',
    quantity: 2,
    custom_attributes: { brand: 'Bosch' },
    image_url: null,
    qr_code_url: null,
  },
  {
    id: 2,
    name: 'Cast iron skillet',
    category: 'Kitchen',
    quantity: 1,
    custom_attributes: {},
    image_url: null,
    qr_code_url: null,
  },
  {
    id: 3,
    name: 'HDMI cable',
    category: 'Electronics',
    quantity: 6,
    custom_attributes: {},
    image_url: null,
    qr_code_url: null,
  },
];

const CATEGORIES = ['Tools', 'Kitchen', 'Electronics'];

function mockApi(items = ITEMS, categories = CATEGORIES) {
  mockedAxios.get.mockImplementation((url: string) => {
    if (url.includes('/categories/')) return Promise.resolve({ data: categories });
    if (url.includes('/items/')) return Promise.resolve({ data: items });
    return Promise.resolve({ data: [] });
  });
}

function renderList() {
  return render(
    <MemoryRouter>
      <ItemList />
    </MemoryRouter>,
  );
}

describe('ItemList', () => {
  beforeEach(() => {
    mockedAxios.get.mockReset();
    window.localStorage.clear();
  });

  it('renders the inventory heading and item count after fetch', async () => {
    mockApi();
    const { container } = renderList();
    expect(await screen.findByRole('heading', { name: /inventory/i })).toBeInTheDocument();
    await waitFor(() => {
      const normalized = (container.textContent || '').replace(/\s+/g, ' ');
      expect(normalized).toMatch(/3\s*of\s*3\s*items?/i);
    });
  });

  it('renders all items in the default list view', async () => {
    mockApi();
    renderList();
    expect(await screen.findByText('Cordless drill')).toBeInTheDocument();
    expect(screen.getByText('Cast iron skillet')).toBeInTheDocument();
    expect(screen.getByText('HDMI cable')).toBeInTheDocument();
  });

  it('toggles between list and grid view and persists choice to localStorage', async () => {
    mockApi();
    renderList();
    await screen.findByText('Cordless drill');

    const gridBtn = screen.getByTitle('Grid view');
    fireEvent.click(gridBtn);
    expect(window.localStorage.getItem('stuf-view-mode')).toBe('grid');

    const listBtn = screen.getByTitle('List view');
    fireEvent.click(listBtn);
    expect(window.localStorage.getItem('stuf-view-mode')).toBe('list');
  });

  it('filters items by the search box', async () => {
    mockApi();
    renderList();
    await screen.findByText('Cordless drill');

    const user = userEvent.setup();
    const searchBox = screen.getByPlaceholderText(/search by name/i);
    await user.type(searchBox, 'drill');

    await waitFor(() => {
      expect(screen.getByText('Cordless drill')).toBeInTheDocument();
      expect(screen.queryByText('Cast iron skillet')).not.toBeInTheDocument();
      expect(screen.queryByText('HDMI cable')).not.toBeInTheDocument();
    });
  });

  it('filters by clicking a category chip', async () => {
    mockApi();
    renderList();
    await screen.findByText('Cordless drill');

    // chip strip renders button with matching text
    const kitchenChip = screen.getAllByRole('button').find((b) => /^Kitchen/.test(b.textContent || ''));
    expect(kitchenChip).toBeDefined();
    fireEvent.click(kitchenChip!);

    await waitFor(() => {
      expect(screen.getByText('Cast iron skillet')).toBeInTheDocument();
      expect(screen.queryByText('Cordless drill')).not.toBeInTheDocument();
    });
  });

  it('shows an empty state with "Add your first item" when there are no items', async () => {
    mockApi([], []);
    renderList();
    expect(await screen.findByText(/no items yet/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /add your first item/i })).toBeInTheDocument();
  });

  it('enters bulk select mode when the Select button is clicked', async () => {
    mockApi();
    renderList();
    await screen.findByText('Cordless drill');

    const selectBtn = screen.getByRole('button', { name: /^Select$/i });
    fireEvent.click(selectBtn);
    expect(screen.getByRole('button', { name: /^Done$/i })).toBeInTheDocument();
  });
});
