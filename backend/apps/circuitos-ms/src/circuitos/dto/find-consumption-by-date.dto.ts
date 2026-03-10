export class FindConsumptionByDateDto {
  fecha: string; // ISO format: YYYY-MM-DD
  take?: number;
  skip?: number;
}
