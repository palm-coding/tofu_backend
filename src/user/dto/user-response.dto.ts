import { Exclude, Transform } from 'class-transformer';

export class UserResponseDto {
  @Transform(({ value }) => value.toString())
  _id: string;

  name: string;
  email: string;

  @Exclude()
  password: string;

  role: string;

  @Transform(({ value }) => (value ? value.toString() : null))
  branchId: string | null;

  createdAt: Date;
  updatedAt: Date;

  constructor(partial: any) {
    // Handle both plain objects and Mongoose documents
    const obj = partial.toObject ? partial.toObject() : partial;
    Object.assign(this, obj);
  }
}
