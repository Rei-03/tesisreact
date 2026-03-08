import { Inject, Injectable } from "@nestjs/common";
import * as sql from 'mssql'


@Injectable()
export class AseguramientosRepository {
    constructor(@Inject("DATABASE_CONNECTION") private readonly db: sql.ConnectionPool){}

    async findMany({select, where, take = 20, skip =  0}) {
        const result = await this.db.request().input('fecha', sql.DateTime, where.fecha).query(`
            SELECT id_CircuitoP, CircuitoP, fechaInicial, fechaFinal, Observaciones, mw, tipo
            FROM ap_Aseguramientos
            WHERE fechaInicial <= @fecha AND fechaFinal >= @fecha
            ORDER BY fechaFinal DESC
        `)

        return result.recordset
    }
}