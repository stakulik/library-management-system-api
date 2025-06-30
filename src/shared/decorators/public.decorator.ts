import { SetMetadata } from '@nestjs/common';

import { isPublicKey } from '../constants';

export const Public = () => SetMetadata(isPublicKey, true);
