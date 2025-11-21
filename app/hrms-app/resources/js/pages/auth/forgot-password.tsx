// Components
import PasswordResetLinkController from '@/actions/App/Http/Controllers/Auth/PasswordResetLinkController';
import { login } from '@/routes';
import { Form, Head } from '@inertiajs/react';
import { LoaderCircle, Mail, ArrowLeft, Shield, Sparkles, Key, CheckCircle } from 'lucide-react';
import { useState } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

export default function ForgotPassword({ status }: { status?: string }) {
  const [isFocused, setIsFocused] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  return (
    <AuthLayout
      title="Reset Your Password"
      description="We'll send you a link to create a new password"
    >
      <Head title="Forgot Password" />

      {/* Animated Background Elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-gradient-to-r from-orange-400/20 to-red-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-gradient-to-r from-amber-400/20 to-orange-500/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative">
        {/* Success State */}
        {submitted && !status && (
          <div className="mb-6 p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl text-center shadow-sm">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
            <h3 className="font-semibold text-green-800 dark:text-green-200 text-lg mb-2">
              Check Your Email!
            </h3>
            <p className="text-green-700 dark:text-green-300 text-sm">
              We've sent a password reset link to your email address.
            </p>
          </div>
        )}

        {/* Status Message */}
        {status && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-center text-sm font-medium text-green-700 dark:text-green-300 shadow-sm">
            <CheckCircle className="h-4 w-4 inline mr-2" />
            {status}
          </div>
        )}

        <Form
          {...PasswordResetLinkController.store.form()}
          onSubmit={() => setSubmitted(true)}
          className="space-y-6"
        >
          {({ processing, errors, data }) => (
            <>
              <div className="space-y-5">
                {/* Enhanced Email Input */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email Address
                  </Label>
                  <div className="relative">
                    <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${
                      isFocused ? 'text-orange-500' : 'text-gray-400'
                    }`}>
                      <Mail className="h-5 w-5" />
                    </div>
                    <Input
                      id="email"
                      type="email"
                      name="email"
                      autoComplete="off"
                      autoFocus
                      placeholder="email@example.com"
                      className={`pl-10 transition-all duration-200 ${
                        isFocused
                          ? 'border-orange-500 ring-2 ring-orange-500/20 shadow-sm'
                          : 'border-gray-300 dark:border-gray-600'
                      } ${
                        errors.email
                          ? 'border-red-500 ring-2 ring-red-500/20'
                          : ''
                      }`}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                    />
                  </div>
                  <InputError message={errors.email} />

                  {/* Help Text */}
                  {!errors.email && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Enter the email address associated with your account
                    </p>
                  )}
                </div>

                {/* Enhanced Submit Button */}
                <Button
                  type="submit"
                  className="w-full relative overflow-hidden group bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                  disabled={processing}
                  data-test="email-password-reset-link-button"
                >
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  {processing ? (
                    <>
                      <LoaderCircle className="h-4 w-4 animate-spin mr-2" />
                      Sending Reset Link...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2 transition-transform group-hover:scale-110" />
                      Send Reset Link
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </Form>

        {/* Enhanced Back to Login */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <TextLink
            href={login()}
            className="inline-flex items-center justify-center w-full group text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50"
          >
            <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
            Return to Login
          </TextLink>
        </div>

        {/* Security Note */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 text-sm mb-1">
                Secure Password Reset
              </h4>
              <p className="text-blue-700 dark:text-blue-300 text-xs">
                The reset link will expire in 1 hour for your security.
                Can't find the email? Check your spam folder.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
