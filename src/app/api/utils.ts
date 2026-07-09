import { ApiError } from '@datocms/cma-client';
import { NextResponse } from 'next/server';
import { timingSafeEqual } from 'node:crypto';

/**
 * Constant-time check of the caller-supplied token against `SECRET_API_TOKEN`.
 * Fails closed when either side is missing; `timingSafeEqual` avoids leaking
 * how many leading characters matched. (The length is still observable — fine
 * for a single high-entropy shared secret.)
 */
export function isValidSecretToken(token: string | null): boolean {
  const secret = process.env.SECRET_API_TOKEN;
  if (!token || !secret) return false;
  const a = Buffer.from(token);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function withCORS(responseInit?: ResponseInit): ResponseInit {
  return {
    ...responseInit,
    headers: {
      ...responseInit?.headers,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'OPTIONS, POST, GET',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  };
}

export function handleUnexpectedError(error: unknown) {
  // Log the full error server-side (incl. ApiError request/response, which may
  // carry the CMA token in its Authorization header) but never echo those
  // details back to the caller.
  console.error(error);

  const message =
    error instanceof ApiError
      ? 'Upstream API error'
      : error instanceof Error
        ? error.message
        : 'Unexpected error';

  return invalidRequestResponse(message, 500);
}

export function invalidRequestResponse(error: unknown, status = 422) {
  return NextResponse.json(
    {
      success: false,
      error,
    },
    withCORS({ status }),
  );
}

export function successfulResponse(data?: unknown, status = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    withCORS({ status }),
  );
}

import { cookies } from 'next/headers';

/**
 * This function should not exist :) Its only purpose is to correct an issue
 * currently present in Next.js!
 *
 * You may not know this, but third-party cookies as we know them are in the
 * process of being eliminated by browsers to improve user privacy and security.
 *
 * The new secure way of setting cookies involves using CHIPS, or a partitioned
 * storage system, with separate cookie jars for each top-level site.
 *
 * Implementation is very simple: you just need to add a new cookie attribute to
 * the old Set-Cookie call:
 *
 * - Set-Cookie: __Host-name=value; Secure; Path=/; SameSite=None;
 * + Set-Cookie: __Host-name=value; Secure; Path=/; SameSite=None; Partitioned;
 *
 * The activation of Next.js's Draft Mode currently sets the cookie WITHOUT this
 * attribute... but our website needs to be accessible within the iframe of the
 * "Web Previews" plugin! Setting a cookie inside an iframe is considered a
 * third-party cookie... so we need to rewrite the cookie set by
 * `draft.enable()`, manually adding the partitioned attribute.
 *
 * Third-party cookie deprecation: https://developers.google.com/privacy-sandbox/3pcd
 * CHIPS: https://developers.google.com/privacy-sandbox/3pcd/chips
 */

export async function makeDraftModeWorkWithinIframes() {
  // Read the cookie just set by draft.enable() or draft.disable()...
  const cookie = (await cookies()).get('__prerender_bypass')!;

  // and reapply it with `partitioned: true`
  (await cookies()).set({
    name: '__prerender_bypass',
    value: cookie?.value,
    httpOnly: true,
    path: '/',
    secure: true,
    sameSite: 'none',
    partitioned: true,
  });
}

export function isRelativeUrl(path: string): boolean {
  // Must be a path-absolute URL ("/foo"). Reject protocol-relative ("//host")
  // and backslash-tricks ("/\\host") that browsers normalize to an external
  // origin — those would turn `redirect()` into an open redirect.
  if (!path.startsWith('/') || path.startsWith('//') || path.startsWith('/\\')) {
    return false;
  }
  try {
    // A leading slash makes it absolute; if it still parses as absolute on its
    // own (has a scheme), it's not relative.
    new URL(path);
    return false;
  } catch {
    try {
      // Verify it can be parsed as a relative URL by providing a base
      new URL(path, 'http://example.com');
      return true;
    } catch {
      // If both attempts fail, it's not a valid URL at all
      return false;
    }
  }
}
