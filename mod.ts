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
