// Storage interface - not used for this frontend-only app
// Tasks are persisted in localStorage on the client side

export interface IStorage {}

export class MemStorage implements IStorage {
  constructor() {}
}

export const storage = new MemStorage();
