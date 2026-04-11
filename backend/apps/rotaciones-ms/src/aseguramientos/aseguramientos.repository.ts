import { Inject, Injectable } from "@nestjs/common";
import type { DbConnection } from "../client-db/client-db.module";
import * as sql from 'mssql';


@Injectable()
export class AseguramientosRepository {
    constructor(@Inject("DATABASE_CONNECTION") private readonly db: DbConnection){}

    async findMany({select, where, take, skip}: { select: any; where: any; take?: number; skip?: number }) {
        const countResult = await this.db.request()
            .input('fecha', sql.DateTime, where.fecha)
            .query(`
                SELECT COUNT(*) as total FROM ap_Aseguramientos
                WHERE fechaInicial <= @fecha AND fechaFinal >= @fecha
            `);
        const total = countResult.recordset[0].total;

        // Si no hay take y skip, devolver todos los registros
        if (take === undefined || skip === undefined) {
            const result = await this.db.request()
                .input('fecha', sql.DateTime, where.fecha)
                .query(`
                    SELECT 
                        id_CircuitoP, CircuitoP, fechaInicial, fechaFinal, Observaciones, mw, tipo
                    FROM ap_Aseguramientos
                    WHERE fechaInicial <= @fecha AND fechaFinal >= @fecha
                    ORDER BY fechaFinal DESC
                `);
            return {
                records: result.recordset,
                total: total
            };
        }

        const result = await this.db.request()
            .input('fecha', sql.DateTime, where.fecha)
            .input('take', sql.Int, take)
            .input('skip', sql.Int, skip)
            .query(`
                SELECT * FROM (
                    SELECT 
                        id_CircuitoP, CircuitoP, fechaInicial, fechaFinal, Observaciones, mw, tipo,
                        ROW_NUMBER() OVER (ORDER BY fechaFinal DESC) AS RowNum
                    FROM ap_Aseguramientos
                    WHERE fechaInicial <= @fecha AND fechaFinal >= @fecha
                ) AS ResultWithRows
                WHERE RowNum > @skip AND RowNum <= (@skip + @take)
                ORDER BY fechaFinal DESC
            `);

        return {
            records: result.recordset,
            total: total
        };
    }
}