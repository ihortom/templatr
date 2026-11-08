declare module '*.png';
declare module '*.css';
declare module '*.scss';

type FilterProps = {
    types: string[],
    var: string,
    values: object,
    picked: string[],
    search: string,
    error: string|null
};