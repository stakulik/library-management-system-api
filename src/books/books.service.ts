import { Injectable } from '@nestjs/common';

import { Book } from './interfaces';

@Injectable()
export class BooksService {
  private readonly books: Book[] = [];

  create(book: Book): Promise<Book | null> {
    this.books.push(book);

    return Promise.resolve(book);
  }

  findAll(): Promise<Book[]> {
    return Promise.resolve(this.books);
  }
}
