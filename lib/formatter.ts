export abstract class Formatter<T> {
  public abstract render(arg: T): Promise<{[k: string]: string}>
}
