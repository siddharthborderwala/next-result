/**
 * Represents a successful result containing a value.
 * @template T The type of the contained value
 */
export type Ok<T> = {
  ok: true;
  value: T;
};

/**
 * Represents an error result containing an error message.
 */
export type Err = {
  ok: false;
  error: string;
};

/**
 * Represents a result that can be either successful (Ok) or an error (Err).
 * 
 * @example
 * ```typescript
 * // Success case
 * const success: Result<number> = { ok: true, value: 42 };
 * // Error case
 * const error: Result<number> = { ok: false, error: "Invalid input" };
 * ```
 */
export type Result<T> = Ok<T> | Err;

/**
 * Represents a promise that resolves to a result.
 * 
 * @example
 * ```typescript
 * const promise: PromiseResult<number> = Promise.resolve(Ok(42));
 * ```
 */
export type PromiseResult<T> = Promise<Result<T>>;

/**
 * Represents an optional value that can be either a value of type T or null.
 * 
 * @example
 * ```typescript
 * const present: Option<string> = "hello";
 * const absent: Option<string> = null;
 * ```
 */
export type Option<T> = T | null;

/**
 * Creates an Ok result with the given value.
 * 
 * @example
 * ```typescript
 * const result = Ok(42);
 * // result = { ok: true, value: 42 }
 * 
 * const stringResult = Ok("success");
 * // stringResult = { ok: true, value: "success" }
 * ```
 */
export const Ok = <T>(value: T): Result<T> => ({ ok: true, value });

/**
 * Creates an Err result with the given error message.
 * 
 * @example
 * ```typescript
 * const error = Err("Invalid input");
 * // error = { ok: false, error: "Invalid input" }
 * ```
 */
export const Err = (error: string): Result<never> => ({
  ok: false,
  error,
});

/**
 * Checks if a result is Ok.
 * 
 * @example
 * ```typescript
 * const success = Ok(42);
 * const isSuccess = isOk(success); // isSuccess = true
 * 
 * const error = Err("Invalid");
 * const isError = isOk(error); // isError = false
 * ```
 */
export const isOk = <T>(result: Result<T>): result is Ok<T> => result.ok;

/**
 * Extracts the value from a result if Ok, otherwise returns null.
 * 
 * @example
 * ```typescript
 * const success = Ok(42);
 * const value = optionOk(success); // value = 42
 * 
 * const error = Err("Invalid");
 * const errorValue = optionOk(error); // errorValue = null
 * ```
 */
export const optionOk = <T>(result: Result<T>): Option<T> =>
  isOk(result) ? result.value : null;

/**
 * Checks if a result is Err.
 * 
 * @example
 * ```typescript
 * const success = Ok(42);
 * const isSuccess = isErr(success); // isSuccess = false
 * 
 * const error = Err("Invalid");
 * const isError = isErr(error); // isError = true
 * ```
 */
export const isErr = <T>(result: Result<T>): result is Err => !result.ok;

/**
 * Extracts the error message from a result if it's Err, otherwise returns null.
 * 
 * @example
 * ```typescript
 * const success = Ok(42);
 * const errorValue = optionErr(success); // errorValue = null
 * 
 * const error = Err("Invalid");
 * const errorValue = optionErr(error); // errorValue = "Invalid"
 * ```
 */
export const optionErr = <T>(result: Result<T>): Option<string> =>
  isErr(result) ? result.error : null;

/**
 * Extracts the value from a successful result or throws an error if the result is an error.
 * 
 * @example
 * ```typescript
 * const success = Ok(42);
 * const value = unwrap(success); // value = 42
 * 
 * const error = Err("Invalid");
 * // The following will throw an Error with message "Invalid"
 * // const value = unwrap(error);
 * ```
 */
export const unwrap = <T>(result: Result<T>): T => {
  if (isOk(result)) {
    return result.value;
  }
  throw new Error(result.error);
};

/**
 * Extracts the value from a successful result or returns a default value if the result is an error.
 * 
 * @example
 * ```typescript
 * const success = Ok(42);
 * const value1 = unwrapOrDefault(success, 0); // value1 = 42
 * 
 * const error = Err("Invalid");
 * const value2 = unwrapOrDefault(error, 0); // value2 = 0
 * ```
 */
export const unwrapOrDefault = <T>(result: Result<T>, defaultValue: T): T => {
  if (isOk(result)) {
    return result.value;
  }
  return defaultValue;
};

/**
 * Awaits a promise that resolves to a result, then unwraps the result.
 * 
 * @example
 * ```typescript
 * // Using with a Promise
 * const promise = Promise.resolve(Ok(42));
 * const value1 = await unwrapPromise(promise); // value1 = 42
 * 
 * // Using with a function that returns a Promise
 * const asyncFn = async () => Ok(42);
 * const value2 = await unwrapPromise(asyncFn); // value2 = 42
 * 
 * // Error case
 * const errorPromise = Promise.resolve(Err("Failed"));
 * // The following will throw an Error with message "Failed"
 * // const value3 = await unwrapPromise(errorPromise);
 * ```
 */
export const unwrapPromise = async <T>(
  fn: (() => Promise<Result<T>>) | Promise<Result<T>>
): Promise<T> => {
  const result = await (typeof fn === "function" ? fn() : fn);
  const value = unwrap(result);
  return value;
};

/**
 * Awaits a promise that resolves to a result, then unwraps the result or returns a default value if the result is an error.
 * 
 * @example
 * ```typescript
 * // Success case
 * const promise = Promise.resolve(Ok(42));
 * const value1 = await unwrapPromiseOrDefault(promise, 0); // value1 = 42
 * 
 * // Error case
 * const errorPromise = Promise.resolve(Err("Failed"));
 * const value2 = await unwrapPromiseOrDefault(errorPromise, 0); // value2 = 0
 * 
 * // Using with an async function
 * const asyncFn = async () => Ok(42);
 * const value3 = await unwrapPromiseOrDefault(asyncFn, 0); // value3 = 42
 * ```
 */
export const unwrapPromiseOrDefault = async <T>(
  fn: (() => PromiseResult<T>) | PromiseResult<T>,
  defaultValue: T
): Promise<T> => {
  const result = await (typeof fn === "function" ? fn() : fn);
  return unwrapOrDefault(result, defaultValue);
};

/**
 * Utility type to extract the value type from an Ok result type.
 * 
 * @example
 * ```typescript
 * type SuccessResult = Ok<number>;
 * type ExtractedType = ExtractOk<SuccessResult>; // type is number
 * ```
 */
export type ExtractOk<T> = T extends Ok<infer U> ? U : never;
