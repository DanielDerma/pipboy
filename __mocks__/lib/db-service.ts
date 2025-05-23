export const rewardsDB = {
  getAll: jest.fn(() => Promise.resolve([])),
  update: jest.fn(() => Promise.resolve()),
  add: jest.fn(() => Promise.resolve()),
  delete: jest.fn(() => Promise.resolve()),
};

export const userDB = {
  get: jest.fn(() => Promise.resolve({ id: 1, level: 1, xp: 0, caps: 100, createdAt: Date.now(), updatedAt: Date.now() })),
  update: jest.fn(() => Promise.resolve()),
};
