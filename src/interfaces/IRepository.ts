export interface IRepository<T> {
    findById(id: number | string): Promise<T | null>;
    findAll(): Promise<T[]>;
    create(data: Partial<T>): Promise<T>;
    update(id: number | string, data: Partial<T>): Promise<T | null>;
    delete(id: number | string): Promise<boolean>;
}
