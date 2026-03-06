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
}