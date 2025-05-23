export const mockUser = {
  id: 1,
  level: 1,
  xp: 0,
  caps: 100,
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

export const mockUpdateUserCaps = jest.fn();

const useUser = jest.fn(() => ({
  user: mockUser,
  updateUserCaps: mockUpdateUserCaps,
  loadingUser: false,
  errorUser: null,
}));

export default useUser;
