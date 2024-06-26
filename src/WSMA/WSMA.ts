import {Big, BigSource} from '../index.js';
import {MovingAverage} from '../MA/MovingAverage.js';
import {FasterSMA, SMA} from '../SMA/SMA.js';
import {NumberIndicatorSeries} from '../Indicator.js';

/**
 * Wilder's Smoothed Moving Average (WSMA)
 * Type: Trend
 *
 * Developed by **John Welles Wilder, Jr.** to help identifying and spotting bullish and bearish trends. Similar to
 * Exponential Moving Averages with the difference that a smoothing factor of 1/interval is being used, which makes it
 * respond more slowly to price changes.
 *
 * Synonyms:
 * - Modified Exponential Moving Average (MEMA)
 * - Smoothed Moving Average (SMMA)
 * - Welles Wilder's Smoothing (WWS)
 * - Wilder's Moving Average (WMA)
 *
 * @see https://tlc.thinkorswim.com/center/reference/Tech-Indicators/studies-library/V-Z/WildersSmoothing
 */
export class WSMA extends MovingAverage {
  private readonly indicator: SMA;
  private readonly smoothingFactor: Big;

  constructor(public readonly interval: number) {
    super(interval);
    this.indicator = new SMA(interval);
    this.smoothingFactor = new Big(1).div(this.interval);
  }

  updates(prices: BigSource[]): Big | void {
    prices.forEach(price => this.update(price));
    return this.result;
  }

  update(price: BigSource): Big | void {
    const sma = this.indicator.update(price);
    if (this.result) {
      const smoothed = new Big(price).minus(this.result).mul(this.smoothingFactor);
      return this.setResult(smoothed.plus(this.result));
    } else if (this.result === undefined && sma) {
      return this.setResult(sma);
    }
  }

  getResultFromBatch(prices: BigSource[]): Big {
    let result: Big | undefined;
    prices.forEach(price => {
      const sma = this.indicator.update(price);
      if (result) {
        const smoothed = new Big(price).minus(result).mul(this.smoothingFactor);
        result = smoothed.plus(result);
      } else if (result === undefined && sma) {
        result = sma;
      }
    });
    return result || new Big(0);
  }
}

export class FasterWSMA extends NumberIndicatorSeries {
  private readonly indicator: FasterSMA;
  private readonly smoothingFactor: number;

  constructor(public readonly interval: number) {
    super();
    this.indicator = new FasterSMA(interval);
    this.smoothingFactor = 1 / this.interval;
  }

  updates(prices: number[]): number | void {
    prices.forEach(price => this.update(price));
    return this.result;
  }

  update(price: number): number | void {
    const sma = this.indicator.update(price);
    if (this.result !== undefined) {
      const smoothed = (price - this.result) * this.smoothingFactor;
      return this.setResult(smoothed + this.result);
    } else if (this.result === undefined && sma !== undefined) {
      return this.setResult(sma);
    }
  }

  getResultFromBatch(prices: number[]): number {
    let result: number | undefined;
    prices.forEach(price => {
      const sma = this.indicator.update(price);
      if (result !== undefined) {
        const smoothed = (price - result) * this.smoothingFactor;
        result = smoothed + result;
      } else if (result === undefined && sma !== undefined) {
        result = sma;
      }
    });
    return result || 0;
  }
}
