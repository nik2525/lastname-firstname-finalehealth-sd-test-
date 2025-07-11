import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import type { Document } from "mongoose"

export type PatientDocument = Patient & Document

@Schema({ timestamps: true })
export class Patient {
  @Prop({ required: true })
  firstName: string

  @Prop({ required: true })
  lastName: string

  @Prop({ required: true })
  dob: Date

  @Prop({ required: true, unique: true })
  email: string

  @Prop({ required: true })
  phoneNumber: string

  @Prop({ required: true })
  address: string

  @Prop({ default: Date.now })
  dateCreated: Date

  @Prop({ default: Date.now })
  dateUpdated: Date
}

export const PatientSchema = SchemaFactory.createForClass(Patient)

// Update dateUpdated on save
PatientSchema.pre("save", function (next) {
  this.dateUpdated = new Date()
  next()
})

// Update dateUpdated on findOneAndUpdate
PatientSchema.pre("findOneAndUpdate", function (next) {
  this.set({ dateUpdated: new Date() })
  next()
})
