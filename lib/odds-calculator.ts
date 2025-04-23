// Convert American odds to decimal odds
export function americanToDecimal(americanOdds: number): number {
  if (americanOdds > 0) {
    return americanOdds / 100 + 1
  } else {
    return 100 / Math.abs(americanOdds) + 1
  }
}

// Convert decimal odds to American odds
export function decimalToAmerican(decimalOdds: number): number {
  if (decimalOdds >= 2) {
    return Math.round((decimalOdds - 1) * 100)
  } else {
    return Math.round(-100 / (decimalOdds - 1))
  }
}

// Calculate implied probability from decimal odds
export function decimalToImpliedProbability(decimalOdds: number): number {
  return 1 / decimalOdds
}

// Calculate implied probability from American odds
export function americanToImpliedProbability(americanOdds: number): number {
  const decimalOdds = americanToDecimal(americanOdds)
  return decimalToImpliedProbability(decimalOdds)
}

// Calculate the edge percentage
export function calculateEdge(bookOdds: number, fairOdds: number, format: "american" | "decimal" = "american"): number {
  let bookProb: number
  let fairProb: number

  if (format === "american") {
    bookProb = americanToImpliedProbability(bookOdds)
    fairProb = americanToImpliedProbability(fairOdds)
  } else {
    bookProb = decimalToImpliedProbability(bookOdds)
    fairProb = decimalToImpliedProbability(fairOdds)
  }

  // Edge = (fair probability - book probability) / book probability
  return ((fairProb - bookProb) / bookProb) * 100
}

// Calculate expected value
export function calculateEV(
  stake: number,
  bookOdds: number,
  fairOdds: number,
  format: "american" | "decimal" = "american",
): number {
  let bookProb: number
  let fairProb: number
  let potentialWin: number

  if (format === "american") {
    bookProb = americanToImpliedProbability(bookOdds)
    fairProb = americanToImpliedProbability(fairOdds)

    if (bookOdds > 0) {
      potentialWin = stake * (bookOdds / 100)
    } else {
      potentialWin = stake * (100 / Math.abs(bookOdds))
    }
  } else {
    bookProb = decimalToImpliedProbability(bookOdds)
    fairProb = decimalToImpliedProbability(fairOdds)
    potentialWin = stake * (bookOdds - 1)
  }

  // EV = (probability of winning * amount won per bet) - (probability of losing * amount lost per bet)
  return fairProb * potentialWin - (1 - fairProb) * stake
}

// Calculate Kelly Criterion bet size
export function calculateKelly(
  bankroll: number,
  bookOdds: number,
  fairOdds: number,
  format: "american" | "decimal" = "american",
): number {
  let bookProb: number
  let fairProb: number
  let decimalOdds: number

  if (format === "american") {
    bookProb = americanToImpliedProbability(bookOdds)
    fairProb = americanToImpliedProbability(fairOdds)
    decimalOdds = americanToDecimal(bookOdds)
  } else {
    bookProb = decimalToImpliedProbability(bookOdds)
    fairProb = decimalToImpliedProbability(fairOdds)
    decimalOdds = bookOdds
  }

  // Kelly = (bp - q) / b where:
  // b = decimal odds - 1
  // p = probability of winning (fair probability)
  // q = probability of losing (1 - p)
  const b = decimalOdds - 1
  const p = fairProb
  const q = 1 - p

  const kellyPercentage = Math.max(0, (b * p - q) / b)

  // Return the recommended bet size
  return bankroll * kellyPercentage
}
