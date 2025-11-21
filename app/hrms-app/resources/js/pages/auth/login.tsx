import AuthenticatedSessionController from '@/actions/App/Http/Controllers/Auth/AuthenticatedSessionController';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import { register } from '@/routes';
import { request } from '@/routes/password';
import { Form, Head } from '@inertiajs/react';
import { Heart, LoaderCircle, Shield, Eye, EyeOff, Mail, Lock, Sparkles } from 'lucide-react';
import { useState } from 'react';

interface LoginProps {
  status?: string;
  canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState({ email: false, password: false });

  return (
    <AuthLayout
      title="Welcome Back!"
      description="Sign in to continue your journey"
    >
      <Head title="Log in" />

      {/* Animated Background Elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-gradient-to-r from-blue-400/20 to-purple-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-gradient-to-r from-purple-400/20 to-pink-500/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative">
        <Form
          {...AuthenticatedSessionController.store.form()}
          resetOnSuccess={['password']}
          className="space-y-6"
        >
          {({ processing, errors }) => (
            <>
              <div className="space-y-5">
                {/* Email Input with Enhanced Styling */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email Address
                  </Label>
                  <div className="relative">
                    <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${
                      isFocused.email ? 'text-blue-500' : 'text-gray-400'
                    }`}>
                      <Mail className="h-5 w-5" />
                    </div>
                    <Input
                      id="email"
                      type="email"
                      name="email"
                      required
                      autoFocus
                      tabIndex={1}
                      autoComplete="email"
                      placeholder="email@example.com"
                      className={`pl-10 transition-all duration-200 ${
                        isFocused.email
                          ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-sm'
                          : 'border-gray-300 dark:border-gray-600'
                      } ${
                        errors.email
                          ? 'border-red-500 ring-2 ring-red-500/20'
                          : ''
                      }`}
                      onFocus={() => setIsFocused(prev => ({ ...prev, email: true }))}
                      onBlur={() => setIsFocused(prev => ({ ...prev, email: false }))}
                    />
                  </div>
                  <InputError message={errors.email} />
                </div>

                {/* Password Input with Enhanced Styling */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Password
                    </Label>
                    {canResetPassword && (
                      <TextLink
                        href={request()}
                        className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
                        tabIndex={5}
                      >
                        Forgot password?
                      </TextLink>
                    )}
                  </div>
                  <div className="relative">
                    <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${
                      isFocused.password ? 'text-blue-500' : 'text-gray-400'
                    }`}>
                      <Lock className="h-5 w-5" />
                    </div>
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      required
                      tabIndex={2}
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      className={`pl-10 pr-10 transition-all duration-200 ${
                        isFocused.password
                          ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-sm'
                          : 'border-gray-300 dark:border-gray-600'
                      } ${
                        errors.password
                          ? 'border-red-500 ring-2 ring-red-500/20'
                          : ''
                      }`}
                      onFocus={() => setIsFocused(prev => ({ ...prev, password: true }))}
                      onBlur={() => setIsFocused(prev => ({ ...prev, password: false }))}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  <InputError message={errors.password} />
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <Checkbox
                    id="remember"
                    name="remember"
                    tabIndex={3}
                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                  <Label htmlFor="remember" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                    Remember me for 30 days
                  </Label>
                </div>

                {/* Enhanced Login Button */}
                <Button
                  type="submit"
                  className="w-full relative overflow-hidden group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                  tabIndex={4}
                  disabled={processing}
                  data-test="login-button"
                >
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  {processing ? (
                    <LoaderCircle className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2 transition-transform group-hover:scale-110" />
                      Sign In
                    </>
                  )}
                </Button>
              </div>

              {/* Sign Up Link */}
              <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Don't have an account?{' '}
                  <TextLink
                    href={register()}
                    tabIndex={5}
                    className="font-semibold text-blue-600 hover:text-blue-500 transition-colors"
                  >
                    Create one now
                  </TextLink>
                </p>
              </div>
            </>
          )}
        </Form>

        {/* Enhanced Demo Account Card */}
        <div className="mt-8 p-5 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-blue-900 dark:text-blue-100 text-sm mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                <div>
                  Demo Account - Try it out!
                </div>
              </div>
              <div className="text-blue-800 dark:text-blue-200 text-xs sm:text-sm space-y-1 font-mono bg-white/50 dark:bg-black/20 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Mail className="h-3 w-3" />
                  <span>email: test@example.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="h-3 w-3" />
                  <span>password: password</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Message */}
        {status && (
          <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-center text-sm font-medium text-green-700 dark:text-green-300 shadow-sm">
            {status}
          </div>
        )}
      </div>
    </AuthLayout>
  );
}
