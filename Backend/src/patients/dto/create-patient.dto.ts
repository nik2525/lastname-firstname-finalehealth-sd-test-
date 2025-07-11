import { IsString, IsEmail, IsDate, IsNotEmpty, Matches } from "class-validator"
import { Type } from 'class-transformer';

export class CreatePatientDto {
  @IsString()
  @IsNotEmpty({ message: 'First name is required' })
  firstName: string;

  @IsString()
  @IsNotEmpty({ message: 'Last name is required' })
  lastName: string;

  @IsNotEmpty({ message: 'Date of birth is required' })
  @Type(() => Date)
  @IsDate({ message: 'Please provide a valid date of birth' })
  dob: Date;

  @IsEmail({}, { message: 'Please provide a valid email' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Phone number is required' })
  @Matches(/^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/, {
    message: 'Please provide a valid phone number (e.g. +1234567890 or 123-456-7890)'
  })
  phoneNumber: string;

  @IsString()
  @IsNotEmpty({ message: 'Address is required' })
  address: string;
}
