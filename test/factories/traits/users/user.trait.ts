import { Role } from '@prisma/client';

import { userFactory } from '../../factories';

export const userTrait = userFactory.params({
  role: Role.USER,
});
