const groupThousands = (value: number) =>
  Math.abs(Math.trunc(value)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0');

export const money = (value: number) =>
  `${value < 0 ? '−' : ''}${groupThousands(value)} грн`;

export const shortDate = (value: string) => {
  const [, month, day] = value.slice(0, 10).split('-');
  return `${day}.${month}`;
};
