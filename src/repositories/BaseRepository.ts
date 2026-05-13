import { AppDataSource } from "../data_source";
import { ObjectLiteral } from "typeorm";

type Constructor<T> = new (...args: any[]) => T;

export function BaseRepository<T extends ObjectLiteral>(entity: Constructor<T>) {
    const repository = AppDataSource.getRepository(entity);

    return class {
        protected repository = repository;

        getById(id: number): Promise<T | null> {
            return this.repository.findOneBy({ id } as any);
        }

        create(data: T): Promise<T> {
            return this.repository.save(data);
        }

        update(data: T): Promise<T> {
            return this.repository.save(data);
        }

        delete(id: number): Promise<void> {
            return this.repository.delete({ id } as any).then(() => { });
        }

        getAll(): Promise<T[] | null> {
            return this.repository.find();
        }
    };
}