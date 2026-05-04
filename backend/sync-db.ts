import { DataSource } from 'typeorm';
import { User } from './apps/auth-ms/src/auth/entities/user.entity';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'auth_user',
  password: 'auth_password',
  database: 'auth_db',
  entities: [User],
  synchronize: true,
  logging: true,
});

AppDataSource.initialize()
  .then(async () => {
    console.log('✅ Conectado a la base de datos');
    console.log('✅ Tablas sincronizadas');
    const queryRunner = AppDataSource.createQueryRunner();
    const tables = await queryRunner.getTables();
    console.log('📋 Tablas en la base de datos:', tables.map(t => t.name));
    await AppDataSource.destroy();
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error conectando a la base de datos:', error.message);
    process.exit(1);
  });
