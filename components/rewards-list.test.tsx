import { render, screen, waitFor, within } from '@testing-library/react'; // Import within
import userEvent from '@testing-library/user-event'; // Import userEvent
import RewardsList from './rewards-list'; // Assuming the component is in the same directory
import { rewardsDB } from '@/lib/db-service';
import useUser from '@/hooks/useUser';
import { notificationService } from '@/lib/notification-service';
import type { Reward } from '@/lib/types'; // Assuming Reward type is exported from types

// Mock the services/hooks
jest.mock('@/lib/db-service');
jest.mock('@/hooks/useUser');
jest.mock('@/lib/notification-service');

// Access mock implementations
const mockedRewardsDB = rewardsDB as jest.Mocked<typeof rewardsDB>;
const mockedUseUser = useUser as jest.Mocked<typeof useUser>;
const mockedNotificationService = notificationService as jest.Mocked<typeof notificationService>;

// Sample data for tests
const mockRewards: Reward[] = [
  { id: '1', name: 'Super Sword', cost: 50, description: 'A mighty fine sword', timesRedeemed: 2, createdAt: Date.now(), updatedAt: Date.now() },
  { id: '2', name: 'Health Potion', cost: 10, description: 'Restores 50 HP', timesRedeemed: 10, createdAt: Date.now(), updatedAt: Date.now() },
  { id: '3', name: 'Magic Shield', cost: 30, timesRedeemed: 0, createdAt: Date.now(), updatedAt: Date.now() }, // No description
];

const defaultUser = {
  id: 1,
  level: 1,
  xp: 0,
  caps: 100,
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

describe('RewardsList Rendering', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Default mock implementations
    mockedUseUser.mockReturnValue({
      user: defaultUser,
      updateUserCaps: jest.fn(),
      loadingUser: false,
      errorUser: null,
    });
  });

  test('renders rewards correctly when data is fetched successfully', async () => {
    mockedRewardsDB.getAll.mockResolvedValue([...mockRewards]);

    render(<RewardsList />);

    // Wait for rewards to load
    await waitFor(() => {
      expect(screen.getByText('Super Sword')).toBeInTheDocument();
    });

    // Check player CAPS
    expect(screen.getByText(`CAPS: ${defaultUser.caps}`)).toBeInTheDocument();

    // Check reward details
    mockRewards.forEach(reward => {
      expect(screen.getByText(reward.name)).toBeInTheDocument();
      expect(screen.getByText(`Cost: ${reward.cost} CAPS`)).toBeInTheDocument();
      expect(screen.getByText(`Redeemed: ${reward.timesRedeemed} time(s)`)).toBeInTheDocument();
      if (reward.description) {
        expect(screen.getByText(reward.description)).toBeInTheDocument();
      }
    });

    // Check redeem buttons (assuming they are identifiable, e.g., by text or role)
    // For simplicity, checking if at least one "Redeem" button is present for each available reward
    const redeemButtons = screen.getAllByRole('button', { name: /redeem/i });
    // Ensure there's a redeem button for each reward that costs less than or equal to user's caps
    const redeemableRewards = mockRewards.filter(r => r.cost <= defaultUser.caps);
    expect(redeemButtons.length).toBe(redeemableRewards.length);
  });

  test('displays loading state initially', async () => {
    // Make the promise never resolve to keep it in loading state
    mockedRewardsDB.getAll.mockReturnValue(new Promise(() => {}));

    render(<RewardsList />);

    // Check for loading text and spinner
    expect(screen.getByText('Loading rewards...')).toBeInTheDocument();
    expect(screen.getByTestId('loader-icon')).toBeInTheDocument(); // Assuming you add data-testid="loader-icon" to your Loader2 icon
  });

  test('displays error state when fetching rewards fails', async () => {
    const errorMessage = 'Failed to fetch rewards';
    mockedRewardsDB.getAll.mockRejectedValue(new Error(errorMessage));

    render(<RewardsList />);

    // Wait for error message to appear
    await waitFor(() => {
      expect(screen.getByText('Failed to load rewards. Please try again.')).toBeInTheDocument();
    });

    // Check for error icon
    expect(screen.getByTestId('alert-circle-icon')).toBeInTheDocument(); // Assuming data-testid="alert-circle-icon"

    // Check for retry button
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  test('displays empty state when no rewards are available', async () => {
    mockedRewardsDB.getAll.mockResolvedValue([]);

    render(<RewardsList />);

    // Wait for the empty state message
    await waitFor(() => {
      expect(screen.getByText('No rewards created yet.')).toBeInTheDocument();
    });

    // Check for empty state icon
    expect(screen.getByTestId('award-icon')).toBeInTheDocument(); // Assuming data-testid="award-icon"

    // Check for "Add New Reward" button
    expect(screen.getByRole('button', { name: /add new reward/i })).toBeInTheDocument();
  });
});

describe('RewardsList Reward Redemption', () => {
  const mockRewardToRedeem: Reward = {
    id: 'reward1',
    name: 'Mega Potion',
    cost: 50,
    description: 'Restores 100 HP',
    timesRedeemed: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const initialUserCaps = 100;
  const mockUserWithSufficientCaps = {
    id: 1,
    level: 2,
    xp: 50,
    caps: initialUserCaps,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  const mockUpdateUserCaps = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Default user mock for redemption tests
    mockedUseUser.mockReturnValue({
      user: mockUserWithSufficientCaps,
      updateUserCaps: mockUpdateUserCaps,
      loadingUser: false,
      errorUser: null,
    });
    mockedRewardsDB.getAll.mockResolvedValue([mockRewardToRedeem]);
    mockedRewardsDB.update.mockResolvedValue(undefined); // Default successful update
    mockedNotificationService.success.mockClear();
    mockedNotificationService.warning.mockClear();
  });

  test('successfully redeems a reward if user has enough CAPS', async () => {
    render(<RewardsList />);

    // Wait for the reward to be displayed
    const rewardNameElement = await screen.findByText(mockRewardToRedeem.name);
    expect(rewardNameElement).toBeInTheDocument();

    // Find the redeem button for the specific reward
    // Assuming the button is within the same parent container as the reward name
    const redeemButton = await screen.findByRole('button', { name: /redeem/i });
    expect(redeemButton).toBeEnabled();

    // Simulate click
    await userEvent.click(redeemButton);

    // 1. Verify rewardsDB.update was called
    await waitFor(() => {
      expect(mockedRewardsDB.update).toHaveBeenCalledTimes(1);
      expect(mockedRewardsDB.update).toHaveBeenCalledWith({
        ...mockRewardToRedeem,
        timesRedeemed: mockRewardToRedeem.timesRedeemed + 1,
      });
    });

    // 2. Verify updateUserCaps was called
    expect(mockUpdateUserCaps).toHaveBeenCalledTimes(1);
    expect(mockUpdateUserCaps).toHaveBeenCalledWith(initialUserCaps - mockRewardToRedeem.cost);

    // 3. Verify UI updates
    // Player's CAPS display (need to update user mock for this to reflect)
    // For the UI to update CAPS, the `useUser` mock needs to reflect the change
    // or the component needs to re-render with the new user state.
    // Let's assume `updateUserCaps` call in the component leads to `user` object update from the hook.
    // We can update the mock `useUser` to return the new user state upon the next "render" or call.
    // For simplicity in this test, we'll check if the success notification and redemption count update.

    mockedUseUser.mockReturnValue({ // Simulate user object update after redemption
      user: { ...mockUserWithSufficientCaps, caps: initialUserCaps - mockRewardToRedeem.cost },
      updateUserCaps: mockUpdateUserCaps,
      loadingUser: false,
      errorUser: null,
    });
    // Re-render might be an option if the component doesn't automatically update from hook changes in test env
    // render(<RewardsList />); // Re-render with updated user state - usually not needed if component reacts to hook state

    // Check for updated redemption count in UI
    await waitFor(() => {
      expect(screen.getByText(`${mockRewardToRedeem.timesRedeemed + 1}×`)).toBeInTheDocument();
    });
    
    // Check for updated CAPS in UI (if component re-renders with new user state)
    // This requires the component to re-render with the updated user state from the hook
    // If not, we can check the call to updateUserCaps as done above.
    // Let's assume the component re-renders or the user object is updated:
    await screen.findByText(`CAPS: ${initialUserCaps - mockRewardToRedeem.cost}`);


    // 4. Verify success notification
    expect(mockedNotificationService.success).toHaveBeenCalledTimes(1);
    expect(mockedNotificationService.success).toHaveBeenCalledWith(`Redeemed: ${mockRewardToRedeem.name}!`);

    // 5. Verify flash message (if it's a separate element)
    // The component shows "Redeemed: {selectedReward.title || selectedReward.name}!"
    // title is not in Reward type, so it will use name.
    await waitFor(() => {
      expect(screen.getByText(`Redeemed: ${mockRewardToRedeem.name}!`)).toBeInTheDocument();
    });
  });

  test('fails to redeem a reward if user has insufficient CAPS', async () => {
    const userWithInsufficientCaps = { ...mockUserWithSufficientCaps, caps: 20 };
    mockedUseUser.mockReturnValue({
      user: userWithInsufficientCaps,
      updateUserCaps: mockUpdateUserCaps,
      loadingUser: false,
      errorUser: null,
    });
    // Reward costs 50, user has 20

    render(<RewardsList />);

    const rewardNameElement = await screen.findByText(mockRewardToRedeem.name);
    expect(rewardNameElement).toBeInTheDocument();

    const redeemButton = await screen.findByRole('button', { name: /redeem/i });
    expect(redeemButton).toBeEnabled(); // The button itself might be enabled, but the action is prevented

    await userEvent.click(redeemButton);

    // Assertions
    expect(mockedRewardsDB.update).not.toHaveBeenCalled();
    expect(mockUpdateUserCaps).not.toHaveBeenCalled();
    expect(mockedNotificationService.warning).toHaveBeenCalledTimes(1);
    expect(mockedNotificationService.warning).toHaveBeenCalledWith("Not enough CAPS to redeem this reward");

    // CAPS display should remain unchanged
    expect(screen.getByText(`CAPS: ${userWithInsufficientCaps.caps}`)).toBeInTheDocument();
    // Redemption count should remain unchanged
    expect(screen.getByText(`${mockRewardToRedeem.timesRedeemed}×`)).toBeInTheDocument();
  });

  test('Redeem button is disabled for unaffordable rewards and enabled for affordable ones', async () => {
    const affordableReward: Reward = { id: 'affordable', name: 'Small Potion', cost: 30, timesRedeemed: 1, createdAt: Date.now(), updatedAt: Date.now() };
    const expensiveReward: Reward = { id: 'expensive', name: 'Grand Sword', cost: 200, timesRedeemed: 0, createdAt: Date.now(), updatedAt: Date.now() };
    
    mockedRewardsDB.getAll.mockResolvedValue([affordableReward, expensiveReward]);
    // User has 100 CAPS (from beforeEach default mockUserWithSufficientCaps)

    render(<RewardsList />);

    // Wait for both rewards to be displayed
    await screen.findByText(affordableReward.name);
    await screen.findByText(expensiveReward.name);

    // Find buttons - more specific selectors might be needed if multiple items exist
    const affordableRedeemButton = screen.getByText(affordableReward.name).closest('div[key]')?.querySelector('button[title!="Delete"]');
    const expensiveRedeemButton = screen.getByText(expensiveReward.name).closest('div[key]')?.querySelector('button[title!="Delete"]');
    
    expect(affordableRedeemButton).not.toBeNull();
    expect(expensiveRedeemButton).not.toBeNull();

    if (!affordableRedeemButton || !expensiveRedeemButton) {
      throw new Error("Could not find redeem buttons for assertion");
    }
    
    // Assertions for button states
    expect(affordableRedeemButton).toBeEnabled();
    expect(expensiveRedeemButton).toBeDisabled();
  });
});

// Mock RewardForm for the management tests
jest.mock('@/components/reward-form', () => ({
  RewardForm: jest.fn(({ isOpen, onClose, onRewardAdded }) => {
    if (!isOpen) return null;
    // This mock allows us to simulate the form being used and calling onRewardAdded
    return (
      <div data-testid="mock-reward-form">
        <button
          data-testid="mock-reward-form-submit"
          onClick={() => {
            const newReward: Reward = { // Ensure Reward type is available or defined
              id: 'new-reward-123',
              name: 'Mocked Reward',
              cost: 15,
              description: 'A reward added via mock form',
              timesRedeemed: 0,
              // xpValue: 10, // xpValue is not in the Reward type in db-service.ts
              createdAt: Date.now(),
              updatedAt: Date.now(),
            };
            onRewardAdded(newReward);
            onClose(); // Typically the form would close itself
          }}
        >
          Add Mock Reward
        </button>
        <button data-testid="mock-reward-form-close" onClick={onClose}>Close Mock Form</button>
      </div>
    );
  }),
}));


describe('RewardsList Reward Management', () => {
  const initialUser = {
    id: 1,
    level: 1,
    xp: 0,
    caps: 100,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  const mockUpdateUserCaps = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    mockedUseUser.mockReturnValue({
      user: initialUser,
      updateUserCaps: mockUpdateUserCaps,
      loadingUser: false,
      errorUser: null,
    });

    // Clear notification mocks
    mockedNotificationService.success.mockClear();
    mockedNotificationService.error.mockClear();
    mockedNotificationService.warning.mockClear();
    mockedNotificationService.info.mockClear();

    // Default getAll to empty array, specific tests can override
    mockedRewardsDB.getAll.mockResolvedValue([]);
    mockedRewardsDB.delete.mockResolvedValue(undefined); // Default successful delete
  });

  test('adds a new reward to the list when RewardForm calls onRewardAdded', async () => {
    render(<RewardsList />);

    // Initially, no rewards (or specific rewards if mockedRewardsDB.getAll was different)
    // Let's ensure the "No rewards created yet" message is there if getAll returns empty.
    await waitFor(() => {
      expect(screen.getByText('No rewards created yet.')).toBeInTheDocument();
    });

    // Click the "Add New Reward" button in RewardsList to "open" the form
    const addNewRewardButton = screen.getByRole('button', { name: /add new reward/i });
    await userEvent.click(addNewRewardButton);

    // The mocked RewardForm should be "visible" (our mock just renders a button)
    const mockFormAddButton = screen.getByTestId('mock-reward-form-submit');
    expect(mockFormAddButton).toBeInTheDocument();

    // Click the button in our mocked RewardForm to trigger onRewardAdded
    await userEvent.click(mockFormAddButton);

    // Assert the new reward "Mocked Reward" (defined in the mock form) appears in RewardsList
    await waitFor(() => {
      expect(screen.getByText('Mocked Reward')).toBeInTheDocument();
      expect(screen.getByText('Cost: 15 CAPS')).toBeInTheDocument();
      expect(screen.getByText('A reward added via mock form')).toBeInTheDocument();
      expect(screen.getByText('0×')).toBeInTheDocument(); // timesRedeemed
    });

    // Ensure the "No rewards" message is gone
    expect(screen.queryByText('No rewards created yet.')).not.toBeInTheDocument();

    // As per refined instructions, rewardsDB.add is not tested here.
    // No notification check here as it's RewardForm's responsibility.
  });

  test('deletes a reward successfully after confirmation', async () => {
    const rewardToDelete: Reward = {
      id: 'reward-to-delete-1',
      name: 'Obsolete Scroll',
      cost: 5,
      description: 'An old scroll, no longer useful.',
      timesRedeemed: 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    mockedRewardsDB.getAll.mockResolvedValue([rewardToDelete]);

    render(<RewardsList />);

    // Wait for the reward to be displayed
    await waitFor(() => {
      expect(screen.getByText(rewardToDelete.name)).toBeInTheDocument();
    });

    // Find the delete button for the specific reward.
    // The delete button is a Trash2 icon inside a button.
    // We can find it by its title "Delete" which is on the button element.
    const deleteButton = screen.getByTitle('Delete');
    expect(deleteButton).toBeInTheDocument();

    // Click the delete button to open the confirmation modal
    await userEvent.click(deleteButton);

    // Assert the RetroModal appears (check for modal title or content)
    await waitFor(() => {
      expect(screen.getByText('Delete Reward')).toBeInTheDocument(); // Modal title
      expect(screen.getByText(`Are you sure you want to delete ${rewardToDelete.name}?`)).toBeInTheDocument();
    });

    // Click the confirm "Delete" button within the modal
    // The button has text "Delete" and is within the modal.
    const confirmDeleteButton = screen.getByRole('button', { name: /delete/i });
    // Make sure it's the one in the modal, not the item's delete button if it's still somehow accessible
    // This can be tricky; let's assume the modal's delete button is the only one with "Delete" text at this point.
    // A more robust way would be to get the modal and find the button within it.
    // const modal = screen.getByRole('dialog'); // Assuming RetroModal has role='dialog'
    // const confirmDeleteButton = within(modal).getByRole('button', { name: /delete/i });
    expect(confirmDeleteButton).toBeInTheDocument();
    await userEvent.click(confirmDeleteButton);

    // Assertions
    // 1. Verify rewardsDB.delete was called
    await waitFor(() => {
      expect(mockedRewardsDB.delete).toHaveBeenCalledTimes(1);
      expect(mockedRewardsDB.delete).toHaveBeenCalledWith(rewardToDelete.id);
    });

    // 2. Verify the reward is removed from the UI
    expect(screen.queryByText(rewardToDelete.name)).not.toBeInTheDocument();
    // If there are no other rewards, the "No rewards created yet" message should appear.
    expect(screen.getByText('No rewards created yet.')).toBeInTheDocument();


    // 3. Verify success notification
    expect(mockedNotificationService.success).toHaveBeenCalledTimes(1);
    expect(mockedNotificationService.success).toHaveBeenCalledWith("Reward deleted successfully");

    // 4. Verify modal is closed
    expect(screen.queryByText('Delete Reward')).not.toBeInTheDocument();
  });
});

describe('RewardsList CAPS UI Updates', () => {
  const sampleRewardA: Reward = { id: 'rewardA', name: 'Potion of Minor Might', cost: 50, timesRedeemed: 0, createdAt: Date.now(), updatedAt: Date.now() };
  const sampleRewardB: Reward = { id: 'rewardB', name: 'Elixir of Major Strength', cost: 100, timesRedeemed: 0, createdAt: Date.now(), updatedAt: Date.now() };
  
  const mockRewardsList = [sampleRewardA, sampleRewardB];
  const mockUpdateUserCaps = jest.fn();

  const initialUser = {
    id: 'user123',
    level: 5,
    xp: 500,
    caps: 75, // Initially, Reward A is affordable, Reward B is not
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockedRewardsDB.getAll.mockResolvedValue([...mockRewardsList]); // Provide both rewards

    // Default user mock for this suite
    mockedUseUser.mockReturnValue({
      user: initialUser,
      updateUserCaps: mockUpdateUserCaps,
      loadingUser: false,
      errorUser: null,
    });

    mockedNotificationService.success.mockClear();
    mockedNotificationService.warning.mockClear();
  });

  test('Reward button states update dynamically with user CAPS changes', async () => {
    // Initial Render with initialUser (caps: 75)
    const { rerender } = render(<RewardsList />);

    // Wait for rewards to load
    await screen.findByText(sampleRewardA.name);
    await screen.findByText(sampleRewardB.name);

    // Find redeem buttons (more robustly using data-testid or specific association if possible)
    // For now, relying on structure: find reward text, go to parent, find button.
    const rewardAContainer = screen.getByText(sampleRewardA.name).closest('div[key="rewardA"]');
    const rewardBContainer = screen.getByText(sampleRewardB.name).closest('div[key="rewardB"]');

    expect(rewardAContainer).toBeInTheDocument();
    expect(rewardBContainer).toBeInTheDocument();

    // Ensure we have a key on the reward mapping in the component for this to work well
    // e.g. <div key={reward.id} ... > which is used.

    // To make button selection more robust, let's assume the containers can be found
    // and then query within them. The component structure is:
    // <div key={reward.id} class="border-2 ...">
    //   ...
    //   <button ...>Redeem</button>
    //   <button title="Delete" ...>...</button>
    // </div>
    // We need to find the "Redeem" button specifically.

    // Find reward containers by their text content (assuming names are unique)
    const rewardADiv = screen.getByText(sampleRewardA.name).closest(`div[class^="border-2"]`);
    const rewardBDiv = screen.getByText(sampleRewardB.name).closest(`div[class^="border-2"]`);

    expect(rewardADiv).toBeInTheDocument();
    expect(rewardBDiv).toBeInTheDocument();
    
    const redeemButtonA1 = within(rewardADiv!).getByRole('button', { name: /redeem/i });
    const redeemButtonB1 = within(rewardBDiv!).getByRole('button', { name: /redeem/i });
    
    // --- Assertion 1: Initial State (CAPS: 75) ---
    expect(screen.getByText('CAPS: 75')).toBeInTheDocument();
    expect(redeemButtonA1).toBeEnabled(); // Cost 50, User has 75
    expect(redeemButtonB1).toBeDisabled(); // Cost 100, User has 75

    // --- Simulate CAPS Increase (CAPS: 120) ---
    mockedUseUser.mockReturnValue({
      user: { ...initialUser, caps: 120 }, // Reward A & B should be affordable
      updateUserCaps: mockUpdateUserCaps,
      loadingUser: false,
      errorUser: null,
    });
    rerender(<RewardsList />);

    // Re-find buttons after rerender
    const redeemButtonA2 = within(rewardADiv!).getByRole('button', { name: /redeem/i });
    const redeemButtonB2 = within(rewardBDiv!).getByRole('button', { name: /redeem/i });

    // --- Assertion 2: CAPS Increased (CAPS: 120) ---
    await screen.findByText('CAPS: 120'); // Wait for UI update
    expect(redeemButtonA2).toBeEnabled(); // Cost 50, User has 120
    expect(redeemButtonB2).toBeEnabled(); // Cost 100, User has 120

    // --- Simulate CAPS Decrease (CAPS: 30) ---
    mockedUseUser.mockReturnValue({
      user: { ...initialUser, caps: 30 }, // Reward A & B should be unaffordable
      updateUserCaps: mockUpdateUserCaps,
      loadingUser: false,
      errorUser: null,
    });
    rerender(<RewardsList />);

    // Re-find buttons after rerender
    const redeemButtonA3 = within(rewardADiv!).getByRole('button', { name: /redeem/i });
    const redeemButtonB3 = within(rewardBDiv!).getByRole('button', { name: /redeem/i });
    
    // --- Assertion 3: CAPS Decreased (CAPS: 30) ---
    await screen.findByText('CAPS: 30'); // Wait for UI update
    expect(redeemButtonA3).toBeDisabled(); // Cost 50, User has 30
    expect(redeemButtonB3).toBeDisabled(); // Cost 100, User has 30
  });
});
