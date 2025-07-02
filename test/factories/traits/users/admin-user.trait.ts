import { Role } from '@prisma/client';

import { userFactory } from '../../factories';

export const adminTrait = userFactory.params({
  role: Role.ADMIN,
});
