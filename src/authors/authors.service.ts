import { Injectable } from '@nestjs/common';

import { Author } from './interfaces';

@Injectable()
export class AuthorsService {
  private readonly authors: Author[] = [];

  create(author: Author): Promise<Author | null> {
    this.authors.push(author);

    return Promise.resolve(author);
  }

  findAll(): Promise<Author[]> {
    return Promise.resolve(this.authors);
  }
}
