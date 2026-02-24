/** An accidental classification with its display and tone symbols. */
export class Accidental {
  constructor(
    public readonly name: string,
    public readonly displaySymbol: string,
    public readonly toneSymbol: string,
    public readonly semitoneOffset: number,
  ) {}
}
