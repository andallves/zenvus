interface GetStorageInput {
  key: string;
}
export type GetStorage = <T>(input: GetStorageInput) => T;

interface SetStorageInput<T> {
  key: string;
  value: T;
}
export type SetStorage<T> = (input: SetStorageInput<T>) => void;

interface RemoveStorageInput {
  key: string;
}

export type RemoveStorage = (input: RemoveStorageInput) => void;
