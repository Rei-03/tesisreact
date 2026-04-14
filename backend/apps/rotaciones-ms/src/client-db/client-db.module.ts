import { Global, Module } from '@nestjs/common';
import * as sql from 'mssql';
import { env } from '../config/env';

const dbConfig = {
  user: env.DB_USER_ROTACIONES,
  password: env.DB_PASSWORD_ROTACIONES,
  server: env.NODE_ENV === 'production' ? 'host.docker.internal' : env.DB_SERVER_ROTACIONES,
  database: env.DB_NAME_ROTACIONES,
  options: {
    encrypt: false,
    trustServerCertificate: true,
    cryptoCredentialsDetails: { minVersion: 'TLSv1' },
  },
};

console.log('Configuración de base de datos:', dbConfig);

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
