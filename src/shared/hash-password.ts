import * as bcrypt from 'bcrypt';

import { saltLength } from './constants';

export const hashPassword = (password: string): Promise<string> =>
  bcrypt.hash(password, saltLength);
