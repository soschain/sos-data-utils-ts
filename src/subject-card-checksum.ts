/** Damm check digit for a decimal card payload; presentation separators carry no identity. */
export function computeDammCheckDigit(value:string):string {
  const source=String(value??'').trim()
  if(!/^[0-9:\-\s]+$/u.test(source))throw new TypeError('card_checksum_digits_required')
  const digits=source.replace(/\D/gu,'')
  if(!digits)throw new TypeError('card_checksum_digits_required')
  const table=[
    [0,3,1,7,5,9,8,6,4,2],[7,0,9,2,1,5,4,8,6,3],
    [4,2,0,6,8,7,1,3,5,9],[1,7,5,0,9,8,3,4,2,6],
    [6,1,2,3,0,4,5,9,7,8],[3,6,7,4,2,0,9,5,8,1],
    [5,8,6,9,7,2,0,1,3,4],[8,9,4,5,3,6,2,0,1,7],
    [9,4,3,8,6,1,7,2,0,5],[2,5,8,1,4,3,6,7,9,0],
  ] as const
  let checksum=0
  for(const digit of digits)checksum=table[checksum][Number(digit)]
  return String(checksum)
}
