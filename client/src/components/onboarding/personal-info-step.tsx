import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "lucide-react";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { SearchableSelect } from "@/components/ui/searchable-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  GENDER_OPTIONS,
  personalInfoSchema,
  type PersonalInfoFormValues,
} from "@/models/onboarding-schemas.zod";
import { COUNTRY_OPTIONS, TIMEZONE_OPTIONS } from "./options";

const RequiredMark = () => (
  <span className="text-destructive" aria-hidden="true">
    *
  </span>
);

export type PersonalInfoStepProps = {
  readonly defaultValues: PersonalInfoFormValues;
  readonly onSubmit: (values: PersonalInfoFormValues) => void;
};

function PersonalInfoStep({ defaultValues, onSubmit }: PersonalInfoStepProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<PersonalInfoFormValues>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues,
  });

  const submit = handleSubmit(onSubmit);

  return (
    <div className="flex w-full flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="font-sans text-3xl font-normal text-foreground">
          Let's get to know each other
        </h1>
        <p className="font-sans text-lg text-foreground/70">
          A few details will help us tailor things to you.
        </p>
      </div>

      <form className="flex flex-col items-center gap-8" onSubmit={submit} noValidate>
        <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2">
          <Field data-invalid={errors.firstName ? true : undefined}>
            <FieldLabel htmlFor="firstName" className="font-light text-muted-foreground">
              First Name <RequiredMark />
            </FieldLabel>
            <Input
              id="firstName"
              placeholder="Patrick"
              autoComplete="given-name"
              className="h-12 rounded-full px-4"
              aria-invalid={errors.firstName ? true : undefined}
              aria-describedby={errors.firstName ? "firstName-error" : undefined}
              {...register("firstName")}
            />
            {errors.firstName ? (
              <FieldError id="firstName-error">{errors.firstName.message}</FieldError>
            ) : null}
          </Field>

          <Field data-invalid={errors.lastName ? true : undefined}>
            <FieldLabel htmlFor="lastName" className="font-light text-muted-foreground">
              Last Name <RequiredMark />
            </FieldLabel>
            <Input
              id="lastName"
              placeholder="Jane"
              autoComplete="family-name"
              className="h-12 rounded-full px-4"
              aria-invalid={errors.lastName ? true : undefined}
              aria-describedby={errors.lastName ? "lastName-error" : undefined}
              {...register("lastName")}
            />
            {errors.lastName ? (
              <FieldError id="lastName-error">{errors.lastName.message}</FieldError>
            ) : null}
          </Field>

          <Field data-invalid={errors.professionalTitle ? true : undefined}>
            <FieldLabel
              htmlFor="professionalTitle"
              className="font-light text-muted-foreground"
            >
              Professional Title <RequiredMark />
            </FieldLabel>
            <Input
              id="professionalTitle"
              placeholder="Software Engineer"
              autoComplete="organization-title"
              className="h-12 rounded-full px-4"
              aria-invalid={errors.professionalTitle ? true : undefined}
              aria-describedby={errors.professionalTitle ? "professionalTitle-error" : undefined}
              {...register("professionalTitle")}
            />
            {errors.professionalTitle ? (
              <FieldError id="professionalTitle-error">{errors.professionalTitle.message}</FieldError>
            ) : null}
          </Field>

          <Controller
            control={control}
            name="gender"
            render={({ field }) => (
              <Field data-invalid={errors.gender ? true : undefined}>
                <FieldLabel htmlFor="gender" className="font-light text-muted-foreground">
                  Gender <RequiredMark />
                </FieldLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    id="gender"
                    aria-invalid={errors.gender ? true : undefined}
                    aria-describedby={errors.gender ? "gender-error" : undefined}
                  >
                    <SelectValue placeholder="Specify your gender" />
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
                  <FieldError id="gender-error">{errors.gender.message}</FieldError>
                ) : null}
              </Field>
            )}
          />

          <Controller
            control={control}
            name="country"
            render={({ field }) => (
              <Field data-invalid={errors.country ? true : undefined}>
                <FieldLabel htmlFor="country" className="font-light text-muted-foreground">
                  Country <RequiredMark />
                </FieldLabel>
                <SearchableSelect
                  id="country"
                  value={field.value}
                  onValueChange={field.onChange}
                  options={COUNTRY_OPTIONS}
                  placeholder="Select your country"
                  searchPlaceholder="Search countries"
                  emptyMessage="No country found."
                  aria-invalid={errors.country ? true : undefined}
                  aria-describedby={errors.country ? "country-error" : undefined}
                />
                {errors.country ? (
                  <FieldError id="country-error">{errors.country.message}</FieldError>
                ) : null}
              </Field>
            )}
          />

          <Controller
            control={control}
            name="timezone"
            render={({ field }) => (
              <Field data-invalid={errors.timezone ? true : undefined}>
                <FieldLabel htmlFor="timezone" className="font-light text-muted-foreground">
                  Timezone <RequiredMark />
                </FieldLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    id="timezone"
                    aria-invalid={errors.timezone ? true : undefined}
                    aria-describedby={errors.timezone ? "timezone-error" : undefined}
                  >
                    <SelectValue placeholder="Select your timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMEZONE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.timezone ? (
                  <FieldError id="timezone-error">{errors.timezone.message}</FieldError>
                ) : null}
              </Field>
            )}
          />
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full max-w-[284px] rounded-full font-sans font-medium"
        >
          Next step
          <ArrowRight data-icon="inline-end" aria-hidden="true" />
        </Button>
      </form>
    </div>
  );
}

export { PersonalInfoStep };
