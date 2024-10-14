import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useAccount, useSwitchChain } from 'wagmi';
import { useShowCallsStatus } from 'wagmi/experimental';
import type { TransactionDefaultReact } from '../types';
import { TransactionDefault } from './TransactionDefault';
import { useTransactionContext } from './TransactionProvider';

vi.mock('../../useBreakpoints', () => ({
  useBreakpoints: vi.fn(),
}));

vi.mock('wagmi', () => ({
  useAccount: vi.fn(),
  useConnect: vi.fn(),
  useConfig: vi.fn(),
}));

vi.mock('wagmi/experimental', () => ({
  useShowCallsStatus: vi.fn(),
}));

const mockSwitchChain = vi.fn();
vi.mock('wagmi', async (importOriginal) => {
  return {
    ...(await importOriginal<typeof import('wagmi')>()),
    useAccount: vi.fn(),
    useChainId: vi.fn(),
    useSwitchChain: vi.fn(),
  };
});

vi.mock('./TransactionProvider', () => ({
  TransactionProvider: ({ children }) => (
    <div data-testid="mock-TransactionProvider">{children}</div>
  ),
  useTransactionContext: vi.fn(),
}));

vi.mock('../../useTheme', () => ({
  useTheme: vi.fn(),
}));

describe('TransactionDefault Component', () => {
  const mockOnError = vi.fn();
  const mockOnStatus = vi.fn();
  const mockOnSuccess = vi.fn();

  const defaultProps: TransactionDefaultReact = {
    calls: [],
    contracts: [],
    disabled: false,
    onError: mockOnError,
    onStatus: mockOnStatus,
    onSuccess: mockOnSuccess,
  };

  beforeEach(() => {
    vi.mocked(useAccount).mockReturnValue({
      address: '0x123',
    });
    (useSwitchChain as ReturnType<typeof vi.fn>).mockReturnValue({
      switchChainAsync: mockSwitchChain,
    });
    (useShowCallsStatus as Mock).mockReturnValue({
      showCallsStatus: vi.fn(),
    });
    (useTransactionContext as Mock).mockReturnValue({
      lifecycleStatus: { statusName: 'init', statusData: null },
      transactionId: undefined,
      onSubmit: vi.fn(),
      isLoading: false,
      transactions: ['transact'],
    });
  });

  it('renders the Swap component with provided props', () => {
    render(<TransactionDefault {...defaultProps} />);
    expect(screen.getByText('Transact')).toBeInTheDocument();
    const button = screen.getByTestId('ockTransactionButton_Button');
    expect(button).not.toBeDisabled();
    expect(button).toBeInTheDocument();
  });

  it('disables the SwapButton when disabled prop is true', () => {
    render(<TransactionDefault {...defaultProps} disabled={true} />);
    const button = screen.getByTestId('ockTransactionButton_Button');
    expect(button).toBeDisabled();
  });
});