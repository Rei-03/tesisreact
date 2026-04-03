import { Inject, Injectable } from "@nestjs/common";
import type { DbConnection } from "src/client-db/client-db.module";
import * as sql from 'mssql'

@Injectable()
export class ApagonesRepository {
    constructor(@Inject("DATABASE_CONNECTION") private readonly db: DbConnection) { }

    /**
     * Obtiene todos los apagones con paginación
     */
    async findAll(take = 20, skip = 0) {
        const result = await this.db.request()
            .input('take', sql.Int, take)
            .input('skip', sql.Int, skip)
            .query(`
                SELECT * FROM (
                    SELECT idApagon, idProv, FechaRetiro, FechaCierre, idCircuitoP, 
                           MWAfectados, Observaciones, Id_Usuario, Id_UsuarioCerrado, AbiertoPor,
                           ROW_NUMBER() OVER (ORDER BY idApagon DESC) AS RowNum
                    FROM ap_apagones
                ) AS ResultWithRows
                WHERE RowNum > @skip AND RowNum <= (@skip + @take)
                ORDER BY idApagon DESC
            `);

        return result.recordset;
    }

    /**
     * Obtiene un apagón específico por ID
     */
    async findById(idApagon: number) {
        const result = await this.db.request()
            .input('idApagon', sql.BigInt, idApagon)
            .query(`
                SELECT idApagon, idProv, FechaRetiro, FechaCierre, idCircuitoP, 
                       MWAfectados, Observaciones, Id_Usuario, Id_UsuarioCerrado, AbiertoPor
                FROM ap_apagones
                WHERE idApagon = @idApagon
            `);

        return result.recordset[0] || null;
    }

    /**
     * Obtiene todos los apagones de un circuito específico
     */
    async findByCircuitoId(idCircuitoP: number, take = 20, skip = 0) {
        const result = await this.db.request()
            .input('idCircuitoP', sql.Int, idCircuitoP)
            .input('take', sql.Int, take)
            .input('skip', sql.Int, skip)
            .query(`
                SELECT * FROM (
                    SELECT idApagon, idProv, FechaRetiro, FechaCierre, idCircuitoP, 
                           MWAfectados, Observaciones, Id_Usuario, Id_UsuarioCerrado, AbiertoPor,
                           ROW_NUMBER() OVER (ORDER BY idApagon DESC) AS RowNum
                    FROM ap_apagones
                    WHERE idCircuitoP = @idCircuitoP
                ) AS ResultWithRows
                WHERE RowNum > @skip AND RowNum <= (@skip + @take)
                ORDER BY idApagon DESC
            `);

        return result.recordset;
    }

    /**
     * Obtiene el último apagón para cada circuito
     * Query optimizada para tablas grandes usando GROUP BY y MAX
     */
    async findLastApagonByCircuito(take = 20, skip = 0) {
        const result = await this.db.request()
            .input('take', sql.Int, take)
            .input('skip', sql.Int, skip)
            .query(`
                WITH LastApagones AS (
                    SELECT 
                        idCircuitoP,
                        MAX(idApagon) AS maxApagonId
                    FROM ap_apagones
                    WHERE idCircuitoP IS NOT NULL
                    GROUP BY idCircuitoP
                )
                SELECT * FROM (
                    SELECT 
                        ap.idApagon,
                        ap.idProv,
                        ap.FechaRetiro,
                        ap.FechaCierre,
                        ap.idCircuitoP,
                        ap.MWAfectados,
                        ap.Observaciones,
                        ap.Id_Usuario,
                        ap.Id_UsuarioCerrado,
                        ap.AbiertoPor,
                        ROW_NUMBER() OVER (ORDER BY ap.idApagon DESC) AS RowNum
                    FROM ap_apagones ap
                    INNER JOIN LastApagones la ON ap.idCircuitoP = la.idCircuitoP 
                        AND ap.idApagon = la.maxApagonId
                ) AS ResultWithRows
                WHERE RowNum > @skip AND RowNum <= (@skip + @take)
                ORDER BY idApagon DESC
            `);

        return result.recordset;
    }

    /**
     * Obtiene apagones por provincia
     */
    async findByProvincia(idProv: string, take = 20, skip = 0) {
        const result = await this.db.request()
            .input('idProv', sql.VarChar(3), idProv)
            .input('take', sql.Int, take)
            .input('skip', sql.Int, skip)
            .query(`
                SELECT * FROM (
                    SELECT idApagon, idProv, FechaRetiro, FechaCierre, idCircuitoP, 
                           MWAfectados, Observaciones, Id_Usuario, Id_UsuarioCerrado, AbiertoPor,
                           ROW_NUMBER() OVER (ORDER BY idApagon DESC) AS RowNum
                    FROM ap_apagones
                    WHERE idProv = @idProv
                ) AS ResultWithRows
                WHERE RowNum > @skip AND RowNum <= (@skip + @take)
                ORDER BY idApagon DESC
            `);

        return result.recordset;
    }

    /**
     * Obtiene apagones abiertos (sin fecha de cierre)
     */
    async findOpenApagones(take = 20, skip = 0) {
        const result = await this.db.request()
            .input('take', sql.Int, take)
            .input('skip', sql.Int, skip)
            .query(`
                SELECT * FROM (
                    SELECT idApagon, idProv, FechaRetiro, FechaCierre, idCircuitoP, 
                           MWAfectados, Observaciones, Id_Usuario, Id_UsuarioCerrado, AbiertoPor,
                           ROW_NUMBER() OVER (ORDER BY FechaRetiro DESC) AS RowNum
                    FROM ap_apagones
                    WHERE FechaCierre IS NULL
                ) AS ResultWithRows
                WHERE RowNum > @skip AND RowNum <= (@skip + @take)
                ORDER BY FechaRetiro DESC
            `);

        return result.recordset;
    }

    /**
     * Obtiene apagones en un rango de fechas
     */
    async findByDateRange(fechaInicio: string, fechaFin: string, take = 20, skip = 0) {
        const result = await this.db.request()
            .input('fechaInicio', sql.DateTime, new Date(fechaInicio))
            .input('fechaFin', sql.DateTime, new Date(fechaFin))
            .input('take', sql.Int, take)
            .input('skip', sql.Int, skip)
            .query(`
                SELECT * FROM (
                    SELECT idApagon, idProv, FechaRetiro, FechaCierre, idCircuitoP, 
                           MWAfectados, Observaciones, Id_Usuario, Id_UsuarioCerrado, AbiertoPor,
                           ROW_NUMBER() OVER (ORDER BY FechaRetiro DESC) AS RowNum
                    FROM ap_apagones
                    WHERE FechaRetiro >= @fechaInicio AND FechaRetiro <= @fechaFin
                ) AS ResultWithRows
                WHERE RowNum > @skip AND RowNum <= (@skip + @take)
                ORDER BY FechaRetiro DESC
            `);

        return result.recordset;
    }

    /**
     * Obtiene estadísticas de apagones por circuito
     */
    async getApagonesByCircuitoStats() {
        const result = await this.db.request()
            .query(`
                SELECT 
                    idCircuitoP,
                    COUNT(*) as totalApagones,
                    MAX(idApagon) as ultimoApagon,
                    CONVERT(DATE, MAX(FechaRetiro)) as ultimaFecha,
                    SUM(CAST(MWAfectados AS DECIMAL(18,2))) as totalMWAfectados
                FROM ap_apagones
                WHERE idCircuitoP IS NOT NULL
                GROUP BY idCircuitoP
                ORDER BY totalApagones DESC
            `);

        return result.recordset;
    }
}
