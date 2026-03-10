import { Inject, Injectable } from "@nestjs/common";
import type { DbConnection } from "src/client-db/client-db.module";
import * as sql from 'mssql'

@Injectable()
export class CircuitosRepository {
    constructor(@Inject("DATABASE_CONNECTION") private readonly db: DbConnection) { }

    async find(take = 20, skip = 0) {
        const result = this.db.request()
            .input('take', sql.Int, take)
            .input('skip', sql.Int, skip)
            .query(`
      SELECT * FROM (
        SELECT idCircuitoP, idProv, Circuito33, Bloque, CircuitoP, Clientes, ZonaAfectada, Apagable,
               ROW_NUMBER() OVER (ORDER BY CircuitoP) AS RowNum
        FROM ap_circuitos
      ) AS ResultWithRows
      WHERE RowNum > @skip AND RowNum <= (@skip + @take)
      ORDER BY CircuitoP
    `)
        return (await result).recordset
    }

    async findWithConsumption(take = 20, skip = 0) {
        const result = this.db.request()
            .input('take', sql.Int, take)
            .input('skip', sql.Int, skip)
            .query(`
      SELECT * FROM (
        SELECT idCircuitoP, idProv, Circuito33, Bloque, CircuitoP, Clientes, ZonaAfectada, Apagable,
               ROW_NUMBER() OVER (ORDER BY CircuitoP) AS RowNum
        FROM ap_circuitos
      ) AS ResultWithRows
      WHERE RowNum > @skip AND RowNum <= (@skip + @take)
      ORDER BY CircuitoP
    `)
        return (await result).recordset
    }

    async findWithConsumptionByDate(fecha: string, take = 20, skip = 0) {
        const result = await this.db.request()
            .input('fecha', sql.Date, new Date(fecha))
            .input('take', sql.Int, take)
            .input('skip', sql.Int, skip)
            .query(`
            SELECT * FROM (
                SELECT 
                    c.idCircuitoP, c.idProv, c.Circuito33, c.Bloque, 
                    c.CircuitoP, c.Clientes, c.ZonaAfectada, c.Apagable,
                    -- Traemos todas las columnas de la tabla de curvas
                    cur.h0, cur.h1, cur.h2, cur.h3, cur.h4, cur.h5, cur.h6, cur.h7,
                    cur.h8, cur.h9, cur.h10, cur.h11, cur.h12, cur.h13, cur.h14, cur.h15,
                    cur.h16, cur.h17, cur.h18, cur.h19, cur.h20, cur.h21, cur.h22, cur.h23,
                    cur.fecha,
                    ROW_NUMBER() OVER (ORDER BY c.CircuitoP) AS RowNum
                FROM ap_circuitos c
                LEFT JOIN ap_curvas cur ON c.idCircuitoP = cur.idCircuitoP 
                    AND DATEDIFF(DAY, cur.fecha, @fecha) = 0
            ) AS ResultWithRows
            WHERE RowNum > @skip AND RowNum <= (@skip + @take)
            ORDER BY CircuitoP
        `);

        return result.recordset.map(row => {
            // Separamos las horas del resto de los datos del circuito
            const {
                h0, h1, h2, h3, h4, h5, h6, h7, h8, h9, h10, h11,
                h12, h13, h14, h15, h16, h17, h18, h19, h20, h21, h22, h23,
                RowNum, fecha, ...datosCircuito
            } = row;

            return {
                ...datosCircuito,
                consumo: {
                    mw: row.h0 || 0, // En lugar de hora actual, usamos h0 (inicio del día)
                    historico: [
                        h0, h1, h2, h3, h4, h5, h6, h7, h8, h9, h10, h11,
                        h12, h13, h14, h15, h16, h17, h18, h19, h20, h21, h22, h23
                    ],
                    fechaReferencia: fecha ? new Date(fecha).toISOString().split('T')[0] : null
                }
            };
        });
    }
}