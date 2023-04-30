export const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

export const getAuth = (): string => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; auth=`);
  if (parts.length === 1) return ''
  const cookie = parts.pop()?.split(';').shift()
  return cookie || '';
}