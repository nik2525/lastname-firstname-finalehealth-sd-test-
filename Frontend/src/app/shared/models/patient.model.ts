export interface Patient {
    _id?: string
    firstName: string
    lastName: string
    dob: Date
    email: string
    phoneNumber: string
    address: string
    dateCreated?: Date
    dateUpdated?: Date
  }
  
  export interface CreatePatientDto {
    firstName: string
    lastName: string
    dob: Date
    email: string
    phoneNumber: string
    address: string
  }
  
  export interface UpdatePatientDto extends Partial<CreatePatientDto> {}
  