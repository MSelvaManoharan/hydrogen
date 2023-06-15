import {vi, describe, it, expect} from 'vitest';
import {CartProvider, useCart} from './CartProvider.js';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {BuyNowButton} from './BuyNowButton.js';
import {getCartWithActionsMock} from './CartProvider.test.helpers.js';

vi.mock('./CartProvider');

describe('<BuyNowButton/>', () => {
  it('renders a button', () => {
    render(<BuyNowButton variantId="1">Buy now</BuyNowButton>, {
      wrapper: CartProvider,
    });
    expect(screen.getByRole('button')).toHaveTextContent('Buy now');
  });

  it('can optionally disable the button', () => {
    render(
      <BuyNowButton disabled variantId="1">
        Buy now
      </BuyNowButton>,
      {
        wrapper: CartProvider,
      },
    );

    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('allows pass-through props', () => {
    render(
      <BuyNowButton className="fancy-button" variantId="1">
        Buy now
      </BuyNowButton>,
      {
        wrapper: CartProvider,
      },
    );

    expect(screen.getByRole('button')).toHaveClass('fancy-button');
  });

  describe('when the button is clicked', () => {
    it('uses useCartCreateCallback with the correct arguments', async () => {
      const mockCartCreate = vi.fn();

      vi.mocked(useCart).mockImplementation(() =>
        getCartWithActionsMock({
          cartCreate: mockCartCreate,
        }),
      );

      const user = userEvent.setup();

      render(
        <BuyNowButton
          attributes={[
            {key: 'color', value: 'blue'},
            {key: 'size', value: 'large'},
          ]}
          quantity={4}
          variantId="SKU123"
        >
          Buy now
        </BuyNowButton>,
        {
          wrapper: CartProvider,
        },
      );

      await user.click(screen.getByRole('button'));

      expect(mockCartCreate).toHaveBeenCalledTimes(1);
      expect(mockCartCreate).toHaveBeenCalledWith({
        lines: [
          {
            quantity: 4,
            merchandiseId: 'SKU123',
            attributes: [
              {key: 'color', value: 'blue'},
              {key: 'size', value: 'large'},
            ],
          },
        ],
      });
    });

    it('disables the button', async () => {
      const user = userEvent.setup();

      render(<BuyNowButton variantId="1">Buy now</BuyNowButton>, {
        wrapper: CartProvider,
      });

      const button = screen.getByRole('button');

      expect(button).not.toBeDisabled();

      await user.click(button);

      expect(button).toBeDisabled();
    });
  });
});