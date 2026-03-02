import demoData from './demo-data.json';

// Type definitions
export type Branch = typeof demoData.branches[0];
export type Currency = typeof demoData.currencies[0];
export type GlAccount = typeof demoData.glAccounts[0];
export type Product = typeof demoData.products[0];
export type Customer = typeof demoData.customers[0];
export type Account = typeof demoData.accounts[0];
export type Loan = typeof demoData.loans[0];
export type Transaction = typeof demoData.transactions[0];
export type BatchJob = typeof demoData.batchJobs[0];
export type WorkflowRequest = typeof demoData.workflowRequests[0];
export type User = typeof demoData.users[0];
export type Role = typeof demoData.roles[0];

type WhereFilterOp = '<' | '<=' | '==' | '!=' | '>=' | '>' | 'in' | 'array-contains';

// Simple document snapshot interface
interface DocSnapshot<T> {
  id: string;
  data(): T;
}

// Helper to compare values based on operator
function matchesFilter(value: any, op: WhereFilterOp, filterValue: any): boolean {
  switch (op) {
    case '==': return value === filterValue;
    case '!=': return value !== filterValue;
    case '<': return value < filterValue;
    case '<=': return value <= filterValue;
    case '>': return value > filterValue;
    case '>=': return value >= filterValue;
    case 'in': return Array.isArray(filterValue) && filterValue.includes(value);
    default: return true;
  }
}

// Query builder class
class QueryBuilder<T extends { id: string }> {
  private items: T[];
  private filters: Array<{ field: string; op: WhereFilterOp; value: any }> = [];
  private sortField: string | null = null;
  private sortDirection: 'asc' | 'desc' = 'asc';
  private limitCount: number | null = null;

  constructor(items: T[]) {
    this.items = [...items];
  }

  where(field: string, op: WhereFilterOp, value: any): this {
    this.filters.push({ field, op, value });
    return this;
  }

  orderBy(field: string, direction: 'asc' | 'desc' = 'asc'): this {
    this.sortField = field;
    this.sortDirection = direction;
    return this;
  }

  limit(count: number): this {
    this.limitCount = count;
    return this;
  }

  count() {
    return {
      get: (): Promise<{ data: () => { count: number } }> => {
        const filtered = this.applyFilters();
        return Promise.resolve({
          data: () => ({ count: filtered.length }),
        });
      },
    };
  }

  private applyFilters(): T[] {
    return this.items.filter(item => {
      return this.filters.every(filter => {
        const value = (item as any)[filter.field];
        if (filter.op === 'in' && Array.isArray(filter.value)) {
          return filter.value.includes(value);
        }
        return matchesFilter(value, filter.op, filter.value);
      });
    });
  }

  async get(): Promise<{ docs: DocSnapshot<T>[]; empty: boolean; size: number; forEach: (cb: (doc: DocSnapshot<T>) => void) => void }> {
    let result = this.applyFilters();

    // Apply sorting
    if (this.sortField) {
      result.sort((a, b) => {
        const aVal = (a as any)[this.sortField!];
        const bVal = (b as any)[this.sortField!];
        if (aVal < bVal) return this.sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return this.sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    // Apply limit
    if (this.limitCount !== null) {
      result = result.slice(0, this.limitCount);
    }

    const docs = result.map(item => ({
      id: item.id,
      data: () => item,
    }));

    return {
      docs,
      empty: docs.length === 0,
      size: docs.length,
      forEach(callback: (doc: DocSnapshot<T>) => void) {
        docs.forEach(callback);
      },
    };
  }
}

// Document reference class
class DocRef<T extends { id: string }> {
  constructor(private collection: T[], private id: string) {}

  async get(): Promise<{ exists: boolean; data: () => T | null; id: string }> {
    const item = this.collection.find(i => i.id === this.id);
    return {
      exists: !!item,
      data: () => item || null,
      id: this.id,
    };
  }

  async set(data: any): Promise<void> {
    const index = this.collection.findIndex(i => i.id === this.id);
    if (index >= 0) {
      this.collection[index] = { ...this.collection[index], ...data, id: this.id } as T;
    } else {
      this.collection.push({ ...data, id: this.id } as T);
    }
  }

  async update(data: any): Promise<void> {
    const index = this.collection.findIndex(i => i.id === this.id);
    if (index >= 0) {
      this.collection[index] = { ...this.collection[index], ...data, id: this.id } as T;
    }
  }

  async delete(): Promise<void> {
    const index = this.collection.findIndex(i => i.id === this.id);
    if (index >= 0) {
      this.collection.splice(index, 1);
    }
  }
}

// Collection reference class
class CollectionRef<T extends { id: string }> {
  constructor(private items: T[]) {}

  doc(id?: string): DocRef<T> {
    const docId = id || `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    return new DocRef(this.items, docId);
  }

  async add(data: any): Promise<{ id: string }> {
    const id = `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.items.push({ ...data, id } as T);
    return { id };
  }

  count() {
    return {
      get: (): Promise<{ data: () => { count: number } }> => {
        return Promise.resolve({
          data: () => ({ count: this.items.length }),
        });
      },
    };
  }

  async get(): Promise<{ docs: DocSnapshot<T>[]; empty: boolean; size: number; forEach: (cb: (doc: DocSnapshot<T>) => void) => void }> {
    return new QueryBuilder(this.items).get();
  }

  where(field: string, op: WhereFilterOp, value: any): QueryBuilder<T> {
    return new QueryBuilder(this.items).where(field, op, value);
  }

  orderBy(field: string, direction: 'asc' | 'desc' = 'asc'): QueryBuilder<T> {
    return new QueryBuilder(this.items).orderBy(field, direction);
  }

  limit(count: number): QueryBuilder<T> {
    return new QueryBuilder(this.items).limit(count);
  }
}

// Create typed collection references
export const demoBranches = new CollectionRef<Branch>(demoData.branches);
export const demoCurrencies = new CollectionRef<Currency>(demoData.currencies);
export const demoGlAccounts = new CollectionRef<GlAccount>(demoData.glAccounts);
export const demoProducts = new CollectionRef<Product>(demoData.products);
export const demoCustomers = new CollectionRef<Customer>(demoData.customers);
export const demoAccounts = new CollectionRef<Account>(demoData.accounts);
export const demoLoans = new CollectionRef<Loan>(demoData.loans);
export const demoTransactions = new CollectionRef<Transaction>(demoData.transactions);
export const demoBatchJobs = new CollectionRef<BatchJob>(demoData.batchJobs);
export const demoWorkflowRequests = new CollectionRef<WorkflowRequest>(demoData.workflowRequests);
export const demoUsers = new CollectionRef<User>(demoData.users);
export const demoRoles = new CollectionRef<Role>(demoData.roles);

// Export raw data for direct access
export { demoData };
