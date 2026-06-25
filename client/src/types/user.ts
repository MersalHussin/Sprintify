export type UserGender = "male" | "female" | "prefer-not-to-say";

export type UserProfile = {
  _id: string;
  uid: string;
  firstName: string;
  lastName: string;
  professionalTitle: string;
  gender: UserGender;
  timezone: string;
  country: string;
  createdAt: string;
  updatedAt: string;
};

export type UserProfileUpdate = Partial<
  Pick<
    UserProfile,
    "firstName" | "lastName" | "professionalTitle" | "gender" | "timezone" | "country"
  >
>;
