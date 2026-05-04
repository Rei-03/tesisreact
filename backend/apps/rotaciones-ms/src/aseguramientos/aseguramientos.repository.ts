import { Inject, Injectable } from "@nestjs/common";
import type { DbConnection } from "../client-db/client-db.module";
import * as sql from 'mssql';


@Injectable()
export class AseguramientosRepository {
    constructor(@Inject("DATABASE_CONNECTION") private readonly db: DbConnection){}

    async findMany({select, where, take, skip}: { select: any; where: any; take?: number; skip?: number }) {
        const isFiltered = where.fecha !== null && where.fecha !== undefined;
        const hasCircuitoFilter = where.circuitoP !== null && where.circuitoP !== undefined;
        
        let countQuery: string;
        let countRequest = this.db.request();
        
        if (isFiltered || hasCircuitoFilter) {
            // Construir WHERE dinamicamente
            const whereConditions: string[] = [];
            
            if (isFiltered) {
                whereConditions.push(`(CAST(fechaInicial AS DATE) <= CAST(@fecha AS DATE) AND CAST(fechaFinal AS DATE) >= CAST(@fecha AS DATE))`);
                countRequest = countRequest.input('fecha', sql.DateTime, where.fecha);
            }
            
            if (hasCircuitoFilter) {
                whereConditions.push(`CircuitoP LIKE '%' + @circuitoP + '%'`);
                countRequest = countRequest.input('circuitoP', sql.NVarChar, where.circuitoP);
            }
            
            const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
            countQuery = `SELECT COUNT(*) as total FROM ap_Aseguramientos ${whereClause}`;
        } else {
            // Si no hay fecha ni circuito, contar TODO el historial
            countQuery = `SELECT COUNT(*) as total FROM ap_Aseguramientos`;
        }
        
        const countResult = await countRequest.query(countQuery);
        const total = countResult.recordset[0]?.total || 0;

        // Si no hay registros, retornar vacío
        if (total === 0) {
            return {
                records: [],
                total: 0
            };
        }

        // Si no hay take y skip, devolver todos los registros
        if (take === undefined || skip === undefined) {
            let dataRequest = this.db.request();
            let dataQuery: string;
            
            if (isFiltered || hasCircuitoFilter) {
                const whereConditions: string[] = [];
                
                if (isFiltered) {
                    whereConditions.push(`(CAST(fechaInicial AS DATE) <= CAST(@fecha AS DATE) AND CAST(fechaFinal AS DATE) >= CAST(@fecha AS DATE))`);
                    dataRequest = dataRequest.input('fecha', sql.DateTime, where.fecha);
                }
                
                if (hasCircuitoFilter) {
                    whereConditions.push(`CircuitoP LIKE '%' + @circuitoP + '%'`);
                    dataRequest = dataRequest.input('circuitoP', sql.NVarChar, where.circuitoP);
                }
                
                const whereClause = whereConditions.join(' AND ');
                dataQuery = `
                    SELECT 
                        id_CircuitoP, CircuitoP, fechaInicial, fechaFinal, Observaciones, mw, tipo
                    FROM ap_Aseguramientos
                    WHERE ${whereClause}
                    ORDER BY fechaFinal DESC
                `;
            } else {
                dataQuery = `
                    SELECT 
                        id_CircuitoP, CircuitoP, fechaInicial, fechaFinal, Observaciones, mw, tipo
                    FROM ap_Aseguramientos
                    ORDER BY fechaFinal DESC
                `;
            }
            
            const result = await dataRequest.query(dataQuery);
            return {
                records: result.recordset,
                total: total
            };
        }

        // Query con paginación
        let pageRequest = this.db.request()
            .input('take', sql.Int, take)
            .input('skip', sql.Int, skip);
        
        let pageQuery: string;
        
        if (isFiltered || hasCircuitoFilter) {
            const whereConditions: string[] = [];
            
            if (isFiltered) {
                whereConditions.push(`(CAST(fechaInicial AS DATE) <= CAST(@fecha AS DATE) AND CAST(fechaFinal AS DATE) >= CAST(@fecha AS DATE))`);
                pageRequest = pageRequest.input('fecha', sql.DateTime, where.fecha);
            }
            
            if (hasCircuitoFilter) {
                whereConditions.push(`CircuitoP LIKE '%' + @circuitoP + '%'`);
                pageRequest = pageRequest.input('circuitoP', sql.NVarChar, where.circuitoP);
            }
            
            const whereClause = whereConditions.join(' AND ');
            pageQuery = `
                SELECT * FROM (
                    SELECT 
                        id_CircuitoP, CircuitoP, fechaInicial, fechaFinal, Observaciones, mw, tipo,
                        ROW_NUMBER() OVER (ORDER BY fechaFinal DESC) AS RowNum
                    FROM ap_Aseguramientos
                    WHERE ${whereClause}
                ) AS ResultWithRows
                WHERE RowNum > @skip AND RowNum <= (@skip + @take)
                ORDER BY fechaFinal DESC
            `;
        } else {
            pageQuery = `
                SELECT * FROM (
                    SELECT 
                        id_CircuitoP, CircuitoP, fechaInicial, fechaFinal, Observaciones, mw, tipo,
                        ROW_NUMBER() OVER (ORDER BY fechaFinal DESC) AS RowNum
                    FROM ap_Aseguramientos
                ) AS ResultWithRows
                WHERE RowNum > @skip AND RowNum <= (@skip + @take)
                ORDER BY fechaFinal DESC
            `;
        }

        const result = await pageRequest.query(pageQuery);
        return {
            records: result.recordset,
            total: total
        };
    }

    async create(data: {
        id_CircuitoP: number;
        CircuitoP: string;
        fechaInicial: Date;
        fechaFinal: Date;
        Observaciones: string;
        tipo: string;
        mw?: number;
    }) {
        const request = this.db.request()
            .input('id_CircuitoP', sql.Int, data.id_CircuitoP)
            .input('CircuitoP', sql.NVarChar(100), data.CircuitoP)
            .input('fechaInicial', sql.DateTime2, data.fechaInicial)
            .input('fechaFinal', sql.DateTime2, data.fechaFinal)
            .input('Observaciones', sql.NVarChar(500), data.Observaciones)
            .input('tipo', sql.NVarChar(50), data.tipo)
            .input('mw', sql.Float, data.mw || null);

        const query = `
            INSERT INTO ap_Aseguramientos (id_CircuitoP, CircuitoP, fechaInicial, fechaFinal, Observaciones, mw, tipo)
            OUTPUT INSERTED.*
            VALUES (@id_CircuitoP, @CircuitoP, @fechaInicial, @fechaFinal, @Observaciones, @mw, @tipo)
        `;

        const result = await request.query(query);
        return result.recordset[0] || null;
    }
}