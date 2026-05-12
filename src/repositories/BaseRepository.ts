import { AppDataSource } from "../data_source";
import { ObjectLiteral } from "typeorm";

export function BaseRepository<T extends ObjectLiteral>(entity: { new(): T }) {
    const repository = AppDataSource.getRepository(entity);

    return class {
        protected static repository = repository;

        static getById(id: number): Promise<T | null> {
            return repository.findOneBy({ id } as any);
        }

        static create(data: T): Promise<T> {
            return repository.save(data);
        }

        static update(data: T): Promise<T> {
            return repository.save(data);
        }

        static delete(id: number): Promise<void> {
            return repository.delete({ id } as any).then(() => { });
        }

        static getAll = async (): Promise<T[] | null> => {
            return await this.repository.find();
        }

    };
}
