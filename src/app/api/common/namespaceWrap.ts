export async function namespaceWrapper<T, P>(
  handler: (args: T & { namespace: string }) => Promise<P>,
  namespace: string,
  args: T = {} as T
) {
  return await handler({ ...args, namespace });
}

export async function restrictedNamespaceWrapper<
  T,
  P,
  AllowedNamespace extends string
>(
  handler: (args: T & { namespace: AllowedNamespace }) => Promise<P>,
  namespace: AllowedNamespace,
  args: T = {} as T
): Promise<P> {
  // This will only accept namespaces that are of type AllowedNamespace
  return await namespaceWrapper(handler, namespace, args);
}
