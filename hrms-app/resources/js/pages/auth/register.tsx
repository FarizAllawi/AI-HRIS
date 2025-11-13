import RegisteredUserController from '@/actions/App/Http/Controllers/Auth/RegisteredUserController';
import { login } from '@/routes';
import { Form, Head } from '@inertiajs/react';
import { LoaderCircle, User, Mail, Lock, CheckCircle, Sparkles, Shield, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedFields, setFocusedFields] = useState({
    name: false,
    email: false,
    password: false,
    password_confirmation: false
  });

  const handleFocus = (field: string) => {
    setFocusedFields(prev => ({ ...prev, [field]: true }));
  };

  const handleBlur = (field: string) => {
    setFocusedFields(prev => ({ ...prev, [field]: false }));
  };

  return (
    <AuthLayout
      title="Join Our Community"
      description="Create your account and start your journey"
    >
      <Head title="Register" />

      {/* Animated Background Elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-gradient-to-r from-green-400/20 to-emerald-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-gradient-to-r from-emerald-400/20 to-teal-500/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative">
        <Form
          {...RegisteredUserController.store.form()}
          resetOnSuccess={['password', 'password_confirmation']}
          disableWhileProcessing
          className="space-y-6"
        >
          {({ processing, errors, data }) => (
            <>
              <div className="space-y-5">
                {/* Name Input */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Full Name
                  </Label>
                  <div className="relative">
                    <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${
                      focusedFields.name ? 'text-green-500' : 'text-gray-400'
                    }`}>
                      <User className="h-5 w-5" />
                    </div>
                    <Input
                      id="name"
                      type="text"
                      required
                      autoFocus
                      tabIndex={1}
                      autoComplete="name"
                      name="name"
                      placeholder="Enter your full name"
                      className={`pl-10 transition-all duration-200 ${
                        focusedFields.name
                          ? 'border-green-500 ring-2 ring-green-500/20 shadow-sm'
                          : 'border-gray-300 dark:border-gray-600'
                      } ${
                        errors.name
                          ? 'border-red-500 ring-2 ring-red-500/20'
                          : ''
                      }`}
                      onFocus={() => handleFocus('name')}
                      onBlur={() => handleBlur('name')}
                    />
                  </div>
                  <InputError message={errors.name} />
                </div>

                {/* Email Input */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email Address
                  </Label>
                  <div className="relative">
                    <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${
                      focusedFields.email ? 'text-green-500' : 'text-gray-400'
                    }`}>
                      <Mail className="h-5 w-5" />
                    </div>
                    <Input
                      id="email"
                      type="email"
                      required
                      tabIndex={2}
                      autoComplete="email"
                      name="email"
                      placeholder="email@example.com"
                      className={`pl-10 transition-all duration-200 ${
                        focusedFields.email
                          ? 'border-green-500 ring-2 ring-green-500/20 shadow-sm'
                          : 'border-gray-300 dark:border-gray-600'
                      } ${
                        errors.email
                          ? 'border-red-500 ring-2 ring-red-500/20'
                          : ''
                      }`}
                      onFocus={() => handleFocus('email')}
                      onBlur={() => handleBlur('email')}
                    />
                  </div>
                  <InputError message={errors.email} />
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Password
                  </Label>
                  <div className="relative">
                    <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${
                      focusedFields.password ? 'text-green-500' : 'text-gray-400'
                    }`}>
                      <Lock className="h-5 w-5" />
                    </div>
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      tabIndex={3}
                      autoComplete="new-password"
                      name="password"
                      placeholder="Create a strong password"
                      className={`pl-10 pr-10 transition-all duration-200 ${
                        focusedFields.password
                          ? 'border-green-500 ring-2 ring-green-500/20 shadow-sm'
                          : 'border-gray-300 dark:border-gray-600'
                      } ${
                        errors.password
                          ? 'border-red-500 ring-2 ring-red-500/20'
                          : ''
                      }`}
                      onFocus={() => handleFocus('password')}
                      onBlur={() => handleBlur('password')}
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

                  {/* Password Requirements */}
                  {!errors.password && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1 mt-2">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                        <span>At least 8 characters</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                        <span>Mix of letters, numbers, and symbols</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password Input */}
                <div className="space-y-2">
                  <Label htmlFor="password_confirmation" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${
                      focusedFields.password_confirmation ? 'text-green-500' : 'text-gray-400'
                    }`}>
                      <CheckCircle className="h-5 w-5" />
                    </div>
                    <Input
                      id="password_confirmation"
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      tabIndex={4}
                      autoComplete="new-password"
                      name="password_confirmation"
                      placeholder="Confirm your password"
                      className={`pl-10 pr-10 transition-all duration-200 ${
                        focusedFields.password_confirmation
                          ? 'border-green-500 ring-2 ring-green-500/20 shadow-sm'
                          : 'border-gray-300 dark:border-gray-600'
                      } ${
                        errors.password_confirmation
                          ? 'border-red-500 ring-2 ring-red-500/20'
                          : ''
                      }`}
                      onFocus={() => handleFocus('password_confirmation')}
                      onBlur={() => handleBlur('password_confirmation')}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  <InputError message={errors.password_confirmation} />
                </div>

                {/* Enhanced Register Button */}
                <Button
                  type="submit"
                  className="w-full relative overflow-hidden group bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                  tabIndex={5}
                  data-test="register-user-button"
                >
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  {processing ? (
                    <>
                      <LoaderCircle className="h-4 w-4 animate-spin mr-2" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2 transition-transform group-hover:scale-110" />
                      Create Account
                      <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </Button>
              </div>

              {/* Enhanced Login Link */}
              <div className="text-center pt-6 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Already have an account?{' '}
                  <TextLink
                    href={login()}
                    tabIndex={6}
                    className="font-semibold text-green-600 hover:text-green-500 transition-colors"
                  >
                    Sign in here
                  </TextLink>
                </p>
              </div>
            </>
          )}
        </Form>
      </div>
    </AuthLayout>
  );
}
