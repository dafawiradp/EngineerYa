import { Controller, Get, Query } from "@nestjs/common";
import { BookStatus, PaginatedDto, BookSummaryDto } from "@engineerya/shared-types";
import { MeilisearchService } from "../../infrastructure/meilisearch.service";
import { SearchQueryDto } from "../dto/search-query.dto";

@Controller("search")
export class SearchController {
  constructor(private readonly searchService: MeilisearchService) {}

  @Get()
  async search(@Query() query: SearchQueryDto): Promise<PaginatedDto<BookSummaryDto>> {
    const page = query.page && query.page > 0 ? query.page : 1;
    const pageSize = query.pageSize && query.pageSize > 0 ? Math.min(query.pageSize, 50) : 20;

    const filters: string[] = [`status = ${BookStatus.PUBLISHED}`];
    if (query.category) filters.push(`categoryId = "${query.category}"`);
    if (query.discipline) filters.push(`discipline = "${query.discipline}"`);

    const result = await this.searchService.search(query.q ?? "", {
      filter: filters.join(" AND "),
      page,
      pageSize,
    });

    return {
      items: result.hits.map(({ authorNames: _a, description: _d, ...summary }) => summary),
      page,
      pageSize,
      total: result.estimatedTotalHits ?? result.hits.length,
    };
  }
}
