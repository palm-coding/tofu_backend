export class UserDto {
  readonly userId?: string;
  readonly username: string;
  readonly password: string;
  readonly email?: string | null;
  readonly profile?: {
    name?: string;
    bio?: string;
    avatarUrl?: string;
  };
  readonly _id?: string;
  readonly sub?: string;
  readonly googleId?: string;
  readonly facebookId?: string;
}
// What we’ll send back on any successful login
export class LoginResponseDto {
  readonly access_token: string;
}

// Common shape for JWT payloads
export class JwtPayloadDto {
  readonly email: string;
  readonly sub: string; // Mongo’s ObjectId as string
  readonly _id: string;
  readonly userId: string;
}

// What you get out of your GoogleStrategy
export interface GoogleUserDto {
  email: string;
  name: string;
  picture?: string;
  googleId: string;
}

// What you get out of your FacebookStrategy
export interface FacebookUserDto {
  email: string | null;
  name: string;
  picture?: string;
  facebookId: string;
  accessToken: string;
  username: string;
  password: string;
}
