type FuncNormalize<ArgumentType> = (arg: ArgumentType) => string;

export type CollectionState<ElementType> = Record<string, ElementType>;

export type Collections<Collection, CollectionName extends string> = Record<
    CollectionName,
    CollectionState<Collection>
>;

export const normalize = <ArgumentType>(func: FuncNormalize<ArgumentType>) => {
    return (list: Array<ArgumentType>, collectionName: string) => {
        return {
            [collectionName]: list.reduce((acc, value) => {
                const key = func(value);
                acc[key] = value;
                return acc;
            }, {} as CollectionState<ArgumentType>),
        };
    };
};
