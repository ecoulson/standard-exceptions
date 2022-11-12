import { Exception } from './exception';

export type ExceptionConstructor = new (...args: any[]) => Exception;
