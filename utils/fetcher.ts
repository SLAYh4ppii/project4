/**
 * Generic fetcher function for SWR
 * @param url The URL to fetch from
 * @returns The parsed JSON response
 */
export async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch data');
  }
  return res.json();
}