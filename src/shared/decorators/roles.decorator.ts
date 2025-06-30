import { SetMetadata } from '@nestjs/common';

import { UserRole } from '../interfaces';
import { rolesKey } from '../constants';

export const Roles = (...roles: UserRole[]) => SetMetadata(rolesKey, roles);
