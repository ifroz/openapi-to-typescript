export abstract class Formatter<T> {
  abstract render(arg: T):Promise<{[k: string]: string}>
}