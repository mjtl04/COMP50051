export const EntityFromBody = <T extends object>(cls: new () => T, body: Partial<T>): T => {
    return Object.assign(new cls(), body);
}