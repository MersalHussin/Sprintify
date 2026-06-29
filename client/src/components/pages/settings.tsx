import React, { useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { FaMoon, FaSun } from 'react-icons/fa6';

import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { SearchableSelect } from '@/components/ui/searchable-select';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { COUNTRY_OPTIONS, timezoneOptionsForValue } from '@/components/onboarding/options';
import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/context/theme-context';
import { apiFetch } from '@/lib/api';
import {
  GENDER_OPTIONS,
  personalInfoSchema,
  type PersonalInfoFormValues,
} from '@/models/onboarding-schemas.zod';

const emptyProfileValues: PersonalInfoFormValues = {
  firstName: '',
  lastName: '',
  professionalTitle: '',
  gender: '',
  country: '',
  timezone: '',
};

export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const { profile, profileLoading, refreshProfile } = useAuth();
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  const profileValues = useMemo<PersonalInfoFormValues>(() => {
    if (!profile) {
      return emptyProfileValues;
    }

    return {
      firstName: profile.firstName ?? '',
      lastName: profile.lastName ?? '',
      professionalTitle: profile.professionalTitle ?? '',
      gender: profile.gender ?? '',
      country: profile.country ?? '',
      timezone: profile.timezone ?? '',
    };
  }, [profile]);

  const timezoneOptions = useMemo(
    () => timezoneOptionsForValue(profile?.timezone),
    [profile?.timezone],
  );

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<PersonalInfoFormValues>({
    resolver: zodResolver(personalInfoSchema),
    values: profileValues,
  });

  const onSubmit = handleSubmit(async (values) => {
    setSaveError(null);
    setSaveSuccess(false);
    setSaving(true);

    try {
      await apiFetch('/users/me', {
        method: 'PATCH',
        body: JSON.stringify(values),
      });
      await refreshProfile();
      setSaveSuccess(true);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  });

  return (
    <div className="flex-1 p-8 bg-bg-base text-text-primary transition-colors duration-150">
      <div className="max-w-2xl flex flex-col gap-6">
        <div className="rounded-2xl border border-border bg-bg-surface p-6">
          <h2 className="text-xl font-semibold mb-4">Profile</h2>
          <p className="text-sm text-text-secondary mb-6">
            Update your personal information.
          </p>

          {profileLoading && !profile ? (
            <p className="text-sm text-text-secondary">Loading profile…</p>
          ) : (
            <form className="flex flex-col gap-6" onSubmit={onSubmit} noValidate>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field data-invalid={errors.firstName ? true : undefined}>
                  <FieldLabel htmlFor="settings-firstName">First Name</FieldLabel>
                  <Input
                    id="settings-firstName"
                    autoComplete="given-name"
                    aria-invalid={errors.firstName ? true : undefined}
                    aria-describedby={errors.firstName ? 'settings-firstName-error' : undefined}
                    {...register('firstName')}
                  />
                  {errors.firstName ? (
                    <FieldError id="settings-firstName-error">{errors.firstName.message}</FieldError>
                  ) : null}
                </Field>

                <Field data-invalid={errors.lastName ? true : undefined}>
                  <FieldLabel htmlFor="settings-lastName">Last Name</FieldLabel>
                  <Input
                    id="settings-lastName"
                    autoComplete="family-name"
                    aria-invalid={errors.lastName ? true : undefined}
                    aria-describedby={errors.lastName ? 'settings-lastName-error' : undefined}
                    {...register('lastName')}
                  />
                  {errors.lastName ? (
                    <FieldError id="settings-lastName-error">{errors.lastName.message}</FieldError>
                  ) : null}
                </Field>

                <Field
                  className="sm:col-span-2"
                  data-invalid={errors.professionalTitle ? true : undefined}
                >
                  <FieldLabel htmlFor="settings-professionalTitle">Professional Title</FieldLabel>
                  <Input
                    id="settings-professionalTitle"
                    autoComplete="organization-title"
                    aria-invalid={errors.professionalTitle ? true : undefined}
                    aria-describedby={
                      errors.professionalTitle ? 'settings-professionalTitle-error' : undefined
                    }
                    {...register('professionalTitle')}
                  />
                  {errors.professionalTitle ? (
                    <FieldError id="settings-professionalTitle-error">
                      {errors.professionalTitle.message}
                    </FieldError>
                  ) : null}
                </Field>

                <Controller
                  control={control}
                  name="gender"
                  render={({ field }) => (
                    <Field data-invalid={errors.gender ? true : undefined}>
                      <FieldLabel htmlFor="settings-gender">Gender</FieldLabel>
                      <Select
                        key={`gender-${field.value}`}
                        value={field.value || undefined}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger
                          id="settings-gender"
                          aria-invalid={errors.gender ? true : undefined}
                          aria-describedby={errors.gender ? 'settings-gender-error' : undefined}
                        >
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          {GENDER_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.gender ? (
                        <FieldError id="settings-gender-error">{errors.gender.message}</FieldError>
                      ) : null}
                    </Field>
                  )}
                />

                <Controller
                  control={control}
                  name="country"
                  render={({ field }) => (
                    <Field data-invalid={errors.country ? true : undefined}>
                      <FieldLabel htmlFor="settings-country">Country</FieldLabel>
                      <SearchableSelect
                        id="settings-country"
                        value={field.value}
                        onValueChange={field.onChange}
                        options={COUNTRY_OPTIONS}
                        placeholder="Select country"
                        searchPlaceholder="Search countries"
                        emptyMessage="No country found."
                        aria-invalid={errors.country ? true : undefined}
                        aria-describedby={errors.country ? 'settings-country-error' : undefined}
                      />
                      {errors.country ? (
                        <FieldError id="settings-country-error">{errors.country.message}</FieldError>
                      ) : null}
                    </Field>
                  )}
                />

                <Controller
                  control={control}
                  name="timezone"
                  render={({ field }) => (
                    <Field
                      className="sm:col-span-2"
                      data-invalid={errors.timezone ? true : undefined}
                    >
                      <FieldLabel htmlFor="settings-timezone">Timezone</FieldLabel>
                      <Select
                        key={`timezone-${field.value}`}
                        value={field.value || undefined}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger
                          id="settings-timezone"
                          aria-invalid={errors.timezone ? true : undefined}
                          aria-describedby={errors.timezone ? 'settings-timezone-error' : undefined}
                        >
                          <SelectValue placeholder="Select timezone" />
                        </SelectTrigger>
                        <SelectContent>
                          {timezoneOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.timezone ? (
                        <FieldError id="settings-timezone-error">{errors.timezone.message}</FieldError>
                      ) : null}
                    </Field>
                  )}
                />
              </div>

              {saveError ? (
                <p role="status" className="text-sm text-destructive">
                  {saveError}
                </p>
              ) : null}

              {saveSuccess ? (
                <p role="status" className="text-sm text-success">
                  Profile saved successfully.
                </p>
              ) : null}

              <Button type="submit" disabled={saving || profileLoading}>
                {saving ? 'Saving…' : 'Save profile'}
              </Button>
            </form>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-bg-surface p-6">
          <h2 className="text-xl font-semibold mb-4">Appearance</h2>

          <div className="flex items-center justify-between py-4">
            <div>
              <p className="font-medium">Theme</p>
              <p className="text-sm text-text-secondary">
                Switch between dark and light mode.
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={toggleTheme}
              className="gap-2"
            >
              {theme === 'dark' ? (
                <>
                  <FaSun className="text-yellow-500" />
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <FaMoon className="text-blue-500" />
                  <span>Dark Mode</span>
                </>
              )}
            </Button>
          </div>
        </div>

        <DeleteAccountSection />
      </div>
    </div>
  );
}

function DeleteAccountSection() {
  const { deleteAccountWithPassword } = useAuth();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState('');

  const handleDelete = async () => {
    if (!password) {
      setError('Please enter your password to confirm deletion.');
      return;
    }

    if (!window.confirm('Are you absolutely sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleting(true);
      setError(null);
      await deleteAccountWithPassword(password);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Incorrect password. Please try again.');
      } else {
        setError(err.message || 'Failed to delete account. Please check your password or try logging in again.');
      }
      setDeleting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6">
      <h2 className="text-xl font-semibold text-destructive mb-4">Danger Zone</h2>
      <p className="text-sm text-text-secondary mb-6">
        Permanently delete your account and all associated data. This action cannot be undone.
      </p>

      <div className="mb-4 max-w-sm">
        <FieldLabel htmlFor="delete-password">Confirm Password</FieldLabel>
        <Input
          id="delete-password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1"
        />
        <p className="text-xs text-text-secondary mt-2">
          If you registered with Google or GitHub, you must first set a password via the{' '}
          <a href="/forgot-password" className="underline hover:text-text-primary">
            Forgot Password
          </a>{' '}
          page before you can delete your account.
        </p>
      </div>

      {error ? (
        <p className="text-sm text-destructive mb-4">{error}</p>
      ) : null}

      <Button
        type="button"
        variant="destructive"
        onClick={handleDelete}
        disabled={deleting}
      >
        {deleting ? 'Deleting Account…' : 'Delete Account'}
      </Button>
    </div>
  );
}
