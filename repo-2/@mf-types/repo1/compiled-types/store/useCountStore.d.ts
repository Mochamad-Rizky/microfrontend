interface CountStore {
    count: number;
    increment: () => void;
    decrement: () => void;
}
export declare const useCountStore: import("zustand").UseBoundStore<import("zustand").StoreApi<CountStore>>;
export {};
