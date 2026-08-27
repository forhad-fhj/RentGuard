/** Unwrap NestJS TransformInterceptor `{ success, data }` responses. */
export function unwrapData<T>(response: { data: T | { data: T } }): T {
  const payload = response.data;
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}
