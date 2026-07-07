import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/session';

export async function middleware(request: NextRequest) {
    // Only run on /admin routes
    if (request.nextUrl.pathname.startsWith('/admin')) {
        // Allow access to login and callback without session
        if (
            request.nextUrl.pathname === '/admin/login' ||
            request.nextUrl.pathname === '/admin/oauth2callback'
        ) {
            return NextResponse.next();
        }

        // Verify session for all other /admin routes
        const token = request.cookies.get('admin_session')?.value;
        const session = token ? await verifyToken(token) : null;

        if (!session) {
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }

        // Sliding session: Extend cookie expiration
        const response = NextResponse.next();
        response.cookies.set('admin_session', token!, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 30, // 30 minutes
            path: '/',
        });

        return response;
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/admin/:path*',
};
