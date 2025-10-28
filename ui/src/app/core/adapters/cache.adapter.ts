import {GetStorage, RemoveStorage, SetStorage} from '@shared/domain-types/cache.type';

export const get: GetStorage = ({ key }) => {
  const value = localStorage.getItem(key);

  if (value) {
    return JSON.parse(value);
  }
  return null;
};

export const setLocalStorage: SetStorage = ({ key, value }) => {
  const data = typeof value === 'string' ? value : JSON.stringify(value);
  localStorage.setItem(key, JSON.stringify(data));
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

export const setSession: SetStorage = ({ key, value }) => {
  const data = typeof value === 'string' ? value : JSON.stringify(value);
  sessionStorage.setItem(key, JSON.stringify(data));
};

export const removeSession: RemoveStorage = ({ key }) => {
  sessionStorage.removeItem(key);
};
