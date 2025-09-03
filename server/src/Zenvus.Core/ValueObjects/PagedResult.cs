using AutoMapper;

namespace Zenvus.Core.ValueObjects;

public sealed class PagedResult<T>
{
    public List<T> Result { get; set; } = [];
    public int CurrentPage { get; set; }
    public int PageSize { get; set; }
    public int TotalPages { get; set; }
    public int TotalResults { get; set; }

    public int LastPage => TotalPages;
    public bool HasPage => TotalPages > 0;
    public bool IsFirstPage => CurrentPage == 1;
    public bool IsLastPage => CurrentPage == TotalPages;
    public bool HasMorePage => TotalPages > CurrentPage;

    public PagedResult<TOut> ToDtoResult<TOut>(IMapper mapper)
    {
        return new PagedResult<TOut>
        {
            Result = mapper.Map<List<TOut>>(Result),
            CurrentPage = CurrentPage,
            PageSize = PageSize,
            TotalPages = TotalPages,
            TotalResults = TotalResults
        };
    }
}
