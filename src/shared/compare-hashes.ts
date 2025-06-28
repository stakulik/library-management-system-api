import * as bcrypt from 'bcrypt';

export const compareHashes = async (
  data: string,
  encrypted: string,
): Promise<boolean> => {
  return bcrypt.compare(data, encrypted);
};
