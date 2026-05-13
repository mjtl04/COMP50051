export interface IValidation {
    classValidate<T extends object>(item: T): Promise<void>;
    paramId(id: string): number;
    email(email: string): string;
    password(password: string): string;
    reason(reason: string): string;
    formatName(name: string): string;
}