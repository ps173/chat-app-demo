const BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const message = (data as { error?: string })?.error ?? 'Something went wrong';
    throw new ApiError(res.status, message);
  }

  return data as T;
}

export { request, ApiError };
