export function randomInRange(rangeStart: number, rangeEnd: number) {
  return rangeStart + (Math.random() * (rangeEnd - rangeStart))
}

export function randomIntInRange(rangeStart: number, rangeEnd: number) {
  return Math.floor(rangeStart + (Math.random() * (rangeEnd - rangeStart + 1)))
}

// We export this function as a generator so that we avoid recomputing the slope value each iteration
export function generateRangeMapper(inputStart: number, inputEnd: number, outputStart: number, outputEnd: number) {
  const slope = (outputEnd - outputStart) / (inputEnd - inputStart)

  return function(input: number) { return outputStart + slope * (input - inputStart) }
}
