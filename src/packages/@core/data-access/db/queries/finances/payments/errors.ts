export class BusinessRuleError extends Error {
  constructor(
    message: string,
    public readonly code = "BUSINESS_RULE_VIOLATION",
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class ExchangeRateNotFoundError extends BusinessRuleError {
  constructor(from: string, to: string, date: string) {
    super(
      `Aucun taux de change défini le ${date} pour convertir le ${from} en ${to}.`,
      "EXCHANGE_RATE_MISSING",
    );
  }
}

export class OverpaymentError extends BusinessRuleError {
  constructor(remaining: number, currency: string) {
    super(
      `Le montant versé dépasse le reste à payer de cet élève (${remaining / 100} ${currency}).`,
      "OVERPAYMENT_FORBIDDEN",
    );
  }
}
