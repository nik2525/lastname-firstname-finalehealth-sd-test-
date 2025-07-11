export enum VisitType {
    HOME = "Home",
    TELEHEALTH = "Telehealth",
    CLINIC = "Clinic",
  }
  
  export interface Visit {
    _id?: string
    patientId: string
    visitDate: Date
    notes?: string
    visitType: VisitType
    dateCreated?: Date
    dateUpdated?: Date
  }
  
  export interface CreateVisitDto {
    patientId: string
    visitDate: Date
    notes?: string
    visitType: VisitType
  }
  
  export interface UpdateVisitDto extends Partial<Omit<CreateVisitDto, "patientId">> {}
  