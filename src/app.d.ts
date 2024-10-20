declare module '*.png';

type FilterProps = {
    types: string[],
    var: string,
    values: object,
    picked: string[],
    search: string,
    error: string|null
};