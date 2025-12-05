export class ReviewWeekUsageDto {
  used: number;
  remaining: number;

  constructor(used: number, remaining: number) {
    this.used = used;
    this.remaining = remaining;
  }
}
