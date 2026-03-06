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
    cryptoCredentialsDetails: { minVersion: 'TLSv1' },
  },
};

async function createDatabaseConnection() {
  try {
    const connection = await sql.connect(dbConfig);
    console.log('✓ Conexión a SQL Server establecida correctamente');
    return connection;
  } catch (err) {
    console.error('✗ Error conectando a SQL 2008:', err);
    throw err;
  }
}

@Global()
@Module({
  providers: [
    {
      provide: 'DATABASE_CONNECTION',
      useFactory: createDatabaseConnection,
    },
  ],
  exports: ['DATABASE_CONNECTION'],
})
export class ClientDbModule {}

export type DbConnection = sql.ConnectionPool;
