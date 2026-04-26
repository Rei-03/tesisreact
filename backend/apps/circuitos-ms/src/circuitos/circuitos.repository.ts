import { Inject, Injectable } from '@nestjs/common';
import type { DbConnection } from '../client-db/client-db.module';
import * as sql from 'mssql';

@Injectable()
export class CircuitosRepository {
  constructor(
    @Inject('DATABASE_CONNECTION') private readonly db: DbConnection,
  ) {}

  async find(take = 20, skip = 0) {
    const countResult = await this.db
      .request()
      .query(`SELECT COUNT(*) as total FROM ap_circuitos`);
    const total = countResult.recordset[0].total;

    const result = await this.db
      .request()
      .input('take', sql.Int, take)
      .input('skip', sql.Int, skip).query(`
      SELECT * FROM (
        SELECT idCircuitoP, idProv, Circuito33, Bloque, CircuitoP, Clientes, ZonaAfectada, Apagable,
               ROW_NUMBER() OVER (ORDER BY CircuitoP) AS RowNum
        FROM ap_circuitos
      ) AS ResultWithRows
      WHERE RowNum > @skip AND RowNum <= (@skip + @take)
      ORDER BY CircuitoP
    `);
    return {
      records: (await result).recordset,
      total: total,
    };
  }

  async findWithConsumption(take = 20, skip = 0) {
    const result = this.db
      .request()
      .input('take', sql.Int, take)
      .input('skip', sql.Int, skip).query(`
      SELECT * FROM (
        SELECT idCircuitoP, idProv, Circuito33, Bloque, CircuitoP, Clientes, ZonaAfectada, Apagable,
               ROW_NUMBER() OVER (ORDER BY CircuitoP) AS RowNum
        FROM ap_circuitos
      ) AS ResultWithRows
      WHERE RowNum > @skip AND RowNum <= (@skip + @take)
      ORDER BY CircuitoP
    `);
    return (await result).recordset;
  }

  async findWithConsumptionByDate(fecha: string, take = 20, skip = 0) {
    const result = await this.db
      .request()
      .input('fecha', sql.Date, new Date(fecha))
      .input('take', sql.Int, take)
      .input('skip', sql.Int, skip).query(`
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

    return result.recordset.map((row) => {
      // Separamos las horas del resto de los datos del circuito
      const {
        h0,
        h1,
        h2,
        h3,
        h4,
        h5,
        h6,
        h7,
        h8,
        h9,
        h10,
        h11,
        h12,
        h13,
        h14,
        h15,
        h16,
        h17,
        h18,
        h19,
        h20,
        h21,
        h22,
        h23,
        RowNum,
        fecha,
        ...datosCircuito
      } = row;

      return {
        ...datosCircuito,
        consumo: {
          mw: row.h0 || 0, // En lugar de hora actual, usamos h0 (inicio del día)
          historico: [
            h0,
            h1,
            h2,
            h3,
            h4,
            h5,
            h6,
            h7,
            h8,
            h9,
            h10,
            h11,
            h12,
            h13,
            h14,
            h15,
            h16,
            h17,
            h18,
            h19,
            h20,
            h21,
            h22,
            h23,
          ],
          fechaReferencia: fecha
            ? new Date(fecha).toISOString().split('T')[0]
            : null,
        },
      };
    });
  }

  /**
   * Obtiene circuitos filtrados por apagable y/o bloque
   * Retorna resultados paginados con metadata
   */
  async findWithFilters(
    take = 20,
    skip = 0,
    apagable?: boolean,
    bloque?: string,
  ) {
    // Construir WHERE clause dinámico
    const whereConditions: string[] = [];
    let countRequest = this.db.request();
    let dataRequest = this.db.request();

    if (apagable !== undefined) {
      countRequest = countRequest.input('apagable', sql.Bit, apagable ? 1 : 0);
      dataRequest = dataRequest.input('apagable', sql.Bit, apagable ? 1 : 0);
      whereConditions.push('Apagable = @apagable');
    }

    if (bloque != null) {
      countRequest = countRequest.input('bloque', sql.VarChar(50), bloque);
      dataRequest = dataRequest.input('bloque', sql.VarChar(50), bloque);
      whereConditions.push('Bloque = @bloque');
    }

    dataRequest = dataRequest
      .input('take', sql.Int, take)
      .input('skip', sql.Int, skip);

    const whereClause =
      whereConditions.length > 0
        ? 'WHERE ' + whereConditions.join(' AND ')
        : '';

    // Contar total de registros que coinciden con los filtros
    const countResult = await countRequest.query(`
            SELECT COUNT(*) as total FROM ap_circuitos 
            ${whereClause}
        `);

    const total = countResult.recordset[0]?.total || 0;

    const result = await dataRequest.query(`
            SELECT * FROM (
                SELECT idCircuitoP, idProv, Circuito33, Bloque, CircuitoP, Clientes, ZonaAfectada, Apagable,
                       ROW_NUMBER() OVER (ORDER BY CircuitoP) AS RowNum
                FROM ap_circuitos
                ${whereClause}
            ) AS ResultWithRows
            WHERE RowNum > @skip AND RowNum <= (@skip + @take)
            ORDER BY CircuitoP
        `);

    return {
      records: result.recordset,
      total: total,
    };
  }

  /**
   * Obtiene circuitos con consumo más actual por id de circuito en ap_curvas
   * Y el último apagón de cada circuito
   * Optimizado en una sola query para máximo rendimiento
   * Perfecto para rotaciones-ms que necesita ambos datos
   */
  async findWithConsumptionAndLastApagon(fecha: string, take = 20, skip = 0) {
    const result = await this.db
      .request()
      .input('take', sql.Int, take)
      .input('skip', sql.Int, skip).query(`
                WITH LastCurvas AS (
                    -- Obtener el registro más reciente de consumo por circuito
                    SELECT 
                        idCircuitoP,
                        h0, h1, h2, h3, h4, h5, h6, h7, h8, h9, h10, h11,
                        h12, h13, h14, h15, h16, h17, h18, h19, h20, h21, h22, h23,
                        fecha,
                        ROW_NUMBER() OVER (PARTITION BY idCircuitoP ORDER BY fecha DESC) as CurvaRank
                    FROM ap_curvas
                ),
                LastApagones AS (
                    -- Obtener el apagón más reciente por circuito
                    SELECT 
                        idCircuitoP, 
                        idApagon,
                        FechaRetiro,
                        FechaCierre,
                        MWAfectados,
                        Observaciones,
                        AbiertoPor,
                        ROW_NUMBER() OVER (PARTITION BY idCircuitoP ORDER BY idApagon DESC) as ApagonRank
                    FROM ap_apagon
                    WHERE idCircuitoP IS NOT NULL
                )
                SELECT * FROM (
                    SELECT 
                        c.idCircuitoP, c.idProv, c.Circuito33, c.Bloque, 
                        c.CircuitoP, c.Clientes, c.ZonaAfectada, c.Apagable,
                        -- Horas de consumo más recientes
                        cur.h0, cur.h1, cur.h2, cur.h3, cur.h4, cur.h5, cur.h6, cur.h7,
                        cur.h8, cur.h9, cur.h10, cur.h11, cur.h12, cur.h13, cur.h14, cur.h15,
                        cur.h16, cur.h17, cur.h18, cur.h19, cur.h20, cur.h21, cur.h22, cur.h23,
                        cur.fecha as fechaConsumo,
                        -- Último apagón
                        ap.idApagon, ap.FechaRetiro, ap.FechaCierre, ap.MWAfectados, 
                        ap.Observaciones as ApagonObservaciones, ap.AbiertoPor,
                        ROW_NUMBER() OVER (ORDER BY c.CircuitoP) AS RowNum
                    FROM ap_circuitos c
                    LEFT JOIN LastCurvas cur ON c.idCircuitoP = cur.idCircuitoP 
                        AND cur.CurvaRank = 1
                    LEFT JOIN LastApagones ap ON c.idCircuitoP = ap.idCircuitoP 
                        AND ap.ApagonRank = 1
                ) AS ResultWithRows
                WHERE RowNum > @skip AND RowNum <= (@skip + @take)
                ORDER BY CircuitoP
            `);

    return result.recordset.map((row) => {
      // Separamos las horas del resto de los datos del circuito
      const {
        h0,
        h1,
        h2,
        h3,
        h4,
        h5,
        h6,
        h7,
        h8,
        h9,
        h10,
        h11,
        h12,
        h13,
        h14,
        h15,
        h16,
        h17,
        h18,
        h19,
        h20,
        h21,
        h22,
        h23,
        RowNum,
        fechaConsumo,
        idApagon,
        FechaRetiro,
        FechaCierre,
        MWAfectados,
        ApagonObservaciones,
        AbiertoPor,
        ...datosCircuito
      } = row;

      // Estructura de respuesta con consumo más actual y último apagón
      const circuitoConDatos = {
        ...datosCircuito,
        consumo: {
          mw: row.h0 || 0,
          historico: [
            h0,
            h1,
            h2,
            h3,
            h4,
            h5,
            h6,
            h7,
            h8,
            h9,
            h10,
            h11,
            h12,
            h13,
            h14,
            h15,
            h16,
            h17,
            h18,
            h19,
            h20,
            h21,
            h22,
            h23,
          ],
          fechaReferencia: fechaConsumo
            ? new Date(fechaConsumo).toISOString().split('T')[0]
            : null,
          fechaHora: fechaConsumo ? new Date(fechaConsumo).toISOString() : null,
        },
      };

      // Agregar último apagón si existe
      if (idApagon) {
        circuitoConDatos['ultimoApagon'] = {
          idApagon,
          FechaRetiro,
          FechaCierre,
          MWAfectados,
          Observaciones: ApagonObservaciones,
          AbiertoPor,
          estado: FechaCierre ? 'cerrado' : 'abierto',
        };
      }

      return circuitoConDatos;
    });
  }
}
