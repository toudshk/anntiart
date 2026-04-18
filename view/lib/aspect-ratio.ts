function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x || 1;
}

/** Сокращённая дробь w:h для подписи и 3D (например 100×110 → 10/11). */
export function aspectRatioFromCm(widthCm: number, heightCm: number): `${number}/${number}` {
  const g = gcd(widthCm, heightCm);
  return `${widthCm / g}/${heightCm / g}`;
}
