import { verifyAuthToken } from '@/lib/authToken';

/**
 * API endpoint to verify tokens
 * This endpoint will be called by the extension to verify tokens
 */
export async function verifyToken(req: any, res: any) {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ 
        valid: false, 
        error: 'Token is required' 
      });
    }
    
    const result = verifyAuthToken(token);
    
    if (result.valid) {
      // Return user data without sensitive information
      const userData = {
        userId: result.data.userId,
        email: result.data.email,
        role: result.data.role
      };
      
      return res.status(200).json({ 
        valid: true, 
        userData 
      });
    } else {
      return res.status(401).json({ 
        valid: false, 
        error: result.error 
      });
    }
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(500).json({ 
      valid: false, 
      error: 'Internal server error during token verification' 
    });
  }
}
