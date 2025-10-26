"use client"

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const code = searchParams.get('code')
        const error = searchParams.get('error')

        if (error) {
          setStatus('error')
          setMessage('Authentication failed. Please try again.')
          return
        }

        if (!code) {
          setStatus('error')
          setMessage('No authorization code received.')
          return
        }

        // For now, we'll simulate a successful login
        // In a real implementation, you'd exchange the code for tokens
        setStatus('success')
        setMessage('Authentication successful! Redirecting...')
        
        // Simulate user data (in real app, get from Google)
        const mockUser = {
          id: 'mock-user-id',
          email: 'user@example.com',
          name: 'Test User',
          picture: '',
          verified_email: true
        }
        
        // Simulate token
        const mockToken = 'mock-jwt-token'
        
        login(mockToken, mockUser)
        
        // Redirect to dashboard
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)

      } catch (error) {
        console.error('Auth callback error:', error)
        setStatus('error')
        setMessage('An error occurred during authentication.')
      }
    }

    handleAuthCallback()
  }, [searchParams, login, router])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            {status === 'loading' && <Loader2 className="h-6 w-6 animate-spin text-primary" />}
            {status === 'success' && <CheckCircle className="h-6 w-6 text-green-600" />}
            {status === 'error' && <XCircle className="h-6 w-6 text-red-600" />}
          </div>
          <CardTitle>
            {status === 'loading' && 'Authenticating...'}
            {status === 'success' && 'Authentication Successful!'}
            {status === 'error' && 'Authentication Failed'}
          </CardTitle>
          <CardDescription>
            {message}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status === 'loading' && (
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Please wait while we complete your authentication...
              </p>
            </div>
          )}
          {status === 'error' && (
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                There was a problem signing you in. Please try again.
              </p>
              <button
                onClick={() => router.push('/login')}
                className="text-primary hover:underline text-sm"
              >
                Return to Login
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
