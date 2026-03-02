import { NextRequest, NextResponse } from 'next/server';
import { verifyCredentials, setAuthCookie, isDemoMode } from '@/lib/auth';
import { UserService } from '@/lib/services/user.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Demo mode - simple credential verification
    if (isDemoMode()) {
      const { email, password } = body;
      
      if (!email || !password) {
        return NextResponse.json(
          { error: 'Email and password are required' },
          { status: 400 }
        );
      }

      const session = await verifyCredentials(email, password);
      
      if (!session) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        );
      }

      // Set auth cookie
      await setAuthCookie(session.token);

      return NextResponse.json({
        success: true,
        user: session.user,
      });
    }
    
    // Firebase mode - verify Firebase token
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { error: 'Firebase token is required' },
        { status: 400 }
      );
    }

    // Verify the Firebase token
    const decodedToken = await UserService.verifyIdToken(token);
    const userId = decodedToken.uid;

    // Get user from Firestore
    const user = await UserService.findById(userId);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found in database' },
        { status: 404 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Account is inactive' },
        { status: 403 }
      );
    }

    // Update last login
    await UserService.updateLastLogin(userId);

    // Set auth cookie
    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        employeeId: user.employeeId,
        roles: user.roles?.map((r: any) => ({ name: r.name })) || [],
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
