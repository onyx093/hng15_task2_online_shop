/**
 * Standardized API response builder for the mobile /api/v1/ endpoints.
 * Every response follows the envelope: { success, data?, error?, meta? }
 */

// ---------------------------------------------------------------------------
// CORS
// ---------------------------------------------------------------------------

const ALLOWED_ORIGINS = process.env.MOBILE_ALLOWED_ORIGINS
  ? process.env.MOBILE_ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  : ['*'];

export function corsHeaders(requestOrigin?: string | null): Record<string, string> {
  // If we allow all origins, just use '*'
  const origin =
    ALLOWED_ORIGINS.includes('*')
      ? '*'
      : ALLOWED_ORIGINS.includes(requestOrigin || '')
        ? requestOrigin!
        : ALLOWED_ORIGINS[0];

  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
  };
}

/**
 * Shared OPTIONS handler — import and re-export from every v1 route.
 */
export async function OPTIONS(request: Request) {
  const origin = request.headers.get('origin');
  return new Response(null, {
    status: 204,
    headers: corsHeaders(origin),
  });
}

// ---------------------------------------------------------------------------
// Response helpers
// ---------------------------------------------------------------------------

export interface ApiError {
  code: string;
  message: string;
}

export interface ApiMeta {
  page?: number;
  per_page?: number;
  total?: number;
  [key: string]: unknown;
}

export interface ApiEnvelope<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ApiMeta;
}

function buildResponse<T>(
  body: ApiEnvelope<T>,
  status: number,
  requestOrigin?: string | null,
): Response {
  return Response.json(body, {
    status,
    headers: {
      ...corsHeaders(requestOrigin),
      'Content-Type': 'application/json',
    },
  });
}

/**
 * Return a successful response.
 */
export function apiSuccess<T>(
  data: T,
  opts?: { status?: number; meta?: ApiMeta; origin?: string | null },
): Response {
  return buildResponse(
    { success: true, data, meta: opts?.meta },
    opts?.status ?? 200,
    opts?.origin,
  );
}

/**
 * Return an error response.
 */
export function apiError(
  code: string,
  message: string,
  opts?: { status?: number; origin?: string | null },
): Response {
  return buildResponse(
    { success: false, error: { code, message } },
    opts?.status ?? 400,
    opts?.origin,
  );
}

// Convenience shortcuts

export function apiBadRequest(message: string, origin?: string | null) {
  return apiError('BAD_REQUEST', message, { status: 400, origin });
}

export function apiUnauthorized(message = 'Authentication required', origin?: string | null) {
  return apiError('UNAUTHORIZED', message, { status: 401, origin });
}

export function apiForbidden(message = 'Access denied', origin?: string | null) {
  return apiError('FORBIDDEN', message, { status: 403, origin });
}

export function apiNotFound(message = 'Resource not found', origin?: string | null) {
  return apiError('NOT_FOUND', message, { status: 404, origin });
}

export function apiServerError(message = 'Internal server error', origin?: string | null) {
  return apiError('INTERNAL_ERROR', message, { status: 500, origin });
}
