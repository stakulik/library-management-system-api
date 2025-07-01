import {
  ItemWithId,
  ListDirection,
  ListPaginatedOptions,
  PaginatedResult,
  SortOrder,
} from './interfaces';
import { defaultPageSize, maxPageSize } from './constants';
import { ListItemsDto } from './dto';

export const listPaginated = async <M extends ItemWithId>(
  listItemsDto: ListItemsDto,
  model,
  options: ListPaginatedOptions = {},
): Promise<PaginatedResult<M>> => {
  const rawPageSize = listItemsDto.pageSize ?? defaultPageSize;
  const pageSize = Math.min(+rawPageSize, maxPageSize);

  const rawCursor = listItemsDto.cursor;
  let cursor;

  if (typeof rawCursor === 'string') {
    cursor = parseInt(rawCursor);
  }

  const direction = listItemsDto.direction ?? ListDirection.Forward;

  let items: M[];
  let hasNextPage = false;
  let hasPreviousPage = false;

  const baseArgs = {
    ...(cursor && {
      cursor: { id: cursor },
      skip: 1,
    }),
    ...options,
    orderBy: { id: SortOrder.Asc },
  };

  if (direction === ListDirection.Forward) {
    items = await model.findMany({
      ...baseArgs,
      take: pageSize + 1,
    });

    hasNextPage = items.length > pageSize;

    if (hasNextPage) {
      items.pop();
    }

    hasPreviousPage = !!cursor;
  } else {
    items = await model.findMany({
      ...baseArgs,
      take: -(pageSize + 1),
    });

    hasPreviousPage = items.length > pageSize;

    if (hasPreviousPage) {
      items.shift();
    }

    hasNextPage = !!cursor;
  }

  const nextCursor =
    hasNextPage && items.length > 0 ? items[items.length - 1].id : null;

  const previousCursor =
    hasPreviousPage && items.length > 0 ? items[0].id : null;

  return {
    data: items,
    pagination: {
      hasNextPage,
      hasPreviousPage,
      nextCursor,
      previousCursor,
    },
  };
};
