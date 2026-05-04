import { Injectable } from '@nestjs/common';
import { CreateCircuitoDto } from './dto/create-circuito.dto';
import { UpdateCircuitoDto } from './dto/update-circuito.dto';
import { FindConsumptionByDateDto } from './dto/find-consumption-by-date.dto';
import { CircuitosRepository } from './circuitos.repository';

type CurvaCircuito = {
  idCircuitoP: number;
  fecha?: Date | string | null;
  h0?: number | null;
  h1?: number | null;
  h2?: number | null;
  h3?: number | null;
  h4?: number | null;
  h5?: number | null;
  h6?: number | null;
  h7?: number | null;
  h8?: number | null;
  h9?: number | null;
  h10?: number | null;
  h11?: number | null;
  h12?: number | null;
  h13?: number | null;
  h14?: number | null;
  h15?: number | null;
  h16?: number | null;
  h17?: number | null;
  h18?: number | null;
  h19?: number | null;
  h20?: number | null;
  h21?: number | null;
  h22?: number | null;
  h23?: number | null;
};

@Injectable()
export class CircuitosService {
  constructor(private readonly circuitoRepo: CircuitosRepository) {}
  create(createCircuitoDto: CreateCircuitoDto) {
    return 'This action adds a new circuito';
  }

  async findAll(
    take: number = 20,
    skip: number = 0,
    apagable?: boolean,
    bloque?: string,
  ) {
    const page = skip / take + 1;
    const { records, total } = await this.circuitoRepo.findWithFilters(
      take,
      skip,
      apagable,
      bloque,
    );
    const totalPages = Math.ceil(total / take);

    return {
      results: records,
      meta: {
        page: Math.floor(page),
        totalPages,
        total,
        pageSize: take,
      },
    };
  }

  findAllWithConsumption(payload: FindConsumptionByDateDto) {
    const take = payload.take || 20;
    const skip = payload.skip || 0;
    const fecha = payload.fecha || new Date().toISOString().split('T')[0];
    return this.circuitoRepo.findWithConsumptionByDate(fecha, take, skip);
  }

  /**
   * Obtiene circuitos con consumo Y último apagón de cada circuito
   * Optimizado para rotaciones-ms que necesita ambos datos
   */
  async findWithConsumptionAndApagones(payload: FindConsumptionByDateDto) {
    const take = payload.take || 20;
    const skip = payload.skip || 0;
    const fecha = payload.fecha || new Date().toISOString().split('T')[0];

    const records = await this.circuitoRepo.findWithConsumptionAndLastApagon(
      fecha,
      take,
      skip,
    );

    if (!records || records.length === 0) {
      return {
        results: [],
        meta: {
          page: Math.ceil((skip + 1) / take),
          totalPages: 0,
          total: 0,
          pageSize: take,
        },
      };
    }

    return {
      results: records,
      meta: {
        page: Math.ceil((skip + 1) / take),
        totalPages: Math.ceil(records.length / take),
        total: records.length,
        pageSize: take,
      },
    };
  }

  async findCurrentHourTotalMW() {
    const curves =
      await this.circuitoRepo.findLatestCurvesByCircuit() as CurvaCircuito[];

    // Defensa extra: si por cualquier razón llegan duplicados, se conserva
    // solo una curva por circuito (la primera, ya ordenada como más reciente).
    const uniqueByCircuit = new Map<number, CurvaCircuito>();
    for (const curve of curves) {
      if (!curve?.idCircuitoP) {
        continue;
      }

      if (!uniqueByCircuit.has(curve.idCircuitoP)) {
        uniqueByCircuit.set(curve.idCircuitoP, curve);
      }
    }

    const horaMilitar = new Date().getHours();
    const hourKey = `h${horaMilitar}` as keyof CurvaCircuito;

    const uniqueRows = Array.from(uniqueByCircuit.values());
    const totalMW = uniqueRows.reduce((acc, row) => {
      return acc + Number(row[hourKey] ?? 0);
    }, 0);

    const fechaReferencia = uniqueRows.reduce<Date | null>((latest, row) => {
      if (!row?.fecha) {
        return latest;
      }

      const current = new Date(row.fecha);
      if (Number.isNaN(current.getTime())) {
        return latest;
      }

      if (!latest || current > latest) {
        return current;
      }

      return latest;
    }, null);

    return {
      totalMW,
      horaMilitar,
      circuitosConsiderados: uniqueRows.length,
      fechaReferencia: fechaReferencia ? fechaReferencia.toISOString() : null,
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} circuito`;
  }

  update(id: number, updateCircuitoDto: UpdateCircuitoDto) {
    return `This action updates a #${id} circuito`;
  }

  remove(id: number) {
    return `This action removes a #${id} circuito`;
  }
}
