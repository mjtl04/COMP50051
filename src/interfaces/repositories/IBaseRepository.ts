
export interface IBaseRepository<T> {
    create(data: T): Promise<T>;
    update(data: T): Promise<T>;
    delete(id: number): Promise<void>;
    getById(id: number): Promise<T | null>;
    getAll(): Promise<T[] | null>;
}