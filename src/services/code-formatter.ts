export const maxCodeLineLength = 84;

export const formatCodeForRendering = (code: string) =>
  code
    .replaceAll("\r\n", "\n")
    .replaceAll("\r", "\n")
    .split("\n")
    .flatMap((line) => wrapCodeLine(line, maxCodeLineLength))
    .join("\n");

const wrapCodeLine = (line: string, maxLength: number): string[] => {
  if (line.length <= maxLength) {
    return [line];
  }

  const wrapped: string[] = [];
  let remaining = line;

  while (remaining.length > maxLength) {
    const wrapAt = findWrapPosition(remaining, maxLength);
    wrapped.push(remaining.slice(0, wrapAt).trimEnd());
    remaining = remaining.slice(wrapAt).trimStart();
  }

  wrapped.push(remaining);
  return wrapped;
};

const findWrapPosition = (line: string, maxLength: number) => {
  for (let index = maxLength; index > 0; index -= 1) {
    if (/\s/.test(line[index] ?? "")) {
      return index;
    }
  }

  return maxLength;
};
