export class GuaranteeCheck {
  constructor(
    public readonly id: number,
    public readonly userId: number,
    public storeName: string,
    public productName: string,
    public purchaseDate: string,
    public expiryDate: string,
    public imagePath: string,
    public notes: string | null,
    public readonly createdAt: Date,
  ) {}

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      storeName: this.storeName,
      productName: this.productName,
      purchaseDate: this.purchaseDate,
      expiryDate: this.expiryDate,
      imagePath: this.imagePath,
      notes: this.notes,
      createdAt: this.createdAt,
    };
  }

  isExpired(): boolean {
    const now = new Date();
    const expiry = new Date(this.expiryDate);
    return expiry < now;
  }

  expiresSoon(): boolean {
    const now = new Date();
    const expiry = new Date(this.expiryDate);
    const thirtyDaysFromNow = new Date(
      now.getTime() + 30 * 24 * 60 * 60 * 1000,
    );
    return expiry >= now && expiry <= thirtyDaysFromNow;
  }
}
