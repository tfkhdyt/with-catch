/**
 * Handles a promise by catching specific errors and returning either the result or the error.
 *
 * @template T - The type of the resolved value of the promise.
 * @template E - The error type to catch. Must extend the `Error` class.
 *
 * @param {Promise<T>} promise - The promise to be resolved or rejected.
 * @param {E[]} [errorsToCatch] - Optional list of error types to catch. If the thrown error is not in this list, it will be rethrown.
 *
 * @returns {Promise<[undefined, T] | [InstanceType<E>]>} A tuple where the first element is `undefined` if no error occurred, and the second is the resolved value of the promise. If an error is caught, the tuple contains the error instance.
 */
export async function withCatch<T, E extends new (message?: string) => Error>(
  promise: Promise<T>,
  errorsToCatch?: E[]
): Promise<[undefined, T] | [InstanceType<E>]> {
  try {
    const data = await promise;

    return [undefined, data] as [undefined, T];
  } catch (error) {
    return checkErrors(error, errorsToCatch);
  }
}

/**
 * Executes a synchronous callback and catches specific errors, returning either the result or the error.
 *
 * @template T - The return type of the callback.
 * @template E - The error type to catch. Must extend the `Error` class.
 *
 * @param {(...args: any[]) => T} callback - The function to be executed synchronously.
 * @param {E[]} [errorsToCatch] - Optional list of error types to catch. If the thrown error is not in this list, it will be rethrown.
 *
 * @returns {[undefined, T] | [InstanceType<E>]} A tuple where the first element is `undefined` if no error occurred, and the second is the result of the callback. If an error is caught, the tuple contains the error instance.
 */
export function withCatchSync<T, E extends new (message?: string) => Error>(
  callback: (...args: any[]) => T,
  errorsToCatch?: E[]
): [undefined, T] | [InstanceType<E>] {
  try {
    const result = callback();

    return [undefined, result] as [undefined, T];
  } catch (error) {
    return checkErrors(error, errorsToCatch);
  }
}

function checkErrors<E extends new (message?: string) => Error>(
  error: InstanceType<E>,
  errorsToCatch?: E[]
): [InstanceType<E>] {
  if (errorsToCatch == undefined) {
    return [error];
  }

  if (errorsToCatch.some((e) => error instanceof e)) {
    return [error];
  }

  throw error;
}
