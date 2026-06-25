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

            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 rounded-lg border border-border bg-bg-subtle px-4 py-2 transition-colors duration-150 hover:bg-bg-inset"
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
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
