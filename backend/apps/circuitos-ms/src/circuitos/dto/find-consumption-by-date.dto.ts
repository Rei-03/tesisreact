export class FindConsumptionByDateDto {
  fecha?: string; // ISO format: YYYY-MM-DD (optional, defaults to today)
  take?: number;
  skip?: number;
}
