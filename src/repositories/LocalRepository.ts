import { IRepository } from './IRepository';

// Helper for simulating async network latency
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export class LocalRepository<T extends { id: string }> implements IRepository<T> {
  constructor(private collectionName: string) {}

  private get items(): T[] {
    const data = localStorage.getItem(`pes_arena_${this.collectionName}`);
    return data ? JSON.parse(data) : [];
  }

  private set items(data: T[]) {
    localStorage.setItem(`pes_arena_${this.collectionName}`, JSON.stringify(data));
  }

  async getAll(): Promise<T[]> {
    await delay(100);
    return this.items;
  }

  async getById(id: string): Promise<T | null> {
    await delay(50);
    return this.items.find(item => item.id === id) || null;
  }

  async query(predicate: (item: T) => boolean): Promise<T[]> {
    await delay(50);
    return this.items.filter(predicate);
  }

  async create(data: Omit<T, 'id'>): Promise<T> {
    await delay(150);
    const newItem = {
      ...data,
      id: crypto.randomUUID()
    } as T;
    
    this.items = [...this.items, newItem];
    return newItem;
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    await delay(150);
    const list = this.items;
    const index = list.findIndex(item => item.id === id);
    
    if (index === -1) {
      throw new Error(`Item with id ${id} not found in ${this.collectionName}`);
    }

    const updatedItem = { ...list[index], ...data };
    list[index] = updatedItem;
    this.items = list;
    
    return updatedItem;
  }

  async delete(id: string): Promise<void> {
    await delay(100);
    this.items = this.items.filter(item => item.id !== id);
  }
}
