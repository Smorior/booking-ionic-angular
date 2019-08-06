export class Booking {
  constructor(
    public bookingId: number,
    public placeId: number,
    public userId: number,
    public placeTitle: string,
    public placeImage: string,
    public firstName: string,
    public lastName: string,
    public guestNumber: number,
    public bookedFrom: Date,
    public bookedTo: Date
  ) {}
}
