import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { type Document, Types } from "mongoose"

export type VisitDocument = Visit & Document

export enum VisitType {
  HOME = "Home",
  TELEHEALTH = "Telehealth",
  CLINIC = "Clinic",
}

@Schema({ timestamps: true })
export class Visit {
  @Prop({ type: Types.ObjectId, ref: "Patient", required: true })
  patientId: Types.ObjectId

  @Prop({ required: true })
  visitDate: Date

  @Prop()
  notes: string

  @Prop({ enum: VisitType, required: true })
  visitType: VisitType

  @Prop({ default: Date.now })
  dateCreated: Date

  @Prop({ default: Date.now })
  dateUpdated: Date
}

export const VisitSchema = SchemaFactory.createForClass(Visit)

// Update dateUpdated on save
VisitSchema.pre("save", function (next) {
  this.dateUpdated = new Date()
  next()
})

// Update dateUpdated on findOneAndUpdate
VisitSchema.pre("findOneAndUpdate", function (next) {
  this.set({ dateUpdated: new Date() })
  next()
})
