import { GetStorage, RemoveStorage, SetStorage } from '@shared/domain-types/cache.type';

export const get: GetStorage = ({ key }) => {
  const value = localStorage.getItem(key);

  if (value) {
    return JSON.parse(value);
  }
  return null;
};

export const setLocalStorage: SetStorage<string> = ({ key, value }) => {
  localStorage.setItem(key, value);
};

export const removeLocalStorage: RemoveStorage = ({ key }) => {
  localStorage.removeItem(key);
};

export const getLocalStorage: GetStorage = ({ key }) => {
  const value = localStorage.getItem(key);

  if (value) {
    return JSON.parse(value);
  }
  return value;
};

export const getSession: GetStorage = ({ key }) => {
  const value = sessionStorage.getItem(key);

  if (value) {
    return JSON.parse(value);
  }
  return null;
};

export const setSession: SetStorage<string> = ({ key, value }) => {
  sessionStorage.setItem(key, value);
};

export const removeSession: RemoveStorage = ({ key }) => {
  sessionStorage.removeItem(key);
};
