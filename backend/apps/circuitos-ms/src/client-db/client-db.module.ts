import { Global, Module } from '@nestjs/common';
import * as sql from 'mssql';

const dbConfig = {
  user: 'sa',
  password: '12341234',
  server: 'localhost',
  database: 'SIGERE',
  options: {
    encrypt: false,
    trustServerCertificate: true,
    cryptoCredentialsDetails: { minVersion: 'TLSv1' }
  }
};
@Global()
@Module({
  providers: [
    {
      provide: 'DATABASE_CONNECTION',
      useFactory: async () => {
        try {
          return await sql.connect(dbConfig);
        } catch (err) {
          console.error('Error conectando a SQL 2008', err);
        }
      },
    },
  ],
  exports: ['DATABASE_CONNECTION'],
})
export class ClientDbModule {}
