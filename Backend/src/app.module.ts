import { Module } from "@nestjs/common"
import { MongooseModule } from "@nestjs/mongoose"
import { ConfigModule, ConfigService } from "@nestjs/config"
import { PatientsModule } from "./patients/patients.module"
import { VisitsModule } from "./visits/visits.module"

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI', 'mongodb://localhost:27017/patient-management'),
      }),
      inject: [ConfigService],
    }),
    PatientsModule,
    VisitsModule,
  ],
})
export class AppModule {}
